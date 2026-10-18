/**
 * The Grand Aurelia Hotel Management System
 * Comprehensive Payment Gateway Simulation Engine
 * Supports: Credit Card (Visa, Mastercard, Amex), Debit Card (RuPay, Maestro, Visa/MC Debit),
 * UPI / QR Code, Net Banking, and Bank 3D Secure / OTP Verification Flow.
 */

const PaymentService = {
    // Current pending payment context
    activePaymentContext: null,

    // Open Payment Gateway Modal
    openPaymentModal: function (paymentData, onSuccess, onFailure) {
        this.activePaymentContext = {
            data: paymentData,
            onSuccess: onSuccess,
            onFailure: onFailure
        };

        let modalEl = document.getElementById('paymentGatewayModal');
        if (!modalEl) {
            this.injectPaymentModal();
            modalEl = document.getElementById('paymentGatewayModal');
        }

        const totalAmount = Number(paymentData.total || paymentData.totalCost || paymentData.amount || 0);
        const refId = paymentData.id || paymentData.refNumber || `PAY_${Math.floor(100000 + Math.random() * 900000)}`;
        const email = paymentData.customerEmail || paymentData.guestEmail || 'guest@grandaurelia.com';
        const phone = paymentData.customerPhone || paymentData.guestPhone || '+1 (555) 019-8821';
        const title = paymentData.description || paymentData.activityName || paymentData.roomType || 'Aurelia Resort & Hospitality Charge';

        document.getElementById('pgModalAmount').textContent = App.formatCurrency(totalAmount);
        document.getElementById('pgModalRefId').textContent = refId;
        document.getElementById('pgCustomerEmail').textContent = email;
        document.getElementById('pgCustomerPhone').textContent = phone;
        document.getElementById('pgOrderTitle').textContent = title;

        // Reset to Credit Card tab by default
        const creditTab = document.getElementById('tab-btn-credit');
        if (creditTab) {
            const tabTrigger = new bootstrap.Tab(creditTab);
            tabTrigger.show();
        }

        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();
    },

    // Inject Payment Gateway HTML
    injectPaymentModal: function () {
        const modalHtml = `
            <div class="modal fade" id="paymentGatewayModal" tabindex="-1" aria-labelledby="paymentGatewayModalLabel" aria-hidden="true" data-bs-backdrop="static">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                        
                        <!-- Gateway Top Header -->
                        <div class="bg-navy-dark text-white p-4 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center border-bottom border-warning-subtle">
                            <div>
                                <div class="d-flex align-items-center gap-2 mb-1">
                                    <span class="badge bg-gold text-dark fw-bold px-2 py-1" style="font-size:0.7rem; letter-spacing:0.05em;">AURELIA PAY GATEWAY</span>
                                    <span class="badge bg-success-subtle text-success px-2 py-1" style="font-size:0.7rem;"><i class="bi bi-shield-lock-fill me-1"></i>256-Bit SSL Secured</span>
                                </div>
                                <h4 class="font-heading fw-bold text-white mb-0" id="pgOrderTitle">The Grand Aurelia Reservation</h4>
                                <small class="text-white-50">Ref: <span id="pgModalRefId" class="font-monospace text-gold">REF-0000</span></small>
                            </div>
                            <div class="text-sm-end mt-2 mt-sm-0">
                                <small class="text-white-50 d-block" style="font-size:0.75rem;">Total Payable</small>
                                <span class="fs-3 fw-bold text-gold" id="pgModalAmount">$0.00</span>
                            </div>
                        </div>

                        <!-- Gateway Body -->
                        <div class="modal-body p-4 bg-white">
                            <!-- Contact Details Strip -->
                            <div class="bg-light p-2 px-3 rounded-3 small d-flex flex-wrap justify-content-between align-items-center border mb-3">
                                <div>
                                    <span class="text-muted me-1">Billed To:</span>
                                    <strong class="text-navy" id="pgCustomerEmail">guest@hotel.demo</strong>
                                </div>
                                <div>
                                    <span class="text-muted me-1">Contact:</span>
                                    <span class="text-dark font-monospace" id="pgCustomerPhone">+1 555-019-8821</span>
                                </div>
                            </div>

                            <!-- Payment Channels Pills -->
                            <ul class="nav nav-pills nav-fill mb-3 gap-2" id="pgPaymentTabs" role="tablist">
                                <li class="nav-item">
                                    <button class="nav-link active py-2 small fw-semibold border" id="tab-btn-credit" data-bs-toggle="pill" data-bs-target="#pane-credit" type="button">
                                        <i class="bi bi-credit-card-2-front text-primary me-1"></i>Credit Card
                                    </button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link py-2 small fw-semibold border" id="tab-btn-debit" data-bs-toggle="pill" data-bs-target="#pane-debit" type="button">
                                        <i class="bi bi-credit-card text-info me-1"></i>Debit Card
                                    </button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link py-2 small fw-semibold border" id="tab-btn-upi" data-bs-toggle="pill" data-bs-target="#pane-upi" type="button">
                                        <i class="bi bi-qr-code text-warning me-1"></i>UPI / QR
                                    </button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link py-2 small fw-semibold border" id="tab-btn-netbanking" data-bs-toggle="pill" data-bs-target="#pane-netbanking" type="button">
                                        <i class="bi bi-bank text-success me-1"></i>Net Banking
                                    </button>
                                </li>
                            </ul>

                            <div class="tab-content border rounded-3 p-3 p-md-4 bg-light-subtle">
                                
                                <!-- 1. CREDIT CARD PANE -->
                                <div class="tab-pane fade show active" id="pane-credit">
                                    <div class="row g-4 align-items-center">
                                        <!-- Card Visual Mockup -->
                                        <div class="col-12 col-md-5">
                                            <div class="card-mockup-credit p-3 rounded-4 text-white shadow" style="background: linear-gradient(135deg, #090e17 0%, #1e293b 50%, #334155 100%); min-height: 175px;">
                                                <div class="d-flex justify-content-between align-items-center mb-3">
                                                    <span class="badge bg-gold text-dark" style="font-size:0.65rem;">CREDIT PLATINUM</span>
                                                    <i class="bi bi-wifi fs-5 text-white-50"></i>
                                                </div>
                                                <div class="fs-5 font-monospace text-center py-2" id="previewCcNumber" style="letter-spacing: 0.15em;">
                                                    •••• •••• •••• 4242
                                                </div>
                                                <div class="d-flex justify-content-between align-items-end mt-2 pt-2 border-top border-white-50">
                                                    <div>
                                                        <small class="text-white-50 d-block" style="font-size:0.65rem;">CARDHOLDER</small>
                                                        <span class="small fw-bold text-uppercase" id="previewCcName">Eleanor Bennett</span>
                                                    </div>
                                                    <div class="text-end">
                                                        <small class="text-white-50 d-block" style="font-size:0.65rem;">EXPIRES</small>
                                                        <span class="small font-monospace" id="previewCcExpiry">12/28</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- 1-Click Test Credit Cards -->
                                            <div class="mt-2 text-center">
                                                <small class="text-muted d-block mb-1" style="font-size:0.7rem;">Quick 1-Click Test Cards:</small>
                                                <div class="d-flex justify-content-center gap-1 flex-wrap">
                                                    <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2" style="font-size:0.7rem;" onclick="PaymentService.setCreditCard('4242 4242 4242 4242', 'Eleanor Bennett', '12/28', '882', 'Visa')">
                                                        Visa Test
                                                    </button>
                                                    <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2" style="font-size:0.7rem;" onclick="PaymentService.setCreditCard('5555 5555 5555 4444', 'Alexander Sterling', '09/27', '341', 'Mastercard')">
                                                        Mastercard
                                                    </button>
                                                    <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2" style="font-size:0.7rem;" onclick="PaymentService.setCreditCard('3782 8224 6310 005', 'Lord Arthur P.', '11/29', '591', 'Amex')">
                                                        Amex
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Card Input Form -->
                                        <div class="col-12 col-md-7">
                                            <div class="mb-2">
                                                <label class="form-label small fw-semibold text-navy mb-1">Card Number *</label>
                                                <div class="input-group input-group-sm">
                                                    <span class="input-group-text bg-white"><i class="bi bi-credit-card-2-front text-primary"></i></span>
                                                    <input type="text" class="form-control" id="ccInputNumber" value="4242 4242 4242 4242" placeholder="4111 2222 3333 4444" oninput="PaymentService.onCardInput('credit')">
                                                </div>
                                            </div>

                                            <div class="mb-2">
                                                <label class="form-label small fw-semibold text-navy mb-1">Name on Card *</label>
                                                <input type="text" class="form-control form-control-sm" id="ccInputName" value="Eleanor Bennett" oninput="PaymentService.onCardInput('credit')">
                                            </div>

                                            <div class="row g-2 mb-2">
                                                <div class="col-6">
                                                    <label class="form-label small fw-semibold text-navy mb-1">Expiry (MM/YY) *</label>
                                                    <input type="text" class="form-control form-control-sm" id="ccInputExpiry" value="12/28" placeholder="MM/YY" maxlength="5" oninput="PaymentService.onCardInput('credit')">
                                                </div>
                                                <div class="col-6">
                                                    <label class="form-label small fw-semibold text-navy mb-1">CVV / CVC *</label>
                                                    <div class="input-group input-group-sm">
                                                        <input type="password" class="form-control" id="ccInputCvv" value="882" maxlength="4" placeholder="•••">
                                                        <span class="input-group-text bg-white"><i class="bi bi-shield-check text-success"></i></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="form-text text-muted" style="font-size:0.75rem;">
                                                <i class="bi bi-lock-fill text-gold me-1"></i>Protected by 3D-Secure 2.0 with instant bank OTP verification.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- 2. DEBIT CARD PANE -->
                                <div class="tab-pane fade" id="pane-debit">
                                    <div class="row g-4 align-items-center">
                                        <!-- Debit Card Visual -->
                                        <div class="col-12 col-md-5">
                                            <div class="card-mockup-debit p-3 rounded-4 text-white shadow" style="background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%); min-height: 175px;">
                                                <div class="d-flex justify-content-between align-items-center mb-3">
                                                    <span class="badge bg-light text-dark fw-bold" style="font-size:0.65rem;">DEBIT CARD</span>
                                                    <span class="badge bg-warning text-dark font-monospace" style="font-size:0.65rem;">DIRECT PIN / OTP</span>
                                                </div>
                                                <div class="fs-5 font-monospace text-center py-2" id="previewDcNumber" style="letter-spacing: 0.15em;">
                                                    •••• •••• •••• 8810
                                                </div>
                                                <div class="d-flex justify-content-between align-items-end mt-2 pt-2 border-top border-white-50">
                                                    <div>
                                                        <small class="text-white-50 d-block" style="font-size:0.65rem;">ACCOUNT HOLDER</small>
                                                        <span class="small fw-bold text-uppercase" id="previewDcName">Julian Hayes</span>
                                                    </div>
                                                    <div class="text-end">
                                                        <small class="text-white-50 d-block" style="font-size:0.65rem;">VALID THRU</small>
                                                        <span class="small font-monospace" id="previewDcExpiry">10/29</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- 1-Click Test Debit Cards -->
                                            <div class="mt-2 text-center">
                                                <small class="text-muted d-block mb-1" style="font-size:0.7rem;">Quick 1-Click Debit Networks:</small>
                                                <div class="d-flex justify-content-center gap-1 flex-wrap">
                                                    <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2" style="font-size:0.7rem;" onclick="PaymentService.setDebitCard('6071 8219 9901 8810', 'Julian Hayes', '10/29', '441', 'RuPay Debit')">
                                                        RuPay Debit
                                                    </button>
                                                    <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2" style="font-size:0.7rem;" onclick="PaymentService.setDebitCard('4000 1234 5678 9010', 'Sophia Chen', '08/28', '119', 'HDFC Visa Debit')">
                                                        Visa Debit
                                                    </button>
                                                    <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2" style="font-size:0.7rem;" onclick="PaymentService.setDebitCard('5120 4400 9922 7111', 'Dr. Harrison Vance', '05/30', '772', 'Mastercard Debit')">
                                                        MC Debit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Debit Card Input Form -->
                                        <div class="col-12 col-md-7">
                                            <div class="mb-2">
                                                <label class="form-label small fw-semibold text-navy mb-1">Debit Card Number *</label>
                                                <div class="input-group input-group-sm">
                                                    <span class="input-group-text bg-white"><i class="bi bi-credit-card text-info"></i></span>
                                                    <input type="text" class="form-control" id="dcInputNumber" value="6071 8219 9901 8810" oninput="PaymentService.onCardInput('debit')">
                                                </div>
                                            </div>

                                            <div class="mb-2">
                                                <label class="form-label small fw-semibold text-navy mb-1">Cardholder Name *</label>
                                                <input type="text" class="form-control form-control-sm" id="dcInputName" value="Julian Hayes" oninput="PaymentService.onCardInput('debit')">
                                            </div>

                                            <div class="row g-2 mb-2">
                                                <div class="col-6">
                                                    <label class="form-label small fw-semibold text-navy mb-1">Expiry Date *</label>
                                                    <input type="text" class="form-control form-control-sm" id="dcInputExpiry" value="10/29" maxlength="5" oninput="PaymentService.onCardInput('debit')">
                                                </div>
                                                <div class="col-6">
                                                    <label class="form-label small fw-semibold text-navy mb-1">CVV / ATM PIN *</label>
                                                    <div class="input-group input-group-sm">
                                                        <input type="password" class="form-control" id="dcInputCvv" value="441" maxlength="4" placeholder="•••">
                                                        <span class="input-group-text bg-white"><i class="bi bi-shield-check text-success"></i></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="form-text text-success" style="font-size:0.75rem;">
                                                <i class="bi bi-check-circle-fill me-1"></i>Direct settlement with zero additional bank surcharges.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- 3. UPI / QR CODE PANE -->
                                <div class="tab-pane fade text-center" id="pane-upi">
                                    <div class="row justify-content-center py-2">
                                        <div class="col-12 col-sm-8 col-md-6">
                                            <div class="bg-white p-3 rounded-4 shadow-sm border d-inline-block mb-3">
                                                <i class="bi bi-qr-code text-navy display-1"></i>
                                                <div class="badge bg-dark text-gold mt-2 d-block py-1">hotel.aurelia@icici</div>
                                            </div>
                                            <p class="small text-muted mb-2">Scan with Google Pay, PhonePe, Paytm, or any BHIM UPI app.</p>
                                            
                                            <div class="input-group input-group-sm mb-3">
                                                <span class="input-group-text bg-white">VPA ID</span>
                                                <input type="text" class="form-control" id="upiVpaInput" value="guest@okhdfcbank" placeholder="yourname@upi">
                                            </div>

                                            <div class="d-flex justify-content-center gap-2">
                                                <button type="button" class="btn btn-outline-primary btn-sm" onclick="PaymentService.simulateUpiApp('Google Pay')">
                                                    <i class="bi bi-phone me-1"></i>Simulate GPay
                                                </button>
                                                <button type="button" class="btn btn-outline-info btn-sm" onclick="PaymentService.simulateUpiApp('PhonePe')">
                                                    <i class="bi bi-phone me-1"></i>Simulate PhonePe
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- 4. NET BANKING PANE -->
                                <div class="tab-pane fade" id="pane-netbanking">
                                    <label class="form-label small fw-semibold text-navy mb-2">Select Preferred Financial Institution</label>
                                    <div class="row g-2 mb-3">
                                        <div class="col-6 col-sm-4">
                                            <label class="p-2 border rounded-3 d-flex align-items-center gap-2 bg-white w-100 cursor-pointer" style="cursor:pointer;">
                                                <input type="radio" name="nbBank" value="HDFC Bank" checked class="form-check-input">
                                                <span class="small fw-semibold">HDFC Bank</span>
                                            </label>
                                        </div>
                                        <div class="col-6 col-sm-4">
                                            <label class="p-2 border rounded-3 d-flex align-items-center gap-2 bg-white w-100 cursor-pointer" style="cursor:pointer;">
                                                <input type="radio" name="nbBank" value="State Bank of India" class="form-check-input">
                                                <span class="small fw-semibold">SBI Global</span>
                                            </label>
                                        </div>
                                        <div class="col-6 col-sm-4">
                                            <label class="p-2 border rounded-3 d-flex align-items-center gap-2 bg-white w-100 cursor-pointer" style="cursor:pointer;">
                                                <input type="radio" name="nbBank" value="ICICI Bank" class="form-check-input">
                                                <span class="small fw-semibold">ICICI Bank</span>
                                            </label>
                                        </div>
                                        <div class="col-6 col-sm-4">
                                            <label class="p-2 border rounded-3 d-flex align-items-center gap-2 bg-white w-100 cursor-pointer" style="cursor:pointer;">
                                                <input type="radio" name="nbBank" value="Axis Bank" class="form-check-input">
                                                <span class="small fw-semibold">Axis Bank</span>
                                            </label>
                                        </div>
                                        <div class="col-6 col-sm-4">
                                            <label class="p-2 border rounded-3 d-flex align-items-center gap-2 bg-white w-100 cursor-pointer" style="cursor:pointer;">
                                                <input type="radio" name="nbBank" value="Chase & J.P. Morgan" class="form-check-input">
                                                <span class="small fw-semibold">JPMorgan Chase</span>
                                            </label>
                                        </div>
                                        <div class="col-6 col-sm-4">
                                            <label class="p-2 border rounded-3 d-flex align-items-center gap-2 bg-white w-100 cursor-pointer" style="cursor:pointer;">
                                                <input type="radio" name="nbBank" value="Citibank Private" class="form-check-input">
                                                <span class="small fw-semibold">Citibank N.A.</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="form-text" style="font-size:0.75rem;">
                                        Simulates bank 2FA authorization redirect and instant webhook callback.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Gateway Footer Actions -->
                        <div class="modal-footer bg-light d-flex justify-content-between p-3 border-top">
                            <button type="button" class="btn btn-outline-danger btn-sm" onclick="PaymentService.simulateFailure()">
                                <i class="bi bi-x-circle me-1"></i>Simulate Gateway Rejection
                            </button>
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-light btn-sm" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-gold btn-sm px-4 fw-semibold" onclick="PaymentService.proceedToOtpVerification()">
                                    <i class="bi bi-shield-check me-1"></i>Proceed to Bank 3D-Secure ➔
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Realistic 3D Secure / Bank OTP Verification Modal -->
            <div class="modal fade" id="bankOtpModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                        <!-- Bank Secure Header -->
                        <div class="bg-navy-primary p-3 text-white d-flex justify-content-between align-items-center border-bottom border-warning-subtle">
                            <div class="d-flex align-items-center gap-2">
                                <i class="bi bi-shield-fill-check text-gold fs-4"></i>
                                <div>
                                    <h6 class="modal-title font-heading mb-0 text-white">Verified by Visa / Mastercard Identity Check</h6>
                                    <small class="text-white-50" style="font-size:0.7rem;">3D Secure 2.0 Customer Strong Authentication</small>
                                </div>
                            </div>
                            <span class="badge bg-gold text-dark font-monospace" id="otpTimerDisplay">01:58</span>
                        </div>

                        <div class="modal-body p-4 bg-white">
                            <div class="text-center mb-3">
                                <div class="badge bg-light text-navy border px-3 py-1 fs-6 mb-2">The Grand Aurelia Hotel & Resort</div>
                                <div class="fs-4 fw-bold text-navy" id="otpModalAmountDisplay">$0.00</div>
                                <small class="text-muted d-block mt-1">One-Time Password (OTP) dispatched to registered mobile: <strong class="text-dark">+1 (•••) •••-8821</strong></small>
                            </div>

                            <div class="bg-light p-3 rounded-3 border mb-3 text-center">
                                <label class="form-label small fw-bold text-navy mb-1">Enter 6-Digit Verification Code</label>
                                <div class="d-flex justify-content-center mb-2">
                                    <input type="text" class="form-control form-control-lg text-center font-monospace fw-bold fs-4" id="bankOtpInput" value="123456" maxlength="6" style="max-width: 220px; letter-spacing: 0.25em;">
                                </div>
                                <div class="d-flex justify-content-center gap-2">
                                    <button type="button" class="btn btn-sm btn-outline-primary py-0" style="font-size:0.75rem;" onclick="document.getElementById('bankOtpInput').value = '123456';">
                                        <i class="bi bi-lightning-fill me-1"></i>Auto-Fill 123456
                                    </button>
                                    <button type="button" class="btn btn-sm btn-link text-decoration-none py-0" style="font-size:0.75rem;" onclick="App.showToast('New simulated OTP dispatched: 123456', 'info')">
                                        Resend Code
                                    </button>
                                </div>
                            </div>

                            <div class="alert alert-info py-2 px-3 small rounded-3 mb-0 border-info-subtle d-flex align-items-center gap-2">
                                <i class="bi bi-info-circle-fill text-info fs-5 flex-shrink-0"></i>
                                <span style="font-size:0.75rem;">Simulating card issuing bank cryptographic verification. Upon confirmation, payment will be settled instantly into the resort financial ledger.</span>
                            </div>
                        </div>

                        <div class="modal-footer bg-light d-flex justify-content-between p-3 border-top">
                            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="PaymentService.backToGatewayModal()">
                                Back
                            </button>
                            <button type="button" class="btn btn-success btn-sm px-4 fw-semibold" id="btnConfirmAuthorize" onclick="PaymentService.confirmBankOtp()">
                                <i class="bi bi-check2-circle me-1"></i>Authorize Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    // Set Credit Card details helper
    setCreditCard: function (num, name, exp, cvv, brand) {
        document.getElementById('ccInputNumber').value = num;
        document.getElementById('ccInputName').value = name;
        document.getElementById('ccInputExpiry').value = exp;
        document.getElementById('ccInputCvv').value = cvv;
        this.onCardInput('credit');
        App.showToast(`Test ${brand} Card details applied.`, 'info');
    },

    // Set Debit Card details helper
    setDebitCard: function (num, name, exp, cvv, brand) {
        document.getElementById('dcInputNumber').value = num;
        document.getElementById('dcInputName').value = name;
        document.getElementById('dcInputExpiry').value = exp;
        document.getElementById('dcInputCvv').value = cvv;
        this.onCardInput('debit');
        App.showToast(`Test ${brand} details applied.`, 'info');
    },

    // Card Input update live visual
    onCardInput: function (type) {
        if (type === 'credit') {
            const num = document.getElementById('ccInputNumber').value || '•••• •••• •••• 4242';
            const name = document.getElementById('ccInputName').value || 'Eleanor Bennett';
            const exp = document.getElementById('ccInputExpiry').value || '12/28';

            const last4 = num.replace(/\s+/g, '').slice(-4) || '4242';
            document.getElementById('previewCcNumber').textContent = `•••• •••• •••• ${last4}`;
            document.getElementById('previewCcName').textContent = name;
            document.getElementById('previewCcExpiry').textContent = exp;
        } else {
            const num = document.getElementById('dcInputNumber').value || '•••• •••• •••• 8810';
            const name = document.getElementById('dcInputName').value || 'Julian Hayes';
            const exp = document.getElementById('dcInputExpiry').value || '10/29';

            const last4 = num.replace(/\s+/g, '').slice(-4) || '8810';
            document.getElementById('previewDcNumber').textContent = `•••• •••• •••• ${last4}`;
            document.getElementById('previewDcName').textContent = name;
            document.getElementById('previewDcExpiry').textContent = exp;
        }
    },

    // Simulate UPI app
    simulateUpiApp: function (appName) {
        App.showToast(`Simulating push notification request to ${appName}...`, 'info');
        setTimeout(() => {
            this.proceedToOtpVerification(appName);
        }, 600);
    },

    // Step 1: Open 3D Secure / OTP Verification Modal
    proceedToOtpVerification: function (customMethod = null) {
        // Detect which tab is active
        const activeTabEl = document.querySelector('#pgPaymentTabs .nav-link.active');
        let method = customMethod || 'Credit Card';
        let cardBrand = 'Visa';
        let cardLast4 = '4242';

        if (activeTabEl) {
            const id = activeTabEl.id;
            if (id === 'tab-btn-debit') {
                method = 'Debit Card';
                cardBrand = 'RuPay Debit';
                const num = document.getElementById('dcInputNumber').value.replace(/\s+/g, '');
                cardLast4 = num.slice(-4) || '8810';
            } else if (id === 'tab-btn-upi') {
                method = 'UPI';
                cardBrand = 'UPI / QR';
                cardLast4 = 'VPA';
            } else if (id === 'tab-btn-netbanking') {
                const checkedBank = document.querySelector('input[name="nbBank"]:checked');
                method = `Net Banking (${checkedBank ? checkedBank.value : 'HDFC Bank'})`;
                cardBrand = 'Net Banking';
                cardLast4 = 'Direct';
            } else {
                method = 'Credit Card';
                cardBrand = 'Visa Credit';
                const num = document.getElementById('ccInputNumber').value.replace(/\s+/g, '');
                cardLast4 = num.slice(-4) || '4242';
            }
        }

        // Hide Gateway modal
        const gatewayModalEl = document.getElementById('paymentGatewayModal');
        const gatewayModal = bootstrap.Modal.getInstance(gatewayModalEl);
        if (gatewayModal) gatewayModal.hide();

        // Update active payment context with payment details
        if (this.activePaymentContext) {
            this.activePaymentContext.method = method;
            this.activePaymentContext.cardBrand = cardBrand;
            this.activePaymentContext.cardLast4 = cardLast4;
        }

        // Open Bank OTP modal
        const amount = this.activePaymentContext ? (this.activePaymentContext.data.total || this.activePaymentContext.data.totalCost || this.activePaymentContext.data.amount) : 0;
        document.getElementById('otpModalAmountDisplay').textContent = App.formatCurrency(amount);

        const otpModalEl = document.getElementById('bankOtpModal');
        const otpModal = new bootstrap.Modal(otpModalEl);
        otpModal.show();
    },

    // Back from OTP to Gateway Modal
    backToGatewayModal: function () {
        const otpModalEl = document.getElementById('bankOtpModal');
        const otpModal = bootstrap.Modal.getInstance(otpModalEl);
        if (otpModal) otpModal.hide();

        const gatewayModalEl = document.getElementById('paymentGatewayModal');
        const gatewayModal = new bootstrap.Modal(gatewayModalEl);
        gatewayModal.show();
    },

    // Step 2: Confirm Bank OTP & Settle Transaction
    confirmBankOtp: function () {
        const otpInput = document.getElementById('bankOtpInput').value.trim();
        if (!otpInput || otpInput.length < 4) {
            App.showToast('Please enter a valid OTP code.', 'error');
            return;
        }

        const confirmBtn = document.getElementById('btnConfirmAuthorize');
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Verifying with Bank...';

        setTimeout(() => {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i>Authorize Payment';

            const otpModalEl = document.getElementById('bankOtpModal');
            const otpModal = bootstrap.Modal.getInstance(otpModalEl);
            if (otpModal) otpModal.hide();

            // Generate verified transaction ID
            const txnRef = `RZP_${Math.floor(100000 + Math.random() * 900000)}`;
            const ctx = this.activePaymentContext || {};
            const data = ctx.data || {};
            const amount = Number(data.total || data.totalCost || data.amount || 0);

            // Record into permanent LocalStorage Payments Ledger
            const paymentRecord = StorageService.recordPayment({
                refNumber: txnRef,
                category: data.category || (data.activityName ? 'Activity Prebooking' : data.roomType ? 'Room Booking' : 'Dining Order'),
                description: data.description || data.activityName || data.roomType || 'Hotel Service Settle',
                customerName: data.customerName || data.guestName || 'Valued Guest',
                customerEmail: data.customerEmail || data.guestEmail || '',
                method: ctx.method || 'Credit Card',
                cardBrand: ctx.cardBrand || 'Card',
                cardLast4: ctx.cardLast4 || '4242',
                subtotal: Number((amount / 1.05).toFixed(2)),
                tax: Number((amount - (amount / 1.05)).toFixed(2)),
                amount: amount,
                status: 'Settled'
            });

            App.showToast(`Payment of ${App.formatCurrency(amount)} Authorized via ${ctx.method}!`, 'success');

            if (ctx.onSuccess && typeof ctx.onSuccess === 'function') {
                ctx.onSuccess({
                    status: 'Successful',
                    transactionRef: txnRef,
                    method: `${ctx.method} (${ctx.cardBrand} •••• ${ctx.cardLast4})`,
                    paymentRecord: paymentRecord
                });
            }
        }, 900);
    },

    // Simulate Failure
    simulateFailure: function () {
        const modalEl = document.getElementById('paymentGatewayModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        App.showToast('Payment declined: Simulated bank network timeout.', 'error');

        if (this.activePaymentContext && typeof this.activePaymentContext.onFailure === 'function') {
            this.activePaymentContext.onFailure({
                status: 'Failed',
                reason: 'Customer cancelled transaction or gateway authorization timeout simulated.'
            });
        }
    },

    // Open Printable Official Tax Invoice / Folio Receipt Modal
    openReceiptModal: function (recordId) {
        // Find in orders, roomBookings, activityBookings, or payments
        const orders = StorageService.get(STORAGE_KEYS.ORDERS, []);
        const roomBookings = StorageService.get(STORAGE_KEYS.ROOM_BOOKINGS, []);
        const activityBookings = StorageService.get(STORAGE_KEYS.ACTIVITY_BOOKINGS, []);
        const payments = StorageService.get(STORAGE_KEYS.PAYMENTS, []);
        const settings = StorageService.get(STORAGE_KEYS.SETTINGS, {});

        let item = orders.find(o => o.id === recordId) ||
                   roomBookings.find(rb => rb.id === recordId) ||
                   activityBookings.find(ab => ab.id === recordId) ||
                   payments.find(p => p.id === recordId || p.refNumber === recordId);

        if (!item) {
            // Default to first order or payment if available
            item = orders[0] || payments[0];
            if (!item) {
                App.showToast('Invoice details not found!', 'error');
                return;
            }
        }

        let modalEl = document.getElementById('printableReceiptModal');
        if (!modalEl) {
            const containerHtml = `
                <div class="modal fade" id="printableReceiptModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content rounded-4 border-0 overflow-hidden shadow-lg">
                            <div class="modal-header bg-navy-primary text-white border-0 py-3 no-print">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="bi bi-printer text-gold fs-5"></i>
                                    <h5 class="modal-title font-heading mb-0 text-white">Official Tax Invoice & Folio Receipt</h5>
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

        // Determine item fields
        const refId = item.id || item.refNumber;
        const guestName = item.customerName || item.guestName || 'Valued Guest';
        const guestEmail = item.customerEmail || item.guestEmail || 'concierge@grandaurelia.com';
        const guestPhone = item.customerPhone || item.guestPhone || '+1 (555) 019-8821';
        const timestamp = item.createdAt || item.timestamp || new Date().toLocaleString();
        const payMethod = item.paymentMethod || item.method || 'Credit Card (Visa •••• 4242)';
        const payStatus = item.paymentStatus || item.status || 'Successful';
        const txnRef = item.transactionRef || item.refNumber || 'RZP_AUTH_88921';

        let rowsHtml = '';
        let subtotal = 0;
        let tax = 0;
        let grandTotal = 0;

        if (item.items && Array.isArray(item.items)) {
            // Food Order
            rowsHtml = item.items.map(i => `
                <tr>
                    <td class="py-2">${i.name}</td>
                    <td class="text-center py-2">${i.quantity}</td>
                    <td class="text-end py-2">${App.formatCurrency(i.price)}</td>
                    <td class="text-end py-2 fw-semibold">${App.formatCurrency(i.subtotal || (i.price * i.quantity))}</td>
                </tr>
            `).join('');
            subtotal = item.subtotal;
            tax = item.tax;
            grandTotal = item.total;
        } else if (item.roomType) {
            // Room Booking
            rowsHtml = `
                <tr>
                    <td class="py-2">Room Suite Accommodation: ${item.roomType} (Room ${item.roomNumber})</td>
                    <td class="text-center py-2">${item.nights} Night${item.nights > 1 ? 's' : ''}</td>
                    <td class="text-end py-2">${App.formatCurrency(item.totalCost / (item.nights * 1.05))}</td>
                    <td class="text-end py-2 fw-semibold">${App.formatCurrency(item.totalCost / 1.05)}</td>
                </tr>
            `;
            subtotal = Number((item.totalCost / 1.05).toFixed(2));
            tax = Number((item.totalCost - subtotal).toFixed(2));
            grandTotal = item.totalCost;
        } else if (item.activityName) {
            // Activity Prebooking
            rowsHtml = `
                <tr>
                    <td class="py-2">Resort Experience: ${item.activityName} (${item.bookingDate} • ${item.timeSlot})</td>
                    <td class="text-center py-2">${item.participants} Guest${item.participants > 1 ? 's' : ''}</td>
                    <td class="text-end py-2">${App.formatCurrency(item.subtotal / item.participants)}</td>
                    <td class="text-end py-2 fw-semibold">${App.formatCurrency(item.subtotal)}</td>
                </tr>
            `;
            subtotal = item.subtotal;
            tax = item.tax;
            grandTotal = item.totalCost;
        } else {
            // Generic Payment record
            rowsHtml = `
                <tr>
                    <td class="py-2">${item.description || 'Hospitality Services'}</td>
                    <td class="text-center py-2">1</td>
                    <td class="text-end py-2">${App.formatCurrency(item.subtotal || (item.amount / 1.05))}</td>
                    <td class="text-end py-2 fw-semibold">${App.formatCurrency(item.subtotal || (item.amount / 1.05))}</td>
                </tr>
            `;
            subtotal = item.subtotal || Number((item.amount / 1.05).toFixed(2));
            tax = item.tax || Number((item.amount - subtotal).toFixed(2));
            grandTotal = item.amount;
        }

        const content = `
            <div class="invoice-box">
                <!-- Header -->
                <div class="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <i class="bi bi-stars text-gold fs-3"></i>
                            <h2 class="font-heading fw-bold text-navy mb-0">${settings.hotelName || 'The Grand Aurelia Hotel & Resort'}</h2>
                        </div>
                        <div class="text-muted small">${settings.address || '742 Royal Promenade Avenue, Coastal Bay, CA'}</div>
                        <div class="text-muted small">Tel: ${settings.contactPhone || '+1 (800) 555-AURELIA'} | Email: ${settings.contactEmail || 'concierge@grandaurelia.com'}</div>
                        <div class="badge bg-gold-subtle text-dark border border-warning-subtle mt-2">GSTIN: 27AABCT8819Q1ZP</div>
                    </div>
                    <div class="text-end">
                        <span class="badge ${payStatus === 'Successful' || payStatus === 'Settled' ? 'bg-success' : 'bg-primary'} fs-6 px-3 py-1 text-uppercase">${payStatus}</span>
                        <div class="fw-bold mt-2 text-navy fs-5">${refId}</div>
                        <small class="text-muted">Dated: ${timestamp}</small>
                    </div>
                </div>

                <!-- Customer Details -->
                <div class="row mb-4">
                    <div class="col-sm-6 mb-3 mb-sm-0">
                        <h6 class="text-uppercase fw-bold text-muted small mb-2">Billed To (Guest)</h6>
                        <div class="fw-bold text-dark fs-6">${guestName}</div>
                        <div class="text-muted small"><i class="bi bi-envelope me-1"></i>${guestEmail}</div>
                        <div class="text-muted small"><i class="bi bi-telephone me-1"></i>${guestPhone}</div>
                    </div>
                    <div class="col-sm-6 text-sm-end">
                        <h6 class="text-uppercase fw-bold text-muted small mb-2">Settlement Details</h6>
                        <div class="small"><strong>Channel:</strong> <span class="badge bg-light text-dark border">${payMethod}</span></div>
                        <div class="small mt-1"><strong>Status:</strong> <span class="badge bg-success-subtle text-success">${payStatus}</span></div>
                        <div class="small text-muted mt-1 font-monospace" style="font-size:0.75rem;">Auth Ref: ${txnRef}</div>
                    </div>
                </div>

                <!-- Items Table -->
                <div class="table-responsive mb-4">
                    <table class="table table-bordered table-striped align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Description</th>
                                <th class="text-center" style="width: 90px;">Units</th>
                                <th class="text-end" style="width: 120px;">Unit Rate</th>
                                <th class="text-end" style="width: 130px;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-end fw-semibold">Net Subtotal:</td>
                                <td class="text-end fw-bold">${App.formatCurrency(subtotal)}</td>
                            </tr>
                            <tr>
                                <td colspan="3" class="text-end fw-semibold">Resort Fee & GST (5%):</td>
                                <td class="text-end">${App.formatCurrency(tax)}</td>
                            </tr>
                            <tr class="table-light">
                                <td colspan="3" class="text-end fw-bold fs-5 text-navy">Grand Total Paid:</td>
                                <td class="text-end fw-bold fs-5 text-gold">${App.formatCurrency(grandTotal)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- Footer notice -->
                <div class="border-top pt-3 text-center text-muted small">
                    <p class="mb-1">Thank you for visiting <strong>${settings.hotelName}</strong>.</p>
                    <p class="mb-0" style="font-size: 0.72rem;">Authentic Computer Generated Tax Invoice. Payment processed via Aurelia Secure Gateway.</p>
                </div>
            </div>
        `;

        document.getElementById('printableReceiptContent').innerHTML = content;
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
};
