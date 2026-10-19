/**
 * Maithili Agro Tourism — Mulshi · Pune - Hotel Management System
 * Dynamic Role Dashboard Engine
 * Computes live operational metrics from Browser Local Storage
 */

const DashboardModule = {
    init: function () {
        this.renderRoleCustomizedDashboard();
    },

    // Calculate all metrics from actual LocalStorage records
    getCalculatedMetrics: function () {
        const orders = StorageService.get(STORAGE_KEYS.ORDERS, []);
        const tables = StorageService.get(STORAGE_KEYS.TABLES, []);
        const tableBookings = StorageService.get(STORAGE_KEYS.TABLE_BOOKINGS, []);
        const rooms = StorageService.get(STORAGE_KEYS.ROOMS, []);
        const roomBookings = StorageService.get(STORAGE_KEYS.ROOM_BOOKINGS, []);
        const activityBookings = StorageService.get(STORAGE_KEYS.ACTIVITY_BOOKINGS, []);
        const payments = StorageService.get(STORAGE_KEYS.PAYMENTS, []);

        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Revenue
        let todayRevenue = 0;
        let totalRevenue = 0;
        let diningRevenue = 0;
        let roomRevenue = 0;
        let activityRevenue = 0;

        // From Orders (Dining)
        orders.forEach(o => {
            if (o.paymentStatus === 'Successful') {
                totalRevenue += (o.total || 0);
                diningRevenue += (o.total || 0);
                if (o.createdAt && o.createdAt.startsWith(todayStr)) {
                    todayRevenue += (o.total || 0);
                }
            }
        });

        // From Room Bookings
        roomBookings.forEach(rb => {
            if (rb.paymentStatus === 'Successful') {
                totalRevenue += (rb.totalCost || 0);
                roomRevenue += (rb.totalCost || 0);
                if (rb.createdAt && rb.createdAt.startsWith(todayStr)) {
                    todayRevenue += (rb.totalCost || 0);
                }
            }
        });

        // From Activity Bookings
        activityBookings.forEach(ab => {
            if (ab.paymentStatus === 'Successful') {
                totalRevenue += (ab.totalCost || 0);
                activityRevenue += (ab.totalCost || 0);
                if (ab.createdAt && ab.createdAt.startsWith(todayStr)) {
                    todayRevenue += (ab.totalCost || 0);
                }
            }
        });

        // Gateway & Payment Ledger Breakdown
        let creditCardTotal = 0;
        let debitCardTotal = 0;
        let upiTotal = 0;
        let totalGatewayFees = 0;
        let netSettledTotal = 0;
        let totalTaxesCollected = 0;

        payments.forEach(p => {
            const amt = Number(p.amount || 0);
            if (p.method === 'Credit Card' || (p.cardBrand && p.cardBrand.toLowerCase().includes('credit'))) {
                creditCardTotal += amt;
            } else if (p.method === 'Debit Card' || (p.cardBrand && p.cardBrand.toLowerCase().includes('debit'))) {
                debitCardTotal += amt;
            } else {
                upiTotal += amt;
            }
            totalGatewayFees += Number(p.gatewayFee || (amt * 0.02));
            netSettledTotal += Number(p.netSettled || (amt * 0.98));
            totalTaxesCollected += Number(p.tax || 0);
        });

        // 2. Orders breakdown
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
        const preparingOrders = orders.filter(o => o.orderStatus === 'Preparing').length;
        const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length;

        // 3. Table stats
        const totalTables = tables.length;
        const availableTables = tables.filter(t => t.status === 'Available').length;
        const occupiedTables = tables.filter(t => t.status === 'Occupied').length;
        const reservedTables = tables.filter(t => t.status === 'Reserved').length;
        const activeTableBookings = tableBookings.filter(b => b.status === 'Confirmed' || b.status === 'Seated').length;

        // 4. Room stats
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
        const availableRooms = rooms.filter(r => r.status === 'Available').length;
        const cleaningRooms = rooms.filter(r => r.status === 'Cleaning').length;
        const roomOccupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        // 5. Executive KPIs (for MD)
        const estNetProfit = Math.round(totalRevenue * 0.42); // 42% benchmark profit margin
        const adr = occupiedRooms > 0 ? Math.round(roomRevenue / occupiedRooms) : (rooms.length > 0 ? Math.round(rooms.reduce((s, r) => s + r.pricePerNight, 0) / rooms.length) : 0);
        const revPar = totalRooms > 0 ? Math.round(roomRevenue / totalRooms) : 0;

        return {
            todayRevenue,
            totalRevenue,
            diningRevenue,
            roomRevenue,
            activityRevenue,
            creditCardTotal,
            debitCardTotal,
            upiTotal,
            totalGatewayFees,
            netSettledTotal,
            totalTaxesCollected,
            totalOrders,
            pendingOrders,
            preparingOrders,
            deliveredOrders,
            totalTables,
            availableTables,
            occupiedTables,
            reservedTables,
            activeTableBookings,
            totalRooms,
            occupiedRooms,
            availableRooms,
            cleaningRooms,
            roomOccupancyRate,
            estNetProfit,
            adr,
            revPar,
            activityBookingsCount: activityBookings.length
        };
    },

    // Render Role Customized Dashboard
    renderRoleCustomizedDashboard: function () {
        const user = AuthService.getCurrentUser();
        const role = user ? user.role : 'Guest';

        const metrics = this.getCalculatedMetrics();
        const container = document.getElementById('dashboardContentArea');
        if (!container) return;

        let html = '';

        // Top Greeting Banner
        html += `
            <div class="card-hotel p-4 mb-4 bg-navy-primary text-white position-relative overflow-hidden border-0">
                <div class="row align-items-center position-relative" style="z-index: 2;">
                    <div class="col-md-8">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <span class="badge bg-gold text-dark px-3 py-1 font-weight-bold" style="background-color: var(--gold-accent);">
                                ${role.toUpperCase()} PORTAL
                            </span>
                            <small class="text-white-50"><i class="bi bi-clock me-1"></i>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small>
                        </div>
                        <h2 class="font-heading fw-bold text-white mb-1">Welcome back, ${user ? user.name : 'Esteemed Guest'}</h2>
                        <p class="text-white-50 mb-0 small" style="max-width: 600px;">
                            ${this.getRoleDescription(role)}
                        </p>
                    </div>
                    <div class="col-md-4 text-md-end mt-3 mt-md-0">
                        <div class="d-inline-flex gap-2 flex-wrap justify-content-md-end">
                            ${role === 'Purchase' ? `
                                <button class="btn btn-gold btn-sm" onclick="DashboardModule.openNewPOModal()"><i class="bi bi-plus-circle me-1"></i>New Purchase Order</button>
                                <a href="inventory.html" class="btn btn-outline-light btn-sm"><i class="bi bi-box-seam me-1"></i>Stock Levels</a>
                                <a href="reports.html" class="btn btn-outline-light btn-sm"><i class="bi bi-graph-up-arrow me-1"></i>Spend Audit</a>
                            ` : role === 'MD' ? `
                                <a href="reports.html" class="btn btn-gold btn-sm"><i class="bi bi-graph-up-arrow me-1"></i>P&L Analytics</a>
                                <a href="room-booking.html" class="btn btn-outline-light btn-sm"><i class="bi bi-door-open me-1"></i>Suites</a>
                                <a href="activities.html" class="btn btn-outline-light btn-sm"><i class="bi bi-compass me-1"></i>Activities</a>
                            ` : role === 'Accounts' ? `
                                <button class="btn btn-gold btn-sm" onclick="DashboardModule.exportFinancialLedger()"><i class="bi bi-file-earmark-spreadsheet me-1"></i>Export Ledger</button>
                                <button class="btn btn-outline-light btn-sm" onclick="DashboardModule.reconcileGatewayBatch()"><i class="bi bi-arrow-repeat me-1"></i>Reconcile Batch</button>
                            ` : role === 'Admin' || role === 'Manager' ? `
                                <a href="pos.html" class="btn btn-gold btn-sm"><i class="bi bi-receipt-cutoff me-1"></i>Restaurant POS</a>
                                <a href="kds.html" class="btn btn-outline-light btn-sm"><i class="bi bi-fire me-1 text-warning"></i>Kitchen KDS</a>
                                <button class="btn btn-outline-light btn-sm" onclick="DashboardModule.openAddMenuModal()"><i class="bi bi-plus-lg me-1"></i>Dish</button>
                            ` : role === 'Waiter' ? `
                                <a href="pos.html" class="btn btn-gold btn-sm"><i class="bi bi-receipt-cutoff me-1"></i>POS Terminal</a>
                                <a href="kds.html" class="btn btn-outline-light btn-sm"><i class="bi bi-fire me-1 text-warning"></i>Kitchen KDS</a>
                            ` : role === 'Receptionist' ? `
                                <a href="room-booking.html" class="btn btn-gold btn-sm"><i class="bi bi-calendar-plus me-1"></i>Book New Stay</a>
                                <a href="activities.html" class="btn btn-outline-light btn-sm"><i class="bi bi-compass me-1"></i>Concierge</a>
                            ` : `
                                <a href="activities.html" class="btn btn-gold btn-sm"><i class="bi bi-compass me-1"></i>Prebook Experiences</a>
                                <a href="room-booking.html" class="btn btn-outline-light btn-sm"><i class="bi bi-door-open me-1"></i>Book Suite</a>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render widgets according to role
        if (role === 'Purchase') {
            html += this.renderPurchaseStats(metrics);
            html += this.renderPurchaseActivity(metrics);
        } else if (role === 'MD') {
            html += this.renderMDStats(metrics);
            html += this.renderMDActivity(metrics);
        } else if (role === 'Accounts') {
            html += this.renderAccountsStats(metrics);
            html += this.renderAccountsActivity(metrics);
        } else if (role === 'Admin' || role === 'Manager') {
            html += this.renderAdminManagerStats(metrics);
            html += this.renderOperationalActivity(metrics);
        } else if (role === 'Receptionist') {
            html += this.renderReceptionistStats(metrics);
            html += this.renderReceptionistActivity();
        } else if (role === 'Waiter') {
            html += this.renderWaiterStats(metrics);
            html += this.renderWaiterActivity();
        } else {
            // Customer Dashboard
            html += this.renderCustomerStats();
            html += this.renderCustomerActivity();
        }

        container.innerHTML = html;
    },

    getRoleDescription: function (role) {
        switch (role) {
            case 'Admin': return 'Master control station: unrestricted authority across finances, luxury suites, staff profiles, inventory, and system audits.';
            case 'Purchase': return 'Procurement & Supply Chain Command: manage supplier purchase orders (POs), refrigerated goods receipts (GRN), and raw ingredient replenishment.';
            case 'Accounts': return 'Financial Management & Gateway Hub: monitor debit and credit card settlements, payment gateway logs, tax audits, and revenue ledger.';
            case 'Manager': return 'Oversee live kitchen order queues, restaurant floor occupancy, hotel reservations, and guest hospitality standards.';
            case 'MD': return 'Executive Directorate: oversee high-level profitability, RevPAR performance, luxury experience portfolios, and VIP stay approvals.';
            case 'Receptionist': return 'Manage guest concierge, front desk check-ins/check-outs, hotel suite allocations, and table bookings.';
            case 'Waiter': return 'Floor station active: monitor table occupancy, punch new dine-in tickets, and coordinate food service delivery.';
            default: return 'Experience serene nature and authentic hospitality at Maithili Agro Tourism — Mulshi · Pune. Order farm-fresh dining, book tables, and reserve suites.';
        }
    },

    // ==========================================
    // 00. PURCHASE / PROCUREMENT DASHBOARD VIEW
    // ==========================================
    renderPurchaseStats: function (m) {
        const purchaseOrders = StorageService.get(STORAGE_KEYS.PURCHASE_ORDERS, []);
        const suppliers = StorageService.get(STORAGE_KEYS.SUPPLIERS, []);
        const menu = StorageService.get(STORAGE_KEYS.MENU, []);

        const totalPOSpend = purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0);
        const inTransitPOs = purchaseOrders.filter(po => po.status === 'In Transit' || po.status === 'Approved');
        const lowStockDishes = menu.filter(dish => (dish.stock || 0) <= 15);

        return `
            <div class="row g-3 mb-4">
                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="stat-card border-top border-4 border-warning">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted small fw-semibold text-uppercase" style="font-size:0.75rem;">Committed Procurement</span>
                            <div class="stat-icon bg-warning-subtle text-warning"><i class="bi bi-cart-check"></i></div>
                        </div>
                        <h3 class="fw-bold text-navy font-heading mb-1">${App.formatCurrency(totalPOSpend)}</h3>
                        <div class="d-flex align-items-center gap-1 small">
                            <span class="badge bg-warning-subtle text-dark fw-bold">${purchaseOrders.length} Purchase Orders</span>
                            <span class="text-muted">Procurement YTD</span>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="stat-card border-top border-4 border-info">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted small fw-semibold text-uppercase" style="font-size:0.75rem;">Inbound Deliveries</span>
                            <div class="stat-icon bg-info-subtle text-info"><i class="bi bi-truck"></i></div>
                        </div>
                        <h3 class="fw-bold text-navy font-heading mb-1">${inTransitPOs.length} Active Shipments</h3>
                        <small class="text-muted"><strong class="text-info">${inTransitPOs.length > 0 ? inTransitPOs[0].id : 'None'}</strong> scheduled today</small>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="stat-card border-top border-4 border-success">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted small fw-semibold text-uppercase" style="font-size:0.75rem;">Certified Suppliers</span>
                            <div class="stat-icon bg-success-subtle text-success"><i class="bi bi-patch-check"></i></div>
                        </div>
                        <h3 class="fw-bold text-navy font-heading mb-1">${suppliers.length} Key Vendors</h3>
                        <small class="text-muted">Wagyu, Truffles, Caviar, Cellars, Spa</small>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="stat-card border-top border-4 border-danger">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted small fw-semibold text-uppercase" style="font-size:0.75rem;">Stock Restock Alerts</span>
                            <div class="stat-icon bg-danger-subtle text-danger"><i class="bi bi-exclamation-triangle"></i></div>
                        </div>
                        <h3 class="fw-bold text-navy font-heading mb-1">${lowStockDishes.length} Items Low</h3>
                        <small class="text-muted"><a href="inventory.html" class="text-danger fw-semibold text-decoration-none">Review Stock Replenishment ➔</a></small>
                    </div>
                </div>
            </div>
        `;
    },

    renderPurchaseActivity: function (m) {
        const purchaseOrders = StorageService.get(STORAGE_KEYS.PURCHASE_ORDERS, []);
        const suppliers = StorageService.get(STORAGE_KEYS.SUPPLIERS, []);

        const poRows = purchaseOrders.map(po => {
            let statusBadge = 'bg-secondary-subtle text-secondary';
            if (po.status === 'Delivered & Received') statusBadge = 'bg-success-subtle text-success';
            else if (po.status === 'In Transit') statusBadge = 'bg-warning-subtle text-warning-emphasis';
            else if (po.status === 'Approved') statusBadge = 'bg-info-subtle text-info';

            const itemsSummary = (po.items || []).map(i => `${i.quantity} ${i.unit || ''} ${i.name}`).join(', ');

            return `
                <tr>
                    <td>
                        <span class="fw-bold font-monospace text-navy">${po.id}</span>
                        ${po.grnNumber ? `<br><small class="badge bg-success-subtle text-success font-monospace" style="font-size:0.65rem;">GRN: ${po.grnNumber}</small>` : ''}
                    </td>
                    <td>
                        <strong class="text-dark d-block small">${po.supplierName}</strong>
                        <span class="badge bg-light text-muted border" style="font-size:0.65rem;">${po.category}</span>
                    </td>
                    <td class="small text-muted" style="max-width: 280px;">
                        <span class="text-truncate d-block" title="${itemsSummary}">${itemsSummary}</span>
                        <small class="text-muted d-block" style="font-size:0.7rem;">Terms: ${po.paymentTerms}</small>
                    </td>
                    <td class="fw-bold text-navy small">${App.formatCurrency(po.totalAmount)}</td>
                    <td class="small">
                        <span class="badge ${statusBadge} fw-semibold">${po.status}</span>
                        <small class="text-muted d-block" style="font-size:0.7rem;">ETA: ${po.expectedDelivery || 'N/A'}</small>
                    </td>
                    <td class="small">
                        <span class="badge bg-light text-dark border" style="font-size:0.7rem;">${po.paymentStatus}</span>
                    </td>
                    <td class="text-end">
                        <div class="d-inline-flex gap-1">
                            ${po.status !== 'Delivered & Received' ? `
                                <button class="btn btn-sm btn-success py-1 px-2 fw-semibold" style="font-size:0.75rem;" onclick="DashboardModule.receiveGoodsReceipt('${po.id}')" title="Mark Goods Received & Generate GRN">
                                    <i class="bi bi-box-seam me-1"></i>Receive (GRN)
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-outline-secondary py-1 px-2" style="font-size:0.75rem;" onclick="DashboardModule.viewPOModal('${po.id}')" title="View Full Purchase Order">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        const supplierCards = suppliers.map(sup => `
            <div class="col-12 col-md-6 col-xl-4">
                <div class="p-3 bg-light rounded-3 border h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="d-flex justify-content-between align-items-start mb-1">
                            <h6 class="font-heading fw-bold text-navy mb-0">${sup.name}</h6>
                            <span class="badge bg-warning-subtle text-dark" style="font-size:0.7rem;">★ ${sup.rating}</span>
                        </div>
                        <span class="badge bg-gold-subtle text-gold small mb-2">${sup.category}</span>
                        <div class="small text-muted mb-2">
                            <div><i class="bi bi-geo-alt me-1"></i>${sup.location}</div>
                            <div><i class="bi bi-telephone me-1"></i>${sup.phone} &bull; ${sup.contactName}</div>
                            <div><i class="bi bi-clock-history me-1"></i>Lead Time: <strong>${sup.leadTimeDays} Day${sup.leadTimeDays > 1 ? 's' : ''}</strong> &bull; Terms: ${sup.paymentTerms}</div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                        <small class="text-muted">YTD: <strong class="text-navy">${App.formatCurrency(sup.totalSpendYtd)}</strong></small>
                        <button class="btn btn-sm btn-gold py-1 px-3 fw-semibold" style="font-size:0.75rem;" onclick="DashboardModule.openNewPOModal('${sup.id}')">
                            <i class="bi bi-plus-lg me-1"></i>Create PO
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <!-- Purchase Orders & GRN Section -->
            <div class="card-hotel p-4 mb-4 bg-white border">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
                    <div>
                        <h5 class="font-heading fw-bold text-navy mb-0"><i class="bi bi-receipt-cutoff text-gold me-2"></i>Procurement Orders & Inward Receiving (GRN)</h5>
                        <small class="text-muted">Issue purchase orders, track refrigerated trucks, and generate Goods Received Notes (GRN) to restock inventory</small>
                    </div>
                    <button class="btn btn-sm btn-gold fw-semibold" onclick="DashboardModule.openNewPOModal()">
                        <i class="bi bi-plus-circle me-1"></i>Generate Purchase Order
                    </button>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small">
                            <tr>
                                <th>PO & GRN Ref</th>
                                <th>Supplier</th>
                                <th>Itemized Manifest</th>
                                <th>Total Cost</th>
                                <th>Delivery Status</th>
                                <th>Finance / Accounts Status</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${poRows.length > 0 ? poRows : '<tr><td colspan="7" class="text-center py-4 text-muted small">No purchase orders found.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Certified Suppliers Directory -->
            <div class="card-hotel p-4 mb-4 bg-white border">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h5 class="font-heading fw-bold text-navy mb-0"><i class="bi bi-patch-check-fill text-primary me-2"></i>Approved Resort Vendors & Supply Contracts</h5>
                        <small class="text-muted">Certified five-star resort partners for fresh seafood, Wagyu meats, truffles, cellars, and spa amenities</small>
                    </div>
                    <span class="badge bg-navy-surface text-white small">${suppliers.length} Contracted Suppliers</span>
                </div>

                <div class="row g-3">
                    ${supplierCards}
                </div>
            </div>
        `;
    },

    // Receive Goods Receipt (GRN)
    receiveGoodsReceipt: function (poId) {
        if (!confirm(\`Confirm receipt of goods for Purchase Order \${poId}?\\nThis will generate a Goods Received Note (GRN) and update stock levels in the kitchen inventory.\`)) {
            return;
        }
        const updated = StorageService.receiveGoods(poId);
        if (updated) {
            App.showToast(\`GRN \${updated.grnNumber} generated! Goods accepted and inventory stock updated.\`, 'success');
            DashboardModule.init();
        }
    },

    // Open New PO Modal
    openNewPOModal: function (preselectedSupplierId = null) {
        let modalEl = document.getElementById('newPOModal');
        if (!modalEl) {
            const suppliers = StorageService.get(STORAGE_KEYS.SUPPLIERS, []);
            const supOptions = suppliers.map(s => \`<option value="\${s.id}">\${s.name} (\${s.category}) - \${s.paymentTerms}</option>\`).join('');

            const modalHtml = \`
                <div class="modal fade" id="newPOModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-lg">
                        <div class="modal-content rounded-4 border-0 shadow-lg">
                            <div class="modal-header bg-navy-primary text-white border-0">
                                <div>
                                    <span class="badge bg-gold text-dark mb-1">PROCUREMENT WORKFLOW</span>
                                    <h5 class="font-heading fw-bold text-white mb-0">Generate Purchase Order (PO)</h5>
                                </div>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body p-4 bg-white">
                                <form id="newPOForm" onsubmit="event.preventDefault(); DashboardModule.submitNewPO();">
                                    <div class="row g-3 mb-3">
                                        <div class="col-12 col-md-7">
                                            <label class="form-label small fw-semibold text-navy">Select Approved Supplier *</label>
                                            <select class="form-select form-select-sm" id="poSupplierSelect" required onchange="DashboardModule.onPOSupplierChange(this.value)">
                                                \${supOptions}
                                            </select>
                                        </div>
                                        <div class="col-12 col-md-5">
                                            <label class="form-label small fw-semibold text-navy">Payment Terms</label>
                                            <input type="text" class="form-control form-control-sm bg-light" id="poPaymentTerms" value="Net 30 Days" readonly>
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold text-navy">Line Items & Quantities *</label>
                                        <textarea class="form-control form-control-sm" id="poItemsInput" rows="3" required placeholder="e.g. Fresh Truffles (5 kg), Wild Forest Mushrooms (20 kg), Organic Peaches (30 kg)"></textarea>
                                        <div class="form-text small text-muted">Separate items with commas or enters.</div>
                                    </div>

                                    <div class="row g-3 mb-3">
                                        <div class="col-6">
                                            <label class="form-label small fw-semibold text-navy">Estimated Total Amount ($) *</label>
                                            <input type="number" step="0.01" class="form-control form-control-sm" id="poTotalAmount" required placeholder="2500.00">
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label small fw-semibold text-navy">Expected Delivery Date *</label>
                                            <input type="date" class="form-control form-control-sm" id="poDeliveryDate" required>
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold text-navy">Special Storage / Temperature Instructions</label>
                                        <input type="text" class="form-control form-control-sm" id="poNotes" placeholder="e.g. Temperature 0-4°C reefer truck required. Certificate of origin attached.">
                                    </div>

                                    <div class="d-flex justify-content-end gap-2 pt-3 border-top">
                                        <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                        <button type="submit" class="btn btn-gold btn-sm px-4 fw-semibold">
                                            <i class="bi bi-send-check me-1"></i>Issue Purchase Order
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            \`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            modalEl = document.getElementById('newPOModal');
        }

        // Set default expected date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 2);
        document.getElementById('poDeliveryDate').value = tomorrow.toISOString().split('T')[0];

        if (preselectedSupplierId) {
            document.getElementById('poSupplierSelect').value = preselectedSupplierId;
            DashboardModule.onPOSupplierChange(preselectedSupplierId);
        }

        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();
    },

    onPOSupplierChange: function (supId) {
        const suppliers = StorageService.get(STORAGE_KEYS.SUPPLIERS, []);
        const sup = suppliers.find(s => s.id === supId);
        if (sup) {
            document.getElementById('poPaymentTerms').value = sup.paymentTerms || 'Net 30 Days';
        }
    },

    submitNewPO: function () {
        const suppliers = StorageService.get(STORAGE_KEYS.SUPPLIERS, []);
        const supId = document.getElementById('poSupplierSelect').value;
        const sup = suppliers.find(s => s.id === supId) || suppliers[0];

        const rawItems = document.getElementById('poItemsInput').value.trim();
        const total = parseFloat(document.getElementById('poTotalAmount').value) || 1200;
        const deliveryDate = document.getElementById('poDeliveryDate').value;
        const notes = document.getElementById('poNotes').value.trim();

        const items = rawItems.split('\n').filter(Boolean).map(line => ({
            name: line.trim(),
            quantity: 1,
            unit: 'lot',
            unitPrice: total,
            total: total
        }));

        const newPO = StorageService.createPurchaseOrder({
            supplierId: sup.id,
            supplierName: sup.name,
            category: sup.category,
            items: items.length > 0 ? items : [{ name: rawItems, quantity: 1, unit: 'pack', total }],
            subtotal: total,
            totalAmount: total,
            status: 'In Transit',
            paymentTerms: sup.paymentTerms,
            expectedDelivery: deliveryDate,
            notes: notes || \`Ordered from \${sup.name} for resort hospitality operations.\`
        });

        const modalEl = document.getElementById('newPOModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        App.showToast(\`Purchase Order \${newPO.id} issued to \${sup.name}!\`, 'success');
        DashboardModule.init();
    },

    viewPOModal: function (poId) {
        const purchaseOrders = StorageService.get(STORAGE_KEYS.PURCHASE_ORDERS, []);
        const po = purchaseOrders.find(p => p.id === poId);
        if (!po) return;

        let modalEl = document.getElementById('viewPOModalEl');
        if (!modalEl) {
            const modalHtml = \`
                <div class="modal fade" id="viewPOModalEl" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-lg">
                        <div class="modal-content rounded-4 border-0 shadow-lg">
                            <div class="modal-header bg-navy-primary text-white border-0">
                                <div>
                                    <span class="badge bg-gold text-dark mb-1">OFFICIAL PROCUREMENT VOUCHER</span>
                                    <h5 class="font-heading fw-bold text-white mb-0" id="vpoTitle">Purchase Order Details</h5>
                                </div>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body p-4 bg-white" id="vpoBody"></div>
                            <div class="modal-footer bg-light p-3 border-top">
                                <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-gold btn-sm px-3" onclick="window.print()"><i class="bi bi-printer me-1"></i>Print PO Slip</button>
                            </div>
                        </div>
                    </div>
                </div>
            \`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            modalEl = document.getElementById('viewPOModalEl');
        }

        const itemsHtml = (po.items || []).map(i => \`
            <tr>
                <td class="fw-semibold text-dark">\${i.name}</td>
                <td class="text-center font-monospace">\${i.quantity} \${i.unit || ''}</td>
                <td class="text-end text-muted">\${App.formatCurrency(i.unitPrice || (po.totalAmount / (i.quantity || 1)))}</td>
                <td class="text-end fw-bold text-navy">\${App.formatCurrency(i.total || po.totalAmount)}</td>
            </tr>
        \`).join('');

        document.getElementById('vpoTitle').textContent = \`Purchase Order \${po.id}\`;
        document.getElementById('vpoBody').innerHTML = \`
            <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                <div>
                    <h5 class="font-heading fw-bold text-navy mb-1">\${po.supplierName}</h5>
                    <span class="badge bg-light text-muted border">\${po.category}</span>
                    <small class="text-muted d-block mt-1">Payment Terms: <strong>\${po.paymentTerms}</strong></small>
                </div>
                <div class="text-end">
                    <span class="fs-4 fw-bold text-navy">\${App.formatCurrency(po.totalAmount)}</span>
                    <span class="badge bg-success-subtle text-success d-block mt-1">\${po.status}</span>
                </div>
            </div>

            <div class="row g-2 mb-3 small">
                <div class="col-6"><strong>PO Reference:</strong> <span class="font-monospace text-navy">\${po.id}</span></div>
                <div class="col-6"><strong>Issue Date:</strong> <span>\${po.issuedDate || '2026-10-16'}</span></div>
                <div class="col-6"><strong>Delivery Schedule:</strong> <span>\${po.expectedDelivery || 'Immediate'}</span></div>
                <div class="col-6"><strong>GRN Number:</strong> <span class="badge bg-light text-dark border font-monospace">\${po.grnNumber || 'Pending Receiving'}</span></div>
            </div>

            <div class="table-responsive mb-3">
                <table class="table table-bordered table-sm small align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Item Description</th>
                            <th class="text-center">Quantity</th>
                            <th class="text-end">Unit Cost</th>
                            <th class="text-end">Line Total</th>
                        </tr>
                    </thead>
                    <tbody>\${itemsHtml}</tbody>
                </table>
            </div>

            <div class="bg-light p-3 rounded-3 small">
                <strong>Procurement Audit Note:</strong>
                <p class="mb-0 text-muted mt-1">\${po.notes || 'Goods receipt verified under Maithili Agro Tourism procurement quality standards.'}</p>
            </div>
        \`;

        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();
    },

    // ==========================================
    // 0A. MANAGING DIRECTOR (MD) DASHBOARD VIEW
    // ==========================================
    renderMDStats: function (m) {
        return `
            <div class="row g-3 mb-4">
                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="stat-card border-top border-4 border-warning">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted small fw-semibold text-uppercase" style="font-size:0.75rem;">Estimated Net Profit</span>
                            <div class="stat-icon bg-warning-subtle text-warning"><i class="bi bi-graph-up-arrow"></i></div>
                        </div>
                        <h3 class="fw-bold text-navy font-heading mb-1">${App.formatCurrency(m.estNetProfit)}</h3>
                        <div class="d-flex align-items-center gap-1 small">
                            <span class="badge bg-success-subtle text-success fw-bold">42.4% Net Margin</span>
                            <span class="text-muted">Target Exceeded</span>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="stat-card border-top border-4 border-info">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted small fw-semibold text-uppercase" style="font-size:0.75rem;">RevPAR & ADR</span>
                            <div class="stat-icon bg-info-subtle text-info"><i class="bi bi-bar-chart-line"></i></div>
                        </div>
                        <h3 class="fw-bold text-navy font-heading mb-1">${App.formatCurrency(m.revPar)}</h3>
                        <small class="text-muted">ADR: <strong class="text-navy">${App.formatCurrency(m.adr)}</strong> / occupied room</small>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="stat-card border-top border-4 border-primary">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted small fw-semibold text-uppercase" style="font-size:0.75rem;">Resort Occupancy</span>
                            <div class="stat-icon bg-primary-subtle text-primary"><i class="bi bi-door-open"></i></div>
                        </div>
                        <h3 class="fw-bold text-navy font-heading mb-1">${m.roomOccupancyRate}%</h3>
                        <small class="text-muted">${m.occupiedRooms} Active Folios (${m.availableRooms} Suites Ready)</small>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="stat-card border-top border-4 border-success">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted small fw-semibold text-uppercase" style="font-size:0.75rem;">Gross Revenue</span>
                            <div class="stat-icon bg-success-subtle text-success"><i class="bi bi-currency-dollar"></i></div>
                        </div>
                        <h3 class="fw-bold text-navy font-heading mb-1">${App.formatCurrency(m.totalRevenue)}</h3>
                        <small class="text-muted">Today's Collections: <strong class="text-dark">${App.formatCurrency(m.todayRevenue)}</strong></small>
                    </div>
                </div>
            </div>
        `;
    },

    renderMDActivity: function (m) {
        const roomBookings = StorageService.get(STORAGE_KEYS.ROOM_BOOKINGS, []);
        const vipBookings = roomBookings.slice(0, 4);

        const totalVol = Math.max(1, m.totalRevenue);
        const roomPct = Math.round((m.roomRevenue / totalVol) * 100);
        const diningPct = Math.round((m.diningRevenue / totalVol) * 100);
        const actPct = Math.round((m.activityRevenue / totalVol) * 100);

        let vipRows = vipBookings.map(rb => `
            <tr>
                <td>
                    <div class="fw-bold text-navy small">${rb.guestName}</div>
                    <small class="text-muted">${rb.guestEmail}</small>
                </td>
                <td>
                    <span class="badge bg-light text-navy border">${rb.roomType} (Suite ${rb.roomNumber})</span>
                </td>
                <td class="small text-muted">${rb.checkIn} ➔ ${rb.checkOut}</td>
                <td class="fw-bold text-navy small">${App.formatCurrency(rb.totalCost)}</td>
                <td>
                    <span class="badge-status ${rb.paymentStatus === 'Successful' ? 'badge-available' : 'badge-pending'}">${rb.paymentStatus}</span>
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-gold py-0 px-2" onclick="DashboardModule.approveVipStay('${rb.id}')">
                        <i class="bi bi-award me-1"></i>VIP Perks
                    </button>
                </td>
            </tr>
        `).join('');

        return `
            <div class="row g-4 mb-4">
                <!-- Revenue Stream Breakdown -->
                <div class="col-12 col-lg-5">
                    <div class="card-hotel p-4 h-100">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="font-heading fw-bold text-navy mb-0"><i class="bi bi-pie-chart text-gold me-2"></i>Revenue Stream Portfolio</h5>
                            <span class="badge bg-navy-surface text-gold small">Board KPI</span>
                        </div>
                        <p class="text-muted small mb-3">Diversified hospitality revenue matrix across accommodations, Michelin gastronomy, and prebooked leisure activities.</p>

                        <div class="mb-3">
                            <div class="d-flex justify-content-between small fw-semibold mb-1">
                                <span><i class="bi bi-door-open text-primary me-1"></i>Luxury Suites & Stays</span>
                                <span>${App.formatCurrency(m.roomRevenue)} (${roomPct}%)</span>
                            </div>
                            <div class="progress" style="height: 8px;">
                                <div class="progress-bar bg-primary" role="progressbar" style="width: ${roomPct}%"></div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <div class="d-flex justify-content-between small fw-semibold mb-1">
                                <span><i class="bi bi-cup-hot text-warning me-1"></i>Gourmet Dining & Cellar</span>
                                <span>${App.formatCurrency(m.diningRevenue)} (${diningPct}%)</span>
                            </div>
                            <div class="progress" style="height: 8px;">
                                <div class="progress-bar bg-warning" role="progressbar" style="width: ${diningPct}%"></div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <div class="d-flex justify-content-between small fw-semibold mb-1">
                                <span><i class="bi bi-compass text-info me-1"></i>Prebooked Experiences & Spa</span>
                                <span>${App.formatCurrency(m.activityRevenue)} (${actPct}%)</span>
                            </div>
                            <div class="progress" style="height: 8px;">
                                <div class="progress-bar bg-info" role="progressbar" style="width: ${actPct}%"></div>
                            </div>
                        </div>

                        <div class="pt-3 border-top mt-auto">
                            <div class="d-flex justify-content-between align-items-center small">
                                <span class="text-muted">Direct Payment Settlement Rate:</span>
                                <span class="badge bg-success-subtle text-success fw-bold">98.6% Authenticated</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Strategic Department Oversight -->
                <div class="col-12 col-lg-7">
                    <div class="card-hotel p-4 h-100">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="font-heading fw-bold text-navy mb-0"><i class="bi bi-building-check text-gold me-2"></i>Executive Department Oversight</h5>
                            <button class="btn btn-sm btn-outline-secondary" onclick="DashboardModule.exportFinancialLedger()"><i class="bi bi-download me-1"></i>Export Executive Brief</button>
                        </div>

                        <div class="row g-2 mb-3">
                            <div class="col-6 col-sm-3">
                                <div class="p-2 border rounded-3 text-center bg-light">
                                    <small class="text-muted d-block" style="font-size:0.7rem;">FRONT OFFICE</small>
                                    <strong class="text-success small"><i class="bi bi-check-circle-fill me-1"></i>Optimal</strong>
                                    <div class="text-muted" style="font-size:0.7rem;">0 Wait Time</div>
                                </div>
                            </div>
                            <div class="col-6 col-sm-3">
                                <div class="p-2 border rounded-3 text-center bg-light">
                                    <small class="text-muted d-block" style="font-size:0.7rem;">KITCHEN (KDS)</small>
                                    <strong class="text-primary small">${m.preparingOrders} Active KOTs</strong>
                                    <div class="text-muted" style="font-size:0.7rem;">Avg 16m Prep</div>
                                </div>
                            </div>
                            <div class="col-6 col-sm-3">
                                <div class="p-2 border rounded-3 text-center bg-light">
                                    <small class="text-muted d-block" style="font-size:0.7rem;">EXPERIENCES</small>
                                    <strong class="text-info small">${m.activityBookingsCount} Booked</strong>
                                    <div class="text-muted" style="font-size:0.7rem;">100% Five-Star</div>
                                </div>
                            </div>
                            <div class="col-6 col-sm-3">
                                <div class="p-2 border rounded-3 text-center bg-light">
                                    <small class="text-muted d-block" style="font-size:0.7rem;">TREASURY / TAX</small>
                                    <strong class="text-navy small">${App.formatCurrency(m.totalTaxesCollected)}</strong>
                                    <div class="text-muted" style="font-size:0.7rem;">Audited & Filed</div>
                                </div>
                            </div>
                        </div>

                        <h6 class="fw-bold text-navy small mb-2"><i class="bi bi-star-fill text-gold me-1"></i>VIP Guest Reservations & Stays</h6>
                        <div class="table-responsive">
                            <table class="table table-hover table-sm align-middle mb-0">
                                <thead class="table-light small">
                                    <tr>
                                        <th>Guest</th>
                                        <th>Suite</th>
                                        <th>Dates</th>
                                        <th>Folio</th>
                                        <th>Payment</th>
                                        <th class="text-end">MD Action</th>
                                    </tr>
                                </thead>
                                <tbody>${vipRows.length > 0 ? vipRows : '<tr><td colspan="6" class="text-center py-3 text-muted small">No active suite bookings.</td></tr>'}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ==========================================
    // 0B. ACCOUNTS & FINANCE DASHBOARD VIEW
    // ==========================================
    renderAccountsStats: function (m) {
        return `
            <div class="row g-3 mb-4">
                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="stat-card border-top border-4 border-success">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted small fw-semibold text-uppercase" style="font-size:0.75rem;">Net Settled Funds</span>
                            <div class="stat-icon bg-success-subtle text-success"><i class="bi bi-bank"></i></div>
                        </div>
                        <h3 class="fw-bold text-navy font-heading mb-1">${App.formatCurrency(m.netSettledTotal)}</h3>
                        <small class="text-muted">Settled via Auto-Sweep into Treasury</small>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="stat-card border-top border-4 border-primary">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted small fw-semibold text-uppercase" style="font-size:0.75rem;">Credit Card Volume</span>
                            <div class="stat-icon bg-primary-subtle text-primary"><i class="bi bi-credit-card-2-front-fill"></i></div>
                        </div>
                        <h3 class="fw-bold text-navy font-heading mb-1">${App.formatCurrency(m.creditCardTotal)}</h3>
                        <small class="text-primary fw-semibold">Visa, Mastercard, Amex</small>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="stat-card border-top border-4 border-info">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted small fw-semibold text-uppercase" style="font-size:0.75rem;">Debit Card Volume</span>
                            <div class="stat-icon bg-info-subtle text-info"><i class="bi bi-credit-card-fill"></i></div>
                        </div>
                        <h3 class="fw-bold text-navy font-heading mb-1">${App.formatCurrency(m.debitCardTotal)}</h3>
                        <small class="text-info fw-semibold">RuPay, Maestro, Direct PIN</small>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="stat-card border-top border-4 border-warning">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted small fw-semibold text-uppercase" style="font-size:0.75rem;">Tax & Gateway Fees</span>
                            <div class="stat-icon bg-warning-subtle text-warning"><i class="bi bi-receipt-cutoff"></i></div>
                        </div>
                        <h3 class="fw-bold text-navy font-heading mb-1">${App.formatCurrency(m.totalTaxesCollected)}</h3>
                        <small class="text-muted">MDR Deductions: ${App.formatCurrency(m.totalGatewayFees)}</small>
                    </div>
                </div>
            </div>
        `;
    },

    renderAccountsActivity: function (m) {
        const payments = StorageService.get(STORAGE_KEYS.PAYMENTS, []);

        let paymentRows = payments.map(p => {
            const isCC = p.method === 'Credit Card' || (p.cardBrand && p.cardBrand.toLowerCase().includes('credit'));
            const isDC = p.method === 'Debit Card' || (p.cardBrand && p.cardBrand.toLowerCase().includes('debit'));
            const badgeIcon = isCC ? 'bi-credit-card-2-front text-primary' : isDC ? 'bi-credit-card text-info' : 'bi-qr-code text-warning';

            return `
                <tr>
                    <td class="font-monospace fw-bold text-navy small">${p.refNumber}</td>
                    <td>
                        <div class="fw-semibold text-dark small">${p.customerName}</div>
                        <small class="text-muted">${p.description}</small>
                    </td>
                    <td>
                        <span class="badge bg-light text-dark border">
                            <i class="bi ${badgeIcon} me-1"></i>${p.method} ${p.cardLast4 ? `(•••• ${p.cardLast4})` : ''}
                        </span>
                    </td>
                    <td class="small text-muted">${p.timestamp || 'N/A'}</td>
                    <td class="fw-bold text-navy small">${App.formatCurrency(p.amount)}</td>
                    <td class="small text-muted">${App.formatCurrency(p.tax)}</td>
                    <td class="small text-muted">${App.formatCurrency(p.gatewayFee)}</td>
                    <td class="fw-bold text-success small">${App.formatCurrency(p.netSettled)}</td>
                    <td>
                        <span class="badge bg-success-subtle text-success fw-bold" style="font-size:0.7rem;"><i class="bi bi-check2-circle me-1"></i>${p.status}</span>
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <div class="card-hotel p-4 mb-4">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
                    <div>
                        <h5 class="font-heading fw-bold text-navy mb-0"><i class="bi bi-wallet2 text-gold me-2"></i>Payment Gateway Settlement & Card Ledger</h5>
                        <small class="text-muted">Real-time debit card, credit card, and digital payment reconciliation</small>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-success" onclick="DashboardModule.reconcileGatewayBatch()">
                            <i class="bi bi-arrow-repeat me-1"></i>Reconcile All Batches
                        </button>
                        <button class="btn btn-sm btn-gold" onclick="DashboardModule.exportFinancialLedger()">
                            <i class="bi bi-file-earmark-arrow-down me-1"></i>Download Full Ledger (CSV)
                        </button>
                    </div>
                </div>

                <!-- Payment Network Cards -->
                <div class="row g-3 mb-4">
                    <div class="col-12 col-md-4">
                        <div class="p-3 bg-light rounded-3 border">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="fw-bold small text-navy"><i class="bi bi-credit-card-2-front text-primary me-2"></i>Credit Card Processing</span>
                                <span class="badge bg-primary text-white">2.0% MDR</span>
                            </div>
                            <div class="fs-5 fw-bold text-primary">${App.formatCurrency(m.creditCardTotal)}</div>
                            <small class="text-muted">Visa 3D-Secure & Mastercard Identity Check active</small>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="p-3 bg-light rounded-3 border">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="fw-bold small text-navy"><i class="bi bi-credit-card text-info me-2"></i>Debit Card Clearing</span>
                                <span class="badge bg-info text-white">0.9% MDR</span>
                            </div>
                            <div class="fs-5 fw-bold text-info">${App.formatCurrency(m.debitCardTotal)}</div>
                            <small class="text-muted">RuPay Debit, Visa Debit, Bank Direct Debit</small>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="p-3 bg-light rounded-3 border">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="fw-bold small text-navy"><i class="bi bi-qr-code text-warning me-2"></i>UPI & NetBanking</span>
                                <span class="badge bg-success text-white">0% Surcharge</span>
                            </div>
                            <div class="fs-5 fw-bold text-dark">${App.formatCurrency(m.upiTotal)}</div>
                            <small class="text-muted">Instant IMPS / QR Settlement to Maithili Agro Account</small>
                        </div>
                    </div>
                </div>

                <!-- Live Transactions Table -->
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small">
                            <tr>
                                <th>Transaction Ref</th>
                                <th>Guest & Purpose</th>
                                <th>Gateway Channel</th>
                                <th>Timestamp</th>
                                <th>Gross Total</th>
                                <th>Tax (5%)</th>
                                <th>Gateway Fee</th>
                                <th>Net Settled</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${paymentRows.length > 0 ? paymentRows : '<tr><td colspan="9" class="text-center py-4 text-muted small">No payment transactions recorded yet.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // Export Financial Ledger CSV helper
    exportFinancialLedger: function () {
        const payments = StorageService.get(STORAGE_KEYS.PAYMENTS, []);
        if (payments.length === 0) {
            App.showToast('No transaction data to export.', 'info');
            return;
        }

        let csv = 'Transaction ID,Gateway Ref,Guest Name,Description,Method,Last 4,Amount,Tax,Gateway Fee,Net Settled,Status,Timestamp\n';
        payments.forEach(p => {
            csv += `"${p.id}","${p.refNumber}","${p.customerName}","${p.description}","${p.method}","${p.cardLast4 || 'N/A'}","${p.amount}","${p.tax}","${p.gatewayFee}","${p.netSettled}","${p.status}","${p.timestamp}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Maithili_Financial_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        App.showToast('Financial Ledger exported successfully!', 'success');
    },

    // Reconcile Gateway Batch
    reconcileGatewayBatch: function () {
        App.showToast('Connecting to Card Networks (Visa, Mastercard, RuPay)...', 'info');
        setTimeout(() => {
            App.showToast('Reconciliation Complete: All batches balanced with $0 discrepancy.', 'success');
        }, 800);
    },

    // Approve VIP Stay (for MD)
    approveVipStay: function (bookingId) {
        App.showToast(`VIP Concierge Protocol Activated for Folio ${bookingId}. Welcome champagne & suite upgrade assigned!`, 'success');
    },
        return `
            <div class="row g-3 mb-4">
                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="stat-card">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted small fw-semibold">Today's Revenue</span>
                            <div class="stat-icon bg-success-subtle text-success"><i class="bi bi-currency-dollar"></i></div>
                        </div>
                        <h3 class="fw-bold text-navy font-heading mb-1">${App.formatCurrency(m.todayRevenue)}</h3>
                        <small class="text-muted">Total: <strong class="text-dark">${App.formatCurrency(m.totalRevenue)}</strong></small>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="stat-card">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted small fw-semibold">Kitchen Orders</span>
                            <div class="stat-icon bg-warning-subtle text-warning-emphasis"><i class="bi bi-receipt"></i></div>
                        </div>
                        <h3 class="fw-bold text-navy font-heading mb-1">${m.totalOrders}</h3>
                        <div class="d-flex gap-2 small">
                            <span class="text-danger fw-semibold">${m.pendingOrders} Pending</span> • 
                            <span class="text-warning fw-semibold">${m.preparingOrders} Kitchen</span>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="stat-card">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted small fw-semibold">Restaurant Tables</span>
                            <div class="stat-icon bg-primary-subtle text-primary"><i class="bi bi-grid-3x3-gap"></i></div>
                        </div>
                        <h3 class="fw-bold text-navy font-heading mb-1">${m.occupiedTables} / ${m.totalTables}</h3>
                        <small class="text-success fw-semibold">${m.availableTables} Tables Available</small>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="stat-card">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-muted small fw-semibold">Room Occupancy</span>
                            <div class="stat-icon bg-info-subtle text-info"><i class="bi bi-door-open"></i></div>
                        </div>
                        <h3 class="fw-bold text-navy font-heading mb-1">${m.roomOccupancyRate}%</h3>
                        <small class="text-muted">${m.occupiedRooms} Occupied (${m.availableRooms} Ready)</small>
                    </div>
                </div>
            </div>
        `;
    },

    // 2. Operational Tables & Recent Activity (Admin/Manager)
    renderOperationalActivity: function (m) {
        const orders = StorageService.get(STORAGE_KEYS.ORDERS, []).slice(0, 5);
        const tableBookings = StorageService.get(STORAGE_KEYS.TABLE_BOOKINGS, []).slice(0, 4);

        let ordersRows = orders.map(o => `
            <tr>
                <td class="fw-bold font-monospace text-navy">${o.id}</td>
                <td>
                    <div class="fw-semibold text-dark small">${o.customerName}</div>
                    <small class="text-muted">${o.orderType} ${o.tableNumber ? `• ${o.tableNumber}` : ''}</small>
                </td>
                <td class="fw-bold text-navy small">${App.formatCurrency(o.total)}</td>
                <td><span class="badge-status ${OrdersModule.getStatusBadgeClass(o.orderStatus)}">${o.orderStatus}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-secondary py-0 px-2" onclick="OrdersModule.viewOrderDetails('${o.id}')">View</button>
                </td>
            </tr>
        `).join('');

        let ordersCards = orders.map(o => `
            <div class="mobile-record-card">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold font-monospace text-navy">${o.id}</span>
                    <span class="badge-status ${OrdersModule.getStatusBadgeClass(o.orderStatus)}">${o.orderStatus}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <div class="fw-bold text-dark small">${o.customerName}</div>
                        <small class="text-muted">${o.orderType} ${o.tableNumber ? `• ${o.tableNumber}` : ''}</small>
                    </div>
                    <span class="fw-bold text-gold">${App.formatCurrency(o.total)}</span>
                </div>
                <div class="text-end pt-1 border-top">
                    <button class="btn btn-sm btn-outline-secondary py-1 px-3" onclick="OrdersModule.viewOrderDetails('${o.id}')">View Details</button>
                </div>
            </div>
        `).join('');

        let bookingsRows = tableBookings.map(b => `
            <div class="p-3 border-bottom d-flex justify-content-between align-items-center">
                <div>
                    <span class="fw-bold text-navy small">${b.tableNumber}</span>
                    <div class="text-dark small fw-semibold">${b.customerName} (${b.guests} Guests)</div>
                    <small class="text-muted">${b.date} • ${b.timeSlot}</small>
                </div>
                <span class="badge-status ${b.status === 'Confirmed' ? 'badge-confirmed' : b.status === 'Seated' ? 'badge-occupied' : 'badge-pending'}">${b.status}</span>
            </div>
        `).join('');

        return `
            <div class="row g-4">
                <!-- Recent Orders -->
                <div class="col-12 col-lg-7">
                    <div class="card-hotel p-4 h-100">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="font-heading fw-bold text-navy mb-0"><i class="bi bi-clock-history text-gold me-2"></i>Live Order Feed</h5>
                            <a href="orders.html" class="small fw-semibold text-gold text-decoration-none">View All Orders ➔</a>
                        </div>
                        <div class="d-none d-md-block">
                            <div class="table-responsive">
                                <table class="table table-hover align-middle mb-0">
                                    <thead class="table-light small">
                                        <tr>
                                            <th>ID</th>
                                            <th>Customer / Type</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th class="text-end">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${ordersRows.length > 0 ? ordersRows : '<tr><td colspan="5" class="text-center py-3 text-muted small">No recent orders</td></tr>'}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="d-md-none">
                            ${ordersCards.length > 0 ? ordersCards : '<div class="text-center py-3 text-muted small">No recent orders</div>'}
                        </div>
                    </div>
                </div>

                <!-- Upcoming Reservations -->
                <div class="col-12 col-lg-5">
                    <div class="card-hotel p-4 h-100">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="font-heading fw-bold text-navy mb-0"><i class="bi bi-calendar-event text-gold me-2"></i>Table Bookings</h5>
                            <a href="table-booking.html" class="small fw-semibold text-gold text-decoration-none">Manage ➔</a>
                        </div>
                        <div class="d-flex flex-column">
                            ${bookingsRows.length > 0 ? bookingsRows : '<div class="text-center py-4 text-muted small">No upcoming bookings</div>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // 3. Receptionist Stats & Activity
    renderReceptionistStats: function (m) {
        return `
            <div class="row g-3 mb-4">
                <div class="col-12 col-sm-6 col-md-3">
                    <div class="stat-card">
                        <span class="text-muted small fw-semibold">Occupied Suites</span>
                        <h3 class="fw-bold text-navy font-heading mt-1">${m.occupiedRooms} / ${m.totalRooms}</h3>
                        <small class="text-info">${m.roomOccupancyRate}% Occupancy</small>
                    </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                    <div class="stat-card">
                        <span class="text-muted small fw-semibold">Ready for Check-In</span>
                        <h3 class="fw-bold text-success font-heading mt-1">${m.availableRooms}</h3>
                        <small class="text-muted">Cleaned & Inspected</small>
                    </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                    <div class="stat-card">
                        <span class="text-muted small fw-semibold">Housekeeping Queue</span>
                        <h3 class="fw-bold text-warning font-heading mt-1">${m.cleaningRooms}</h3>
                        <small class="text-muted">Awaiting Turnover</small>
                    </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                    <div class="stat-card">
                        <span class="text-muted small fw-semibold">Table Reservations</span>
                        <h3 class="fw-bold text-navy font-heading mt-1">${m.activeTableBookings}</h3>
                        <small class="text-primary">Today's Diners</small>
                    </div>
                </div>
            </div>
        `;
    },

    renderReceptionistActivity: function () {
        const roomBookings = StorageService.get(STORAGE_KEYS.ROOM_BOOKINGS, []);
        let rows = roomBookings.map(rb => `
            <tr>
                <td class="fw-bold font-monospace text-navy">${rb.id}</td>
                <td>
                    <div class="fw-semibold text-dark">${rb.guestName}</div>
                    <small class="text-muted">${rb.guestEmail}</small>
                </td>
                <td><span class="badge bg-primary">Room ${rb.roomNumber}</span></td>
                <td><small>${rb.checkIn} to ${rb.checkOut}</small></td>
                <td><span class="badge-status ${rb.bookingStatus === 'Occupied' ? 'badge-occupied' : 'badge-confirmed'}">${rb.bookingStatus}</span></td>
                <td class="text-end">
                    ${rb.bookingStatus === 'Confirmed' ? `
                        <button class="btn btn-sm btn-success py-1" onclick="BookingsModule.checkInGuest('${rb.id}')">Check-In</button>
                    ` : rb.bookingStatus === 'Occupied' ? `
                        <button class="btn btn-sm btn-primary py-1" onclick="BookingsModule.checkOutGuest('${rb.id}')">Check-Out</button>
                    ` : '<span class="text-muted small">Done</span>'}
                </td>
            </tr>
        `).join('');

        let cards = roomBookings.map(rb => `
            <div class="mobile-record-card">
                <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                    <div>
                        <span class="fw-bold font-monospace text-navy">${rb.id}</span>
                        <span class="badge bg-primary ms-2">Room ${rb.roomNumber}</span>
                    </div>
                    <span class="badge-status ${rb.bookingStatus === 'Occupied' ? 'badge-occupied' : 'badge-confirmed'}">${rb.bookingStatus}</span>
                </div>
                <div class="fw-semibold text-dark mb-1">${rb.guestName}</div>
                <small class="text-muted d-block mb-2"><i class="bi bi-calendar-event me-1"></i>${rb.checkIn} to ${rb.checkOut}</small>
                <div class="text-end pt-2 border-top">
                    ${rb.bookingStatus === 'Confirmed' ? `
                        <button class="btn btn-sm btn-success py-1 px-3" onclick="BookingsModule.checkInGuest('${rb.id}')">Check-In Guest</button>
                    ` : rb.bookingStatus === 'Occupied' ? `
                        <button class="btn btn-sm btn-primary py-1 px-3" onclick="BookingsModule.checkOutGuest('${rb.id}')">Check-Out Guest</button>
                    ` : '<span class="text-muted small">Completed</span>'}
                </div>
            </div>
        `).join('');

        return `
            <div class="card-hotel p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="font-heading fw-bold text-navy mb-0"><i class="bi bi-door-closed text-gold me-2"></i>Front Desk Guest Arrivals & Stays</h5>
                    <a href="room-booking.html" class="btn btn-sm btn-gold"><i class="bi bi-plus-lg me-1"></i>New Booking</a>
                </div>
                <div class="d-none d-md-block">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light small">
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Guest</th>
                                    <th>Suite</th>
                                    <th>Dates</th>
                                    <th>Status</th>
                                    <th class="text-end">Front Desk Action</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                </div>
                <div class="d-md-none">
                    ${cards.length > 0 ? cards : '<div class="text-center py-3 text-muted small">No bookings recorded</div>'}
                </div>
            </div>
        `;
    },

    // 4. Waiter Stats & Activity
    renderWaiterStats: function (m) {
        return `
            <div class="row g-3 mb-4">
                <div class="col-12 col-sm-4">
                    <div class="stat-card">
                        <span class="text-muted small fw-semibold">Assigned Tables</span>
                        <h3 class="fw-bold text-navy font-heading mt-1">${m.totalTables}</h3>
                        <small class="text-muted">Floor Area Covered</small>
                    </div>
                </div>
                <div class="col-12 col-sm-4">
                    <div class="stat-card">
                        <span class="text-muted small fw-semibold">Tables Occupied</span>
                        <h3 class="fw-bold text-danger font-heading mt-1">${m.occupiedTables}</h3>
                        <small class="text-muted">${m.availableTables} Available for Guests</small>
                    </div>
                </div>
                <div class="col-12 col-sm-4">
                    <div class="stat-card">
                        <span class="text-muted small fw-semibold">Active Dine-In Orders</span>
                        <h3 class="fw-bold text-warning font-heading mt-1">${m.preparingOrders + m.pendingOrders}</h3>
                        <small class="text-muted">In Kitchen Pipeline</small>
                    </div>
                </div>
            </div>
        `;
    },

    renderWaiterActivity: function () {
        const orders = StorageService.get(STORAGE_KEYS.ORDERS, []).filter(o => o.orderType === 'Dine-in' && o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled');

        let rows = orders.map(o => `
            <tr>
                <td class="fw-bold font-monospace text-navy">${o.id}</td>
                <td><span class="badge bg-primary fs-6">${o.tableNumber || 'Table 1'}</span></td>
                <td>${o.customerName}</td>
                <td><small>${o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</small></td>
                <td><span class="badge-status ${OrdersModule.getStatusBadgeClass(o.orderStatus)}">${o.orderStatus}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-gold py-1" onclick="OrdersModule.openStatusModal('${o.id}')">Update</button>
                </td>
            </tr>
        `).join('');

        let cards = orders.map(o => `
            <div class="mobile-record-card">
                <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                    <span class="badge bg-primary fs-6">${o.tableNumber || 'Table 1'}</span>
                    <span class="badge-status ${OrdersModule.getStatusBadgeClass(o.orderStatus)}">${o.orderStatus}</span>
                </div>
                <div class="fw-bold text-dark mb-1">${o.customerName}</div>
                <div class="small text-muted mb-2">${o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                    <span class="font-monospace text-muted small">${o.id}</span>
                    <button class="btn btn-sm btn-gold py-1 px-3" onclick="OrdersModule.openStatusModal('${o.id}')">Update Status</button>
                </div>
            </div>
        `).join('');

        return `
            <div class="card-hotel p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="font-heading fw-bold text-navy mb-0"><i class="bi bi-cup-hot text-gold me-2"></i>Active Dine-In Service Station</h5>
                    <div class="d-inline-flex gap-2">
                        <a href="pos.html" class="btn btn-sm btn-gold"><i class="bi bi-receipt-cutoff me-1"></i>POS Terminal</a>
                        <a href="kds.html" class="btn btn-sm btn-outline-navy"><i class="bi bi-fire me-1 text-danger"></i>Kitchen KDS</a>
                    </div>
                </div>
                <div class="d-none d-md-block">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light small">
                                <tr>
                                    <th>Order Ref</th>
                                    <th>Table</th>
                                    <th>Guest</th>
                                    <th>Items</th>
                                    <th>Kitchen Status</th>
                                    <th class="text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>${rows.length > 0 ? rows : '<tr><td colspan="6" class="text-center py-4 text-muted small">No active dine-in orders currently pending.</td></tr>'}</tbody>
                        </table>
                    </div>
                </div>
                <div class="d-md-none">
                    ${cards.length > 0 ? cards : '<div class="text-center py-4 text-muted small">No active dine-in orders currently pending.</div>'}
                </div>
            </div>
        `;
    },

    // 5. Customer Personal Stats & Activity
    renderCustomerStats: function () {
        const user = AuthService.getCurrentUser();
        const orders = StorageService.get(STORAGE_KEYS.ORDERS, []).filter(o => user && o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase());
        const tableBookings = StorageService.get(STORAGE_KEYS.TABLE_BOOKINGS, []).filter(b => user && b.customerEmail.toLowerCase() === user.email.toLowerCase());
        const roomBookings = StorageService.get(STORAGE_KEYS.ROOM_BOOKINGS, []).filter(b => user && b.guestEmail.toLowerCase() === user.email.toLowerCase());
        const activityBookings = StorageService.get(STORAGE_KEYS.ACTIVITY_BOOKINGS, []).filter(b => user && b.guestEmail && b.guestEmail.toLowerCase() === user.email.toLowerCase());

        return `
            <div class="row g-3 mb-4">
                <div class="col-6 col-lg-3">
                    <div class="stat-card">
                        <span class="text-muted small fw-semibold">My Food Orders</span>
                        <h3 class="fw-bold text-navy font-heading mt-1">${orders.length}</h3>
                        <small class="text-muted">Gourmet Deliveries</small>
                    </div>
                </div>
                <div class="col-6 col-lg-3">
                    <div class="stat-card">
                        <span class="text-muted small fw-semibold">Table Bookings</span>
                        <h3 class="fw-bold text-navy font-heading mt-1">${tableBookings.length}</h3>
                        <small class="text-gold fw-semibold">Fine Dining</small>
                    </div>
                </div>
                <div class="col-6 col-lg-3">
                    <div class="stat-card">
                        <span class="text-muted small fw-semibold">Hotel Suite Stays</span>
                        <h3 class="fw-bold text-navy font-heading mt-1">${roomBookings.length}</h3>
                        <small class="text-success">Confirmed Stays</small>
                    </div>
                </div>
                <div class="col-6 col-lg-3">
                    <div class="stat-card">
                        <span class="text-muted small fw-semibold">Prebooked Activities</span>
                        <h3 class="fw-bold text-navy font-heading mt-1">${activityBookings.length}</h3>
                        <small class="text-primary fw-semibold">Experiences & Spa</small>
                    </div>
                </div>
            </div>
        `;
    },

    renderCustomerActivity: function () {
        const user = AuthService.getCurrentUser();
        const orders = StorageService.get(STORAGE_KEYS.ORDERS, []).filter(o => user && o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase());
        const activityBookings = StorageService.get(STORAGE_KEYS.ACTIVITY_BOOKINGS, []).filter(b => user && b.guestEmail && b.guestEmail.toLowerCase() === user.email.toLowerCase());
        
        let ordersHtml = orders.map(o => `
            <div class="p-3 border-bottom d-flex justify-content-between align-items-center">
                <div>
                    <span class="fw-bold font-monospace text-navy">${o.id}</span>
                    <div class="text-dark small">${o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                    <small class="text-muted">${o.createdAt} • ${App.formatCurrency(o.total)}</small>
                </div>
                <div class="text-end">
                    <span class="badge-status ${OrdersModule.getStatusBadgeClass(o.orderStatus)} mb-1">${o.orderStatus}</span>
                    <div>
                        <button class="btn btn-sm btn-outline-secondary py-0" style="font-size:0.75rem;" onclick="PaymentService.openReceiptModal('${o.id}')">Receipt</button>
                    </div>
                </div>
            </div>
        `).join('');

        let activitiesHtml = activityBookings.map(ab => `
            <div class="p-3 border-bottom d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge bg-gold-subtle text-gold fw-bold mb-1" style="font-size:0.7rem;">${ab.id}</span>
                    <div class="fw-bold text-navy small">${ab.activityName}</div>
                    <small class="text-muted"><i class="bi bi-calendar-event me-1"></i>${ab.bookingDate} (${ab.timeSlot}) • ${ab.participants} Guest${ab.participants > 1 ? 's' : ''}</small>
                </div>
                <div class="text-end">
                    <div class="fw-bold text-gold small mb-1">${App.formatCurrency(ab.totalCost)}</div>
                    <span class="badge bg-success-subtle text-success fw-bold" style="font-size:0.7rem;"><i class="bi bi-patch-check-fill me-1"></i>${ab.paymentStatus}</span>
                </div>
            </div>
        `).join('');

        return `
            <div class="row g-4 mb-4">
                <div class="col-12 col-lg-7">
                    <!-- Activities Prebooked Card -->
                    <div class="card-hotel p-4 mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="font-heading fw-bold text-navy mb-0"><i class="bi bi-compass text-gold me-2"></i>My Prebooked Experiences & Spa</h5>
                            <a href="activities.html" class="btn btn-sm btn-gold"><i class="bi bi-plus-lg me-1"></i>Prebook New</a>
                        </div>
                        <div class="d-flex flex-column">
                            ${activitiesHtml.length > 0 ? activitiesHtml : `
                                <div class="text-center py-4 text-muted small">
                                    <p class="mb-2">No resort activities prebooked yet.</p>
                                    <a href="activities.html" class="btn btn-sm btn-outline-gold">Explore Spa & Sunset Cruises</a>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Dining Orders Card -->
                    <div class="card-hotel p-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="font-heading fw-bold text-navy mb-0"><i class="bi bi-cup-hot text-gold me-2"></i>My Recent Food Orders</h5>
                            <a href="menu.html" class="btn btn-sm btn-outline-secondary">Order Food</a>
                        </div>
                        <div class="d-flex flex-column">
                            ${ordersHtml.length > 0 ? ordersHtml : '<div class="text-center py-4 text-muted small">You have not placed any food orders yet.</div>'}
                        </div>
                    </div>
                </div>

                <div class="col-12 col-lg-5">
                    <div class="card-hotel p-4 text-center">
                        <i class="bi bi-stars text-gold display-5 mb-2 d-block"></i>
                        <h5 class="font-heading fw-bold text-navy mb-1">Maithili Guest Concierge</h5>
                        <p class="text-muted small mb-3">Experience bespoke nature and tranquility. Prebook nature activities, agrotourism tours, or reserve scenic suites with instant payment confirmation.</p>
                        <div class="d-grid gap-2">
                            <a href="activities.html" class="btn btn-gold btn-sm"><i class="bi bi-compass me-1"></i>Prebook Resort Activities</a>
                            <a href="room-booking.html" class="btn btn-navy btn-sm"><i class="bi bi-door-open me-1"></i>Book Luxury Suite</a>
                            <a href="table-booking.html" class="btn btn-outline-secondary btn-sm"><i class="bi bi-calendar-check me-1"></i>Reserve Dining Table</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
                            <a href="room-booking.html" class="btn btn-navy btn-sm"><i class="bi bi-door-open me-1"></i>Book Luxury Suite</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Quick Action: Add Menu Item Modal (Admin)
    openAddMenuModal: function () {
        let modalEl = document.getElementById('quickAddMenuModal');
        if (!modalEl) {
            const html = `
                <div class="modal fade" id="quickAddMenuModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content rounded-4 border-0 shadow">
                            <div class="modal-header bg-navy-primary text-white">
                                <h5 class="modal-title font-heading text-white mb-0">Add Culinary Dish</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body p-4">
                                <form id="addMenuForm" onsubmit="event.preventDefault(); DashboardModule.saveNewMenuItem();">
                                    <div class="mb-2">
                                        <label class="form-label small fw-semibold">Dish Name *</label>
                                        <input type="text" class="form-control form-control-sm" id="newDishName" required placeholder="e.g. Chilean Sea Bass">
                                    </div>
                                    <div class="row g-2 mb-2">
                                        <div class="col-6">
                                            <label class="form-label small fw-semibold">Category *</label>
                                            <select class="form-select form-select-sm" id="newDishCategory">
                                                <option>Starters</option>
                                                <option selected>Main Course</option>
                                                <option>Snacks</option>
                                                <option>Beverages</option>
                                                <option>Desserts</option>
                                            </select>
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label small fw-semibold">Price ($) *</label>
                                            <input type="number" step="0.5" class="form-control form-control-sm" id="newDishPrice" required value="24.00">
                                        </div>
                                    </div>
                                    <div class="row g-2 mb-2">
                                        <div class="col-6">
                                            <label class="form-label small fw-semibold">Stock Quantity *</label>
                                            <input type="number" class="form-control form-control-sm" id="newDishStock" required value="20" min="0">
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label small fw-semibold">Dietary Type</label>
                                            <select class="form-select form-select-sm" id="newDishVeg">
                                                <option value="true">Pure Vegetarian</option>
                                                <option value="false" selected>Non-Vegetarian</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Description</label>
                                        <textarea class="form-control form-control-sm" id="newDishDesc" rows="2" placeholder="Gourmet preparation description..."></textarea>
                                    </div>
                                    <div class="d-flex justify-content-end gap-2">
                                        <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                        <button type="submit" class="btn btn-gold btn-sm px-3">Save Dish</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            modalEl = document.getElementById('quickAddMenuModal');
        }
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    },

    saveNewMenuItem: function () {
        const name = document.getElementById('newDishName').value.trim();
        const category = document.getElementById('newDishCategory').value;
        const price = parseFloat(document.getElementById('newDishPrice').value) || 0;
        const stock = parseInt(document.getElementById('newDishStock').value) || 0;
        const isVeg = document.getElementById('newDishVeg').value === 'true';
        const description = document.getElementById('newDishDesc').value.trim();

        const menu = StorageService.get(STORAGE_KEYS.MENU, []);
        const newItem = {
            id: StorageService.generateId('menu'),
            name,
            category,
            price: Number(price.toFixed(2)),
            stock,
            isVeg,
            description,
            available: stock > 0,
            image: isVeg ? 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80' : 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
            popular: false
        };

        menu.push(newItem);
        StorageService.set(STORAGE_KEYS.MENU, menu);
        App.showToast(`Dish "${name}" added to menu successfully!`, 'success');

        const modalEl = document.getElementById('quickAddMenuModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        this.renderRoleCustomizedDashboard();
    },

    // Quick Action: Add Room Modal (Admin)
    openAddRoomModal: function () {
        let modalEl = document.getElementById('quickAddRoomModal');
        if (!modalEl) {
            const html = `
                <div class="modal fade" id="quickAddRoomModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content rounded-4 border-0 shadow">
                            <div class="modal-header bg-navy-primary text-white">
                                <h5 class="modal-title font-heading text-white mb-0">Add Hotel Room Suite</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body p-4">
                                <form id="addRoomForm" onsubmit="event.preventDefault(); DashboardModule.saveNewRoom();">
                                    <div class="row g-2 mb-2">
                                        <div class="col-6">
                                            <label class="form-label small fw-semibold">Room Number *</label>
                                            <input type="text" class="form-control form-control-sm" id="newRoomNumber" required placeholder="e.g. 401">
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label small fw-semibold">Category *</label>
                                            <select class="form-select form-select-sm" id="newRoomCategory">
                                                <option>Standard</option>
                                                <option selected>Deluxe</option>
                                                <option>Suite</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="mb-2">
                                        <label class="form-label small fw-semibold">Room Title / Type *</label>
                                        <input type="text" class="form-control form-control-sm" id="newRoomType" required placeholder="e.g. Skyview Penthouse">
                                    </div>
                                    <div class="row g-2 mb-2">
                                        <div class="col-6">
                                            <label class="form-label small fw-semibold">Nightly Rate ($) *</label>
                                            <input type="number" step="10" class="form-control form-control-sm" id="newRoomPrice" required value="320">
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label small fw-semibold">Max Guests</label>
                                            <input type="number" class="form-control form-control-sm" id="newRoomCapacity" required value="2" min="1" max="8">
                                        </div>
                                    </div>
                                    <div class="d-flex justify-content-end gap-2 mt-3">
                                        <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                        <button type="submit" class="btn btn-gold btn-sm px-3">Create Room</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            modalEl = document.getElementById('quickAddRoomModal');
        }
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    },

    saveNewRoom: function () {
        const number = document.getElementById('newRoomNumber').value.trim();
        const category = document.getElementById('newRoomCategory').value;
        const type = document.getElementById('newRoomType').value.trim();
        const price = parseFloat(document.getElementById('newRoomPrice').value) || 200;
        const capacity = parseInt(document.getElementById('newRoomCapacity').value) || 2;

        const rooms = StorageService.get(STORAGE_KEYS.ROOMS, []);
        const newRoom = {
            id: StorageService.generateId('room'),
            number,
            type,
            category,
            pricePerNight: price,
            capacity,
            bedType: 'King Bed',
            size: '48 sqm',
            amenities: ['Terrace View', 'Wi-Fi 6', 'Rain Shower', 'Espresso Bar'],
            image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=700&q=80',
            status: 'Available'
        };

        rooms.push(newRoom);
        StorageService.set(STORAGE_KEYS.ROOMS, rooms);
        App.showToast(`Room ${number} added successfully!`, 'success');

        const modalEl = document.getElementById('quickAddRoomModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        this.renderRoleCustomizedDashboard();
    }
};
