/**
 * The Grand Aurelia Hotel Management System
 * Restaurant Table & Hotel Room Booking Engine
 */

const BookingsModule = {
    // ==========================================
    // 1. RESTAURANT TABLE RESERVATIONS
    // ==========================================
    initTableBooking: function () {
        this.populateTableSelectDropdown();
        this.renderTableList();
        this.renderTableBookingsList();
        this.setupTableForm();
    },

    // Populate available tables in the reservation form based on guest count
    populateTableSelectDropdown: function () {
        const select = document.getElementById('tableSelect');
        const guestInput = document.getElementById('tableGuestsInput');
        if (!select) return;

        const tables = StorageService.get(STORAGE_KEYS.TABLES, []);
        const guests = guestInput ? parseInt(guestInput.value) || 2 : 2;

        let html = '<option value="" disabled selected>-- Select a table --</option>';
        tables.forEach(table => {
            const isFit = table.capacity >= guests;
            html += `
                <option value="${table.id}" ${!isFit ? 'disabled' : ''}>
                    ${table.number} (${table.capacity} Guests) - ${table.location} ${!isFit ? '(Too small for party)' : ''} [${table.status}]
                </option>
            `;
        });
        select.innerHTML = html;
    },

    // Setup Table Booking Form
    setupTableForm: function () {
        const form = document.getElementById('tableReservationForm');
        const guestInput = document.getElementById('tableGuestsInput');
        const dateInput = document.getElementById('tableDateInput');

        if (dateInput && !dateInput.value) {
            // Default to today
            dateInput.value = new Date().toISOString().split('T')[0];
            dateInput.min = new Date().toISOString().split('T')[0];
        }

        if (guestInput) {
            guestInput.addEventListener('input', () => {
                this.populateTableSelectDropdown();
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTableBookingSubmit();
            });
        }
    },

    // Submit Table Reservation
    handleTableBookingSubmit: function () {
        const date = document.getElementById('tableDateInput').value;
        const timeSlot = document.getElementById('tableTimeSlotSelect').value;
        const guests = parseInt(document.getElementById('tableGuestsInput').value);
        const tableId = document.getElementById('tableSelect').value;
        const name = document.getElementById('custNameInput').value.trim();
        const email = document.getElementById('custEmailInput').value.trim();
        const phone = document.getElementById('custPhoneInput').value.trim();
        const specialRequests = document.getElementById('specialRequestsInput').value.trim();

        if (!date || !timeSlot || !guests || !tableId || !name || !email) {
            App.showToast('Please fill all mandatory reservation fields.', 'error');
            return;
        }

        const tables = StorageService.get(STORAGE_KEYS.TABLES, []);
        const selectedTable = tables.find(t => t.id === tableId);
        if (!selectedTable) {
            App.showToast('Selected table not found.', 'error');
            return;
        }

        // Validate table capacity
        if (guests > selectedTable.capacity) {
            App.showToast(`Selected table only accommodates ${selectedTable.capacity} guests. Please select a larger table.`, 'error');
            return;
        }

        // Prevent overlapping reservations for the same table and time
        const hasConflict = StorageService.checkTableConflict(tableId, date, timeSlot);
        if (hasConflict) {
            App.showToast(`Conflict: ${selectedTable.number} is already booked for ${date} at ${timeSlot}. Please choose another time or table.`, 'error');
            return;
        }

        const bookingId = StorageService.generateId('tb');
        const newBooking = {
            id: bookingId,
            tableId: tableId,
            tableNumber: selectedTable.number,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            date: date,
            timeSlot: timeSlot,
            guests: guests,
            specialRequests: specialRequests,
            status: 'Confirmed',
            createdAt: StorageService.nowString()
        };

        const bookings = StorageService.get(STORAGE_KEYS.TABLE_BOOKINGS, []);
        bookings.push(newBooking);
        StorageService.set(STORAGE_KEYS.TABLE_BOOKINGS, bookings);

        // Update table status if booking is today
        const todayStr = new Date().toISOString().split('T')[0];
        if (date === todayStr) {
            const tIdx = tables.findIndex(t => t.id === tableId);
            if (tIdx > -1 && tables[tIdx].status === 'Available') {
                tables[tIdx].status = 'Reserved';
                StorageService.set(STORAGE_KEYS.TABLES, tables);
            }
        }

        App.showToast(`Table booked successfully! Confirmation ID: ${bookingId}`, 'success');

        // Reset form
        document.getElementById('tableReservationForm').reset();
        this.populateTableSelectDropdown();
        this.renderTableList();
        this.renderTableBookingsList();

        // Show confirmation modal
        this.showTableBookingSuccessModal(newBooking);
    },

    // Show Table Booking Success Modal
    showTableBookingSuccessModal: function (booking) {
        let modalEl = document.getElementById('tableBookingSuccessModal');
        if (!modalEl) {
            const html = `
                <div class="modal fade" id="tableBookingSuccessModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content rounded-4 border-0 shadow">
                            <div class="modal-body p-4 text-center">
                                <div class="stat-icon bg-success-subtle text-success mx-auto mb-3" style="width:64px; height:64px; font-size:2rem; border-radius:50%;">
                                    <i class="bi bi-check2"></i>
                                </div>
                                <h4 class="font-heading fw-bold text-navy mb-1">Reservation Confirmed!</h4>
                                <p class="text-muted small mb-3">We look forward to welcoming you to The Grand Aurelia.</p>
                                
                                <div class="bg-light p-3 rounded-3 text-start mb-3 small">
                                    <div class="d-flex justify-content-between mb-1">
                                        <span class="text-muted">Booking Reference:</span>
                                        <span class="fw-bold font-monospace text-navy">${booking.id}</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-1">
                                        <span class="text-muted">Table:</span>
                                        <span class="fw-bold text-primary">${booking.tableNumber}</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-1">
                                        <span class="text-muted">Date & Time:</span>
                                        <span class="fw-semibold">${booking.date} at ${booking.timeSlot}</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span class="text-muted">Guests:</span>
                                        <span class="fw-semibold">${booking.guests} Person(s)</span>
                                    </div>
                                </div>

                                <button type="button" class="btn btn-gold btn-sm px-4" data-bs-dismiss="modal">Great, Got It</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            modalEl = document.getElementById('tableBookingSuccessModal');
        }
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    },

    // Render Table Status Grid (Floor Map / Table Status)
    renderTableList: function () {
        const container = document.getElementById('tablesOverviewGrid');
        if (!container) return;

        const tables = StorageService.get(STORAGE_KEYS.TABLES, []);
        const user = AuthService.getCurrentUser();
        const canManage = user && (user.role === 'Admin' || user.role === 'Manager' || user.role === 'Waiter');

        let html = '';
        tables.forEach(tbl => {
            let statusBadge = 'badge-available';
            if (tbl.status === 'Occupied') statusBadge = 'badge-occupied';
            if (tbl.status === 'Reserved') statusBadge = 'badge-pending';
            if (tbl.status === 'Cleaning') statusBadge = 'badge-cleaning';

            const activeOrder = StorageService.getActiveTableOrder ? StorageService.getActiveTableOrder(tbl.id) : null;
            const runningTotal = activeOrder ? App.formatCurrency(activeOrder.total) : '';

            html += `
                <div class="col-6 col-md-4 col-lg-2 mb-3">
                    <div class="card-hotel p-2 p-sm-3 text-center h-100 ${tbl.status === 'Occupied' ? 'border-danger' : tbl.status === 'Reserved' ? 'border-warning' : tbl.status === 'Cleaning' ? 'border-purple' : 'border-success'}">
                        <i class="bi bi-grid-3x3-gap fs-2 text-navy mb-1 d-block"></i>
                        <h6 class="fw-bold mb-1 font-heading text-dark fs-6">${tbl.number}</h6>
                        <small class="text-muted d-block mb-1" style="font-size: 0.72rem; line-height: 1.25;">${tbl.capacity} Seats • ${tbl.zone || tbl.location}</small>
                        <span class="badge-status ${statusBadge} mb-2">${tbl.status}</span>

                        ${activeOrder ? `
                            <div class="small fw-bold text-navy mb-1">Bill: ${runningTotal}</div>
                        ` : ''}

                        ${canManage ? `
                            <div class="d-flex flex-column gap-1 mt-2">
                                <a href="pos.html" class="btn btn-sm ${activeOrder ? 'btn-gold text-white' : 'btn-outline-navy'} w-100 py-1" style="font-size: 0.72rem;">
                                    <i class="bi bi-receipt-cutoff me-1"></i>${activeOrder ? 'Active POS' : 'Seat in POS'}
                                </a>
                                <div class="dropdown">
                                    <button class="btn btn-sm btn-outline-secondary w-100 dropdown-toggle py-0" style="font-size: 0.68rem;" data-bs-toggle="dropdown">
                                        Status
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-end shadow-sm small">
                                        <li><a class="dropdown-item py-1" href="javascript:void(0)" onclick="BookingsModule.updateTableStatus('${tbl.id}', 'Available')"><span class="badge-status badge-available me-1"></span>Available</a></li>
                                        <li><a class="dropdown-item py-1" href="javascript:void(0)" onclick="BookingsModule.updateTableStatus('${tbl.id}', 'Reserved')"><span class="badge-status badge-pending me-1"></span>Reserved</a></li>
                                        <li><a class="dropdown-item py-1" href="javascript:void(0)" onclick="BookingsModule.updateTableStatus('${tbl.id}', 'Occupied')"><span class="badge-status badge-occupied me-1"></span>Occupied</a></li>
                                        <li><a class="dropdown-item py-1" href="javascript:void(0)" onclick="BookingsModule.updateTableStatus('${tbl.id}', 'Cleaning')"><span class="badge-status badge-cleaning me-1"></span>Turnover</a></li>
                                    </ul>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    // Update table real-time status (Available, Reserved, Occupied)
    updateTableStatus: function (tableId, newStatus) {
        const tables = StorageService.get(STORAGE_KEYS.TABLES, []);
        const idx = tables.findIndex(t => t.id === tableId);
        if (idx > -1) {
            tables[idx].status = newStatus;
            StorageService.set(STORAGE_KEYS.TABLES, tables);
            App.showToast(`${tables[idx].number} status set to ${newStatus}.`, 'info');
            this.renderTableList();
            this.populateTableSelectDropdown();
        }
    },

    // Render Table Bookings List (Table view / cards)
    renderTableBookingsList: function () {
        const container = document.getElementById('tableBookingsList');
        if (!container) return;

        const allBookings = StorageService.get(STORAGE_KEYS.TABLE_BOOKINGS, []);
        const user = AuthService.getCurrentUser();
        const canManage = user && (user.role === 'Admin' || user.role === 'Manager' || user.role === 'Receptionist' || user.role === 'Waiter');

        let filtered = allBookings;
        if (user && user.role === 'Customer') {
            filtered = allBookings.filter(b => b.customerEmail.toLowerCase() === user.email.toLowerCase());
        }

        // Sort by date descending
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="bi bi-calendar-x text-muted fs-2 mb-2 d-block"></i>
                    <p class="text-muted small mb-0">No active table reservations recorded.</p>
                </div>
            `;
            return;
        }

        let tableRows = '';
        let mobileCards = '';

        filtered.forEach(b => {
            let statusBadge = 'badge-confirmed';
            if (b.status === 'Pending') statusBadge = 'badge-pending';
            if (b.status === 'Seated') statusBadge = 'badge-occupied';
            if (b.status === 'Completed') statusBadge = 'badge-delivered';
            if (b.status === 'Cancelled') statusBadge = 'badge-cancelled';

            const actionDropdown = b.status !== 'Cancelled' && b.status !== 'Completed' ? `
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" style="font-size: 0.75rem;" data-bs-toggle="dropdown">
                        Status
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm small">
                        ${canManage ? `
                            <li><a class="dropdown-item py-1" href="javascript:void(0)" onclick="BookingsModule.updateReservationStatus('${b.id}', 'Confirmed')">Confirm</a></li>
                            <li><a class="dropdown-item py-1" href="javascript:void(0)" onclick="BookingsModule.updateReservationStatus('${b.id}', 'Seated')">Mark Seated</a></li>
                            <li><a class="dropdown-item py-1" href="javascript:void(0)" onclick="BookingsModule.updateReservationStatus('${b.id}', 'Completed')">Complete</a></li>
                            <li><hr class="dropdown-divider my-1"></li>
                        ` : ''}
                        <li><a class="dropdown-item py-1 text-danger" href="javascript:void(0)" onclick="BookingsModule.updateReservationStatus('${b.id}', 'Cancelled')">Cancel Reservation</a></li>
                    </ul>
                </div>
            ` : '<span class="text-muted small">Archived</span>';

            // Desktop Row
            tableRows += `
                <tr>
                    <td class="fw-bold font-monospace text-navy">${b.id}</td>
                    <td>
                        <div class="fw-semibold text-dark">${b.customerName}</div>
                        <small class="text-muted">${b.customerPhone || b.customerEmail}</small>
                    </td>
                    <td><span class="badge bg-primary-subtle text-primary border">${b.tableNumber}</span></td>
                    <td>
                        <div class="fw-medium text-dark">${b.date}</div>
                        <small class="text-muted">${b.timeSlot}</small>
                    </td>
                    <td><span class="badge bg-light text-dark border">${b.guests} Guests</span></td>
                    <td><span class="badge-status ${statusBadge}">${b.status}</span></td>
                    <td class="text-end">${actionDropdown}</td>
                </tr>
            `;

            // Mobile Card
            mobileCards += `
                <div class="mobile-record-card">
                    <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                        <div>
                            <span class="fw-bold font-monospace text-navy">${b.id}</span>
                            <span class="badge bg-primary-subtle text-primary border ms-2">${b.tableNumber}</span>
                        </div>
                        <span class="badge-status ${statusBadge}">${b.status}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <div class="fw-bold text-dark">${b.customerName}</div>
                            <small class="text-muted">${b.customerPhone || b.customerEmail}</small>
                        </div>
                        <span class="badge bg-light text-dark border">${b.guests} Guests</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                        <small class="text-muted"><i class="bi bi-clock me-1"></i>${b.date} at ${b.timeSlot}</small>
                        <div>${actionDropdown}</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="d-none d-md-block">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Ref ID</th>
                                <th>Guest</th>
                                <th>Table</th>
                                <th>Date & Slot</th>
                                <th>Guests</th>
                                <th>Status</th>
                                <th class="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </div>
            </div>
            <div class="d-md-none">
                ${mobileCards}
            </div>
        `;
    },

    // Update Reservation Status
    updateReservationStatus: function (bookingId, newStatus) {
        const bookings = StorageService.get(STORAGE_KEYS.TABLE_BOOKINGS, []);
        const idx = bookings.findIndex(b => b.id === bookingId);
        if (idx > -1) {
            bookings[idx].status = newStatus;
            StorageService.set(STORAGE_KEYS.TABLE_BOOKINGS, bookings);

            // If marked Seated, update table to Occupied
            if (newStatus === 'Seated') {
                const tables = StorageService.get(STORAGE_KEYS.TABLES, []);
                const tIdx = tables.findIndex(t => t.id === bookings[idx].tableId);
                if (tIdx > -1) {
                    tables[tIdx].status = 'Occupied';
                    StorageService.set(STORAGE_KEYS.TABLES, tables);
                }
            } else if (newStatus === 'Completed' || newStatus === 'Cancelled') {
                const tables = StorageService.get(STORAGE_KEYS.TABLES, []);
                const tIdx = tables.findIndex(t => t.id === bookings[idx].tableId);
                if (tIdx > -1 && tables[tIdx].status !== 'Available') {
                    tables[tIdx].status = 'Available';
                    StorageService.set(STORAGE_KEYS.TABLES, tables);
                }
            }

            App.showToast(`Reservation ${bookingId} marked as ${newStatus}.`, 'info');
            this.renderTableList();
            this.renderTableBookingsList();
        }
    },


    // ==========================================
    // 2. HOTEL ROOM RESERVATIONS & STAYS
    // ==========================================
    initRoomBooking: function () {
        this.renderRoomsGrid();
        this.renderRoomBookingsList();
        this.setupRoomDates();
    },

    // Setup Room Dates (Defaults to today and tomorrow)
    setupRoomDates: function () {
        const checkIn = document.getElementById('roomCheckInInput');
        const checkOut = document.getElementById('roomCheckOutInput');
        if (!checkIn || !checkOut) return;

        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        checkIn.min = todayStr;
        checkIn.value = todayStr;

        checkOut.min = tomorrowStr;
        checkOut.value = tomorrowStr;

        const calculateStay = () => {
            const inDate = new Date(checkIn.value);
            const outDate = new Date(checkOut.value);
            const diffTime = outDate - inDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const durationSpan = document.getElementById('stayDurationBadge');
            if (durationSpan) {
                if (diffDays <= 0) {
                    durationSpan.textContent = 'Invalid Dates';
                    durationSpan.className = 'badge bg-danger';
                } else {
                    durationSpan.textContent = `${diffDays} Night${diffDays > 1 ? 's' : ''}`;
                    durationSpan.className = 'badge bg-primary';
                }
            }
        };

        checkIn.addEventListener('change', () => {
            checkOut.min = checkIn.value;
            calculateStay();
        });
        checkOut.addEventListener('change', calculateStay);
        calculateStay();
    },

    // Render Hotel Room Cards
    renderRoomsGrid: function () {
        const container = document.getElementById('roomsListingGrid');
        if (!container) return;

        const rooms = StorageService.get(STORAGE_KEYS.ROOMS, []);
        let html = '';

        rooms.forEach(room => {
            let statusBadge = 'badge-available';
            if (room.status === 'Occupied') statusBadge = 'badge-occupied';
            if (room.status === 'Reserved') statusBadge = 'badge-pending';
            if (room.status === 'Cleaning') statusBadge = 'badge-cleaning';

            const amenitiesHtml = (room.amenities || []).slice(0, 3).map(a => `
                <span class="badge bg-light text-dark border me-1 mb-1" style="font-size:0.7rem;"><i class="bi bi-check2 text-gold me-1"></i>${a}</span>
            `).join('');

            html += `
                <div class="col-12 col-md-6 col-lg-4 mb-4">
                    <div class="room-card h-100 d-flex flex-direction-column">
                        <div class="position-relative">
                            <img src="${room.image}" class="room-card-img" alt="${room.type}">
                            <div class="position-absolute top-0 start-0 m-2">
                                <span class="badge bg-navy-surface text-white shadow-sm font-monospace">Room ${room.number}</span>
                                <span class="badge bg-warning text-dark shadow-sm ms-1">${room.category}</span>
                            </div>
                            <div class="position-absolute top-0 end-0 m-2">
                                <span class="badge-status ${statusBadge} shadow-sm">${room.status}</span>
                            </div>
                        </div>

                        <div class="p-3 d-flex flex-column flex-grow-1">
                            <div class="d-flex justify-content-between align-items-start mb-1">
                                <h5 class="fw-bold font-heading text-dark mb-0">${room.type}</h5>
                                <div class="text-end">
                                    <span class="fs-5 fw-bold text-gold">${App.formatCurrency(room.pricePerNight)}</span>
                                    <small class="text-muted d-block" style="font-size:0.75rem;">/ night</small>
                                </div>
                            </div>

                            <p class="small text-muted mb-2">
                                <i class="bi bi-people me-1"></i>Up to ${room.capacity} Guests • <i class="bi bi-bounding-box me-1"></i>${room.size} • ${room.bedType}
                            </p>

                            <div class="mb-3">${amenitiesHtml}</div>

                            <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="BookingsModule.openRoomDetailsModal('${room.id}')">
                                    View Suite
                                </button>
                                <button type="button" class="btn btn-gold btn-sm px-3" onclick="BookingsModule.openBookStayModal('${room.id}')" ${room.status === 'Occupied' ? 'disabled' : ''}>
                                    <i class="bi bi-calendar-plus me-1"></i>Book Suite
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    // View Room Details Modal
    openRoomDetailsModal: function (roomId) {
        const rooms = StorageService.get(STORAGE_KEYS.ROOMS, []);
        const room = rooms.find(r => r.id === roomId);
        if (!room) return;

        let modalEl = document.getElementById('roomDetailsModal');
        if (!modalEl) {
            const html = `
                <div class="modal fade" id="roomDetailsModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content rounded-4 border-0 shadow">
                            <div class="modal-body p-0" id="roomDetailsModalBody"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            modalEl = document.getElementById('roomDetailsModal');
        }

        const amenitiesList = (room.amenities || []).map(a => `
            <div class="col-6 mb-2 small"><i class="bi bi-patch-check-fill text-gold me-2"></i>${a}</div>
        `).join('');

        const content = `
            <div class="position-relative">
                <img src="${room.image}" style="width:100%; height:320px; object-fit:cover;" class="rounded-top-4">
                <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3 p-2 bg-dark rounded-circle" data-bs-dismiss="modal"></button>
            </div>
            <div class="p-4">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <span class="badge bg-primary text-uppercase">${room.category} Class</span>
                        <h3 class="font-heading fw-bold text-navy mt-1">${room.type} (Room ${room.number})</h3>
                    </div>
                    <div class="text-end">
                        <div class="fs-4 fw-bold text-gold">${App.formatCurrency(room.pricePerNight)}</div>
                        <small class="text-muted">per night + 5% tax</small>
                    </div>
                </div>
                <div class="d-flex gap-4 text-muted small mb-3 pb-3 border-bottom">
                    <span><i class="bi bi-people-fill me-1"></i>Accommodates ${room.capacity} Guests</span>
                    <span><i class="bi bi-aspect-ratio me-1"></i>${room.size}</span>
                    <span><i class="bi bi-moon-stars-fill me-1"></i>${room.bedType}</span>
                </div>
                <h6 class="fw-bold text-navy mb-2">Curated Suite Amenities</h6>
                <div class="row mb-4">${amenitiesList}</div>
                <div class="d-flex justify-content-between align-items-center pt-3 border-top">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-gold px-4" onclick="bootstrap.Modal.getInstance(document.getElementById('roomDetailsModal')).hide(); BookingsModule.openBookStayModal('${room.id}');">
                        Proceed to Reservation
                    </button>
                </div>
            </div>
        `;

        document.getElementById('roomDetailsModalBody').innerHTML = content;
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    },

    // Open Book Stay Modal
    openBookStayModal: function (roomId) {
        const rooms = StorageService.get(STORAGE_KEYS.ROOMS, []);
        const room = rooms.find(r => r.id === roomId);
        if (!room) return;

        const user = AuthService.getCurrentUser();

        let modalEl = document.getElementById('bookStayModal');
        if (!modalEl) {
            const html = `
                <div class="modal fade" id="bookStayModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content rounded-4 border-0 shadow">
                            <div class="modal-header bg-navy-primary text-white">
                                <h5 class="modal-title font-heading text-white mb-0">Confirm Room Stay</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body p-4" id="bookStayModalBody"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            modalEl = document.getElementById('bookStayModal');
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const content = `
            <form id="stayBookingForm" onsubmit="event.preventDefault(); BookingsModule.handleRoomStayBooking('${room.id}');">
                <div class="bg-light p-3 rounded-3 mb-3 d-flex justify-content-between align-items-center border">
                    <div>
                        <span class="badge bg-primary text-white mb-1">Room ${room.number}</span>
                        <h6 class="fw-bold font-heading text-navy mb-0">${room.type}</h6>
                        <small class="text-muted">Rate: ${App.formatCurrency(room.pricePerNight)} / night</small>
                    </div>
                    <img src="${room.image}" width="70" height="55" class="rounded-2" style="object-fit:cover;">
                </div>

                <div class="row g-2 mb-3">
                    <div class="col-6">
                        <label class="form-label small fw-semibold">Check-in Date *</label>
                        <input type="date" class="form-control form-control-sm" id="modalCheckInDate" value="${todayStr}" min="${todayStr}" required onchange="BookingsModule.recalculateStayCost('${room.id}')">
                    </div>
                    <div class="col-6">
                        <label class="form-label small fw-semibold">Check-out Date *</label>
                        <input type="date" class="form-control form-control-sm" id="modalCheckOutDate" value="${tomorrowStr}" min="${tomorrowStr}" required onchange="BookingsModule.recalculateStayCost('${room.id}')">
                    </div>
                </div>

                <div class="row g-2 mb-3">
                    <div class="col-6">
                        <label class="form-label small fw-semibold">Adult Guests *</label>
                        <input type="number" class="form-control form-control-sm" id="modalAdultsInput" value="2" min="1" max="${room.capacity}" required>
                    </div>
                    <div class="col-6">
                        <label class="form-label small fw-semibold">Stay Duration</label>
                        <input type="text" class="form-control form-control-sm bg-light fw-bold text-navy" id="modalDurationDisplay" value="1 Night" readonly>
                    </div>
                </div>

                <div class="mb-2">
                    <label class="form-label small fw-semibold">Lead Guest Name *</label>
                    <input type="text" class="form-control form-control-sm" id="modalGuestName" value="${user ? user.name : ''}" required>
                </div>
                <div class="row g-2 mb-3">
                    <div class="col-6">
                        <label class="form-label small fw-semibold">Email *</label>
                        <input type="email" class="form-control form-control-sm" id="modalGuestEmail" value="${user ? user.email : ''}" required>
                    </div>
                    <div class="col-6">
                        <label class="form-label small fw-semibold">Phone *</label>
                        <input type="tel" class="form-control form-control-sm" id="modalGuestPhone" value="${user && user.phone ? user.phone : '+1 (555) 019-8821'}" required>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-navy mb-1"><i class="bi bi-credit-card-2-front text-gold me-1"></i>Settlement Method *</label>
                    <select class="form-select form-select-sm" id="modalRoomPaymentChoice">
                        <option value="Online">Pay Online Now via Debit / Credit Card Gateway (Instant Guarantee)</option>
                        <option value="FrontDesk">Pay on Check-In at Front Desk / Concierge</option>
                    </select>
                </div>

                <div class="d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-gold btn-sm px-4">
                        <i class="bi bi-lock-fill me-1"></i>Confirm Reservation
                    </button>
                </div>
            </form>
        `;

        document.getElementById('bookStayModalBody').innerHTML = content;
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    },

    // Recalculate stay cost in modal
    recalculateStayCost: function (roomId) {
        const rooms = StorageService.get(STORAGE_KEYS.ROOMS, []);
        const room = rooms.find(r => r.id === roomId);
        if (!room) return;

        const inVal = document.getElementById('modalCheckInDate').value;
        const outVal = document.getElementById('modalCheckOutDate').value;

        if (!inVal || !outVal) return;

        const inDate = new Date(inVal);
        const outDate = new Date(outVal);
        const diffDays = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            document.getElementById('modalDurationDisplay').value = 'Invalid Date';
            return;
        }

        const nights = diffDays;
        const subtotal = nights * room.pricePerNight;
        const tax = subtotal * 0.05;
        const total = subtotal + tax;

        document.getElementById('modalDurationDisplay').value = `${nights} Night${nights > 1 ? 's' : ''}`;
        document.getElementById('modalStayMathText').textContent = `${nights} Night${nights > 1 ? 's' : ''} × ${App.formatCurrency(room.pricePerNight)}:`;
        document.getElementById('modalStaySubtotal').textContent = App.formatCurrency(subtotal);
        document.getElementById('modalStayTax').textContent = App.formatCurrency(tax);
        document.getElementById('modalStayTotal').textContent = App.formatCurrency(total);
    },

    // Handle Room Stay Booking Submit
    handleRoomStayBooking: function (roomId) {
        const rooms = StorageService.get(STORAGE_KEYS.ROOMS, []);
        const room = rooms.find(r => r.id === roomId);
        if (!room) return;

        const checkIn = document.getElementById('modalCheckInDate').value;
        const checkOut = document.getElementById('modalCheckOutDate').value;
        const guests = parseInt(document.getElementById('modalAdultsInput').value) || 1;
        const name = document.getElementById('modalGuestName').value.trim();
        const email = document.getElementById('modalGuestEmail').value.trim();
        const phone = document.getElementById('modalGuestPhone').value.trim();

        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);
        const nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));

        if (nights <= 0) {
            App.showToast('Check-out date must be after check-in date.', 'error');
            return;
        }

        // Validate availability
        const isAvailable = StorageService.checkRoomAvailability(roomId, checkIn, checkOut);
        if (!isAvailable) {
            App.showToast(`Room ${room.number} is unavailable for selected dates. Please choose another date or room.`, 'error');
            return;
        }

        const paymentChoice = document.getElementById('modalRoomPaymentChoice').value;
        const subtotal = nights * room.pricePerNight;
        const tax = subtotal * 0.05;
        const totalCost = subtotal + tax;
        const bookingId = StorageService.generateId('rb');

        const newBooking = {
            id: bookingId,
            roomId: room.id,
            roomNumber: room.number,
            roomType: room.type,
            guestName: name,
            guestEmail: email,
            guestPhone: phone,
            checkIn: checkIn,
            checkOut: checkOut,
            nights: nights,
            adults: guests,
            totalCost: Number(totalCost.toFixed(2)),
            paymentStatus: 'Pending',
            paymentMethod: paymentChoice === 'Online' ? 'Credit / Debit Card' : 'Pay at Front Desk',
            transactionRef: `PAY_PENDING_${bookingId}`,
            bookingStatus: 'Confirmed',
            createdAt: StorageService.nowString()
        };

        const modalEl = document.getElementById('bookStayModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        if (paymentChoice === 'Online') {
            // Launch Debit/Credit Card Gateway
            PaymentService.openPaymentModal({
                id: bookingId,
                total: totalCost,
                description: `Suite ${room.number} - ${room.type} (${nights} Night${nights > 1 ? 's' : ''})`,
                customerName: name,
                customerEmail: email,
                customerPhone: phone,
                category: 'Room Booking'
            }, (res) => {
                // Payment Successful
                newBooking.paymentStatus = 'Successful';
                newBooking.paymentMethod = res.method || 'Credit Card';
                newBooking.transactionRef = res.transactionRef;

                const bookings = StorageService.get(STORAGE_KEYS.ROOM_BOOKINGS, []);
                bookings.push(newBooking);
                StorageService.set(STORAGE_KEYS.ROOM_BOOKINGS, bookings);

                // Update room status
                if (checkIn === new Date().toISOString().split('T')[0]) {
                    const rIdx = rooms.findIndex(r => r.id === roomId);
                    if (rIdx > -1) {
                        rooms[rIdx].status = 'Reserved';
                        StorageService.set(STORAGE_KEYS.ROOMS, rooms);
                    }
                }

                App.showToast(`Suite ${room.number} reserved & paid! Folio: ${bookingId}`, 'success');
                BookingsModule.renderRoomsGrid();
                BookingsModule.renderRoomBookingsList();
                PaymentService.openReceiptModal(bookingId);
            }, (err) => {
                App.showToast(err.reason || 'Payment was cancelled. Room reservation not finalized.', 'error');
            });
        } else {
            // Pay on Arrival
            newBooking.paymentStatus = 'Pending';
            newBooking.paymentMethod = 'Pay at Front Desk';
            
            const bookings = StorageService.get(STORAGE_KEYS.ROOM_BOOKINGS, []);
            bookings.push(newBooking);
            StorageService.set(STORAGE_KEYS.ROOM_BOOKINGS, bookings);

            if (checkIn === new Date().toISOString().split('T')[0]) {
                const rIdx = rooms.findIndex(r => r.id === roomId);
                if (rIdx > -1) {
                    rooms[rIdx].status = 'Reserved';
                    StorageService.set(STORAGE_KEYS.ROOMS, rooms);
                }
            }

            App.showToast(`Room ${room.number} booked successfully! Folio: ${bookingId}`, 'success');
            this.renderRoomsGrid();
            this.renderRoomBookingsList();
        }
    },

    // Settle Room Booking Online via Payment Gateway
    payRoomBookingOnline: function (bookingId) {
        const bookings = StorageService.get(STORAGE_KEYS.ROOM_BOOKINGS, []);
        const b = bookings.find(item => item.id === bookingId);
        if (!b) return;

        PaymentService.openPaymentModal({
            id: b.id,
            total: b.totalCost,
            description: `Suite ${b.roomNumber} - ${b.roomType} (${b.nights} Night${b.nights > 1 ? 's' : ''})`,
            customerName: b.guestName,
            customerEmail: b.guestEmail,
            customerPhone: b.guestPhone,
            category: 'Room Booking'
        }, (res) => {
            StorageService.updateRoomBookingPayment(bookingId, 'Successful', res.transactionRef, res.method);
            App.showToast(`Folio ${bookingId} settled successfully!`, 'success');
            BookingsModule.renderRoomsGrid();
            BookingsModule.renderRoomBookingsList();
            PaymentService.openReceiptModal(bookingId);
        }, (err) => {
            App.showToast(err.reason || 'Payment could not be settled.', 'error');
        });
    },

    // Render Room Bookings List (Check-in/out table for Reception/Admin)
    renderRoomBookingsList: function () {
        const desktopContainer = document.getElementById('roomBookingsTableBody');
        const mobileContainer = document.getElementById('roomBookingsMobileList');
        if (!desktopContainer && !mobileContainer) return;

        const allBookings = StorageService.get(STORAGE_KEYS.ROOM_BOOKINGS, []);
        const user = AuthService.getCurrentUser();
        const canManage = user && (user.role === 'Admin' || user.role === 'Manager' || user.role === 'Receptionist');

        let filtered = allBookings;
        if (user && user.role === 'Customer') {
            filtered = allBookings.filter(b => b.guestEmail.toLowerCase() === user.email.toLowerCase());
        }

        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (filtered.length === 0) {
            if (desktopContainer) {
                desktopContainer.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted small">No hotel reservations recorded yet.</td></tr>`;
            }
            if (mobileContainer) {
                mobileContainer.innerHTML = `<div class="text-center py-4 text-muted small">No hotel reservations recorded yet.</div>`;
            }
            return;
        }

        let tableHtml = '';
        let cardsHtml = '';

        filtered.forEach(b => {
            let statusBadge = 'badge-confirmed';
            if (b.bookingStatus === 'Occupied') statusBadge = 'badge-occupied';
            if (b.bookingStatus === 'Checked-Out') statusBadge = 'badge-delivered';
            if (b.bookingStatus === 'Cancelled') statusBadge = 'badge-cancelled';

            const actionButtons = canManage ? `
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" style="font-size:0.75rem;" data-bs-toggle="dropdown">
                        Action
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm small">
                        ${b.paymentStatus !== 'Successful' ? `
                            <li><a class="dropdown-item py-1 text-success fw-semibold" href="javascript:void(0)" onclick="BookingsModule.payRoomBookingOnline('${b.id}')"><i class="bi bi-credit-card me-1"></i>Settle via Card Gateway</a></li>
                            <li><hr class="dropdown-divider my-1"></li>
                        ` : ''}
                        <li><a class="dropdown-item py-1" href="javascript:void(0)" onclick="PaymentService.openReceiptModal('${b.id}')"><i class="bi bi-receipt me-1"></i>Tax Invoice / Folio</a></li>
                        ${b.bookingStatus === 'Confirmed' ? `
                            <li><a class="dropdown-item py-1 text-primary fw-semibold" href="javascript:void(0)" onclick="BookingsModule.checkInGuest('${b.id}')"><i class="bi bi-box-arrow-in-right me-1"></i>Check-In Guest</a></li>
                        ` : ''}
                        ${b.bookingStatus === 'Occupied' ? `
                            <li><a class="dropdown-item py-1 text-info fw-semibold" href="javascript:void(0)" onclick="BookingsModule.checkOutGuest('${b.id}')"><i class="bi bi-box-arrow-left me-1"></i>Check-Out Guest</a></li>
                        ` : ''}
                        ${b.bookingStatus !== 'Cancelled' && b.bookingStatus !== 'Checked-Out' ? `
                            <li><hr class="dropdown-divider my-1"></li>
                            <li><a class="dropdown-item py-1 text-danger" href="javascript:void(0)" onclick="BookingsModule.cancelRoomBooking('${b.id}')"><i class="bi bi-x-circle me-1"></i>Cancel Stay</a></li>
                        ` : ''}
                    </ul>
                </div>
            ` : `
                <div class="d-flex gap-1 justify-content-end">
                    ${b.paymentStatus !== 'Successful' ? `
                        <button type="button" class="btn btn-sm btn-gold py-0 px-2" style="font-size:0.75rem;" onclick="BookingsModule.payRoomBookingOnline('${b.id}')">
                            <i class="bi bi-credit-card me-1"></i>Pay
                        </button>
                    ` : ''}
                    <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" style="font-size:0.75rem;" onclick="PaymentService.openReceiptModal('${b.id}')">
                        <i class="bi bi-receipt me-1"></i>Folio
                    </button>
                    ${b.bookingStatus === 'Confirmed' ? `
                        <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2" style="font-size:0.75rem;" onclick="BookingsModule.cancelRoomBooking('${b.id}')">Cancel</button>
                    ` : ''}
                </div>
            `;

            // Desktop Table Row
            tableHtml += `
                <tr>
                    <td class="fw-bold font-monospace text-navy">${b.id}</td>
                    <td>
                        <div class="fw-semibold text-dark">${b.guestName}</div>
                        <small class="text-muted">${b.guestEmail}</small>
                    </td>
                    <td>
                        <span class="badge bg-navy-surface text-white">Room ${b.roomNumber}</span>
                        <small class="d-block text-muted">${b.roomType}</small>
                    </td>
                    <td>
                        <div class="small fw-semibold text-dark">${b.checkIn} ➔ ${b.checkOut}</div>
                        <small class="text-muted">${b.nights} night(s)</small>
                    </td>
                    <td class="fw-bold text-navy">${App.formatCurrency(b.totalCost)}</td>
                    <td><span class="badge ${b.paymentStatus === 'Successful' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'}">${b.paymentStatus}</span></td>
                    <td><span class="badge-status ${statusBadge}">${b.bookingStatus}</span></td>
                    <td class="text-end">${actionButtons}</td>
                </tr>
            `;

            // Mobile Card
            cardsHtml += `
                <div class="mobile-record-card">
                    <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                        <div>
                            <span class="fw-bold font-monospace text-navy">${b.id}</span>
                            <span class="badge bg-navy-surface text-white ms-2">Room ${b.roomNumber}</span>
                        </div>
                        <span class="badge-status ${statusBadge}">${b.bookingStatus}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <div class="fw-bold text-dark">${b.guestName}</div>
                            <small class="text-muted">${b.roomType}</small>
                        </div>
                        <div class="text-end">
                            <div class="fw-bold text-gold">${App.formatCurrency(b.totalCost)}</div>
                            <small class="badge ${b.paymentStatus === 'Successful' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}" style="font-size:0.65rem;">${b.paymentStatus}</small>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                        <small class="text-muted"><i class="bi bi-calendar-event me-1"></i>${b.checkIn} to ${b.checkOut} (${b.nights}n)</small>
                        <div>${actionButtons}</div>
                    </div>
                </div>
            `;
        });

        if (desktopContainer) desktopContainer.innerHTML = tableHtml;
        if (mobileContainer) mobileContainer.innerHTML = cardsHtml;
    },

    // Receptionist Check-In Guest
    checkInGuest: function (bookingId) {
        const bookings = StorageService.get(STORAGE_KEYS.ROOM_BOOKINGS, []);
        const bIdx = bookings.findIndex(b => b.id === bookingId);
        if (bIdx > -1) {
            bookings[bIdx].bookingStatus = 'Occupied';
            bookings[bIdx].paymentStatus = 'Successful'; // Settle upon check-in
            StorageService.set(STORAGE_KEYS.ROOM_BOOKINGS, bookings);

            // Update room
            const rooms = StorageService.get(STORAGE_KEYS.ROOMS, []);
            const rIdx = rooms.findIndex(r => r.id === bookings[bIdx].roomId);
            if (rIdx > -1) {
                rooms[rIdx].status = 'Occupied';
                StorageService.set(STORAGE_KEYS.ROOMS, rooms);
            }

            App.showToast(`Guest checked in! Room ${bookings[bIdx].roomNumber} marked Occupied.`, 'success');
            this.renderRoomsGrid();
            this.renderRoomBookingsList();
        }
    },

    // Receptionist Check-Out Guest
    checkOutGuest: function (bookingId) {
        const bookings = StorageService.get(STORAGE_KEYS.ROOM_BOOKINGS, []);
        const bIdx = bookings.findIndex(b => b.id === bookingId);
        if (bIdx > -1) {
            bookings[bIdx].bookingStatus = 'Checked-Out';
            StorageService.set(STORAGE_KEYS.ROOM_BOOKINGS, bookings);

            // Update room to Cleaning
            const rooms = StorageService.get(STORAGE_KEYS.ROOMS, []);
            const rIdx = rooms.findIndex(r => r.id === bookings[bIdx].roomId);
            if (rIdx > -1) {
                rooms[rIdx].status = 'Cleaning';
                StorageService.set(STORAGE_KEYS.ROOMS, rooms);
            }

            App.showToast(`Guest checked out. Room ${bookings[bIdx].roomNumber} queued for Housekeeping / Cleaning.`, 'info');
            this.renderRoomsGrid();
            this.renderRoomBookingsList();
        }
    },

    // Cancel Room Booking
    cancelRoomBooking: function (bookingId) {
        if (!confirm('Are you sure you want to cancel this room reservation?')) return;

        const bookings = StorageService.get(STORAGE_KEYS.ROOM_BOOKINGS, []);
        const bIdx = bookings.findIndex(b => b.id === bookingId);
        if (bIdx > -1) {
            bookings[bIdx].bookingStatus = 'Cancelled';
            StorageService.set(STORAGE_KEYS.ROOM_BOOKINGS, bookings);

            // Free room
            const rooms = StorageService.get(STORAGE_KEYS.ROOMS, []);
            const rIdx = rooms.findIndex(r => r.id === bookings[bIdx].roomId);
            if (rIdx > -1 && rooms[rIdx].status !== 'Occupied') {
                rooms[rIdx].status = 'Available';
                StorageService.set(STORAGE_KEYS.ROOMS, rooms);
            }

            App.showToast(`Reservation ${bookingId} has been cancelled.`, 'info');
            this.renderRoomsGrid();
            this.renderRoomBookingsList();
        }
    }
};
