/**
 * The Grand Aurelia Hotel Management System
 * Order Management & Tracking Engine
 */

const OrdersModule = {
    currentStatusFilter: 'All',
    searchQuery: '',

    init: function () {
        this.setupEventListeners();
        this.renderOrders();
    },

    setupEventListeners: function () {
        const searchInput = document.getElementById('orderSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim();
                this.renderOrders();
            });
        }

        const filterBtns = document.querySelectorAll('.order-status-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active', 'btn-navy'));
                filterBtns.forEach(b => b.classList.add('btn-outline-secondary'));
                
                e.currentTarget.classList.add('active', 'btn-navy');
                e.currentTarget.classList.remove('btn-outline-secondary');
                
                this.currentStatusFilter = e.currentTarget.getAttribute('data-status');
                this.renderOrders();
            });
        });
    },

    // Get orders based on user permissions
    getVisibleOrders: function () {
        const allOrders = StorageService.get(STORAGE_KEYS.ORDERS, []);
        const user = AuthService.getCurrentUser();

        let filtered = allOrders;

        // If Customer, restrict to own orders
        if (user && user.role === 'Customer') {
            filtered = allOrders.filter(o => 
                (o.customerId && o.customerId === user.id) || 
                (o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase())
            );
        }

        // Apply Status Filter
        if (this.currentStatusFilter !== 'All') {
            filtered = filtered.filter(o => o.orderStatus === this.currentStatusFilter);
        }

        // Apply Search Filter
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            filtered = filtered.filter(o => 
                o.id.toLowerCase().includes(q) || 
                o.customerName.toLowerCase().includes(q) ||
                (o.tableNumber && o.tableNumber.toLowerCase().includes(q))
            );
        }

        // Sort descending by date
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    // Helper for status badge class
    getStatusBadgeClass: function (status) {
        switch (status) {
            case 'Pending': return 'badge-pending';
            case 'Confirmed': return 'badge-confirmed';
            case 'Preparing': return 'badge-preparing';
            case 'Ready for Pickup': return 'badge-ready';
            case 'Out for Delivery': return 'badge-confirmed';
            case 'Delivered': return 'badge-delivered';
            case 'Cancelled': return 'badge-cancelled';
            default: return 'badge-pending';
        }
    },

    // Render Orders: Table for Desktop & Cards for Mobile
    renderOrders: function () {
        const desktopContainer = document.getElementById('ordersTableBody');
        const mobileContainer = document.getElementById('ordersMobileList');
        const countBadge = document.getElementById('ordersTotalCount');

        const orders = this.getVisibleOrders();
        const user = AuthService.getCurrentUser();
        const canUpdateStatus = user && (user.role === 'Admin' || user.role === 'Manager' || user.role === 'Waiter');

        if (countBadge) countBadge.textContent = orders.length;

        if (orders.length === 0) {
            const emptyHtml = `
                <div class="text-center py-5">
                    <i class="bi bi-inbox text-muted display-4 mb-3 d-block"></i>
                    <h5 class="fw-semibold">No orders found</h5>
                    <p class="text-muted small">No orders match the selected filter criteria.</p>
                </div>
            `;
            if (desktopContainer) desktopContainer.innerHTML = `<tr><td colspan="8">${emptyHtml}</td></tr>`;
            if (mobileContainer) mobileContainer.innerHTML = emptyHtml;
            return;
        }

        // Desktop Table Rows
        if (desktopContainer) {
            let tableHtml = '';
            orders.forEach(order => {
                const itemsSummary = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
                const badgeClass = this.getStatusBadgeClass(order.orderStatus);

                tableHtml += `
                    <tr>
                        <td class="fw-bold font-monospace text-navy">${order.id}</td>
                        <td>
                            <div class="fw-semibold text-dark">${order.customerName}</div>
                            <small class="text-muted">${order.customerPhone || order.customerEmail}</small>
                        </td>
                        <td>
                            <span class="badge bg-light text-dark border">${order.orderType}</span>
                            ${order.tableNumber ? `<span class="badge bg-primary-subtle text-primary border ms-1">${order.tableNumber}</span>` : ''}
                        </td>
                        <td style="max-width: 200px;" class="text-truncate" title="${itemsSummary}">
                            <small>${itemsSummary}</small>
                        </td>
                        <td class="fw-bold text-navy">${App.formatCurrency(order.total)}</td>
                        <td>
                            <span class="badge ${order.paymentStatus === 'Successful' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'}">
                                ${order.paymentStatus}
                            </span>
                        </td>
                        <td>
                            <span class="badge-status ${badgeClass}">${order.orderStatus}</span>
                        </td>
                        <td class="text-end">
                            <div class="btn-group btn-group-sm">
                                <button type="button" class="btn btn-outline-secondary" onclick="OrdersModule.viewOrderDetails('${order.id}')" title="View Details">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button type="button" class="btn btn-outline-secondary" onclick="PaymentService.openReceiptModal('${order.id}')" title="Print Receipt">
                                    <i class="bi bi-printer"></i>
                                </button>
                                ${canUpdateStatus ? `
                                    <button type="button" class="btn btn-gold" onclick="OrdersModule.openStatusModal('${order.id}')" title="Update Status">
                                        <i class="bi bi-pencil-square"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            });
            desktopContainer.innerHTML = tableHtml;
        }

        // Mobile Cards Layout
        if (mobileContainer) {
            let cardsHtml = '';
            orders.forEach(order => {
                const badgeClass = this.getStatusBadgeClass(order.orderStatus);
                const itemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);

                cardsHtml += `
                    <div class="card-hotel p-3 mb-3 border">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <span class="fw-bold font-monospace text-navy">${order.id}</span>
                                <div class="small text-muted">${order.createdAt}</div>
                            </div>
                            <span class="badge-status ${badgeClass}">${order.orderStatus}</span>
                        </div>

                        <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                            <div>
                                <span class="fw-semibold text-dark">${order.customerName}</span>
                                <div class="small text-muted">${order.orderType} ${order.tableNumber ? `• ${order.tableNumber}` : ''}</div>
                            </div>
                            <div class="text-end">
                                <div class="fs-6 fw-bold text-gold">${App.formatCurrency(order.total)}</div>
                                <small class="badge bg-light text-muted border">${order.paymentStatus}</small>
                            </div>
                        </div>

                        <div class="small text-muted mb-3">
                            <i class="bi bi-basket me-1"></i>${itemsCount} item(s): 
                            ${order.items.slice(0, 2).map(i => `${i.quantity}x ${i.name}`).join(', ')}${order.items.length > 2 ? '...' : ''}
                        </div>

                        <div class="d-flex justify-content-between align-items-center pt-1">
                            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="PaymentService.openReceiptModal('${order.id}')">
                                <i class="bi bi-printer me-1"></i>Receipt
                            </button>
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-sm btn-outline-primary" onclick="OrdersModule.viewOrderDetails('${order.id}')">
                                    Details
                                </button>
                                ${canUpdateStatus ? `
                                    <button type="button" class="btn btn-sm btn-gold" onclick="OrdersModule.openStatusModal('${order.id}')">
                                        Update
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
            mobileContainer.innerHTML = cardsHtml;
        }
    },

    // View Order Details Modal
    viewOrderDetails: function (orderId) {
        const orders = StorageService.get(STORAGE_KEYS.ORDERS, []);
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        let modalEl = document.getElementById('orderDetailsModal');
        if (!modalEl) {
            const html = `
                <div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content rounded-4 border-0 shadow">
                            <div class="modal-header bg-navy-primary text-white">
                                <h5 class="modal-title font-heading text-white mb-0">Order Specification</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body p-4" id="orderDetailsModalBody"></div>
                            <div class="modal-footer bg-light p-3 border-top">
                                <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-gold btn-sm" onclick="PaymentService.openReceiptModal('${order.id}')">
                                    <i class="bi bi-printer me-1"></i>Tax Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            modalEl = document.getElementById('orderDetailsModal');
        }

        const itemsList = order.items.map(item => `
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <div>
                    <span class="fw-semibold text-dark">${item.name}</span>
                    <small class="text-muted d-block">${App.formatCurrency(item.price)} × ${item.quantity}</small>
                </div>
                <span class="fw-bold text-navy">${App.formatCurrency(item.subtotal)}</span>
            </div>
        `).join('');

        const bodyContent = `
            <div class="mb-3 d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge-status ${this.getStatusBadgeClass(order.orderStatus)}">${order.orderStatus}</span>
                    <div class="fw-bold font-monospace text-navy fs-5 mt-1">${order.id}</div>
                </div>
                <div class="text-end">
                    <div class="small text-muted">${order.createdAt}</div>
                    <span class="badge bg-secondary-subtle text-dark">${order.orderType}</span>
                </div>
            </div>

            <div class="bg-light p-3 rounded-3 mb-3 small">
                <div class="fw-semibold text-dark mb-1"><i class="bi bi-person me-1"></i>${order.customerName}</div>
                <div class="text-muted"><i class="bi bi-envelope me-1"></i>${order.customerEmail}</div>
                <div class="text-muted"><i class="bi bi-telephone me-1"></i>${order.customerPhone || 'N/A'}</div>
                ${order.tableNumber ? `<div class="mt-1 fw-bold text-primary"><i class="bi bi-pin-map me-1"></i>Table/Room: ${order.tableNumber}</div>` : ''}
                ${order.notes ? `<div class="mt-2 text-danger fst-italic"><i class="bi bi-chat-left-dots me-1"></i>Chef Note: "${order.notes}"</div>` : ''}
            </div>

            <h6 class="fw-bold text-navy mb-2">Item Breakdown</h6>
            <div class="mb-3">${itemsList}</div>

            <div class="p-3 bg-light-subtle rounded-3">
                <div class="d-flex justify-content-between small text-muted mb-1">
                    <span>Subtotal:</span>
                    <span>${App.formatCurrency(order.subtotal)}</span>
                </div>
                <div class="d-flex justify-content-between small text-muted mb-1">
                    <span>Tax (5%):</span>
                    <span>${App.formatCurrency(order.tax)}</span>
                </div>
                <div class="d-flex justify-content-between fw-bold text-navy fs-6 border-top pt-2">
                    <span>Total Amount:</span>
                    <span class="text-gold">${App.formatCurrency(order.total)}</span>
                </div>
                <div class="mt-2 pt-2 border-top small d-flex justify-content-between">
                    <span class="text-muted">Payment:</span>
                    <span class="fw-semibold">${order.paymentMethod} (${order.paymentStatus})</span>
                </div>
            </div>
        `;

        document.getElementById('orderDetailsModalBody').innerHTML = bodyContent;
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    },

    // Open Update Status Modal
    openStatusModal: function (orderId) {
        const orders = StorageService.get(STORAGE_KEYS.ORDERS, []);
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        let modalEl = document.getElementById('orderStatusUpdateModal');
        if (!modalEl) {
            const html = `
                <div class="modal fade" id="orderStatusUpdateModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content rounded-4 border-0 shadow">
                            <div class="modal-header bg-navy-primary text-white">
                                <h5 class="modal-title font-heading text-white mb-0">Update Order Workflow</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body p-4">
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Order ID</label>
                                    <input type="text" id="statusModalOrderId" class="form-control font-monospace" readonly>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Current Status</label>
                                    <div id="statusModalCurrentBadge"></div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Select New Status</label>
                                    <select class="form-select" id="newStatusSelect">
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Preparing">Preparing</option>
                                        <option value="Ready for Pickup">Ready for Pickup</option>
                                        <option value="Out for Delivery">Out for Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                    <div class="form-text small">Staff workflows: Kitchen moves to Preparing -> Ready. Service marks Delivered.</div>
                                </div>
                            </div>
                            <div class="modal-footer bg-light p-3 border-top">
                                <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-gold btn-sm px-3" onclick="OrdersModule.saveStatusUpdate()">
                                    <i class="bi bi-check2-circle me-1"></i>Apply Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            modalEl = document.getElementById('orderStatusUpdateModal');
        }

        document.getElementById('statusModalOrderId').value = order.id;
        document.getElementById('statusModalCurrentBadge').innerHTML = `
            <span class="badge-status ${this.getStatusBadgeClass(order.orderStatus)}">${order.orderStatus}</span>
        `;
        document.getElementById('newStatusSelect').value = order.orderStatus;

        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    },

    // Save Updated Status
    saveStatusUpdate: function () {
        const orderId = document.getElementById('statusModalOrderId').value;
        const newStatus = document.getElementById('newStatusSelect').value;

        const orders = StorageService.get(STORAGE_KEYS.ORDERS, []);
        const idx = orders.findIndex(o => o.id === orderId);

        if (idx > -1) {
            const oldStatus = orders[idx].orderStatus;
            orders[idx].orderStatus = newStatus;

            // If order completed and was cash, mark payment successful
            if (newStatus === 'Delivered' && orders[idx].paymentStatus === 'Pending') {
                orders[idx].paymentStatus = 'Successful';
            }

            StorageService.set(STORAGE_KEYS.ORDERS, orders);
            App.showToast(`Order ${orderId} updated: ${oldStatus} ➔ ${newStatus}`, 'success');

            const modalEl = document.getElementById('orderStatusUpdateModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            this.renderOrders();
        }
    }
};
