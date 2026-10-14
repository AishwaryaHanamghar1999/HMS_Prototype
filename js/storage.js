/**
 * The Grand Aurelia Hotel Management System
 * Storage & Data Layer (Local Storage Architecture)
 */

const STORAGE_KEYS = {
    USERS: 'hotel_users',
    SESSION: 'hotel_session',
    MENU: 'hotel_menu',
    CART: 'hotel_cart',
    ORDERS: 'hotel_orders',
    TABLES: 'hotel_tables',
    TABLE_BOOKINGS: 'hotel_table_bookings',
    ROOMS: 'hotel_rooms',
    ROOM_BOOKINGS: 'hotel_room_bookings',
    INVENTORY: 'hotel_inventory',
    PAYMENTS: 'hotel_payments',
    FEEDBACK: 'hotel_feedback',
    SETTINGS: 'hotel_settings'
};

// Initial Default Dataset (Only loaded if keys do not exist in Local Storage)
const DEFAULT_DATA = {
    users: [
        {
            id: 'usr_admin_1',
            name: 'Alexander Sterling',
            email: 'admin@hotel.demo',
            password: 'Admin@123',
            role: 'Admin',
            phone: '+1 (555) 019-2831',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            joinedDate: '2025-01-15'
        },
        {
            id: 'usr_mgr_1',
            name: 'Victoria Vance',
            email: 'manager@hotel.demo',
            password: 'Manager@123',
            role: 'Manager',
            phone: '+1 (555) 019-5829',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
            joinedDate: '2025-02-01'
        },
        {
            id: 'usr_rec_1',
            name: 'Julian Hayes',
            email: 'reception@hotel.demo',
            password: 'Reception@123',
            role: 'Receptionist',
            phone: '+1 (555) 019-7412',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            joinedDate: '2025-03-10'
        },
        {
            id: 'usr_wtr_1',
            name: 'Marco Rossi',
            email: 'waiter@hotel.demo',
            password: 'Waiter@123',
            role: 'Waiter',
            phone: '+1 (555) 019-3390',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
            joinedDate: '2025-04-05'
        },
        {
            id: 'usr_cust_1',
            name: 'Eleanor Bennett',
            email: 'customer@hotel.demo',
            password: 'Customer@123',
            role: 'Customer',
            phone: '+1 (555) 019-8821',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
            joinedDate: '2025-05-12'
        }
    ],

    menu: [
        {
            id: 'menu_1',
            name: 'Truffle Glazed Wild Mushrooms',
            category: 'Starters',
            price: 18.50,
            description: 'Pan-seared forest mushrooms with black truffle emulsion and toasted sourdough brioche.',
            isVeg: true,
            available: true,
            stock: 24,
            image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
            popular: true
        },
        {
            id: 'menu_2',
            name: 'Artisan Burrata & Heirloom Peach',
            category: 'Starters',
            price: 21.00,
            description: 'Creamy Pugliese burrata, grilled heirloom peaches, aged balsamic reduction, basil pearls.',
            isVeg: true,
            available: true,
            stock: 18,
            image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=600&q=80',
            popular: false
        },
        {
            id: 'menu_3',
            name: 'Pan-Roasted Atlantic Salmon',
            category: 'Main Course',
            price: 36.00,
            description: 'Crispy skin salmon with saffron asparagus risotto, lemon-dill velouté, and caviar butter.',
            isVeg: false,
            available: true,
            stock: 14,
            image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
            popular: true
        },
        {
            id: 'menu_4',
            name: 'Prime Wagyu Ribeye Steak (8oz)',
            category: 'Main Course',
            price: 54.00,
            description: 'Char-grilled MB7 Wagyu beef with pomme purée, charred broccolini, and black garlic demi-glace.',
            isVeg: false,
            available: true,
            stock: 10,
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
            popular: true
        },
        {
            id: 'menu_5',
            name: 'Wild Herb Truffle Risotto',
            category: 'Main Course',
            price: 28.00,
            description: 'Carnaroli rice slow-cooked in parmesan broth, wild chanterelles, and 24-month aged parmesan.',
            isVeg: true,
            available: true,
            stock: 4, // low stock test
            image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80',
            popular: false
        },
        {
            id: 'menu_6',
            name: 'Smoked Gouda & Chorizo Croquettes',
            category: 'Snacks',
            price: 15.00,
            description: 'Crispy Iberian bites with saffron aioli and sweet smoked paprika dusting.',
            isVeg: false,
            available: true,
            stock: 20,
            image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
            popular: true
        },
        {
            id: 'menu_7',
            name: 'Gold Leaf Valrhona Chocolate Fondant',
            category: 'Desserts',
            price: 16.50,
            description: 'Warm molten 70% dark chocolate center, Madagascar vanilla bean gelato, and 24k gold leaf.',
            isVeg: true,
            available: true,
            stock: 15,
            image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
            popular: true
        },
        {
            id: 'menu_8',
            name: 'Signature Aurelia Smoked Bourbon',
            category: 'Beverages',
            price: 19.00,
            description: 'Aged reserve bourbon, orange bitters, smoked rosemary plume, and crystal ice sphere.',
            isVeg: true,
            available: true,
            stock: 30,
            image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80',
            popular: false
        }
    ],

    tables: [
        { id: 'tbl_1', number: 'Table 1', capacity: 2, location: 'Window Terrace', status: 'Available' },
        { id: 'tbl_2', number: 'Table 2', capacity: 2, location: 'Garden Courtyard', status: 'Occupied' },
        { id: 'tbl_3', number: 'Table 3', capacity: 4, location: 'Main Dining Hall', status: 'Available' },
        { id: 'tbl_4', number: 'Table 4', capacity: 4, location: 'Mezzanine View', status: 'Reserved' },
        { id: 'tbl_5', number: 'Table 5', capacity: 6, location: 'Wine Cellar Alcove', status: 'Available' },
        { id: 'tbl_6', number: 'Table 6 (VIP)', capacity: 8, location: 'Royal Salon', status: 'Available' }
    ],

    tableBookings: [
        {
            id: 'tb_1001',
            tableId: 'tbl_4',
            tableNumber: 'Table 4',
            customerName: 'Eleanor Bennett',
            customerEmail: 'customer@hotel.demo',
            customerPhone: '+1 (555) 019-8821',
            date: new Date().toISOString().split('T')[0], // today
            timeSlot: '19:30',
            guests: 4,
            specialRequests: 'Anniversary celebration. Quiet window table preferred.',
            status: 'Confirmed',
            createdAt: '2026-10-14 09:15'
        },
        {
            id: 'tb_1002',
            tableId: 'tbl_2',
            tableNumber: 'Table 2',
            customerName: 'Marcus Sterling',
            customerEmail: 'marcus.s@example.com',
            customerPhone: '+1 (555) 349-2210',
            date: new Date().toISOString().split('T')[0],
            timeSlot: '13:00',
            guests: 2,
            specialRequests: 'Lunch meeting.',
            status: 'Seated',
            createdAt: '2026-10-14 11:30'
        }
    ],

    rooms: [
        {
            id: 'room_101',
            number: '101',
            type: 'Deluxe King Suite',
            category: 'Deluxe',
            pricePerNight: 240,
            capacity: 2,
            bedType: 'King Size Bed',
            size: '45 sqm',
            amenities: ['Ocean View Balcony', 'High-speed Wi-Fi', 'Marble Rain Shower', 'Nespresso Bar', 'Smart TV'],
            image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=700&q=80',
            status: 'Available'
        },
        {
            id: 'room_102',
            number: '102',
            type: 'Executive Standard Room',
            category: 'Standard',
            pricePerNight: 160,
            capacity: 2,
            bedType: 'Queen Bed',
            size: '32 sqm',
            amenities: ['Courtyard View', 'Ergonomic Work Desk', 'Complimentary Mini-Bar', 'Luxury Linens'],
            image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=700&q=80',
            status: 'Occupied'
        },
        {
            id: 'room_201',
            number: '201',
            type: 'Grand Aurelia Presidential Penthouse',
            category: 'Suite',
            pricePerNight: 650,
            capacity: 4,
            bedType: '2 King Bedrooms',
            size: '110 sqm',
            amenities: ['Panoramic 270° View', 'Private Jacuzzi Terrace', 'Butler Service', 'Walk-in Wardrobe', 'Fireplace'],
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=700&q=80',
            status: 'Available'
        },
        {
            id: 'room_202',
            number: '202',
            type: 'Garden Sanctuary Suite',
            category: 'Deluxe',
            pricePerNight: 290,
            capacity: 3,
            bedType: 'King Bed + Sofa Bed',
            size: '52 sqm',
            amenities: ['Private Garden Patio', 'Soaking Bathtub', 'Wine Cooler', 'Artisan Bathrobe'],
            image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=700&q=80',
            status: 'Cleaning'
        },
        {
            id: 'room_301',
            number: '301',
            type: 'Heritage Suite',
            category: 'Suite',
            pricePerNight: 420,
            capacity: 3,
            bedType: 'King Bed',
            size: '65 sqm',
            amenities: ['Living Lounge', 'Dressing Room', 'Chandelier Lighting', 'Soundproof Architecture'],
            image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=700&q=80',
            status: 'Reserved'
        }
    ],

    roomBookings: [
        {
            id: 'rb_5001',
            roomId: 'room_102',
            roomNumber: '102',
            roomType: 'Executive Standard Room',
            guestName: 'Eleanor Bennett',
            guestEmail: 'customer@hotel.demo',
            guestPhone: '+1 (555) 019-8821',
            checkIn: '2026-10-13',
            checkOut: '2026-10-16',
            nights: 3,
            adults: 2,
            totalCost: 480.00,
            paymentStatus: 'Successful',
            bookingStatus: 'Occupied',
            createdAt: '2026-10-10 14:20'
        },
        {
            id: 'rb_5002',
            roomId: 'room_301',
            roomNumber: '301',
            roomType: 'Heritage Suite',
            guestName: 'Lord Arthur Pendelton',
            guestEmail: 'arthur.p@heritage.uk',
            guestPhone: '+44 20 7946 0912',
            checkIn: '2026-10-15',
            checkOut: '2026-10-18',
            nights: 3,
            adults: 2,
            totalCost: 1260.00,
            paymentStatus: 'Pending',
            bookingStatus: 'Confirmed',
            createdAt: '2026-10-12 16:45'
        }
    ],

    orders: [
        {
            id: 'ord_9101',
            customerId: 'usr_cust_1',
            customerName: 'Eleanor Bennett',
            customerEmail: 'customer@hotel.demo',
            customerPhone: '+1 (555) 019-8821',
            orderType: 'Dine-in',
            tableNumber: 'Table 2',
            items: [
                { id: 'menu_3', name: 'Pan-Roasted Atlantic Salmon', price: 36.00, quantity: 1, subtotal: 36.00 },
                { id: 'menu_8', name: 'Signature Aurelia Smoked Bourbon', price: 19.00, quantity: 2, subtotal: 38.00 }
            ],
            subtotal: 74.00,
            tax: 3.70, // 5%
            total: 77.70,
            notes: 'Extra crisp skin on salmon please.',
            orderStatus: 'Preparing',
            paymentMethod: 'Razorpay (Online Simulation)',
            paymentStatus: 'Successful',
            transactionRef: 'PAY_SIM_RZP_99182',
            createdAt: '2026-10-14 12:45'
        },
        {
            id: 'ord_9095',
            customerId: 'usr_cust_1',
            customerName: 'Eleanor Bennett',
            customerEmail: 'customer@hotel.demo',
            customerPhone: '+1 (555) 019-8821',
            orderType: 'Room Delivery',
            tableNumber: 'Room 102',
            deliveryAddress: 'Room 102, The Grand Aurelia',
            items: [
                { id: 'menu_1', name: 'Truffle Glazed Wild Mushrooms', price: 18.50, quantity: 1, subtotal: 18.50 },
                { id: 'menu_7', name: 'Gold Leaf Valrhona Chocolate Fondant', price: 16.50, quantity: 1, subtotal: 16.50 }
            ],
            subtotal: 35.00,
            tax: 1.75,
            total: 36.75,
            notes: 'Leave with room service tray.',
            orderStatus: 'Delivered',
            paymentMethod: 'Pay at Counter / Room Charge',
            paymentStatus: 'Successful',
            transactionRef: 'PAY_OFFLINE_88124',
            createdAt: '2026-10-13 20:10'
        },
        {
            id: 'ord_9090',
            customerId: 'guest_charles',
            customerName: 'Charles Montgomery',
            customerEmail: 'charles.m@example.com',
            customerPhone: '+1 (555) 441-9002',
            orderType: 'Takeaway / Pickup',
            items: [
                { id: 'menu_4', name: 'Prime Wagyu Ribeye Steak (8oz)', price: 54.00, quantity: 2, subtotal: 108.00 }
            ],
            subtotal: 108.00,
            tax: 5.40,
            total: 113.40,
            notes: 'Pack cutlery set.',
            orderStatus: 'Pending',
            paymentMethod: 'Cash on Delivery / Pickup',
            paymentStatus: 'Pending',
            transactionRef: 'PAY_PENDING_10291',
            createdAt: '2026-10-14 13:10'
        }
    ],

    feedback: [
        {
            id: 'fb_1',
            customerName: 'Lady Catherine Finch',
            rating: 5,
            comments: 'Exquisite hospitality and extraordinary dining. The Wagyu Ribeye and Smoked Bourbon were sheer perfection!',
            date: '2026-10-12',
            serviceType: 'Dining & Stay'
        },
        {
            id: 'fb_2',
            customerName: 'Eleanor Bennett',
            rating: 5,
            comments: 'The room views are unmatched, staff is wonderfully courteous. Checkout and table booking were seamless.',
            date: '2026-10-13',
            serviceType: 'Hotel Suite'
        }
    ],

    settings: {
        hotelName: 'The Grand Aurelia Hotel & Resort',
        hotelTagline: 'Luxury Living & Michelin-Inspired Gastronomy',
        taxRatePercent: 5,
        currencySymbol: '$',
        contactPhone: '+1 (800) 555-AURELIA',
        contactEmail: 'concierge@grandaurelia.com',
        address: '742 Royal Promenade Avenue, Coastal Bay, CA 90210',
        openingHours: '24/7 Front Desk | Restaurant: 07:00 AM – 11:30 PM',
        razorpayDemoKey: 'rzp_test_aurelia_prototype_key'
    }
};

