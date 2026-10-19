/**
 * Maithili Agro Tourism — Mulshi · Pune - Hotel Management System
 * Restaurant Point of Sale (POS) & Dining Floor Engine
 */

const POSModule = {
    selectedTableId: 'tbl_2',
    activeOrder: null,
    draftItems: [],
    activeCategory: 'All',
    searchQuery: '',
    vegOnly: false,
    viewMode: 'punch', // 'punch' or 'floor'
    discountPercent: 0,
    serviceChargePercent: 5,

    init: function () {
        this.setupClock();
        this.renderCategoryPills();
        this.renderMenuGrid();
        this.renderFloorTables();
        this.setupEventListeners();

        // Default to Table 2 or first table
        const tables = StorageService.get(STORAGE_KEYS.TABLES, []);
        const initialTable = tables.find(t => t.id === 'tbl_2') || tables[0];
        if (initialTable) {
            this.selectTable(initialTable.id);
        }

        // Listen for external storage updates
        window.addEventListener('storageUpdated', () => {
            this.renderFloorTables();
            if (this.selectedTableId) {
                this.activeOrder = StorageService.getActiveTableOrder(this.selectedTableId);
                this.renderTicketPane();
            }
        });
    },

    // Real-time clock in header
    setupClock: function () {
        const update = () => {
            const clockEl = document.getElementById('posClockDisplay');
            if (clockEl) {
                const now = new Date();
                clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
        };
        update();
        setInterval(update, 1000);
    },

    // Setup global listeners
    setupEventListeners: function () {
        const searchInput = document.getElementById('posSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderMenuGrid();
            });
        }

        const vegToggle = document.getElementById('posVegToggle');
        if (vegToggle) {
            vegToggle.addEventListener('change', (e) => {
                this.vegOnly = e.target.checked;
                this.renderMenuGrid();
            });
        }

        // Keyboard shortcut: F2 to Punch KOT, Esc to toggle Floor View
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                this.punchKOT();
            }
            if (e.key === 'Escape' && !document.querySelector('.modal.show')) {
                this.toggleViewMode();
            }
        });
    },

    // Toggle View Mode: Floor Plan vs Order Punching
    toggleViewMode: function (mode) {
        if (mode) {
            this.viewMode = mode;
        } else {
            this.viewMode = this.viewMode === 'punch' ? 'floor' : 'punch';
        }

        const floorContainer = document.getElementById('posFloorView');
        const catalogContainer = document.getElementById('posCatalogView');
        const toggleBtn = document.getElementById('posViewToggleBtn');

        if (this.viewMode === 'floor') {
            if (floorContainer) floorContainer.classList.remove('d-none');
            if (catalogContainer) catalogContainer.classList.add('d-none');
            if (toggleBtn) {
                toggleBtn.innerHTML = '<i class="bi bi-grid-3x3-gap-fill me-1"></i>Menu Catalog';
                toggleBtn.classList.replace('btn-outline-gold', 'btn-gold');
            }
            this.renderFloorTables();
        } else {
            if (floorContainer) floorContainer.classList.add('d-none');
            if (catalogContainer) catalogContainer.classList.remove('d-none');
            if (toggleBtn) {
                toggleBtn.innerHTML = '<i class="bi bi-diagram-3-fill me-1"></i>Floor Plan';
                toggleBtn.classList.replace('btn-gold', 'btn-outline-gold');
            }
        }
    },

    // Render floor tables
    renderFloorTables: function () {
        const container = document.getElementById('posFloorTablesGrid');
        if (!container) return;

        const tables = StorageService.get(STORAGE_KEYS.TABLES, []);
        let html = '';

        tables.forEach(table => {
            const isSelected = table.id === this.selectedTableId;
            let statusClass = 'table-available';
            let badgeBg = 'bg-success';
            let statusText = 'Available';

            if (table.status === 'Occupied') {
                statusClass = 'table-occupied';
                badgeBg = 'bg-danger';
                statusText = 'Occupied';
            } else if (table.status === 'Reserved') {
                statusClass = 'table-reserved';
                badgeBg = 'bg-warning text-dark';
                statusText = 'Reserved';
            } else if (table.status === 'Cleaning') {
                statusClass = 'table-cleaning';
                badgeBg = 'bg-purple text-white';
                statusText = 'Turnover';
            }

            const activeOrder = StorageService.getActiveTableOrder(table.id);
            const runningTotal = activeOrder ? App.formatCurrency(activeOrder.total) : '';
            const kotCount = (activeOrder && activeOrder.kots) ? activeOrder.kots.length : 0;

            html += `
                <div class="col-6 col-md-4 col-lg-3 col-xl-2">
                    <div class="pos-table-card ${statusClass} ${isSelected ? 'active-table' : ''}" onclick="POSModule.selectTable('${table.id}', true)">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="fw-bold font-monospace text-navy fs-5">${table.number}</span>
                            <span class="badge ${badgeBg} rounded-pill" style="font-size: 0.65rem;">${statusText}</span>
                        </div>
                        <div class="small text-muted mb-2">
                            <i class="bi bi-people me-1"></i>${table.capacity} Seats • <span class="text-truncate">${table.zone || table.location}</span>
                        </div>
                        ${activeOrder ? `
                            <div class="pt-2 border-top d-flex justify-content-between align-items-center">
                                <span class="badge bg-danger-subtle text-danger" style="font-size:0.65rem;">${kotCount} KOT(s)</span>
                                <strong class="text-navy fs-6">${runningTotal}</strong>
                            </div>
                        ` : `
                            <div class="pt-2 border-top text-success small">
                                <i class="bi bi-check2-circle me-1"></i>Ready to Seat
                            </div>
                        `}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    // Select active table
    selectTable: function (tableId, autoSwitchToPunch = false) {
        this.selectedTableId = tableId;
        const tables = StorageService.get(STORAGE_KEYS.TABLES, []);
        const table = tables.find(t => t.id === tableId);
        if (!table) return;

        // Fetch active order
        this.activeOrder = StorageService.getActiveTableOrder(tableId);
        this.draftItems = [];

        // Update active table banner
        const tableBannerNumber = document.getElementById('posActiveTableNumber');
        const tableBannerZone = document.getElementById('posActiveTableZone');
        const tableBannerStatus = document.getElementById('posActiveTableStatus');

        if (tableBannerNumber) tableBannerNumber.textContent = table.number;
        if (tableBannerZone) tableBannerZone.textContent = `${table.zone || table.location} • ${table.capacity} Covers`;
        if (tableBannerStatus) {
            tableBannerStatus.textContent = table.status;
            tableBannerStatus.className = `badge ${table.status === 'Occupied' ? 'bg-danger' : table.status === 'Reserved' ? 'bg-warning text-dark' : 'bg-success'}`;
        }

        this.renderTicketPane();
        this.renderFloorTables();

        if (autoSwitchToPunch && this.viewMode === 'floor') {
            this.toggleViewMode('punch');
        }
    },

    // Category Filter Pills
    renderCategoryPills: function () {
        const container = document.getElementById('posCategoryPillsContainer');
        if (!container) return;

        const categories = ['All', 'Starters', 'Main Course', 'Snacks', 'Beverages', 'Desserts'];
        let html = '';

        categories.forEach(cat => {
            const isActive = cat === this.activeCategory;
            html += `
                <button type="button" class="btn btn-sm ${isActive ? 'btn-navy active-cat' : 'btn-outline-secondary'} text-nowrap rounded-pill px-3 py-1" onclick="POSModule.filterCategory('${cat}')">
                    ${cat}
                </button>
            `;
        });

        container.innerHTML = html;
    },

    filterCategory: function (category) {
        this.activeCategory = category;
        this.renderCategoryPills();
        this.renderMenuGrid();
    },

    // Render Menu Grid
    renderMenuGrid: function () {
        const container = document.getElementById('posMenuGrid');
        if (!container) return;

        const menu = StorageService.get(STORAGE_KEYS.MENU, []);
        let filtered = menu;

        if (this.activeCategory !== 'All') {
            filtered = filtered.filter(m => m.category === this.activeCategory);
        }

        if (this.vegOnly) {
            filtered = filtered.filter(m => m.isVeg);
        }

        if (this.searchQuery) {
            filtered = filtered.filter(m => 
                m.name.toLowerCase().includes(this.searchQuery) ||
                (m.description && m.description.toLowerCase().includes(this.searchQuery))
            );
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5 text-muted">
                    <i class="bi bi-search fs-2 mb-2 d-block"></i>
                    <div>No dishes found matching criteria.</div>
                </div>
            `;
            return;
        }

        let html = '';
        filtered.forEach(item => {
            const isOutOfStock = item.stock <= 0;
            const isLowStock = item.stock > 0 && item.stock <= 5;

            html += `
                <div class="pos-dish-card ${isOutOfStock ? 'opacity-50' : ''}" onclick="${isOutOfStock ? '' : `POSModule.addToDraft('${item.id}')`}">
                    <div class="pos-dish-img-wrap">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                        <span class="position-absolute top-0 start-0 m-2">
                            <span class="food-type-icon ${item.isVeg ? 'food-type-veg' : 'food-type-nonveg'} bg-white shadow-sm"></span>
                        </span>
                        ${isOutOfStock ? `
                            <div class="position-absolute inset-0 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center text-white fw-bold small">
                                SOLD OUT
                            </div>
                        ` : ''}
                        ${isLowStock ? `
                            <span class="position-absolute bottom-0 end-0 m-1 badge bg-warning text-dark" style="font-size:0.6rem;">
                                Only ${item.stock} left
                            </span>
                        ` : ''}
                    </div>
                    <div class="pos-dish-body">
                        <div class="fw-semibold text-dark small text-truncate mb-1" title="${item.name}">${item.name}</div>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="fw-bold text-navy">${App.formatCurrency(item.price)}</span>
                            <button type="button" class="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center" style="width:26px; height:26px;" ${isOutOfStock ? 'disabled' : ''}>
                                <i class="bi bi-plus-lg text-navy"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    // Add item to draft KOT
    addToDraft: function (menuItemId) {
        const menu = StorageService.get(STORAGE_KEYS.MENU, []);
        const item = menu.find(m => m.id === menuItemId);
        if (!item || item.stock <= 0) {
            App.showToast('Selected item is currently out of stock.', 'error');
            return;
        }

        // Count in existing draft
        const existingDraftIdx = this.draftItems.findIndex(i => i.id === menuItemId && !i.notes);
        if (existingDraftIdx > -1) {
            if (this.draftItems[existingDraftIdx].quantity + 1 > item.stock) {
                App.showToast(`Only ${item.stock} units available in kitchen stock!`, 'error');
                return;
            }
            this.draftItems[existingDraftIdx].quantity += 1;
            this.draftItems[existingDraftIdx].subtotal = Number((this.draftItems[existingDraftIdx].quantity * item.price).toFixed(2));
        } else {
            this.draftItems.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
                notes: '',
                isVeg: item.isVeg,
                subtotal: item.price
            });
        }

        this.renderTicketPane();
    },

    // Update Draft Item Quantity
    updateDraftQty: function (index, delta) {
        if (index < 0 || index >= this.draftItems.length) return;

        const item = this.draftItems[index];
        const menu = StorageService.get(STORAGE_KEYS.MENU, []);
        const menuItem = menu.find(m => m.id === item.id);
        const maxStock = menuItem ? menuItem.stock : 99;

        const newQty = item.quantity + delta;
        if (newQty <= 0) {
            this.draftItems.splice(index, 1);
        } else if (newQty > maxStock) {
            App.showToast(`Max available kitchen stock is ${maxStock}.`, 'error');
            return;
        } else {
            item.quantity = newQty;
            item.subtotal = Number((item.price * newQty).toFixed(2));
        }

        this.renderTicketPane();
    },

    // Open Custom Notes / Cooking Preferences modal for draft item
    openDraftItemNotesModal: function (index) {
        if (index < 0 || index >= this.draftItems.length) return;
        const item = this.draftItems[index];

        let modalEl = document.getElementById('posItemNotesModal');
        if (!modalEl) {
            const html = `
                <div class="modal fade" id="posItemNotesModal" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered modal-sm">
                        <div class="modal-content rounded-4 border-0 shadow">
                            <div class="modal-header bg-navy-primary text-white py-2 px-3">
                                <h6 class="modal-title font-heading mb-0"><i class="bi bi-pencil-square text-gold me-1"></i>Kitchen Cooking Instructions</h6>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body p-3">
                                <div class="fw-bold text-navy mb-2" id="posModalDishName"></div>
                                <div class="mb-3 d-flex flex-wrap gap-1" id="posQuickChipsContainer">
                                    <span class="badge bg-light text-dark border cursor-pointer" onclick="POSModule.appendQuickNote('Extra Spicy')">Extra Spicy</span>
                                    <span class="badge bg-light text-dark border cursor-pointer" onclick="POSModule.appendQuickNote('Mild / No Chilli')">Mild</span>
                                    <span class="badge bg-light text-dark border cursor-pointer" onclick="POSModule.appendQuickNote('No Onion/Garlic (Jain)')">No Onion/Garlic</span>
                                    <span class="badge bg-light text-dark border cursor-pointer" onclick="POSModule.appendQuickNote('Gluten Free')">Gluten Free</span>
                                    <span class="badge bg-light text-dark border cursor-pointer" onclick="POSModule.appendQuickNote('Ice on Side')">Ice on Side</span>
                                    <span class="badge bg-light text-dark border cursor-pointer" onclick="POSModule.appendQuickNote('Extra Crisp')">Extra Crisp</span>
                                </div>
                                <textarea class="form-control form-control-sm" id="posItemNotesInput" rows="3" placeholder="Special guest preferences..."></textarea>
                            </div>
                            <div class="modal-footer p-2 bg-light">
                                <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-sm btn-gold px-3" onclick="POSModule.saveDraftItemNotes()">Save Instruction</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            modalEl = document.getElementById('posItemNotesModal');
        }

        this.editingDraftItemIndex = index;
        document.getElementById('posModalDishName').textContent = item.name;
        document.getElementById('posItemNotesInput').value = item.notes || '';

        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    },

    appendQuickNote: function (noteText) {
        const input = document.getElementById('posItemNotesInput');
        if (!input) return;
        if (input.value) {
            input.value += `, ${noteText}`;
        } else {
            input.value = noteText;
        }
    },

    saveDraftItemNotes: function () {
        const input = document.getElementById('posItemNotesInput');
        if (this.editingDraftItemIndex !== undefined && this.draftItems[this.editingDraftItemIndex]) {
            this.draftItems[this.editingDraftItemIndex].notes = input ? input.value.trim() : '';
            this.renderTicketPane();
        }
        const modal = bootstrap.Modal.getInstance(document.getElementById('posItemNotesModal'));
        if (modal) modal.hide();
    },

    // Render Right Ticket Pane (Running Order + Draft Items)
    renderTicketPane: function () {
        const scrollContainer = document.getElementById('posTicketItemsScroll');
        const emptyState = document.getElementById('posTicketEmptyState');
        const summaryContainer = document.getElementById('posTicketFinancials');
        const punchKOTBtn = document.getElementById('posPunchKOTBtn');
        const printCheckBtn = document.getElementById('posPrintCheckBtn');
        const settleBtn = document.getElementById('posSettleBtn');

        if (!scrollContainer) return;

        const hasSentItems = this.activeOrder && this.activeOrder.items && this.activeOrder.items.length > 0;
        const hasDraftItems = this.draftItems.length > 0;

        if (!hasSentItems && !hasDraftItems) {
            if (emptyState) emptyState.classList.remove('d-none');
            scrollContainer.innerHTML = '';
            if (summaryContainer) summaryContainer.classList.add('d-none');
            if (punchKOTBtn) punchKOTBtn.disabled = true;
            if (printCheckBtn) printCheckBtn.disabled = true;
            if (settleBtn) settleBtn.disabled = true;
            return;
        }

        if (emptyState) emptyState.classList.add('d-none');
        if (summaryContainer) summaryContainer.classList.remove('d-none');
        if (punchKOTBtn) punchKOTBtn.disabled = !hasDraftItems;
        if (printCheckBtn) printCheckBtn.disabled = !hasSentItems;
        if (settleBtn) settleBtn.disabled = !hasSentItems;

        let html = '';

        // 1. Sent to Kitchen Items (Active KOTs)
        if (hasSentItems) {
            html += `
                <div class="px-2 py-1 mb-2 bg-light rounded text-muted small fw-bold d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-fire text-danger me-1"></i>Sent to Kitchen (${this.activeOrder.kots ? this.activeOrder.kots.length : 1} KOT)</span>
                    <span class="badge bg-secondary text-white" style="font-size:0.6rem;">Firmed Order</span>
                </div>
            `;

            this.activeOrder.items.forEach((item, idx) => {
                html += `
                    <div class="ticket-item-row is-sent-kot mb-1">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <span class="badge bg-navy text-white me-1 font-monospace">${item.quantity}x</span>
                                <strong class="small text-dark">${item.name}</strong>
                                ${item.notes ? `<div class="text-danger small" style="font-size:0.75rem;"><i class="bi bi-info-circle me-1"></i>${item.notes}</div>` : ''}
                            </div>
                            <div class="fw-bold text-navy small">${App.formatCurrency(item.subtotal || (item.price * item.quantity))}</div>
                        </div>
                    </div>
                `;
            });
        }

        // 2. Draft / Un-punched items
        if (hasDraftItems) {
            html += `
                <div class="px-2 py-1 my-2 bg-warning-subtle rounded text-warning-emphasis small fw-bold d-flex justify-content-between align-items-center border border-warning-subtle">
                    <span><i class="bi bi-hourglass-split me-1"></i>New Draft Items (Unsent)</span>
                    <span class="badge bg-warning text-dark" style="font-size:0.6rem;">Pending KOT</span>
                </div>
            `;

            this.draftItems.forEach((item, idx) => {
                html += `
                    <div class="ticket-item-row mb-1 bg-white border border-light-subtle rounded-2">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1 pe-2">
                                <div class="d-flex align-items-center gap-1">
                                    <span class="food-type-icon ${item.isVeg ? 'food-type-veg' : 'food-type-nonveg'}"></span>
                                    <strong class="small text-dark">${item.name}</strong>
                                </div>
                                ${item.notes ? `<div class="text-danger small fw-semibold" style="font-size:0.75rem;"><i class="bi bi-card-text me-1"></i>${item.notes}</div>` : ''}
                                <div class="d-flex align-items-center gap-2 mt-1">
                                    <button type="button" class="btn btn-outline-secondary btn-sm p-0 d-flex align-items-center justify-content-center" style="width:20px; height:20px;" onclick="POSModule.updateDraftQty(${idx}, -1)">
                                        <i class="bi bi-dash"></i>
                                    </button>
                                    <span class="fw-bold font-monospace small">${item.quantity}</span>
                                    <button type="button" class="btn btn-outline-secondary btn-sm p-0 d-flex align-items-center justify-content-center" style="width:20px; height:20px;" onclick="POSModule.updateDraftQty(${idx}, 1)">
                                        <i class="bi bi-plus"></i>
                                    </button>
                                    <button type="button" class="btn btn-link text-muted p-0 small text-decoration-none ms-1" style="font-size:0.75rem;" onclick="POSModule.openDraftItemNotesModal(${idx})">
                                        <i class="bi bi-pencil me-1"></i>Notes
                                    </button>
                                </div>
                            </div>
                            <div class="text-end">
                                <div class="fw-bold text-navy small">${App.formatCurrency(item.subtotal)}</div>
                                <button type="button" class="btn btn-link text-danger p-0 mt-1" style="font-size:0.75rem;" onclick="POSModule.updateDraftQty(${idx}, -${item.quantity})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        scrollContainer.innerHTML = html;

        // Calculate Totals
        const sentSubtotal = (this.activeOrder && this.activeOrder.subtotal) ? this.activeOrder.subtotal : 0;
        const draftSubtotal = this.draftItems.reduce((sum, i) => sum + i.subtotal, 0);
        const subtotal = Number((sentSubtotal + draftSubtotal).toFixed(2));

        const settings = StorageService.get(STORAGE_KEYS.SETTINGS, {});
        const taxRate = settings.taxRatePercent || 5;
        const tax = Number(((subtotal * taxRate) / 100).toFixed(2));
        const total = Number((subtotal + tax).toFixed(2));

        const subtotalEl = document.getElementById('posTicketSubtotal');
        const taxEl = document.getElementById('posTicketTax');
        const totalEl = document.getElementById('posTicketTotal');

        if (subtotalEl) subtotalEl.textContent = App.formatCurrency(subtotal);
        if (taxEl) taxEl.textContent = App.formatCurrency(tax);
        if (totalEl) totalEl.textContent = App.formatCurrency(total);
    },

    // Clear Draft
    clearDraft: function () {
        if (this.draftItems.length === 0) return;
        this.draftItems = [];
        this.renderTicketPane();
        App.showToast('Draft items cleared.', 'info');
    },

    // Punch KOT (Send Draft to Kitchen)
    punchKOT: function () {
        if (!this.selectedTableId) {
            App.showToast('Please select a table first.', 'error');
            return;
        }

        if (this.draftItems.length === 0) {
            App.showToast('No new items in draft to send to kitchen.', 'error');
            return;
        }

        const currentUser = AuthService.getCurrentUser();
        const serverName = currentUser ? currentUser.name : 'Marco Rossi (Waiter)';

        const result = StorageService.punchKOT(this.selectedTableId, this.draftItems, {
            serverName: serverName
        });

        if (result.success) {
            this.draftItems = [];
            this.activeOrder = result.order;
            this.renderTicketPane();
            this.renderFloorTables();
            this.renderMenuGrid(); // refresh stock

            // Play audio alert / sound chime simulation
            this.playNotificationSound();

            App.showToast(`Ticket ${result.kot.kotId} sent to Kitchen successfully!`, 'success');
        } else {
            App.showToast(result.message || 'Error punching KOT.', 'error');
        }
    },

    // Notification chime tone generator using Web Audio API
    playNotificationSound: function () {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            // AudioContext not allowed or not supported, ignore silently
        }
    },

    // Open Pre-Payment Bill / Dining Check Slip Modal
    openBillCheckModal: function () {
        if (!this.activeOrder) {
            App.showToast('No active bill to print.', 'error');
            return;
        }

        const order = this.activeOrder;
        const settings = StorageService.get(STORAGE_KEYS.SETTINGS, {});

        let modalEl = document.getElementById('posBillModal');
        if (!modalEl) {
            const html = `
                <div class="modal fade" id="posBillModal" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered modal-sm">
                        <div class="modal-content rounded-4 border-0 shadow">
                            <div class="modal-body p-3" id="posBillModalBody"></div>
                            <div class="modal-footer p-2 bg-light d-flex justify-content-between">
                                <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-sm btn-navy" onclick="window.print()"><i class="bi bi-printer me-1"></i>Print Check</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            modalEl = document.getElementById('posBillModal');
        }

        const itemsHtml = order.items.map(item => `
            <div class="d-flex justify-content-between mb-1">
                <span>${item.quantity}x ${item.name}</span>
                <span>${App.formatCurrency(item.subtotal || (item.price * item.quantity))}</span>
            </div>
        `).join('');

        const content = `
            <div class="thermal-receipt">
                <div class="text-center mb-2">
                    <div class="fw-bold fs-6">${settings.hotelFullName || settings.hotelName || 'MAITHILI AGRO TOURISM'}</div>
                    <div style="font-size:11px;">Agro Tourism & Farm Dining</div>
                    <div style="font-size:10px;">${settings.address || 'Mulshi, Pune'}</div>
                    <div class="receipt-divider"></div>
                    <div class="fw-bold">TABLE CHECK / PROVISIONAL BILL</div>
                </div>

                <div class="d-flex justify-content-between mb-1" style="font-size:11px;">
                    <span>Table: <strong>${order.tableNumber}</strong></span>
                    <span>Server: ${order.serverName || 'Staff'}</span>
                </div>
                <div class="d-flex justify-content-between mb-1" style="font-size:11px;">
                    <span>Bill Ref: ${order.id}</span>
                    <span>${order.createdAt}</span>
                </div>

                <div class="receipt-double-divider"></div>
                <div class="mb-2">${itemsHtml}</div>
                <div class="receipt-divider"></div>

                <div class="d-flex justify-content-between">
                    <span>Subtotal:</span>
                    <span>${App.formatCurrency(order.subtotal)}</span>
                </div>
                <div class="d-flex justify-content-between">
                    <span>Resort & Food Tax (5%):</span>
                    <span>${App.formatCurrency(order.tax)}</span>
                </div>
                <div class="receipt-double-divider"></div>
                <div class="d-flex justify-content-between fs-6 fw-bold">
                    <span>TOTAL PAYABLE:</span>
                    <span>${App.formatCurrency(order.total)}</span>
                </div>
                <div class="receipt-divider"></div>
                <div class="text-center mt-2 text-muted" style="font-size:10px;">
                    *** Thank You For Dining With Us ***<br>
                    Please present this check to settle at counter
                </div>
            </div>
        `;

        document.getElementById('posBillModalBody').innerHTML = content;
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    },

    // Open Settle Payment Modal (Cash with change calculator, Card, UPI, Room Charge)
    openSettleModal: function () {
        if (!this.activeOrder) {
            App.showToast('No active order to settle.', 'error');
            return;
        }

        const order = this.activeOrder;
        const total = order.total;

        let modalEl = document.getElementById('posSettleModal');
        if (!modalEl) {
            const html = `
                <div class="modal fade" id="posSettleModal" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered modal-md">
                        <div class="modal-content rounded-4 border-0 shadow">
                            <div class="modal-header bg-navy-primary text-white py-3 px-4">
                                <div>
                                    <h5 class="modal-title font-heading mb-0"><i class="bi bi-cash-stack text-gold me-2"></i>Settle Table Bill</h5>
                                    <small class="text-white-50">${order.tableNumber} • Bill Ref: ${order.id}</small>
                                </div>
                                <div class="text-end">
                                    <span class="fs-4 fw-bold text-gold" id="settleModalTotalDisplay">$0.00</span>
                                </div>
                            </div>
                            <div class="modal-body p-4 bg-white" id="posSettleModalBody"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            modalEl = document.getElementById('posSettleModal');
        }

        // Fetch in-house hotel rooms for Room Charge option
        const roomBookings = StorageService.get(STORAGE_KEYS.ROOM_BOOKINGS, []);
        const inHouseGuests = roomBookings.filter(b => b.bookingStatus === 'Occupied' || b.bookingStatus === 'Confirmed');

        let roomOptionsHtml = '<option value="" disabled selected>-- Select In-House Guest Suite --</option>';
        if (inHouseGuests.length > 0) {
            inHouseGuests.forEach(g => {
                roomOptionsHtml += `<option value="${g.roomId}" data-room="${g.roomNumber}" data-guest="${g.guestName}">${g.roomNumber} - ${g.guestName} (${g.roomType})</option>`;
            });
        } else {
            roomOptionsHtml += '<option value="room_102" data-room="102" data-guest="Eleanor Bennett">Room 102 - Eleanor Bennett (In-House)</option>';
        }

        const content = `
            <div>
                <!-- Payment Method Tabs -->
                <ul class="nav nav-pills nav-fill mb-3" id="settleMethodTabs" role="tablist">
                    <li class="nav-item">
                        <button class="nav-link active py-2 small fw-semibold" data-bs-toggle="pill" data-bs-target="#settle-cash" type="button">
                            <i class="bi bi-cash me-1"></i>Cash
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link py-2 small fw-semibold" data-bs-toggle="pill" data-bs-target="#settle-card" type="button">
                            <i class="bi bi-credit-card me-1"></i>Card / EDC
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link py-2 small fw-semibold" data-bs-toggle="pill" data-bs-target="#settle-upi" type="button">
                            <i class="bi bi-qr-code-scan me-1"></i>UPI / QR
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link py-2 small fw-semibold" data-bs-toggle="pill" data-bs-target="#settle-room" type="button">
                            <i class="bi bi-door-closed me-1"></i>Room Charge
                        </button>
                    </li>
                </ul>

                <div class="tab-content border rounded-3 p-3 bg-light-subtle mb-3">
                    <!-- Cash Tab -->
                    <div class="tab-pane fade show active" id="settle-cash">
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Amount Tendered ($)</label>
                            <input type="number" step="0.01" class="form-control form-control-lg fw-bold text-navy" id="cashTenderedInput" value="${total.toFixed(2)}" oninput="POSModule.calculateCashChange(${total})">
                        </div>
                        <div class="d-flex gap-2 mb-3">
                            <button type="button" class="btn btn-outline-secondary btn-sm px-2" onclick="POSModule.setTenderAmount(${total})">Exact ($${total})</button>
                            <button type="button" class="btn btn-outline-secondary btn-sm px-2" onclick="POSModule.setTenderAmount(${Math.ceil(total / 10) * 10})">$${Math.ceil(total / 10) * 10}</button>
                            <button type="button" class="btn btn-outline-secondary btn-sm px-2" onclick="POSModule.setTenderAmount(${Math.ceil(total / 50) * 50 || 50})">$${Math.ceil(total / 50) * 50 || 50}</button>
                            <button type="button" class="btn btn-outline-secondary btn-sm px-2" onclick="POSModule.setTenderAmount(${Math.ceil(total / 100) * 100 || 100})">$${Math.ceil(total / 100) * 100 || 100}</button>
                        </div>
                        <div class="p-2 rounded bg-light border d-flex justify-content-between align-items-center">
                            <span class="small fw-semibold text-muted">Change Return:</span>
                            <span class="fs-5 fw-bold text-success" id="cashChangeDisplay">$0.00</span>
                        </div>
                    </div>

                    <!-- Card Tab -->
                    <div class="tab-pane fade" id="settle-card">
                        <div class="text-center py-3">
                            <i class="bi bi-credit-card-2-front display-4 text-primary mb-2"></i>
                            <div class="fw-semibold">Wireless POS Terminal Swipe</div>
                            <small class="text-muted d-block mb-3">Terminal Ref: POS-TERM-04 (Approved)</small>
                            <input type="text" class="form-control form-control-sm text-center font-monospace" value="AUTH_APPR_68219" readonly>
                        </div>
                    </div>

                    <!-- UPI QR Tab -->
                    <div class="tab-pane fade" id="settle-upi">
                        <div class="text-center py-2">
                            <div class="p-2 bg-white rounded shadow-sm d-inline-block border mb-2">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=maithiliagro@icici%26am=${total}%26pn=MaithiliAgroTourism" width="130" height="130" alt="QR Code">
                            </div>
                            <div class="small fw-bold text-navy">Scan with Google Pay / PhonePe / Paytm</div>
                            <small class="text-muted d-block">Simulated instant QR settlement</small>
                        </div>
                    </div>

                    <!-- Room Charge Tab (Hotel Folio Integration) -->
                    <div class="tab-pane fade" id="settle-room">
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Transfer to In-House Guest Room Folio</label>
                            <select class="form-select form-select-sm" id="settleRoomSelect">
                                ${roomOptionsHtml}
                            </select>
                            <small class="text-muted" style="font-size:0.75rem;">This dining balance will be posted to the hotel stay invoice upon checkout.</small>
                        </div>
                    </div>
                </div>

                <!-- Vacate Table Option -->
                <div class="form-check form-switch mb-3">
                    <input class="form-check-input" type="checkbox" id="vacateToTurnoverToggle" checked>
                    <label class="form-check-label small fw-semibold text-dark" for="vacateToTurnoverToggle">
                        Mark Table as "Turnover / Cleaning" after settlement
                    </label>
                </div>

                <!-- Submit Action Buttons -->
                <div class="d-flex justify-content-between align-items-center pt-3 border-top">
                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-success px-4" onclick="POSModule.processSettlement()">
                        <i class="bi bi-check2-circle me-1"></i>Confirm & Settle Payment
                    </button>
                </div>
            </div>
        `;

        document.getElementById('settleModalTotalDisplay').textContent = App.formatCurrency(total);
        document.getElementById('posSettleModalBody').innerHTML = content;

        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    },

    setTenderAmount: function (amount) {
        const input = document.getElementById('cashTenderedInput');
        if (input) {
            input.value = amount.toFixed(2);
            if (this.activeOrder) {
                this.calculateCashChange(this.activeOrder.total);
            }
        }
    },

    calculateCashChange: function (total) {
        const input = document.getElementById('cashTenderedInput');
        const changeDisplay = document.getElementById('cashChangeDisplay');
        if (!input || !changeDisplay) return;

        const tendered = parseFloat(input.value) || 0;
        const change = Math.max(0, tendered - total);
        changeDisplay.textContent = App.formatCurrency(change);
    },

    // Process Final Settlement
    processSettlement: function () {
        if (!this.activeOrder) return;

        // Detect active tab
        const activeTabEl = document.querySelector('#settleMethodTabs .nav-link.active');
        const activeTab = activeTabEl ? activeTabEl.textContent.trim() : 'Cash';

        let method = 'Cash';
        let tendered = this.activeOrder.total;
        let changeAmount = 0;
        let roomId = null;
        let roomNumber = null;
        let roomGuestName = null;

        if (activeTab.includes('Card')) {
            method = 'Credit / Debit Card (EDC)';
        } else if (activeTab.includes('UPI')) {
            method = 'UPI / QR Code Scan';
        } else if (activeTab.includes('Room Charge')) {
            method = 'Room Charge';
            const roomSelect = document.getElementById('settleRoomSelect');
            if (roomSelect && roomSelect.value) {
                roomId = roomSelect.value;
                const opt = roomSelect.options[roomSelect.selectedIndex];
                roomNumber = opt.getAttribute('data-room');
                roomGuestName = opt.getAttribute('data-guest');
            } else {
                App.showToast('Please select a valid guest room.', 'error');
                return;
            }
        } else {
            // Cash
            const input = document.getElementById('cashTenderedInput');
            tendered = parseFloat(input ? input.value : 0) || this.activeOrder.total;
            if (tendered < this.activeOrder.total) {
                App.showToast('Tendered cash is less than payable amount.', 'error');
                return;
            }
            changeAmount = Number((tendered - this.activeOrder.total).toFixed(2));
        }

        const vacateToggle = document.getElementById('vacateToTurnoverToggle');
        const vacateToCleaning = vacateToggle ? vacateToggle.checked : true;

        const result = StorageService.settleTableBill(this.activeOrder.id, {
            method: method,
            tendered: tendered,
            changeAmount: changeAmount,
            vacateToCleaning: vacateToCleaning,
            roomId: roomId,
            roomNumber: roomNumber,
            roomGuestName: roomGuestName
        });

        if (result.success) {
            // Hide modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('posSettleModal'));
            if (modal) modal.hide();

            App.showToast(`Bill for ${result.order.tableNumber} settled successfully (${method})!`, 'success');

            // Reset current view
            this.activeOrder = null;
            this.draftItems = [];
            this.renderTicketPane();
            this.renderFloorTables();

            // Open Receipt print dialog
            setTimeout(() => {
                this.openBillCheckModal();
            }, 400);
        } else {
            App.showToast(result.message || 'Settlement failed.', 'error');
        }
    },

    // Open Transfer Table Modal
    openTransferTableModal: function () {
        if (!this.activeOrder) {
            App.showToast('No active table order to transfer.', 'error');
            return;
        }

        const tables = StorageService.get(STORAGE_KEYS.TABLES, []);
        const availableTables = tables.filter(t => t.status === 'Available');

        if (availableTables.length === 0) {
            App.showToast('No available vacant tables to transfer to!', 'error');
            return;
        }

        let optionsHtml = '';
        availableTables.forEach(t => {
            optionsHtml += `<option value="${t.id}">${t.number} (${t.capacity} Seats - ${t.zone || t.location})</option>`;
        });

        let modalEl = document.getElementById('posTransferModal');
        if (!modalEl) {
            const html = `
                <div class="modal fade" id="posTransferModal" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered modal-sm">
                        <div class="modal-content rounded-4 border-0 shadow">
                            <div class="modal-header bg-navy-primary text-white py-2 px-3">
                                <h6 class="modal-title font-heading mb-0"><i class="bi bi-arrow-left-right text-gold me-1"></i>Transfer Table</h6>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body p-3">
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Current Occupied Table</label>
                                    <input type="text" class="form-control form-control-sm bg-light fw-bold" id="transferCurrentTable" readonly>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Select Destination Table *</label>
                                    <select class="form-select form-select-sm" id="transferTargetTableSelect">
                                        ${optionsHtml}
                                    </select>
                                </div>
                            </div>
                            <div class="modal-footer p-2 bg-light">
                                <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-sm btn-gold px-3" onclick="POSModule.processTableTransfer()">Confirm Transfer</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            modalEl = document.getElementById('posTransferModal');
        } else {
            const selectEl = document.getElementById('transferTargetTableSelect');
            if (selectEl) selectEl.innerHTML = optionsHtml;
        }

        document.getElementById('transferCurrentTable').value = this.activeOrder.tableNumber;
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    },

    processTableTransfer: function () {
        const targetSelect = document.getElementById('transferTargetTableSelect');
        if (!targetSelect || !targetSelect.value) return;

        const targetTableId = targetSelect.value;
        const result = StorageService.transferTable(this.selectedTableId, targetTableId);

        if (result.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('posTransferModal'));
            if (modal) modal.hide();

            App.showToast(`Order successfully transferred to ${result.toTable.number}!`, 'success');
            this.selectTable(targetTableId);
        } else {
            App.showToast(result.message || 'Transfer failed.', 'error');
        }
    },

    // Split Bill Tool
    openSplitBillModal: function () {
        if (!this.activeOrder) {
            App.showToast('No active order to split.', 'error');
            return;
        }

        const total = this.activeOrder.total;
        let modalEl = document.getElementById('posSplitModal');
        if (!modalEl) {
            const html = `
                <div class="modal fade" id="posSplitModal" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered modal-sm">
                        <div class="modal-content rounded-4 border-0 shadow">
                            <div class="modal-header bg-navy-primary text-white py-2 px-3">
                                <h6 class="modal-title font-heading mb-0"><i class="bi bi-pie-chart-fill text-gold me-1"></i>Split Bill Calculator</h6>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body p-3">
                                <div class="text-center p-3 rounded bg-light border mb-3">
                                    <small class="text-muted d-block">Total Bill Amount</small>
                                    <span class="fs-4 fw-bold text-navy" id="splitTotalDisplay">$0.00</span>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Number of Ways to Split</label>
                                    <div class="d-flex align-items-center gap-2">
                                        <button class="btn btn-outline-secondary btn-sm" onclick="POSModule.adjustSplitWays(-1)">-</button>
                                        <input type="number" id="splitWaysInput" class="form-control form-control-sm text-center fw-bold" value="2" min="2" max="20" oninput="POSModule.recalculateSplit()">
                                        <button class="btn btn-outline-secondary btn-sm" onclick="POSModule.adjustSplitWays(1)">+</button>
                                    </div>
                                </div>
                                <div class="p-3 rounded bg-gold-subtle border border-warning d-flex justify-content-between align-items-center">
                                    <div>
                                        <span class="small fw-bold text-dark d-block">Each Guest Pays:</span>
                                        <small class="text-muted" id="splitWaysLabel">Split equally by 2</small>
                                    </div>
                                    <span class="fs-4 fw-bold text-gold" id="splitPerPersonDisplay">$0.00</span>
                                </div>
                            </div>
                            <div class="modal-footer p-2 bg-light">
                                <button type="button" class="btn btn-sm btn-secondary w-100" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            modalEl = document.getElementById('posSplitModal');
        }

        document.getElementById('splitTotalDisplay').textContent = App.formatCurrency(total);
        this.recalculateSplit();

        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    },

    adjustSplitWays: function (delta) {
        const input = document.getElementById('splitWaysInput');
        if (!input) return;
        const current = parseInt(input.value) || 2;
        const next = Math.max(2, current + delta);
        input.value = next;
        this.recalculateSplit();
    },

    recalculateSplit: function () {
        if (!this.activeOrder) return;
        const input = document.getElementById('splitWaysInput');
        const display = document.getElementById('splitPerPersonDisplay');
        const label = document.getElementById('splitWaysLabel');
        if (!input || !display) return;

        const ways = Math.max(2, parseInt(input.value) || 2);
        const perPerson = Number((this.activeOrder.total / ways).toFixed(2));

        display.textContent = App.formatCurrency(perPerson);
        if (label) label.textContent = `Split equally across ${ways} covers`;
    }
};
