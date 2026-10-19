/**
 * Maithili Agro Tourism — Mulshi · Pune - Hotel Management System
 * Food Menu & Ordering Engine
 */

const MenuModule = {
    currentCategory: 'All',
    searchQuery: '',
    vegOnly: false,

    init: function () {
        this.renderCategoryPills();
        this.renderMenuGrid();
        this.setupFilters();
    },

    // Get categories dynamically from menu data
    getCategories: function () {
        const menu = StorageService.get(STORAGE_KEYS.MENU, []);
        const categories = new Set(menu.map(item => item.category));
        return ['All', ...Array.from(categories)];
    },

    // Render Category Filter Pills
    renderCategoryPills: function () {
        const container = document.getElementById('categoryFilters');
        if (!container) return;

        const categories = this.getCategories();
        let html = '';

        categories.forEach(cat => {
            const isActive = cat === this.currentCategory;
            html += `
                <button type="button" class="btn btn-sm ${isActive ? 'btn-navy' : 'btn-outline-secondary'} rounded-pill px-3 py-1 font-weight-medium category-btn" data-category="${cat}">
                    ${cat}
                </button>
            `;
        });

        container.innerHTML = html;

        // Attach click handlers
        container.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentCategory = e.currentTarget.getAttribute('data-category');
                this.renderCategoryPills();
                this.renderMenuGrid();
            });
        });
    },

    // Filter menu items
    getFilteredItems: function () {
        const menu = StorageService.get(STORAGE_KEYS.MENU, []);
        return menu.filter(item => {
            // Category filter
            if (this.currentCategory !== 'All' && item.category !== this.currentCategory) {
                return false;
            }
            // Veg filter
            if (this.vegOnly && !item.isVeg) {
                return false;
            }
            // Search filter
            if (this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                const matchesName = item.name.toLowerCase().includes(q);
                const matchesDesc = (item.description || '').toLowerCase().includes(q);
                const matchesCat = (item.category || '').toLowerCase().includes(q);
                if (!matchesName && !matchesDesc && !matchesCat) return false;
            }
            return true;
        });
    },

    // Render Menu Cards Grid
    renderMenuGrid: function () {
        const grid = document.getElementById('menuGrid');
        if (!grid) return;

        const items = this.getFilteredItems();
        const user = AuthService.getCurrentUser();
        const canManage = user && (user.role === 'Admin' || user.role === 'Manager');

        if (items.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search text-muted display-4 mb-3 d-block"></i>
                    <h5 class="fw-semibold">No culinary delights found</h5>
                    <p class="text-muted small">Try adjusting your search terms or category filters.</p>
                    <button class="btn btn-outline-gold btn-sm mt-2" onclick="MenuModule.resetFilters()">Reset Filters</button>
                </div>
            `;
            return;
        }

        let html = '';
        items.forEach(item => {
            const isOutOfStock = !item.available || item.stock <= 0;
            const isLowStock = item.available && item.stock > 0 && item.stock <= 5;

            html += `
                <div class="col-12 col-md-6 col-lg-4 mb-4">
                    <div class="menu-card h-100 ${!item.available ? 'opacity-75' : ''}">
                        <div class="menu-card-img-wrap">
                            <img src="${item.image}" alt="${item.name}" loading="lazy">
                            
                            <!-- Badges on image -->
                            <div class="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1">
                                <span class="badge ${item.isVeg ? 'bg-success' : 'bg-danger'} shadow-sm">
                                    <span class="food-type-icon ${item.isVeg ? 'food-type-veg' : 'food-type-nonveg'} bg-white me-1"></span>
                                    ${item.isVeg ? 'Pure Veg' : 'Non-Veg'}
                                </span>
                                ${item.popular ? '<span class="badge bg-warning text-dark shadow-sm"><i class="bi bi-star-fill me-1"></i>Chef Special</span>' : ''}
                            </div>

                            <div class="position-absolute top-0 end-0 m-2">
                                ${isOutOfStock 
                                    ? '<span class="badge bg-danger shadow-sm">Sold Out</span>' 
                                    : isLowStock 
                                        ? `<span class="badge bg-warning text-dark shadow-sm"><i class="bi bi-exclamation-circle me-1"></i>Only ${item.stock} left</span>`
                                        : `<span class="badge bg-navy-surface text-white shadow-sm">${item.stock} in stock</span>`
                                }
                            </div>
                        </div>

                        <div class="menu-card-body">
                            <div class="d-flex justify-content-between align-items-start mb-1">
                                <span class="text-muted text-uppercase fw-semibold" style="font-size:0.75rem;">${item.category}</span>
                                <span class="fs-5 fw-bold text-gold">${App.formatCurrency(item.price)}</span>
                            </div>

                            <h5 class="fw-bold mb-2 text-dark font-heading">${item.name}</h5>
                            <p class="text-muted small mb-3 flex-grow-1">${item.description || ''}</p>

                            <!-- Staff Availability toggle if Admin/Manager -->
                            ${canManage ? `
                                <div class="bg-light p-2 rounded-2 mb-3 d-flex justify-content-between align-items-center border">
                                    <span class="small fw-semibold text-muted"><i class="bi bi-shield-lock me-1"></i>Staff Controls:</span>
                                    <div class="form-check form-switch mb-0">
                                        <input class="form-check-input" type="checkbox" role="switch" id="toggle_${item.id}" ${item.available ? 'checked' : ''} onchange="MenuModule.toggleAvailability('${item.id}', this.checked)">
                                        <label class="form-check-label small" for="toggle_${item.id}">${item.available ? 'Available' : 'Unavailable'}</label>
                                    </div>
                                </div>
                            ` : ''}

                            <!-- Card Bottom Action -->
                            <div class="d-flex align-items-center justify-content-between pt-2 border-top">
                                <!-- Qty selector -->
                                <div class="qty-control">
                                    <button class="qty-btn" type="button" onclick="MenuModule.changeCardQty('${item.id}', -1)" ${isOutOfStock ? 'disabled' : ''}>-</button>
                                    <input type="text" class="qty-input" id="qty_${item.id}" value="1" readonly>
                                    <button class="qty-btn" type="button" onclick="MenuModule.changeCardQty('${item.id}', 1)" ${isOutOfStock ? 'disabled' : ''}>+</button>
                                </div>

                                <button type="button" class="btn btn-gold btn-sm px-3" onclick="MenuModule.handleAddToCart('${item.id}')" ${isOutOfStock ? 'disabled' : ''}>
                                    <i class="bi bi-bag-plus me-1"></i>Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    },

    // Change Card Quantity Selector
    changeCardQty: function (itemId, delta) {
        const input = document.getElementById(`qty_${itemId}`);
        if (!input) return;
        let val = parseInt(input.value) || 1;
        val = Math.max(1, Math.min(10, val + delta));
        input.value = val;
    },

    // Handle Add to Cart
    handleAddToCart: function (itemId) {
        const menu = StorageService.get(STORAGE_KEYS.MENU, []);
        const item = menu.find(m => m.id === itemId);
        if (!item) return;

        const input = document.getElementById(`qty_${itemId}`);
        const qty = input ? parseInt(input.value) || 1 : 1;

        const result = StorageService.addToCart(item, qty);
        if (result.success) {
            if (!AuthService.isAuthenticated()) {
                App.showToast(`Added ${qty}x ${item.name} to cart! (Sign-in required at checkout)`, 'info');
            } else {
                App.showToast(`Added ${qty}x ${item.name} to cart!`, 'success');
            }
            App.updateCartBadge();
            // Reset quantity to 1
            if (input) input.value = 1;
        } else {
            App.showToast(result.message || 'Could not add to cart.', 'error');
        }
    },

    // Toggle Availability for Admin/Manager
    toggleAvailability: function (itemId, isChecked) {
        const menu = StorageService.get(STORAGE_KEYS.MENU, []);
        const idx = menu.findIndex(m => m.id === itemId);
        if (idx > -1) {
            menu[idx].available = isChecked;
            StorageService.set(STORAGE_KEYS.MENU, menu);
            App.showToast(`${menu[idx].name} marked as ${isChecked ? 'Available' : 'Unavailable'}.`, 'info');
            this.renderMenuGrid();
        }
    },

    // Setup Search & Veg Filters
    setupFilters: function () {
        const searchInput = document.getElementById('menuSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim();
                this.renderMenuGrid();
            });
        }

        const vegCheck = document.getElementById('vegOnlyToggle');
        if (vegCheck) {
            vegCheck.addEventListener('change', (e) => {
                this.vegOnly = e.target.checked;
                this.renderMenuGrid();
            });
        }
    },

    // Reset Filters
    resetFilters: function () {
        this.currentCategory = 'All';
        this.searchQuery = '';
        this.vegOnly = false;

        const searchInput = document.getElementById('menuSearchInput');
        if (searchInput) searchInput.value = '';

        const vegCheck = document.getElementById('vegOnlyToggle');
        if (vegCheck) vegCheck.checked = false;

        this.renderCategoryPills();
        this.renderMenuGrid();
    }
};