/**
 * Storage Controller Helper Functions
 */
const StorageService = {
    // Initialize LocalStorage with default data if missing
    init: function () {
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_DATA.users));
        }
        if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
            localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_DATA.menu));
        }
        if (!localStorage.getItem(STORAGE_KEYS.TABLES)) {
            localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(DEFAULT_DATA.tables));
        }
        if (!localStorage.getItem(STORAGE_KEYS.TABLE_BOOKINGS)) {
            localStorage.setItem(STORAGE_KEYS.TABLE_BOOKINGS, JSON.stringify(DEFAULT_DATA.tableBookings));
        }
        if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
            localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(DEFAULT_DATA.rooms));
        }
        if (!localStorage.getItem(STORAGE_KEYS.ROOM_BOOKINGS)) {
            localStorage.setItem(STORAGE_KEYS.ROOM_BOOKINGS, JSON.stringify(DEFAULT_DATA.roomBookings));
        }
        if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_DATA.orders));
        }
        if (!localStorage.getItem(STORAGE_KEYS.CART)) {
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE_KEYS.FEEDBACK)) {
            localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(DEFAULT_DATA.feedback));
        }
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_DATA.settings));
        }
    },

    // Reset all storage to pristine demo data
    resetToDefault: function () {
        localStorage.clear();
        this.init();
        // Notify any listeners
        window.dispatchEvent(new Event('storageUpdated'));
        return true;
    },

    // Generic Get
    get: function (key, fallback = []) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch (e) {
            console.error(`Error parsing LocalStorage key [${key}]:`, e);
            return fallback;
        }
    },

    // Generic Set
    set: function (key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            window.dispatchEvent(new Event('storageUpdated'));
            return true;
        } catch (e) {
            console.error(`Error saving to LocalStorage key [${key}]:`, e);
            return false;
        }
    },

    // ID Generator Helper
    generateId: function (prefix = 'id') {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 6);
        return `${prefix}_${timestamp}_${randomStr}`;
    },

    // Current formatted timestamp
    nowString: function () {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    },

    // Get Cart
    getCart: function () {
        return this.get(STORAGE_KEYS.CART, []);
    },

    // Add Item to Cart
    addToCart: function (menuItem, quantity = 1) {
        const cart = this.getCart();
        const existingIndex = cart.findIndex(i => i.id === menuItem.id);
        
        // Check stock availability
        const currentMenu = this.get(STORAGE_KEYS.MENU);
        const found = currentMenu.find(m => m.id === menuItem.id);
        const availableStock = found ? found.stock : 0;

        const currentInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;
        if (currentInCart + quantity > availableStock) {
            return { success: false, message: `Only ${availableStock} in stock!` };
        }

        if (existingIndex > -1) {
            cart[existingIndex].quantity += quantity;
            cart[existingIndex].subtotal = Number((cart[existingIndex].quantity * cart[existingIndex].price).toFixed(2));
        } else {
            cart.push({
                id: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                isVeg: menuItem.isVeg,
                image: menuItem.image,
                quantity: quantity,
                subtotal: Number((menuItem.price * quantity).toFixed(2))
            });
        }

        this.set(STORAGE_KEYS.CART, cart);
        return { success: true, cartCount: this.getCartCount() };
    },

    // Update Cart Quantity
    updateCartQuantity: function (itemId, quantity) {
        let cart = this.getCart();
        const index = cart.findIndex(i => i.id === itemId);
        if (index === -1) return;

        if (quantity <= 0) {
            cart.splice(index, 1);
        } else {
            // Check stock
            const menu = this.get(STORAGE_KEYS.MENU);
            const found = menu.find(m => m.id === itemId);
            if (found && quantity > found.stock) {
                return { success: false, message: `Max available stock is ${found.stock}` };
            }
            cart[index].quantity = quantity;
            cart[index].subtotal = Number((cart[index].price * quantity).toFixed(2));
        }

        this.set(STORAGE_KEYS.CART, cart);
        return { success: true };
    },

    // Remove from Cart
    removeFromCart: function (itemId) {
        let cart = this.getCart().filter(i => i.id !== itemId);
        this.set(STORAGE_KEYS.CART, cart);
    },

    // Clear Cart
    clearCart: function () {
        this.set(STORAGE_KEYS.CART, []);
    },

    // Get Cart Totals
    getCartTotals: function () {
        const cart = this.getCart();
        const settings = this.get(STORAGE_KEYS.SETTINGS, DEFAULT_DATA.settings);
        const taxRate = settings.taxRatePercent || 5;

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = (subtotal * taxRate) / 100;
        const total = subtotal + tax;

        return {
            itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: Number(subtotal.toFixed(2)),
            taxRate: taxRate,
            tax: Number(tax.toFixed(2)),
            total: Number(total.toFixed(2))
        };
    },

    // Get Cart Count badge
    getCartCount: function () {
        const cart = this.getCart();
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    },

    // Deduct stock after order
    deductMenuStock: function (items) {
        const menu = this.get(STORAGE_KEYS.MENU);
        items.forEach(orderItem => {
            const index = menu.findIndex(m => m.id === orderItem.id);
            if (index > -1) {
                menu[index].stock = Math.max(0, menu[index].stock - orderItem.quantity);
                if (menu[index].stock === 0) {
                    menu[index].available = false;
                }
            }
        });
        this.set(STORAGE_KEYS.MENU, menu);
    },

    // Table Overlap Check
    // Prevents two active bookings for the same table at overlapping times
    checkTableConflict: function (tableId, date, timeSlot, excludeBookingId = null) {
        const bookings = this.get(STORAGE_KEYS.TABLE_BOOKINGS);
        
        return bookings.some(b => {
            if (excludeBookingId && b.id === excludeBookingId) return false;
            if (b.status === 'Cancelled' || b.status === 'Completed') return false;
            
            // Check matching table and date
            if (b.tableId === tableId && b.date === date) {
                // Table slot collision (assuming typical 2-hour dining window)
                return b.timeSlot === timeSlot;
            }
            return false;
        });
    },

    // Room Availability Check
    checkRoomAvailability: function (roomId, checkIn, checkOut, excludeBookingId = null) {
        const bookings = this.get(STORAGE_KEYS.ROOM_BOOKINGS);
        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);

        return !bookings.some(b => {
            if (excludeBookingId && b.id === excludeBookingId) return false;
            if (b.bookingStatus === 'Cancelled' || b.bookingStatus === 'Checked-Out') return false;

            if (b.roomId === roomId) {
                const bIn = new Date(b.checkIn);
                const bOut = new Date(b.checkOut);
                // Overlap formula: (StartA < EndB) and (EndA > StartB)
                return inDate < bOut && outDate > bIn;
            }
            return false;
        });
    }
};

// Initialize on file load
StorageService.init();
