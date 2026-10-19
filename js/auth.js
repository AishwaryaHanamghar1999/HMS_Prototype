/**
 * Maithili Agro Tourism — Mulshi · Pune - Hotel Management System
 * Authentication & Role-Based Access Control (RBAC)
 */

const ROLE_PERMISSIONS = {
    Admin: {
        canManageMenu: true,
        canManageRooms: true,
        canManageTables: true,
        canManageStaff: true,
        canManageOrders: true,
        canViewReports: true,
        canManageInventory: true,
        canCheckInOut: true,
        canCreateOrders: true,
        canBookRooms: true,
        canReserveTables: true,
        canManageActivities: true,
        canManageFinances: true,
        allowedPages: [
            'dashboard.html',
            'pos.html',
            'kds.html',
            'orders.html',
            'table-booking.html',
            'room-booking.html',
            'rooms.html',
            'activities.html',
            'staff.html',
            'inventory.html',
            'reports.html',
            'menu.html',
            'cart.html',
            'checkout.html',
            'profile.html'
        ]
    },
    Purchase: {
        canManageMenu: false,
        canManageRooms: false,
        canManageTables: false,
        canManageStaff: false,
        canManageOrders: true,
        canViewReports: true,
        canManageInventory: true,
        canManagePurchases: true,
        canCheckInOut: false,
        canCreateOrders: false,
        canBookRooms: false,
        canReserveTables: false,
        canManageActivities: false,
        allowedPages: [
            'dashboard.html',
            'inventory.html',
            'reports.html',
            'orders.html',
            'activities.html',
            'profile.html'
        ]
    },
    MD: {
        canManageMenu: true,
        canManageRooms: true,
        canManageTables: true,
        canManageStaff: true,
        canManageOrders: true,
        canViewReports: true,
        canManageInventory: true,
        canCheckInOut: true,
        canCreateOrders: true,
        canBookRooms: true,
        canReserveTables: true,
        canManageActivities: true,
        canManageFinances: true,
        allowedPages: [
            'dashboard.html',
            'reports.html',
            'orders.html',
            'rooms.html',
            'room-booking.html',
            'activities.html',
            'table-booking.html',
            'staff.html',
            'inventory.html',
            'pos.html',
            'kds.html',
            'menu.html',
            'cart.html',
            'checkout.html',
            'profile.html'
        ]
    },
    Accounts: {
        canManageMenu: false,
        canManageRooms: false,
        canManageTables: false,
        canManageStaff: false,
        canManageOrders: true,
        canViewReports: true,
        canManageInventory: true,
        canCheckInOut: false,
        canCreateOrders: true,
        canBookRooms: true,
        canReserveTables: true,
        canManageActivities: true,
        canManageFinances: true,
        allowedPages: [
            'dashboard.html',
            'reports.html',
            'orders.html',
            'activities.html',
            'room-booking.html',
            'rooms.html',
            'checkout.html',
            'profile.html'
        ]
    },
    Manager: {
        canManageMenu: true,
        canManageRooms: true,
        canManageTables: true,
        canManageStaff: false,
        canManageOrders: true,
        canViewReports: true,
        canManageInventory: true,
        canCheckInOut: true,
        canCreateOrders: true,
        canBookRooms: true,
        canReserveTables: true,
        canManageActivities: true,
        allowedPages: [
            'dashboard.html',
            'pos.html',
            'kds.html',
            'orders.html',
            'table-booking.html',
            'room-booking.html',
            'rooms.html',
            'activities.html',
            'inventory.html',
            'reports.html',
            'menu.html',
            'cart.html',
            'checkout.html',
            'profile.html'
        ]
    },
    Receptionist: {
        canManageMenu: false,
        canManageRooms: true,
        canManageTables: false,
        canManageStaff: false,
        canManageOrders: false,
        canViewReports: false,
        canManageInventory: false,
        canCheckInOut: true,
        canCreateOrders: false,
        canBookRooms: true,
        canReserveTables: true,
        allowedPages: [
            'dashboard.html',
            'pos.html',
            'room-booking.html',
            'rooms.html',
            'table-booking.html',
            'profile.html'
        ]
    },
    Waiter: {
        canManageMenu: false,
        canManageRooms: false,
        canManageTables: false,
        canManageStaff: false,
        canManageOrders: true, // update statuses of orders and take dine-in
        canViewReports: false,
        canManageInventory: false,
        canCheckInOut: false,
        canCreateOrders: true,
        canBookRooms: false,
        canReserveTables: false,
        allowedPages: [
            'dashboard.html',
            'pos.html',
            'kds.html',
            'orders.html',
            'table-booking.html',
            'menu.html',
            'cart.html',
            'checkout.html',
            'profile.html'
        ]
    },
    Customer: {
        canManageMenu: false,
        canManageRooms: false,
        canManageTables: false,
        canManageStaff: false,
        canManageOrders: false,
        canViewReports: false,
        canManageInventory: false,
        canCheckInOut: false,
        canCreateOrders: true,
        canBookRooms: true,
        canReserveTables: true,
        canManageActivities: true,
        allowedPages: [
            'index.html',
            'menu.html',
            'cart.html',
            'checkout.html',
            'orders.html',
            'table-booking.html',
            'room-booking.html',
            'rooms.html',
            'activities.html',
            'profile.html',
            'dashboard.html'
        ]
    }
};

