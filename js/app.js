/**
 * The Grand Aurelia Hotel Management System
 * App Core UI & Navigation Engine
 */

const App = {
    init: function () {
        this.renderRoleNavigation();
        this.updateCartBadge();
        this.setupEventListeners();
        this.setupActiveNavIndicators();
    },

    // Format currency
    formatCurrency: function (amount) {
        const settings = StorageService.get(STORAGE_KEYS.SETTINGS, {});
        const symbol = settings.currencySymbol || '$';
        return `${symbol}${Number(amount || 0).toFixed(2)}`;
    },

    // Format Date / Time
    formatDate: function (dateStr) {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    },

    // Toast Notification helper
    showToast: function (message, type = 'success') {
        let container = document.getElementById('toastNotificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastNotificationContainer';
            container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const icon = type === 'success' ? 'bi-check-circle-fill' : type === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill';
        const bgClass = type === 'success' ? 'bg-success text-white' : type === 'error' ? 'bg-danger text-white' : 'bg-navy-primary text-white';

        toast.className = `p-3 rounded-3 shadow-lg d-flex align-items-center gap-2 ${bgClass}`;
        toast.style.cssText = 'min-width: 280px; max-width: 380px; pointer-events: auto; animation: slideInRight 0.3s ease;';
        toast.innerHTML = `
            <i class="bi ${icon} fs-5"></i>
            <div class="flex-grow-1 small font-weight-medium">${message}</div>
            <button type="button" class="btn-close btn-close-white ms-auto" style="font-size: 0.75rem;"></button>
        `;

        const closeBtn = toast.querySelector('.btn-close');
        closeBtn.onclick = () => toast.remove();

        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    },

    // Update cart badge across all navigation elements
    updateCartBadge: function () {
        const count = StorageService.getCartCount();
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        });
    },

    // Build Role-Tailored Navigation & Mobile Bottom Bar
    renderRoleNavigation: function () {
        const user = AuthService.getCurrentUser();
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        // 1. Render Topbar User Info / Demo Switcher
        const userProfileContainers = document.querySelectorAll('.user-profile-widget');
        userProfileContainers.forEach(container => {
            if (user) {
                container.innerHTML = `
                    <div class="dropdown">
                        <button class="btn btn-sm d-flex align-items-center gap-1 gap-sm-2 border rounded-pill px-2 px-sm-3 py-1 bg-white dropdown-toggle" data-bs-toggle="dropdown">
                            <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" class="rounded-circle" width="28" height="28" style="object-fit:cover;">
                            <div class="text-start d-none d-sm-block" style="line-height: 1.2;">
                                <div class="fw-semibold text-dark small">${user.name}</div>
                                <span class="badge bg-gold-subtle text-gold fw-bold" style="font-size: 0.68rem; background-color: #fdf6e9; color: #b89358;">${user.role}</span>
                            </div>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2 p-2" style="border-radius: 12px; min-width: 220px;">
                            <li class="px-3 py-2 border-bottom">
                                <div class="fw-bold small text-navy">${user.name}</div>
                                <div class="text-muted" style="font-size: 0.75rem;">${user.email}</div>
                                <span class="badge bg-primary-subtle text-primary mt-1" style="font-size: 0.7rem;">Role: ${user.role}</span>
                            </li>
                            <li><a class="dropdown-item py-2 small" href="profile.html"><i class="bi bi-person me-2"></i>My Profile</a></li>
                            ${user.role !== 'Customer' ? '<li><a class="dropdown-item py-2 small" href="dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Management Dashboard</a></li>' : ''}
                            ${user.role === 'Admin' || user.role === 'Manager' || user.role === 'Waiter' ? '<li><a class="dropdown-item py-2 small text-gold fw-semibold" href="pos.html"><i class="bi bi-receipt-cutoff me-2"></i>Restaurant POS Terminal</a></li><li><a class="dropdown-item py-2 small" href="kds.html"><i class="bi bi-fire me-2 text-danger"></i>Kitchen Display (KDS)</a></li>' : ''}
                            <li class="dropdown-header small text-muted text-uppercase" style="font-size: 0.65rem;">5 Primary Role Logins</li>
                            <li><a class="dropdown-item py-1 small" href="javascript:void(0)" onclick="AuthService.quickSwitchRole('Admin')"><i class="bi bi-shield-check text-primary me-2"></i>1. Admin</a></li>
                            <li><a class="dropdown-item py-1 small" href="javascript:void(0)" onclick="AuthService.quickSwitchRole('Purchase')"><i class="bi bi-cart-check text-warning me-2"></i>2. Purchase</a></li>
                            <li><a class="dropdown-item py-1 small" href="javascript:void(0)" onclick="AuthService.quickSwitchRole('Accounts')"><i class="bi bi-cash-stack text-success me-2"></i>3. Accounts</a></li>
                            <li><a class="dropdown-item py-1 small" href="javascript:void(0)" onclick="AuthService.quickSwitchRole('Manager')"><i class="bi bi-briefcase text-info me-2"></i>4. Manager</a></li>
                            <li><a class="dropdown-item py-1 small" href="javascript:void(0)" onclick="AuthService.quickSwitchRole('MD')"><i class="bi bi-person-workspace text-gold me-2"></i>5. MD</a></li>
                            <li><hr class="dropdown-divider my-1"></li>
                            <li class="dropdown-header small text-muted text-uppercase" style="font-size: 0.65rem;">Front Desk & Guest Access</li>
                            <li><a class="dropdown-item py-1 small" href="javascript:void(0)" onclick="AuthService.quickSwitchRole('Receptionist')"><i class="bi bi-calendar2-check text-muted me-2"></i>Receptionist</a></li>
                            <li><a class="dropdown-item py-1 small" href="javascript:void(0)" onclick="AuthService.quickSwitchRole('Customer')"><i class="bi bi-person-heart text-muted me-2"></i>Customer</a></li>
                            <li><a class="dropdown-item py-1 small" href="javascript:void(0)" onclick="AuthService.quickSwitchRole('Waiter')"><i class="bi bi-cup-hot text-muted me-2"></i>Waiter</a></li>
                            <li><hr class="dropdown-divider my-1"></li>
                            <li><a class="dropdown-item py-2 small text-danger" href="javascript:void(0)" onclick="AuthService.logout()"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</a></li>
                        </ul>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="d-flex align-items-center gap-2">
                        <a href="login.html" class="btn btn-outline-gold btn-sm"><i class="bi bi-box-arrow-in-right me-1"></i>Sign In</a>
                        <a href="menu.html" class="btn btn-gold btn-sm d-none d-sm-inline-flex"><i class="bi bi-bag me-1"></i>Order Food</a>
                    </div>
                `;
            }
        });

        // 2. Render Desktop Sidebar Nav Items (if sidebar container exists)
        const sidebarNav = document.getElementById('sidebarNavContainer');
        if (sidebarNav && user) {
            const role = user.role;
            let navHTML = '';

            // Common link: Dashboard
            navHTML += `
                <a href="dashboard.html" class="sidebar-item ${currentPage === 'dashboard.html' ? 'active' : ''}">
                    <i class="bi bi-grid-1x2"></i> <span>Dashboard</span>
                </a>
            `;

            if (role === 'Admin' || role === 'MD' || role === 'Manager' || role === 'Waiter') {
                navHTML += `
                    <a href="pos.html" class="sidebar-item ${currentPage === 'pos.html' ? 'active' : ''}">
                        <i class="bi bi-receipt-cutoff"></i> <span>Restaurant POS</span>
                    </a>
                    <a href="kds.html" class="sidebar-item ${currentPage === 'kds.html' ? 'active' : ''}">
                        <i class="bi bi-fire"></i> <span>Kitchen KDS</span>
                    </a>
                    <a href="orders.html" class="sidebar-item ${currentPage === 'orders.html' ? 'active' : ''}">
                        <i class="bi bi-receipt"></i> <span>Orders & Billing</span>
                    </a>
                `;
            } else if (role === 'Accounts' || role === 'Purchase') {
                navHTML += `
                    <a href="orders.html" class="sidebar-item ${currentPage === 'orders.html' ? 'active' : ''}">
                        <i class="bi bi-receipt"></i> <span>Orders & Billing</span>
                    </a>
                `;
            }

            if (role === 'Admin' || role === 'MD' || role === 'Manager' || role === 'Receptionist' || role === 'Waiter') {
                navHTML += `
                    <a href="table-booking.html" class="sidebar-item ${currentPage === 'table-booking.html' ? 'active' : ''}">
                        <i class="bi bi-calendar-event"></i> <span>Table Bookings</span>
                    </a>
                `;
            }

            if (role === 'Admin' || role === 'MD' || role === 'Manager' || role === 'Receptionist' || role === 'Accounts') {
                navHTML += `
                    <a href="room-booking.html" class="sidebar-item ${currentPage === 'room-booking.html' ? 'active' : ''}">
                        <i class="bi bi-door-open"></i> <span>Room Stays</span>
                    </a>
                    <a href="rooms.html" class="sidebar-item ${currentPage === 'rooms.html' ? 'active' : ''}">
                        <i class="bi bi-building"></i> <span>Room Inventory</span>
                    </a>
                `;
            }

            // Activities Prebooking Navigation Item for all roles
            navHTML += `
                <a href="activities.html" class="sidebar-item ${currentPage === 'activities.html' ? 'active' : ''}">
                    <i class="bi bi-compass"></i> <span>Resort Activities</span>
                </a>
            `;

            if (role === 'Admin' || role === 'MD' || role === 'Accounts' || role === 'Manager' || role === 'Purchase') {
                if (role !== 'Accounts') {
                    navHTML += `
                        <a href="inventory.html" class="sidebar-item ${currentPage === 'inventory.html' ? 'active' : ''}">
                            <i class="bi bi-box-seam"></i> <span>Menu & Stock</span>
                        </a>
                    `;
                }
                navHTML += `
                    <a href="reports.html" class="sidebar-item ${currentPage === 'reports.html' ? 'active' : ''}">
                        <i class="bi bi-graph-up-arrow"></i> <span>${role === 'Accounts' ? 'Accounts Ledger & Tax' : role === 'Purchase' ? 'Procurement Spend' : role === 'MD' ? 'Executive P&L' : 'Financial Reports'}</span>
                    </a>
                `;
            }

            if (role === 'Admin' || role === 'MD') {
                navHTML += `
                    <a href="staff.html" class="sidebar-item ${currentPage === 'staff.html' ? 'active' : ''}">
                        <i class="bi bi-people"></i> <span>Staff Directory</span>
                    </a>
                `;
            }

            // Customer Pages links for quick preview
            navHTML += `
                <div class="px-3 pt-3 pb-1 text-uppercase text-muted" style="font-size: 0.68rem; letter-spacing: 0.05em;">Guest Services</div>
                <a href="activities.html" class="sidebar-item ${currentPage === 'activities.html' ? 'active' : ''}">
                    <i class="bi bi-stars text-gold"></i> <span>Prebook Experiences</span>
                </a>
                <a href="menu.html" class="sidebar-item ${currentPage === 'menu.html' ? 'active' : ''}">
                    <i class="bi bi-cup-straw"></i> <span>Public Food Menu</span>
                </a>
                <a href="index.html" class="sidebar-item ${currentPage === 'index.html' ? 'active' : ''}">
                    <i class="bi bi-house"></i> <span>Public Hotel Home</span>
                </a>
                <a href="profile.html" class="sidebar-item ${currentPage === 'profile.html' ? 'active' : ''}">
                    <i class="bi bi-person-gear"></i> <span>Profile & Settings</span>
                </a>
            `;

            sidebarNav.innerHTML = navHTML;
        }

        // 3. Render Mobile Bottom Navigation Bar (4-5 primary items + More)
        this.renderMobileBottomNav(user, currentPage);
    },

    // Mobile Bottom Navigation
    renderMobileBottomNav: function (user, currentPage) {
        let bottomNav = document.getElementById('mobileBottomNav');
        if (!bottomNav) {
            bottomNav = document.createElement('nav');
            bottomNav.id = 'mobileBottomNav';
            bottomNav.className = 'mobile-bottom-nav';
            document.body.appendChild(bottomNav);
        }

        const role = user ? user.role : 'Guest';
        let navItems = [];

        if (role === 'Customer' || !user) {
            navItems = [
                { label: 'Home', icon: 'bi-house-door', href: 'index.html' },
                { label: 'Menu', icon: 'bi-cup-straw', href: 'menu.html' },
                { label: 'Cart', icon: 'bi-bag', href: 'cart.html', badge: true },
                { label: 'Book Table', icon: 'bi-calendar2-check', href: 'table-booking.html' },
                { label: 'More', icon: 'bi-grid', href: '#mobileMoreOffcanvas', isDrawer: true }
            ];
        } else if (role === 'Admin' || role === 'Manager') {
            navItems = [
                { label: 'Dashboard', icon: 'bi-speedometer2', href: 'dashboard.html' },
                { label: 'POS', icon: 'bi-receipt-cutoff', href: 'pos.html' },
                { label: 'Kitchen', icon: 'bi-fire', href: 'kds.html' },
                { label: 'Tables', icon: 'bi-calendar-check', href: 'table-booking.html' },
                { label: 'More', icon: 'bi-grid', href: '#mobileMoreOffcanvas', isDrawer: true }
            ];
        } else if (role === 'Receptionist') {
            navItems = [
                { label: 'Dashboard', icon: 'bi-speedometer2', href: 'dashboard.html' },
                { label: 'Room Stays', icon: 'bi-door-open', href: 'room-booking.html' },
                { label: 'POS Terminal', icon: 'bi-receipt-cutoff', href: 'pos.html' },
                { label: 'Tables', icon: 'bi-calendar-check', href: 'table-booking.html' },
                { label: 'More', icon: 'bi-grid', href: '#mobileMoreOffcanvas', isDrawer: true }
            ];
        } else if (role === 'Waiter') {
            navItems = [
                { label: 'POS Terminal', icon: 'bi-receipt-cutoff', href: 'pos.html' },
                { label: 'Kitchen KDS', icon: 'bi-fire', href: 'kds.html' },
                { label: 'Tables', icon: 'bi-calendar-check', href: 'table-booking.html' },
                { label: 'Orders', icon: 'bi-receipt', href: 'orders.html' },
                { label: 'More', icon: 'bi-grid', href: '#mobileMoreOffcanvas', isDrawer: true }
            ];
        }

        let html = '';
        navItems.forEach(item => {
            const isActive = currentPage === item.href;
            if (item.isDrawer) {
                html += `
                    <a href="javascript:void(0)" class="mobile-bottom-nav-item" data-bs-toggle="offcanvas" data-bs-target="#mobileMoreOffcanvas">
                        <i class="bi ${item.icon}"></i>
                        <span>${item.label}</span>
                    </a>
                `;
            } else {
                html += `
                    <a href="${item.href}" class="mobile-bottom-nav-item ${isActive ? 'active' : ''}">
                        <div class="position-relative">
                            <i class="bi ${item.icon}"></i>
                            ${item.badge ? '<span class="cart-badge badge rounded-pill bg-warning text-dark position-absolute top-0 start-100 translate-middle" style="font-size:0.6rem; display:none;">0</span>' : ''}
                        </div>
                        <span>${item.label}</span>
                    </a>
                `;
            }
        });

        bottomNav.innerHTML = html;

        // Ensure Mobile "More" Offcanvas exists
        this.renderMobileMoreDrawer(user);
    },

    // Render the Offcanvas Drawer for Mobile "More" Menu
    renderMobileMoreDrawer: function (user) {
        let drawer = document.getElementById('mobileMoreOffcanvas');
        if (!drawer) {
            drawer = document.createElement('div');
            drawer.id = 'mobileMoreOffcanvas';
            drawer.className = 'offcanvas offcanvas-bottom offcanvas-more-menu h-75 rounded-top-4';
            drawer.setAttribute('tabindex', '-1');
            document.body.appendChild(drawer);
        }

        const role = user ? user.role : 'Guest';

        drawer.innerHTML = `
            <div class="offcanvas-header border-bottom border-secondary pb-3">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-stars text-gold fs-4"></i>
                    <div>
                        <h6 class="offcanvas-title font-heading mb-0 text-white">The Grand Aurelia</h6>
                        <small class="text-gold" style="font-size: 0.75rem;">Signed in as: ${user ? `${user.name} (${role})` : 'Guest'}</small>
                    </div>
                </div>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
            </div>
            <div class="offcanvas-body p-0">
                <div class="list-group list-group-flush">
                    ${user && role !== 'Customer' ? '<a href="dashboard.html" class="list-group-item"><i class="bi bi-speedometer2 text-gold"></i> Management Dashboard</a>' : ''}
                    ${role === 'Admin' || role === 'Manager' || role === 'Waiter' ? `
                        <a href="pos.html" class="list-group-item bg-navy-surface text-white"><i class="bi bi-receipt-cutoff text-gold"></i> Restaurant POS Terminal</a>
                        <a href="kds.html" class="list-group-item bg-navy-surface text-white"><i class="bi bi-fire text-danger"></i> Kitchen Display System (KDS)</a>
                    ` : ''}
                    <a href="index.html" class="list-group-item"><i class="bi bi-house-door text-gold"></i> Hotel Home</a>
                    <a href="menu.html" class="list-group-item"><i class="bi bi-cup-straw text-gold"></i> Food Menu & Ordering</a>
                    <a href="table-booking.html" class="list-group-item"><i class="bi bi-calendar-check text-gold"></i> Table Reservations</a>
                    <a href="room-booking.html" class="list-group-item"><i class="bi bi-door-open text-gold"></i> Room Booking & Stays</a>
                    ${role === 'Admin' || role === 'Manager' || role === 'Receptionist' ? '<a href="rooms.html" class="list-group-item"><i class="bi bi-building text-gold"></i> Room Inventory Management</a>' : ''}
                    ${role === 'Admin' || role === 'Manager' || role === 'Waiter' ? '<a href="orders.html" class="list-group-item"><i class="bi bi-receipt text-gold"></i> Orders & Billing</a>' : ''}
                    ${role === 'Admin' || role === 'Manager' ? `
                        <a href="inventory.html" class="list-group-item"><i class="bi bi-box-seam text-gold"></i> Inventory & Stock</a>
                        <a href="reports.html" class="list-group-item"><i class="bi bi-graph-up-arrow text-gold"></i> Reports & Analytics</a>
                    ` : ''}
                    ${role === 'Admin' ? '<a href="staff.html" class="list-group-item"><i class="bi bi-people text-gold"></i> Staff & User Management</a>' : ''}
                    <a href="profile.html" class="list-group-item"><i class="bi bi-person text-gold"></i> My Profile & History</a>
                    
                    <div class="p-3 bg-navy-dark mt-2">
                        <div class="small text-muted text-uppercase mb-2 fw-semibold" style="font-size: 0.68rem;">5 Primary Demo Accounts</div>
                        <div class="d-flex flex-wrap gap-2">
                            <button class="btn btn-sm btn-outline-light" onclick="AuthService.quickSwitchRole('Admin')">1. Admin</button>
                            <button class="btn btn-sm btn-outline-light" onclick="AuthService.quickSwitchRole('Purchase')">2. Purchase</button>
                            <button class="btn btn-sm btn-outline-light" onclick="AuthService.quickSwitchRole('Accounts')">3. Accounts</button>
                            <button class="btn btn-sm btn-outline-light" onclick="AuthService.quickSwitchRole('Manager')">4. Manager</button>
                            <button class="btn btn-sm btn-outline-light" onclick="AuthService.quickSwitchRole('MD')">5. MD</button>
                        </div>
                        <div class="mt-3 pt-2 border-top border-secondary d-flex justify-content-between align-items-center">
                            <button class="btn btn-sm btn-outline-danger" onclick="App.confirmResetData()"><i class="bi bi-arrow-counterclockwise me-1"></i>Reset Demo Data</button>
                            ${user ? '<button class="btn btn-sm btn-danger" onclick="AuthService.logout()">Sign Out</button>' : '<a href="login.html" class="btn btn-sm btn-gold">Sign In</a>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Active state helper
    setupActiveNavIndicators: function () {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.public-navbar .nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            }
        });
    },

    // Reset Confirmation
    confirmResetData: function () {
        if (confirm('Are you sure you want to restore original prototype demo data? Any custom items or bookings added will be reset.')) {
            StorageService.resetToDefault();
            this.showToast('Demo data restored successfully!', 'success');
            setTimeout(() => window.location.reload(), 500);
        }
    },

    // Listen to cross-module storage updates
    setupEventListeners: function () {
        window.addEventListener('storageUpdated', () => {
            this.updateCartBadge();
        });
    }
};

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
