/**
 * The Grand Aurelia Hotel Management System
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

        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Revenue
        let todayRevenue = 0;
        let totalRevenue = 0;

        // From Orders
        orders.forEach(o => {
            if (o.paymentStatus === 'Successful') {
                totalRevenue += (o.total || 0);
                if (o.createdAt && o.createdAt.startsWith(todayStr)) {
                    todayRevenue += (o.total || 0);
                }
            }
        });

        // From Room Bookings
        roomBookings.forEach(rb => {
            if (rb.paymentStatus === 'Successful') {
                totalRevenue += (rb.totalCost || 0);
                if (rb.createdAt && rb.createdAt.startsWith(todayStr)) {
                    todayRevenue += (rb.totalCost || 0);
                }
            }
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

        return {
            todayRevenue,
            totalRevenue,
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
            roomOccupancyRate
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
                        <div class="d-inline-flex gap-2">
                            ${role === 'Admin' ? `
                                <button class="btn btn-gold btn-sm" onclick="DashboardModule.openAddMenuModal()"><i class="bi bi-plus-lg me-1"></i>Add Dish</button>
                                <button class="btn btn-outline-light btn-sm" onclick="DashboardModule.openAddRoomModal()"><i class="bi bi-door-open me-1"></i>Add Room</button>
                            ` : role === 'Waiter' ? `
                                <a href="menu.html" class="btn btn-gold btn-sm"><i class="bi bi-plus-circle me-1"></i>Punch Dine-in Order</a>
                            ` : role === 'Receptionist' ? `
                                <a href="room-booking.html" class="btn btn-gold btn-sm"><i class="bi bi-calendar-plus me-1"></i>Book New Stay</a>
                            ` : `
                                <a href="menu.html" class="btn btn-gold btn-sm"><i class="bi bi-bag-plus me-1"></i>Order Food</a>
                                <a href="table-booking.html" class="btn btn-outline-light btn-sm"><i class="bi bi-calendar-check me-1"></i>Reserve Table</a>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render widgets according to role
        if (role === 'Admin' || role === 'Manager') {
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
            case 'Admin': return 'You have unrestricted administrative authority across finances, hotel suites, dining menus, staff accounts, and operational analytics.';
            case 'Manager': return 'Oversee live kitchen order queues, restaurant floor occupancy, hotel reservations, and guest hospitality standards.';
            case 'Receptionist': return 'Manage guest concierge, front desk check-ins/check-outs, hotel suite allocations, and table bookings.';
            case 'Waiter': return 'Floor station active: monitor table occupancy, punch new dine-in tickets, and coordinate food service delivery.';
            default: return 'Experience royal luxury at The Grand Aurelia. Order gourmet room service, book dining tables, and reserve luxury suites.';
        }
    },

    // 1. Admin & Manager Stat Cards
    renderAdminManagerStats: function (m) {
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
                    <a href="menu.html" class="btn btn-sm btn-gold"><i class="bi bi-plus-circle me-1"></i>Punch New Ticket</a>
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

        return `
            <div class="row g-3 mb-4">
                <div class="col-12 col-sm-4">
                    <div class="stat-card">
                        <span class="text-muted small fw-semibold">My Food Orders</span>
                        <h3 class="fw-bold text-navy font-heading mt-1">${orders.length}</h3>
                        <small class="text-muted">Total Gourmet Orders</small>
                    </div>
                </div>
                <div class="col-12 col-sm-4">
                    <div class="stat-card">
                        <span class="text-muted small fw-semibold">My Table Reservations</span>
                        <h3 class="fw-bold text-navy font-heading mt-1">${tableBookings.length}</h3>
                        <small class="text-gold fw-semibold">Dining Bookings</small>
                    </div>
                </div>
                <div class="col-12 col-sm-4">
                    <div class="stat-card">
                        <span class="text-muted small fw-semibold">Hotel Suite Stays</span>
                        <h3 class="fw-bold text-navy font-heading mt-1">${roomBookings.length}</h3>
                        <small class="text-success">Confirmed Stays</small>
                    </div>
                </div>
            </div>
        `;
    },

    renderCustomerActivity: function () {
        const user = AuthService.getCurrentUser();
        const orders = StorageService.get(STORAGE_KEYS.ORDERS, []).filter(o => user && o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase());
        
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

        return `
            <div class="row g-4">
                <div class="col-12 col-lg-7">
                    <div class="card-hotel p-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="font-heading fw-bold text-navy mb-0">My Recent Food Orders</h5>
                            <a href="menu.html" class="btn btn-sm btn-gold">Order Food</a>
                        </div>
                        <div class="d-flex flex-column">
                            ${ordersHtml.length > 0 ? ordersHtml : '<div class="text-center py-4 text-muted small">You have not placed any food orders yet.</div>'}
                        </div>
                    </div>
                </div>
                <div class="col-12 col-lg-5">
                    <div class="card-hotel p-4 text-center">
                        <i class="bi bi-stars text-gold display-5 mb-2 d-block"></i>
                        <h5 class="font-heading fw-bold text-navy mb-1">Aurelia Guest Concierge</h5>
                        <p class="text-muted small mb-3">Need private dining or an airport chauffeur? Our 24/7 concierge is at your service.</p>
                        <div class="d-grid gap-2">
                            <a href="table-booking.html" class="btn btn-outline-gold btn-sm"><i class="bi bi-calendar-check me-1"></i>Reserve a Table</a>
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