const AuthService = {
    // Current authenticated session
    getCurrentUser: function () {
        return StorageService.get(STORAGE_KEYS.SESSION, null);
    },

    // Check if user is logged in
    isAuthenticated: function () {
        return this.getCurrentUser() !== null;
    },

    // Login logic
    login: function (email, password) {
        const users = StorageService.get(STORAGE_KEYS.USERS, []);
        const cleanEmail = email.trim().toLowerCase();
        
        const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
        
        if (!user) {
            return { success: false, message: 'Invalid email or password. Please check credentials.' };
        }

        if (user.status !== 'active') {
            return { success: false, message: 'This account has been deactivated. Please contact Administration.' };
        }

        // Store active session (exclude password for good hygiene)
        const sessionUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            loginTime: new Date().toISOString()
        };

        StorageService.set(STORAGE_KEYS.SESSION, sessionUser);
        return { success: true, user: sessionUser };
    },

    // Logout
    logout: function () {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        window.location.href = 'login.html';
    },

    // Switch Role Helper for fast demonstration testing
    quickSwitchRole: function (roleName) {
        const users = StorageService.get(STORAGE_KEYS.USERS, []);
        const targetUser = users.find(u => u.role.toLowerCase() === roleName.toLowerCase());
        if (targetUser) {
            const sessionUser = {
                id: targetUser.id,
                name: targetUser.name,
                email: targetUser.email,
                role: targetUser.role,
                phone: targetUser.phone,
                avatar: targetUser.avatar,
                loginTime: new Date().toISOString()
            };
            StorageService.set(STORAGE_KEYS.SESSION, sessionUser);
            window.location.reload();
        }
    },

    // Check permissions
    hasPermission: function (permissionName) {
        const user = this.getCurrentUser();
        if (!user) return false;
        const rolePerms = ROLE_PERMISSIONS[user.role];
        return rolePerms ? !!rolePerms[permissionName] : false;
    },

    // Enforce Route Protection
    requireAuth: function (allowedRoles = null) {
        const user = this.getCurrentUser();
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (!user) {
            // Not logged in and accessing a private page
            const publicPages = ['index.html', 'login.html', 'menu.html', 'cart.html', 'rooms.html', 'activities.html', 'room-booking.html', 'table-booking.html'];
            if (!publicPages.includes(currentPage)) {
                const reasonParam = currentPage === 'checkout.html' ? '&reason=order_login' : '';
                window.location.href = `login.html?redirect=${encodeURIComponent(currentPage)}${reasonParam}`;
                return false;
            }
            return true;
        }

        // User is logged in: check allowed roles for the specific page
        if (allowedRoles && allowedRoles.length > 0) {
            if (!allowedRoles.includes(user.role)) {
                // Not authorized: redirect to dashboard
                alert(`Access Denied: The '${user.role}' role does not have authorization to view this module.`);
                window.location.href = 'dashboard.html';
                return false;
            }
        }

        // Check against role allowed pages
        const roleConfig = ROLE_PERMISSIONS[user.role];
        if (roleConfig && roleConfig.allowedPages) {
            // Normalize page
            if (!roleConfig.allowedPages.includes(currentPage) && currentPage !== 'index.html') {
                alert(`Access Restricted: Page '${currentPage}' is not available for ${user.role} role.`);
                window.location.href = 'dashboard.html';
                return false;
            }
        }

        return true;
    }
};
