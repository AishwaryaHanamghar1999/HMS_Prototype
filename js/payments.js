/**
 * The Grand Aurelia Hotel Management System
 * Payment Gateway Simulation Module (Razorpay-ready structure)
 *
 * NOTE: This is a frontend prototype. A real production payment gateway requires
 * server-side order generation and cryptographic HMAC webhook verification.
 * No real credit cards or secrets are stored or transmitted.
 */

const PaymentService = {
    // Current pending order context for payment modal
    activePaymentContext: null,

    // Open the simulated Razorpay Modal
    openPaymentModal: function (orderData, onSuccess, onFailure) {
        this.activePaymentContext = {
            orderData: orderData,
            onSuccess: onSuccess,
            onFailure: onFailure
        };

        let modalEl = document.getElementById('razorpayModal');
        if (!modalEl) {
            this.injectRazorpayModal();
            modalEl = document.getElementById('razorpayModal');
        }

        // Fill modal details
        document.getElementById('rzpOrderAmount').textContent = App.formatCurrency(orderData.total);
        document.getElementById('rzpOrderIdText').textContent = orderData.id;
        document.getElementById('rzpCustomerEmail').textContent = orderData.customerEmail;
        document.getElementById('rzpCustomerPhone').textContent = orderData.customerPhone || 'N/A';

        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();
    },

    // Inject simulated Razorpay UI modal
    injectRazorpayModal: function () {
        const modalHtml = `
            <div class="modal fade" id="razorpayModal" tabindex="-1" aria-labelledby="razorpayModalLabel" aria-hidden="true" data-bs-backdrop="static">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content razorpay-modal-content">
                        <!-- Razorpay Dark Header -->
                        <div class="razorpay-header d-flex justify-content-between align-items-center">
                            <div>
                                <div class="d-flex align-items-center gap-2">
                                    <span class="badge bg-primary text-uppercase px-2 py-1" style="font-size:0.65rem; letter-spacing: 0.05em;">Razorpay Gateway Demo</span>
                                    <span class="badge bg-warning text-dark px-2 py-1" style="font-size:0.65rem;"><i class="bi bi-shield-lock-fill me-1"></i>Test Sandbox</span>
                                </div>
                                <h5 class="modal-title font-heading mt-2 text-white mb-0">The Grand Aurelia</h5>
                                <small class="text-white-50">Ref: <span id="rzpOrderIdText">ORD_0000</span></small>
                            </div>
                            <div class="text-end">
                                <small class="text-white-50 d-block" style="font-size:0.75rem;">Payable Amount</small>
                                <span class="fs-4 fw-bold text-gold" id="rzpOrderAmount">$0.00</span>
                            </div>
                        </div>

                        <!-- Modal Body -->
                        <div class="modal-body p-4 bg-white">
                            <!-- Production Architecture Notice -->
                            <div class="alert alert-warning d-flex align-items-start gap-2 py-2 px-3 small rounded-3 mb-3 border-warning-subtle">
                                <i class="bi bi-info-circle-fill text-warning fs-5 flex-shrink-0"></i>
                                <div>
                                    <strong>Prototype Integration Notice:</strong> This simulates the Razorpay checkout UI flow. In production, an authorized backend creates a Razorpay Order ID via API and validates signature hashes before marking transactions successful.
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label small fw-semibold text-muted">Customer Contact Details</label>
                                <div class="bg-light p-2 rounded-2 small d-flex justify-content-between">
                                    <span id="rzpCustomerEmail" class="fw-medium text-dark">user@hotel.demo</span>
                                    <span id="rzpCustomerPhone" class="text-muted">+1 555-019-8821</span>
                                </div>
                            </div>

                            <!-- Payment Options Tabs -->
                            <ul class="nav nav-pills nav-fill mb-3" id="paymentMethodTabs" role="tablist">
                                <li class="nav-item">
                                    <button class="nav-link active py-2 small fw-semibold" id="card-tab" data-bs-toggle="pill" data-bs-target="#tab-card" type="button"><i class="bi bi-credit-card me-1"></i>Card</button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link py-2 small fw-semibold" id="upi-tab" data-bs-toggle="pill" data-bs-target="#tab-upi" type="button"><i class="bi bi-qr-code-scan me-1"></i>UPI / QR</button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link py-2 small fw-semibold" id="netbanking-tab" data-bs-toggle="pill" data-bs-target="#tab-netbanking" type="button"><i class="bi bi-bank me-1"></i>Net Banking</button>
                                </li>
                            </ul>

                            <div class="tab-content border rounded-3 p-3 bg-light-subtle">
                                <!-- Card Simulation -->
                                <div class="tab-pane fade show active" id="tab-card">
                                    <div class="mb-2">
                                        <label class="form-label small fw-semibold">Card Number (Simulated)</label>
                                        <div class="input-group input-group-sm">
                                            <span class="input-group-text bg-white"><i class="bi bi-credit-card-2-front"></i></span>
                                            <input type="text" class="form-control" value="4111 2222 3333 4444" readonly>
                                        </div>
                                    </div>
                                    <div class="row g-2 mb-2">
                                        <div class="col-6">
                                            <label class="form-label small fw-semibold">Expiry</label>
                                            <input type="text" class="form-control form-control-sm" value="12/28" readonly>
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label small fw-semibold">CVV</label>
                                            <input type="password" class="form-control form-control-sm" value="123" readonly>
                                        </div>
                                    </div>
                                    <div class="form-text text-success" style="font-size:0.75rem;"><i class="bi bi-shield-check me-1"></i>Test Sandbox Credentials Pre-Filled</div>
                                </div>

                                <!-- UPI Simulation -->
                                <div class="tab-pane fade text-center" id="tab-upi">
                                    <div class="py-2">
                                        <i class="bi bi-qr-code text-navy display-4"></i>
                                        <p class="small text-muted mt-2 mb-1">Scan simulated QR with any UPI app</p>
                                        <span class="badge bg-secondary-subtle text-dark">hotel.aurelia@razorpay</span>
                                    </div>
                                </div>

                                <!-- Net Banking Simulation -->
                                <div class="tab-pane fade" id="tab-netbanking">
                                    <label class="form-label small fw-semibold">Select Popular Bank</label>
                                    <select class="form-select form-select-sm mb-2">
                                        <option selected>HDFC Bank (Demo)</option>
                                        <option>State Bank of India (Demo)</option>
                                        <option>ICICI Bank (Demo)</option>
                                        <option>Axis Bank (Demo)</option>
                                    </select>
                                    <div class="form-text" style="font-size:0.75rem;">Simulates bank redirect and callback authentication.</div>
                                </div>
                            </div>
                        </div>

                        <!-- Footer Actions -->
                        <div class="modal-footer bg-light d-flex justify-content-between p-3 border-top">
                            <button type="button" class="btn btn-outline-danger btn-sm" onclick="PaymentService.simulateFailure()">
                                <i class="bi bi-x-circle me-1"></i>Simulate Failure
                            </button>
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-light btn-sm" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-gold btn-sm px-3" onclick="PaymentService.simulateSuccess()">
                                    <i class="bi bi-lock-fill me-1"></i>Confirm & Pay Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    // Simulate Success callback
    simulateSuccess: function () {
        const modalEl = document.getElementById('razorpayModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        const txnRef = `RZP_TXN_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        if (this.activePaymentContext && typeof this.activePaymentContext.onSuccess === 'function') {
            this.activePaymentContext.onSuccess({
                status: 'Successful',
                transactionRef: txnRef,
                method: 'Razorpay (Online Simulation)'
            });
        }
    },

    // Simulate Failure callback
    simulateFailure: function () {
        const modalEl = document.getElementById('razorpayModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        if (this.activePaymentContext && typeof this.activePaymentContext.onFailure === 'function') {
            this.activePaymentContext.onFailure({
                status: 'Failed',
                reason: 'Customer cancelled transaction or gateway authorization timeout simulated.'
            });
        }
    },

    // Open Printable Order Receipt / Tax Invoice Modal
    openReceiptModal: function (orderId) {
        const orders = StorageService.get(STORAGE_KEYS.ORDERS, []);
        const order = orders.find(o => o.id === orderId);
        if (!order) {
            App.showToast('Order not found!', 'error');
            return;
        }

        const settings = StorageService.get(STORAGE_KEYS.SETTINGS, {});

        let modalEl = document.getElementById('printableReceiptModal');
        if (!modalEl) {
            const containerHtml = `
                <div class="modal fade" id="printableReceiptModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content rounded-4 border-0 overflow-hidden shadow-lg">
                            <div class="modal-header bg-navy-primary text-white border-0 py-3 no-print">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="bi bi-printer text-gold fs-5"></i>
                                    <h5 class="modal-title font-heading mb-0 text-white">Official Tax Invoice & Receipt</h5>
                                </div>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body p-4 p-md-5" id="printableReceiptContent"></div>
                            <div class="modal-footer bg-light no-print d-flex justify-content-between p-3 border-top">
                                <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-gold btn-sm px-3" onclick="window.print()">
                                    <i class="bi bi-printer me-1"></i>Print / Save as PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', containerHtml);
            modalEl = document.getElementById('printableReceiptModal');
        }

        const itemsRows = order.items.map(item => `
            <tr>
                <td class="py-2">${item.name}</td>
                <td class="text-center py-2">${item.quantity}</td>
                <td class="text-end py-2">${App.formatCurrency(item.price)}</td>
                <td class="text-end py-2 fw-semibold">${App.formatCurrency(item.subtotal)}</td>
            </tr>
        `).join('');

        const content = `
            <div class="invoice-box">
                <!-- Header -->
                <div class="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
                    <div>
                        <h2 class="font-heading fw-bold text-navy mb-1">${settings.hotelName || 'The Grand Aurelia Hotel & Resort'}</h2>
                        <div class="text-muted small">${settings.address || '742 Royal Promenade Avenue, Coastal Bay, CA'}</div>
                        <div class="text-muted small">Tel: ${settings.contactPhone || '+1 (800) 555-AURELIA'} | Email: ${settings.contactEmail || 'concierge@grandaurelia.com'}</div>
                        <div class="badge bg-gold-subtle text-dark border border-warning-subtle mt-2">GSTIN: 27AABCT8819Q1ZP</div>
                    </div>
                    <div class="text-end">
                        <span class="badge ${order.orderStatus === 'Delivered' ? 'bg-success' : 'bg-primary'} fs-6 px-3 py-2 text-uppercase">${order.orderStatus}</span>
                        <div class="fw-bold mt-2 text-navy fs-5">${order.id}</div>
                        <small class="text-muted">Date: ${order.createdAt}</small>
                    </div>
                </div>

                <!-- Customer Details -->
                <div class="row mb-4">
                    <div class="col-sm-6 mb-3 mb-sm-0">
                        <h6 class="text-uppercase fw-bold text-muted small mb-2">Billed To (Guest)</h6>
                        <div class="fw-bold text-dark">${order.customerName}</div>
                        <div class="text-muted small"><i class="bi bi-envelope me-1"></i>${order.customerEmail}</div>
                        <div class="text-muted small"><i class="bi bi-telephone me-1"></i>${order.customerPhone || 'N/A'}</div>
                        ${order.deliveryAddress ? `<div class="text-muted small mt-1"><i class="bi bi-geo-alt me-1"></i>${order.deliveryAddress}</div>` : ''}
                    </div>
                    <div class="col-sm-6 text-sm-end">
                        <h6 class="text-uppercase fw-bold text-muted small mb-2">Order Information</h6>
                        <div class="small"><strong>Type:</strong> <span class="badge bg-light text-dark border">${order.orderType}</span></div>
                        ${order.tableNumber ? `<div class="small mt-1"><strong>Table / Room:</strong> <span class="fw-bold text-primary">${order.tableNumber}</span></div>` : ''}
                        <div class="small mt-1"><strong>Payment:</strong> ${order.paymentMethod}</div>
                        <div class="small mt-1"><strong>Status:</strong> <span class="badge ${order.paymentStatus === 'Successful' ? 'bg-success' : 'bg-warning text-dark'}">${order.paymentStatus}</span></div>
                        <div class="small text-muted mt-1 font-monospace" style="font-size:0.75rem;">Txn: ${order.transactionRef || 'N/A'}</div>
                    </div>
                </div>

                <!-- Items Table -->
                <div class="table-responsive mb-4">
                    <table class="table table-bordered table-striped align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Item Description</th>
                                <th class="text-center" style="width: 80px;">Qty</th>
                                <th class="text-end" style="width: 110px;">Unit Price</th>
                                <th class="text-end" style="width: 120px;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRows}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-end fw-semibold">Subtotal:</td>
                                <td class="text-end fw-bold">${App.formatCurrency(order.subtotal)}</td>
                            </tr>
                            <tr>
                                <td colspan="3" class="text-end fw-semibold">Taxes & Hospitality Levy (5%):</td>
                                <td class="text-end">${App.formatCurrency(order.tax)}</td>
                            </tr>
                            <tr class="table-light">
                                <td colspan="3" class="text-end fw-bold fs-5 text-navy">Grand Total:</td>
                                <td class="text-end fw-bold fs-5 text-gold">${App.formatCurrency(order.total)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- Footer notice -->
                <div class="border-top pt-3 text-center text-muted small">
                    <p class="mb-1">Thank you for dining with <strong>${settings.hotelName}</strong>.</p>
                    <p class="mb-0" style="font-size: 0.72rem;">Computer generated tax invoice. Demo prototype transaction record.</p>
                </div>
            </div>
        `;

        document.getElementById('printableReceiptContent').innerHTML = content;
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
};
