/**
 * Maithili Agro Tourism — Mulshi · Pune - Hotel Management System
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
    ACTIVITIES: 'hotel_activities',
    ACTIVITY_BOOKINGS: 'hotel_activity_bookings',
    PURCHASE_ORDERS: 'hotel_purchase_orders',
    SUPPLIERS: 'hotel_suppliers',
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
            id: 'usr_pur_1',
            name: 'Marcus Sterling',
            email: 'purchase@hotel.demo',
            password: 'Purchase@123',
            role: 'Purchase',
            phone: '+1 (555) 019-3388',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
            joinedDate: '2025-01-20'
        },
        {
            id: 'usr_acc_1',
            name: 'Sophia Chen, CPA',
            email: 'accounts@hotel.demo',
            password: 'Accounts@123',
            role: 'Accounts',
            phone: '+1 (555) 019-4455',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
            joinedDate: '2025-01-10'
        },
        {
            id: 'usr_mgr_1',
            name: 'Victoria Vance',
            email: 'manager@hotel.demo',
            password: 'Manager@123',
            role: 'Manager',
            phone: '+1 (555) 019-5829',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
            joinedDate: '2025-02-01'
        },
        {
            id: 'usr_md_1',
            name: 'Dr. Harrison Vance',
            email: 'md@hotel.demo',
            password: 'Md@123',
            role: 'MD',
            phone: '+1 (555) 019-1100',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            joinedDate: '2024-11-01'
        },
        {
            id: 'usr_rec_1',
            name: 'Julian Hayes',
            email: 'reception@hotel.demo',
            password: 'Reception@123',
            role: 'Receptionist',
            phone: '+1 (555) 019-7412',
            status: 'active',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
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
            avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
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
            name: 'Signature Maithili Smoked Bourbon',
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
        { id: 'tbl_1', number: 'Table 1', capacity: 2, location: 'Window Terrace', zone: 'Terrace', status: 'Available' },
        { id: 'tbl_2', number: 'Table 2', capacity: 2, location: 'Garden Courtyard', zone: 'Garden', status: 'Occupied', activeOrderId: 'ord_9101' },
        { id: 'tbl_3', number: 'Table 3', capacity: 4, location: 'Main Dining Hall', zone: 'Main Hall', status: 'Available' },
        { id: 'tbl_4', number: 'Table 4', capacity: 4, location: 'Mezzanine View', zone: 'Mezzanine', status: 'Reserved' },
        { id: 'tbl_5', number: 'Table 5', capacity: 6, location: 'Wine Cellar Alcove', zone: 'Wine Cellar', status: 'Available' },
        { id: 'tbl_6', number: 'Table 6 (VIP)', capacity: 8, location: 'Royal Salon', zone: 'VIP Salon', status: 'Available' },
        { id: 'tbl_7', number: 'Table 7', capacity: 4, location: 'Main Dining Hall', zone: 'Main Hall', status: 'Available' },
        { id: 'tbl_8', number: 'Table 8', capacity: 2, location: 'Garden Courtyard', zone: 'Garden', status: 'Available' },
        { id: 'tbl_9', number: 'Table 9', capacity: 4, location: 'Window Terrace', zone: 'Terrace', status: 'Available' },
        { id: 'tbl_10', number: 'Table 10 (Bar)', capacity: 4, location: 'Artisan Bar Counter', zone: 'Bar & Lounge', status: 'Available' }
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
            type: 'Maithili Presidential Penthouse',
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
            tableId: 'tbl_2',
            tableNumber: 'Table 2',
            serverName: 'Marco Rossi',
            guests: 2,
            items: [
                { id: 'menu_3', name: 'Pan-Roasted Atlantic Salmon', price: 36.00, quantity: 1, subtotal: 36.00, notes: 'Extra crisp skin' },
                { id: 'menu_8', name: 'Signature Maithili Smoked Bourbon', price: 19.00, quantity: 2, subtotal: 38.00, notes: 'Sphere crystal ice' }
            ],
            kots: [
                {
                    kotId: 'KOT-101',
                    kotNumber: 1,
                    punchedAt: '2026-10-15 10:40',
                    items: [
                        { id: 'menu_3', name: 'Pan-Roasted Atlantic Salmon', quantity: 1, notes: 'Extra crisp skin' },
                        { id: 'menu_8', name: 'Signature Maithili Smoked Bourbon', quantity: 2, notes: 'Sphere crystal ice' }
                    ],
                    status: 'Preparing'
                }
            ],
            subtotal: 74.00,
            tax: 3.70, // 5%
            total: 77.70,
            notes: 'Extra crisp skin on salmon please.',
            orderStatus: 'Preparing',
            paymentMethod: 'Pending Settlement',
            paymentStatus: 'Pending',
            transactionRef: 'PAY_PENDING_KOT',
            createdAt: '2026-10-15 10:40'
        },
        {
            id: 'ord_9095',
            customerId: 'usr_cust_1',
            customerName: 'Eleanor Bennett',
            customerEmail: 'customer@hotel.demo',
            customerPhone: '+1 (555) 019-8821',
            orderType: 'Room Delivery',
            tableNumber: 'Room 102',
            deliveryAddress: 'Room 102, Maithili Agro Tourism',
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

    activities: [
        {
            id: 'act_spa_1',
            name: 'Serenity Oceanfront Spa & Aromatherapy',
            category: 'Spa & Wellness',
            duration: '90 Minutes',
            pricePerPerson: 180.00,
            image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
            description: 'Indulge in holistic organic botanical massages, ocean-facing open cabanas, hot Himalayan stone therapy, and restorative sound bowl frequency healing.',
            slots: ['09:00 AM', '11:30 AM', '02:30 PM', '04:30 PM'],
            maxParticipants: 4,
            inclusions: ['Welcome herbal elixir', 'Full body aroma ritual', 'Private ocean jacuzzi access'],
            popular: true
        },
        {
            id: 'act_yacht_2',
            name: 'Sunset Luxury Catamaran & Champagne Cruise',
            category: 'Ocean & Watersports',
            duration: '2.5 Hours',
            pricePerPerson: 240.00,
            image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
            description: 'Sail into golden coastal sunsets aboard our 52-foot Sunreef catamaran. Savor vintage French champagne, caviar tartlets, and live acoustic violin accompaniment.',
            slots: ['04:45 PM Sunset Sail'],
            maxParticipants: 12,
            inclusions: ['Moët & Chandon champagne', 'Artisan charcuterie & caviar', 'Professional maritime crew'],
            popular: true
        },
        {
            id: 'act_dive_3',
            name: 'Coral Reef Scuba Safari & Sea Turtle Encounter',
            category: 'Ocean & Watersports',
            duration: '3.5 Hours',
            pricePerPerson: 165.00,
            image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
            description: 'PADI Master-guided marine reserve expedition. Explore vibrant protected coral gardens, crystal waters, manta rays, and endemic reef fish species.',
            slots: ['08:30 AM Morning Tide', '01:30 PM Sunlit Deep'],
            maxParticipants: 6,
            inclusions: ['Complete Mares scuba gear', 'Underwater 4K GoPro photo kit', 'Marine biologist guide'],
            popular: false
        },
        {
            id: 'act_culinary_4',
            name: 'Michelin-Inspired Master Chef Cooking Workshop',
            category: 'Culinary Masterclasses',
            duration: '2 Hours',
            pricePerPerson: 135.00,
            image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
            description: 'Step into our state-of-the-art culinary atelier with Executive Chef Marco. Master artisanal hand-rolled truffled pasta and pan-seared Wagyu techniques.',
            slots: ['10:30 AM Lunch Prep', '03:30 PM Afternoon Lab'],
            maxParticipants: 8,
            inclusions: ['Handmade pasta & wine pairing tasting', 'Custom embroidered apron', 'Signature recipe book'],
            popular: true
        },
        {
            id: 'act_yoga_5',
            name: 'Sunrise Zen Yoga & Crystal Sound Healing',
            category: 'Spa & Wellness',
            duration: '75 Minutes',
            pricePerPerson: 65.00,
            image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
            description: 'Awaken your mind at dawn on the sea pavilion. Harmonizing vinyasa flow accompanied by 432Hz quartz crystal singing bowls and sea breeze.',
            slots: ['06:30 AM Dawn Break'],
            maxParticipants: 15,
            inclusions: ['Lululemon eco-mat & bolster', 'Cold-pressed detox vitality juice', 'Guided meditation tape'],
            popular: false
        },
        {
            id: 'act_golf_6',
            name: 'Championship 18-Hole Links Golf & Pro Clinic',
            category: 'Sports & Adventure',
            duration: '4 Hours',
            pricePerPerson: 195.00,
            image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80',
            description: 'Play on our cliffside ocean links course designed by golf legends. Includes electric GPS golf cart, Titleist rental set, and 45-min PGA coach analysis.',
            slots: ['07:30 AM Early Tee', '01:00 PM Afternoon Round'],
            maxParticipants: 4,
            inclusions: ['Electric GPS cart', 'Custom fitted Titleist irons', 'Clubhouse lunch voucher'],
            popular: true
        },
        {
            id: 'act_dinner_7',
            name: 'Private Beachfront Starlight Candlelight Dining',
            category: 'Romantic Experiences',
            duration: '3 Hours',
            pricePerPerson: 225.00,
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
            description: 'A secluded bamboo pergola on private sands, illuminated by tiki torches and floating lanterns. 6-course bespoke tasting menu with sommelier wine pairings.',
            slots: ['07:00 PM Starlight Seating'],
            maxParticipants: 2,
            inclusions: ['Dedicated personal butler & chef', '6-course gastronomic feast', 'Floral canopy arrangement'],
            popular: true
        },
        {
            id: 'act_heli_8',
            name: 'Coastal Helicopter Aerial Panorama Tour',
            category: 'Sports & Adventure',
            duration: '45 Minutes',
            pricePerPerson: 350.00,
            image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
            description: 'Take flight from the private Maithili Helipad. Soar above scenic Mulshi backwaters, turquoise lake views, and lush Sahyadri hills with Bose noise-canceling headsets.',
            slots: ['10:00 AM Morning Flight', '02:00 PM Midday Vista', '05:00 PM Golden Flight'],
            maxParticipants: 4,
            inclusions: ['Helipad lounge express check-in', 'Bose aviation headset audio', 'Champagne landing toast'],
            popular: true
        }
    ],

    activityBookings: [
        {
            id: 'actb_7001',
            activityId: 'act_yacht_2',
            activityName: 'Sunset Luxury Catamaran & Champagne Cruise',
            guestName: 'Eleanor Bennett',
            guestEmail: 'customer@hotel.demo',
            guestPhone: '+1 (555) 019-8821',
            bookingDate: '2026-10-18',
            timeSlot: '04:45 PM Sunset Sail',
            participants: 2,
            subtotal: 480.00,
            tax: 24.00,
            totalCost: 504.00,
            paymentMethod: 'Credit Card (Visa •••• 4242)',
            paymentStatus: 'Successful',
            transactionRef: 'PAY_CC_88921',
            bookingStatus: 'Confirmed',
            specialRequests: 'Celebrating wedding anniversary. Extra champagne please.',
            createdAt: '2026-10-14 11:30'
        },
        {
            id: 'actb_7002',
            activityId: 'act_spa_1',
            activityName: 'Serenity Oceanfront Spa & Aromatherapy',
            guestName: 'Lord Arthur Pendelton',
            guestEmail: 'arthur.p@heritage.uk',
            guestPhone: '+44 20 7946 0912',
            bookingDate: '2026-10-16',
            timeSlot: '11:30 AM',
            participants: 1,
            subtotal: 180.00,
            tax: 9.00,
            totalCost: 189.00,
            paymentMethod: 'Debit Card (Mastercard •••• 5521)',
            paymentStatus: 'Successful',
            transactionRef: 'PAY_DC_10923',
            bookingStatus: 'Confirmed',
            specialRequests: 'Focus on deep tissue shoulder relief.',
            createdAt: '2026-10-15 09:15'
        }
    ],

    payments: [
        {
            id: 'txn_9001',
            refNumber: 'RZP_CC_49219',
            category: 'Room Booking',
            description: 'Room 201 - Presidential Penthouse (2 Nights)',
            customerName: 'Eleanor Bennett',
            customerEmail: 'customer@hotel.demo',
            method: 'Credit Card',
            cardBrand: 'Visa',
            cardLast4: '4242',
            subtotal: 960.00,
            tax: 48.00,
            amount: 1008.00,
            gatewayFee: 20.16,
            netSettled: 987.84,
            status: 'Settled',
            timestamp: '2026-10-14 14:22:10'
        },
        {
            id: 'txn_9002',
            refNumber: 'RZP_DC_38102',
            category: 'Activity Prebooking',
            description: 'Serenity Oceanfront Spa & Aromatherapy (1 Guest)',
            customerName: 'Lord Arthur Pendelton',
            customerEmail: 'arthur.p@heritage.uk',
            method: 'Debit Card',
            cardBrand: 'Mastercard',
            cardLast4: '5521',
            subtotal: 180.00,
            tax: 9.00,
            amount: 189.00,
            gatewayFee: 1.89,
            netSettled: 187.11,
            status: 'Settled',
            timestamp: '2026-10-15 09:15:30'
        },
        {
            id: 'txn_9003',
            refNumber: 'RZP_CC_11029',
            category: 'Activity Prebooking',
            description: 'Sunset Luxury Catamaran & Champagne Cruise (2 Guests)',
            customerName: 'Eleanor Bennett',
            customerEmail: 'customer@hotel.demo',
            method: 'Credit Card',
            cardBrand: 'Visa',
            cardLast4: '4242',
            subtotal: 480.00,
            tax: 24.00,
            amount: 504.00,
            gatewayFee: 10.08,
            netSettled: 493.92,
            status: 'Settled',
            timestamp: '2026-10-14 11:30:45'
        },
        {
            id: 'txn_9004',
            refNumber: 'RZP_UPI_58291',
            category: 'Dining Order',
            description: 'Michelin Table 4 Dining & Vintage Wine',
            customerName: 'Vikramaditya Singhania',
            customerEmail: 'vikram.s@ventures.in',
            method: 'UPI',
            cardBrand: 'UPI / QR',
            cardLast4: 'GPay',
            subtotal: 145.00,
            tax: 7.25,
            amount: 152.25,
            gatewayFee: 0.00,
            netSettled: 152.25,
            status: 'Settled',
            timestamp: '2026-10-15 20:45:00'
        },
        {
            id: 'txn_9005',
            refNumber: 'RZP_DC_88192',
            category: 'Room Booking',
            description: 'Room 102 - Executive Ocean Suite (3 Nights)',
            customerName: 'Eleanor Bennett',
            customerEmail: 'customer@hotel.demo',
            method: 'Debit Card',
            cardBrand: 'RuPay Debit',
            cardLast4: '8810',
            subtotal: 480.00,
            tax: 24.00,
            amount: 504.00,
            gatewayFee: 0.00,
            netSettled: 504.00,
            status: 'Settled',
            timestamp: '2026-10-10 14:20:00'
        }
    ],

    suppliers: [
        {
            id: 'sup_1',
            name: 'Coastal Seafood & Fresh Catch Co.',
            category: 'Seafood & Caviar',
            rating: 4.9,
            paymentTerms: 'Net 30 Days',
            contactName: 'Captain Patrick Ross',
            phone: '+1 (555) 019-8811',
            email: 'orders@coastalseafood.demo',
            location: 'Harbor Pier 9, Coastal Bay',
            leadTimeDays: 1,
            activeOrdersCount: 1,
            totalSpendYtd: 42800.00
        },
        {
            id: 'sup_2',
            name: 'Heritage Prime Wagyu & Poultry Ltd.',
            category: 'Meats & Poultry',
            rating: 5.0,
            paymentTerms: 'Net 15 Days',
            contactName: 'Claire Beaumont',
            phone: '+1 (555) 019-4422',
            email: 'sales@heritageprime.demo',
            location: 'Valley Ranches, North Valley',
            leadTimeDays: 2,
            activeOrdersCount: 1,
            totalSpendYtd: 68500.00
        },
        {
            id: 'sup_3',
            name: 'Artisan Truffle & Organic Valley Farms',
            category: 'Truffles & Organic Produce',
            rating: 4.8,
            paymentTerms: 'Net 30 Days',
            contactName: 'Lucia Ferri',
            phone: '+1 (555) 019-9933',
            email: 'lucia@artisanproduce.demo',
            location: 'Orchard Ridge, CA 95476',
            leadTimeDays: 1,
            activeOrdersCount: 1,
            totalSpendYtd: 29400.00
        },
        {
            id: 'sup_4',
            name: 'Château Maithili Cellars & Fine Spirits',
            category: 'Vintage Wines & Spirits',
            rating: 5.0,
            paymentTerms: 'Immediate / Card',
            contactName: 'Étienne Laurent',
            phone: '+1 (555) 019-2244',
            email: 'sommelier@maithiliagro.demo',
            location: 'Reserve Vineyard Estate, Napa',
            leadTimeDays: 3,
            activeOrdersCount: 1,
            totalSpendYtd: 94200.00
        },
        {
            id: 'sup_5',
            name: 'Luxe Linens & Resort Botanicals Corp.',
            category: 'Hotel Amenities & Textiles',
            rating: 4.9,
            paymentTerms: 'Net 45 Days',
            contactName: 'Genevieve Dupond',
            phone: '+1 (555) 019-7755',
            email: 'hospitality@luxelinens.demo',
            location: 'Industrial Boulevard, San Francisco',
            leadTimeDays: 4,
            activeOrdersCount: 0,
            totalSpendYtd: 36100.00
        }
    ],

    purchaseOrders: [
        {
            id: 'PO-8801',
            supplierId: 'sup_1',
            supplierName: 'Coastal Seafood & Fresh Catch Co.',
            category: 'Seafood & Caviar',
            items: [
                { name: 'Fresh Atlantic Salmon Fillet', quantity: 40, unit: 'kg', unitPrice: 32.00, total: 1280.00 },
                { name: 'Imperial Ossetra Caviar (50g)', quantity: 15, unit: 'tins', unitPrice: 110.00, total: 1650.00 },
                { name: 'Pacific Bluefin Tuna Loin', quantity: 20, unit: 'kg', unitPrice: 48.00, total: 960.00 },
                { name: 'Wild Coastal Oysters', quantity: 120, unit: 'pcs', unitPrice: 3.00, total: 360.00 }
            ],
            subtotal: 4250.00,
            tax: 0.00,
            totalAmount: 4250.00,
            status: 'Delivered & Received',
            grnNumber: 'GRN-108',
            paymentStatus: 'Settled by Accounts',
            paymentTerms: 'Net 30 Days',
            issuedDate: '2026-10-12',
            expectedDelivery: '2026-10-14',
            receivedDate: '2026-10-14 09:15',
            receivedBy: 'Marcus Sterling (Purchase Head)',
            notes: 'Temperature-controlled reefer delivery confirmed. Goods verified & entered into kitchen inventory.'
        },
        {
            id: 'PO-8802',
            supplierId: 'sup_2',
            supplierName: 'Heritage Prime Wagyu & Poultry Ltd.',
            category: 'Meats & Poultry',
            items: [
                { name: 'A5 Miyazaki Wagyu Ribeye Cut', quantity: 25, unit: 'kg', unitPrice: 180.00, total: 4500.00 },
                { name: 'Organic Free-Range Duck Breast', quantity: 40, unit: 'units', unitPrice: 28.00, total: 1120.00 },
                { name: 'Prime Dry-Aged Angus Striploin', quantity: 30, unit: 'kg', unitPrice: 39.00, total: 1180.00 }
            ],
            subtotal: 6800.00,
            tax: 0.00,
            totalAmount: 6800.00,
            status: 'In Transit',
            grnNumber: null,
            paymentStatus: 'Pending Accounts Clearance',
            paymentTerms: 'Net 15 Days',
            issuedDate: '2026-10-15',
            expectedDelivery: '2026-10-17 Today',
            receivedDate: null,
            receivedBy: null,
            notes: 'Dispatch confirmed via refrigerated truck. Driver ETA: 02:30 PM.'
        },
        {
            id: 'PO-8803',
            supplierId: 'sup_3',
            supplierName: 'Artisan Truffle & Organic Valley Farms',
            category: 'Truffles & Produce',
            items: [
                { name: 'Fresh Italian Black Autumn Truffles', quantity: 5, unit: 'kg', unitPrice: 420.00, total: 2100.00 },
                { name: 'Wild Forest Morels & Chanterelles', quantity: 20, unit: 'kg', unitPrice: 35.00, total: 700.00 },
                { name: 'Heirloom Organic Peaches & Figs', quantity: 40, unit: 'kg', unitPrice: 16.25, total: 650.00 }
            ],
            subtotal: 3450.00,
            tax: 0.00,
            totalAmount: 3450.00,
            status: 'Approved',
            grnNumber: null,
            paymentStatus: 'Awaiting Dispatch',
            paymentTerms: 'Net 30 Days',
            issuedDate: '2026-10-16',
            expectedDelivery: '2026-10-18',
            receivedDate: null,
            receivedBy: null,
            notes: 'Signed off by Executive Chef Marco & Purchase Head Marcus Sterling.'
        },
        {
            id: 'PO-8804',
            supplierId: 'sup_4',
            supplierName: 'Château Maithili Cellars & Fine Spirits',
            category: 'Vintage Wines & Spirits',
            items: [
                { name: 'Dom Pérignon Vintage Champagne 2015', quantity: 24, unit: 'btls', unitPrice: 220.00, total: 5280.00 },
                { name: 'Tenuta San Guido Sassicaia 2018', quantity: 12, unit: 'btls', unitPrice: 195.00, total: 2340.00 },
                { name: 'The Macallan 18-Year Triple Cask', quantity: 6, unit: 'btls', unitPrice: 213.33, total: 1280.00 }
            ],
            subtotal: 8900.00,
            tax: 0.00,
            totalAmount: 8900.00,
            status: 'Pending Review',
            grnNumber: null,
            paymentStatus: 'Draft PO',
            paymentTerms: 'Immediate / Card',
            issuedDate: '2026-10-17',
            expectedDelivery: '2026-10-20',
            receivedDate: null,
            receivedBy: null,
            notes: 'Restock order for Main Dining Salon & Sommelier Tasting Atelier.'
        }
    ],

    settings: {
        hotelName: 'Maithili',
        hotelFullName: 'Maithili Agro Tourism — Mulshi · Pune',
        hotelShortName: 'Maithili',
        hotelTagline: 'Agro Tourism, Scenic Nature & Authentic Hospitality',
        taxRatePercent: 5,
        currencySymbol: '$',
        contactPhone: '+91 98230 12345 / +91 (020) 2555-6789',
        contactEmail: 'contact@maithiliagro.com',
        address: 'Mulshi Dam Road, Mulshi, Pune, Maharashtra 412108',
        openingHours: '24/7 Front Desk | Restaurant: 07:00 AM – 11:30 PM',
        razorpayDemoKey: 'rzp_test_maithili_prototype_key'
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
        } else {
            // Ensure Purchase, MD, and Accounts users are present in existing localStorage
            try {
                const existingUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
                let updated = false;
                ['usr_pur_1', 'usr_md_1', 'usr_acc_1'].forEach(id => {
                    if (!existingUsers.some(u => u.id === id)) {
                        const defaultUser = DEFAULT_DATA.users.find(u => u.id === id);
                        if (defaultUser) {
                            existingUsers.push(defaultUser);
                            updated = true;
                        }
                    }
                });
                if (updated) {
                    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(existingUsers));
                }
            } catch (e) {
                console.error('Error synchronizing users:', e);
            }
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
        if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
            localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(DEFAULT_DATA.activities));
        }
        if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY_BOOKINGS)) {
            localStorage.setItem(STORAGE_KEYS.ACTIVITY_BOOKINGS, JSON.stringify(DEFAULT_DATA.activityBookings));
        }
        if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
            localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(DEFAULT_DATA.payments));
        }
        if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_DATA.orders));
        }
        if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
            localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(DEFAULT_DATA.suppliers));
        }
        if (!localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS)) {
            localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(DEFAULT_DATA.purchaseOrders));
        }
        if (!localStorage.getItem(STORAGE_KEYS.CART)) {
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE_KEYS.FEEDBACK)) {
            localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(DEFAULT_DATA.feedback));
        }
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_DATA.settings));
        } else {
            try {
                const curSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
                if (!curSettings.hotelFullName || (curSettings.hotelName && (curSettings.hotelName.includes('Aurelia') || curSettings.hotelName.includes('Grand')))) {
                    curSettings.hotelName = DEFAULT_DATA.settings.hotelName;
                    curSettings.hotelFullName = DEFAULT_DATA.settings.hotelFullName;
                    curSettings.hotelShortName = DEFAULT_DATA.settings.hotelShortName;
                    curSettings.hotelTagline = DEFAULT_DATA.settings.hotelTagline;
                    curSettings.address = DEFAULT_DATA.settings.address;
                    curSettings.contactEmail = DEFAULT_DATA.settings.contactEmail;
                    curSettings.contactPhone = DEFAULT_DATA.settings.contactPhone;
                    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(curSettings));
                }
            } catch (e) {
                console.error('Error synchronizing settings:', e);
            }
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
            if (typeof window !== 'undefined' && typeof Event !== 'undefined') {
                window.dispatchEvent(new Event('storageUpdated'));
            }
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
    },

    // ==========================================
    // RESTAURANT POS & KITCHEN (RMS) ENGINE
    // ==========================================

    // Get active unpaid order for a table
    getActiveTableOrder: function (tableId) {
        const orders = this.get(STORAGE_KEYS.ORDERS, []);
        const tables = this.get(STORAGE_KEYS.TABLES, []);
        const table = tables.find(t => t.id === tableId);

        // Check by activeOrderId on table first
        if (table && table.activeOrderId) {
            const found = orders.find(o => o.id === table.activeOrderId);
            if (found && found.paymentStatus === 'Pending' && found.orderStatus !== 'Cancelled') {
                return found;
            }
        }

        // Fallback search by tableId & pending payment
        return orders.find(o => 
            o.tableId === tableId && 
            o.paymentStatus === 'Pending' && 
            o.orderStatus !== 'Cancelled' &&
            o.orderStatus !== 'Delivered'
        ) || null;
    },

    // Punch KOT (Kitchen Order Ticket) for a table
    punchKOT: function (tableId, draftItems, metadata = {}) {
        if (!draftItems || draftItems.length === 0) {
            return { success: false, message: 'No items in draft ticket.' };
        }

        const tables = this.get(STORAGE_KEYS.TABLES, []);
        const orders = this.get(STORAGE_KEYS.ORDERS, []);
        const settings = this.get(STORAGE_KEYS.SETTINGS, DEFAULT_DATA.settings);
        const taxRate = settings.taxRatePercent || 5;

        const tableIndex = tables.findIndex(t => t.id === tableId);
        if (tableIndex === -1) {
            return { success: false, message: 'Table not found.' };
        }
        const table = tables[tableIndex];

        let order = this.getActiveTableOrder(tableId);
        const isNewOrder = !order;
        const now = this.nowString();

        const kotNumber = (order && order.kots) ? (order.kots.length + 1) : 1;
        const kotId = `KOT-${Math.floor(100 + Math.random() * 900)}`;

        const kotTicket = {
            kotId: kotId,
            kotNumber: kotNumber,
            punchedAt: now,
            serverName: metadata.serverName || 'Staff',
            tableNumber: table.number,
            status: 'Preparing',
            items: draftItems.map(item => ({
                id: item.id,
                name: item.name,
                price: Number(item.price),
                quantity: Number(item.quantity),
                notes: item.notes || '',
                isVeg: item.isVeg !== undefined ? item.isVeg : true,
                subtotal: Number((item.price * item.quantity).toFixed(2))
            }))
        };

        if (isNewOrder) {
            const orderId = this.generateId('ord_pos');
            const items = kotTicket.items.map(i => ({ ...i }));
            const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
            const tax = Number(((subtotal * taxRate) / 100).toFixed(2));
            const total = Number((subtotal + tax).toFixed(2));

            order = {
                id: orderId,
                customerId: metadata.customerId || null,
                customerName: metadata.customerName || `Dine-In (${table.number})`,
                customerEmail: metadata.customerEmail || 'pos.guest@hotel.demo',
                customerPhone: metadata.customerPhone || '',
                orderType: 'Dine-in',
                tableId: table.id,
                tableNumber: table.number,
                serverName: metadata.serverName || 'Staff',
                guests: metadata.guests || table.capacity || 2,
                items: items,
                kots: [kotTicket],
                subtotal: subtotal,
                tax: tax,
                total: total,
                orderStatus: 'Preparing',
                paymentMethod: 'Pending Settlement',
                paymentStatus: 'Pending',
                createdAt: now,
                updatedAt: now
            };
            orders.unshift(order);
        } else {
            // Append to existing running order
            order.updatedAt = now;
            if (!order.kots) order.kots = [];
            order.kots.push(kotTicket);

            // Merge items into running total
            kotTicket.items.forEach(newItem => {
                const existingItem = order.items.find(i => i.id === newItem.id && (i.notes || '') === (newItem.notes || ''));
                if (existingItem) {
                    existingItem.quantity += newItem.quantity;
                    existingItem.subtotal = Number((existingItem.price * existingItem.quantity).toFixed(2));
                } else {
                    order.items.push({ ...newItem });
                }
            });

            // Recalculate financial totals
            order.subtotal = Number(order.items.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2));
            order.tax = Number(((order.subtotal * taxRate) / 100).toFixed(2));
            order.total = Number((order.subtotal + order.tax).toFixed(2));
            order.orderStatus = 'Preparing';

            const ordIdx = orders.findIndex(o => o.id === order.id);
            if (ordIdx > -1) {
                orders[ordIdx] = order;
            }
        }

        // Update table status to Occupied and save activeOrderId
        tables[tableIndex].status = 'Occupied';
        tables[tableIndex].activeOrderId = order.id;

        // Deduct inventory stock
        this.deductMenuStock(kotTicket.items);

        // Save state
        this.set(STORAGE_KEYS.ORDERS, orders);
        this.set(STORAGE_KEYS.TABLES, tables);

        // Dispatch specific KOT event for real-time KDS chime & update
        window.dispatchEvent(new CustomEvent('kotPunched', { detail: { order, kot: kotTicket } }));

        return { success: true, order: order, kot: kotTicket };
    },

    // Settle Table Bill & Vacate Table
    settleTableBill: function (orderId, paymentData = {}) {
        const orders = this.get(STORAGE_KEYS.ORDERS, []);
        const tables = this.get(STORAGE_KEYS.TABLES, []);

        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) {
            return { success: false, message: 'Order not found.' };
        }

        const order = orders[orderIndex];
        const now = this.nowString();

        order.paymentStatus = 'Successful';
        order.orderStatus = 'Delivered';
        order.paymentMethod = paymentData.method || 'Cash';
        order.discount = paymentData.discount || 0;
        order.serviceCharge = paymentData.serviceCharge || 0;
        order.tendered = paymentData.tendered || order.total;
        order.changeAmount = paymentData.changeAmount || 0;
        order.paidAt = now;
        order.transactionRef = paymentData.transactionRef || `BILL_${Date.now().toString(36).toUpperCase()}`;

        // Link with Room Folio if charged to room
        if (paymentData.method === 'Room Charge' && paymentData.roomId) {
            order.roomChargeDetails = {
                roomId: paymentData.roomId,
                roomNumber: paymentData.roomNumber || '',
                guestName: paymentData.roomGuestName || ''
            };
        }

        // Find table and set status to Turnover / Available
        const tableIndex = tables.findIndex(t => t.id === order.tableId || t.activeOrderId === order.id);
        if (tableIndex > -1) {
            tables[tableIndex].status = paymentData.vacateToCleaning ? 'Cleaning' : 'Available';
            tables[tableIndex].activeOrderId = null;
        }

        orders[orderIndex] = order;
        this.set(STORAGE_KEYS.ORDERS, orders);
        this.set(STORAGE_KEYS.TABLES, tables);

        return { success: true, order: order };
    },

    // Transfer Table running order
    transferTable: function (fromTableId, toTableId) {
        const tables = this.get(STORAGE_KEYS.TABLES, []);
        const orders = this.get(STORAGE_KEYS.ORDERS, []);

        const fromIdx = tables.findIndex(t => t.id === fromTableId);
        const toIdx = tables.findIndex(t => t.id === toTableId);

        if (fromIdx === -1 || toIdx === -1) {
            return { success: false, message: 'Invalid tables specified.' };
        }

        if (tables[toIdx].status === 'Occupied') {
            return { success: false, message: `${tables[toIdx].number} is already occupied!` };
        }

        const activeOrder = this.getActiveTableOrder(fromTableId);
        if (!activeOrder) {
            return { success: false, message: `No active order found on ${tables[fromIdx].number}.` };
        }

        // Move order
        activeOrder.tableId = tables[toIdx].id;
        activeOrder.tableNumber = tables[toIdx].number;
        activeOrder.updatedAt = this.nowString();

        // Update table statuses
        tables[fromIdx].status = 'Available';
        tables[fromIdx].activeOrderId = null;

        tables[toIdx].status = 'Occupied';
        tables[toIdx].activeOrderId = activeOrder.id;

        const ordIdx = orders.findIndex(o => o.id === activeOrder.id);
        if (ordIdx > -1) orders[ordIdx] = activeOrder;

        this.set(STORAGE_KEYS.TABLES, tables);
        this.set(STORAGE_KEYS.ORDERS, orders);

        return { success: true, fromTable: tables[fromIdx], toTable: tables[toIdx] };
    },

    // Get all KOTs across active dining orders for Kitchen Display System
    getAllKOTs: function () {
        const orders = this.get(STORAGE_KEYS.ORDERS, []);
        const kotsList = [];

        orders.forEach(order => {
            if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Delivered') return;
            if (order.kots && Array.isArray(order.kots)) {
                order.kots.forEach(kot => {
                    kotsList.push({
                        ...kot,
                        orderId: order.id,
                        orderType: order.orderType,
                        tableNumber: order.tableNumber || (order.orderType === 'Room Delivery' ? order.deliveryAddress : 'Takeaway'),
                        tableId: order.tableId,
                        overallOrderStatus: order.orderStatus,
                        orderCreatedAt: order.createdAt
                    });
                });
            }
        });

        // Sort oldest first (standard kitchen FIFO queue)
        return kotsList.sort((a, b) => new Date(a.punchedAt) - new Date(b.punchedAt));
    },

    // Update individual KOT status (e.g. Preparing -> Ready -> Served)
    updateKOTStatus: function (orderId, kotId, newStatus) {
        const orders = this.get(STORAGE_KEYS.ORDERS, []);
        const ordIdx = orders.findIndex(o => o.id === orderId);
        if (ordIdx === -1) return false;

        const order = orders[ordIdx];
        if (!order.kots) return false;

        const kot = order.kots.find(k => k.kotId === kotId);
        if (kot) {
            kot.status = newStatus;
            kot.updatedAt = this.nowString();

            // If all KOTs are Ready, mark order as Ready for Pickup
            const allReady = order.kots.every(k => k.status === 'Ready' || k.status === 'Served');
            if (allReady && order.orderStatus !== 'Delivered') {
                order.orderStatus = 'Ready for Pickup';
            }

            orders[ordIdx] = order;
            this.set(STORAGE_KEYS.ORDERS, orders);
            return true;
        }
        return false;
    },

    // Record a completed payment transaction into payments ledger
    recordPayment: function (paymentData) {
        const payments = this.get(STORAGE_KEYS.PAYMENTS, []);
        const newPayment = {
            id: paymentData.id || this.generateId('txn'),
            refNumber: paymentData.refNumber || `RZP_${Math.floor(100000 + Math.random() * 900000)}`,
            category: paymentData.category || 'General',
            description: paymentData.description || 'Hotel Charge',
            customerName: paymentData.customerName || 'Valued Guest',
            customerEmail: paymentData.customerEmail || '',
            method: paymentData.method || 'Credit Card',
            cardBrand: paymentData.cardBrand || 'Card',
            cardLast4: paymentData.cardLast4 || '4242',
            subtotal: Number(paymentData.subtotal || paymentData.amount || 0),
            tax: Number(paymentData.tax || 0),
            amount: Number(paymentData.amount || 0),
            gatewayFee: Number(paymentData.gatewayFee || (paymentData.amount * 0.02).toFixed(2)),
            netSettled: Number(paymentData.netSettled || (paymentData.amount * 0.98).toFixed(2)),
            status: paymentData.status || 'Settled',
            timestamp: paymentData.timestamp || this.nowString()
        };

        payments.unshift(newPayment);
        this.set(STORAGE_KEYS.PAYMENTS, payments);
        return newPayment;
    },

    // Prebook Activity
    prebookActivity: function (bookingData) {
        const bookings = this.get(STORAGE_KEYS.ACTIVITY_BOOKINGS, []);
        const newBooking = {
            id: bookingData.id || this.generateId('actb'),
            activityId: bookingData.activityId,
            activityName: bookingData.activityName,
            guestName: bookingData.guestName,
            guestEmail: bookingData.guestEmail,
            guestPhone: bookingData.guestPhone || '',
            bookingDate: bookingData.bookingDate,
            timeSlot: bookingData.timeSlot,
            participants: Number(bookingData.participants || 1),
            subtotal: Number(bookingData.subtotal || 0),
            tax: Number(bookingData.tax || 0),
            totalCost: Number(bookingData.totalCost || 0),
            paymentMethod: bookingData.paymentMethod || 'Credit Card',
            paymentStatus: bookingData.paymentStatus || 'Successful',
            transactionRef: bookingData.transactionRef || `PAY_${Math.floor(100000 + Math.random() * 900000)}`,
            bookingStatus: bookingData.bookingStatus || 'Confirmed',
            specialRequests: bookingData.specialRequests || '',
            createdAt: this.nowString()
        };

        bookings.unshift(newBooking);
        this.set(STORAGE_KEYS.ACTIVITY_BOOKINGS, bookings);

        // Record payment in payments ledger if successful
        if (newBooking.paymentStatus === 'Successful') {
            this.recordPayment({
                refNumber: newBooking.transactionRef,
                category: 'Activity Prebooking',
                description: `${newBooking.activityName} (${newBooking.participants} Guest${newBooking.participants > 1 ? 's' : ''})`,
                customerName: newBooking.guestName,
                customerEmail: newBooking.guestEmail,
                method: newBooking.paymentMethod,
                cardBrand: newBooking.paymentMethod.includes('Debit') ? 'Debit Card' : newBooking.paymentMethod.includes('UPI') ? 'UPI' : 'Credit Card',
                cardLast4: '4242',
                subtotal: newBooking.subtotal,
                tax: newBooking.tax,
                amount: newBooking.totalCost,
                status: 'Settled'
            });
        }

        return newBooking;
    },

    // Update Room Booking Payment status
    updateRoomBookingPayment: function (bookingId, paymentStatus, txnRef, paymentMethod = 'Credit Card') {
        const bookings = this.get(STORAGE_KEYS.ROOM_BOOKINGS, []);
        const idx = bookings.findIndex(b => b.id === bookingId);
        if (idx > -1) {
            bookings[idx].paymentStatus = paymentStatus;
            bookings[idx].transactionRef = txnRef;
            bookings[idx].paymentMethod = paymentMethod;
            this.set(STORAGE_KEYS.ROOM_BOOKINGS, bookings);

            if (paymentStatus === 'Successful') {
                this.recordPayment({
                    refNumber: txnRef,
                    category: 'Room Booking',
                    description: `Room ${bookings[idx].roomNumber} - ${bookings[idx].roomType} (${bookings[idx].nights} Night${bookings[idx].nights > 1 ? 's' : ''})`,
                    customerName: bookings[idx].guestName,
                    customerEmail: bookings[idx].guestEmail,
                    method: paymentMethod,
                    cardBrand: paymentMethod.includes('Debit') ? 'Debit Card' : paymentMethod.includes('UPI') ? 'UPI' : 'Credit Card',
                    cardLast4: '4242',
                    subtotal: Number((bookings[idx].totalCost / 1.05).toFixed(2)),
                    tax: Number((bookings[idx].totalCost - (bookings[idx].totalCost / 1.05)).toFixed(2)),
                    amount: bookings[idx].totalCost,
                    status: 'Settled'
                });
            }
            return true;
        }
        return false;
    },

    // Create new Purchase Order
    createPurchaseOrder: function (poData) {
        const orders = this.get(STORAGE_KEYS.PURCHASE_ORDERS, []);
        const poId = poData.id || `PO-${Math.floor(8800 + Math.random() * 1100)}`;
        const newPO = {
            id: poId,
            supplierId: poData.supplierId || 'sup_1',
            supplierName: poData.supplierName || 'Resort Certified Supplier',
            category: poData.category || 'Kitchen Ingredients',
            items: poData.items || [],
            subtotal: Number(poData.subtotal || poData.totalAmount || 0),
            tax: 0.00,
            totalAmount: Number(poData.totalAmount || poData.subtotal || 0),
            status: poData.status || 'Pending Review',
            grnNumber: null,
            paymentStatus: 'Pending Accounts Clearance',
            paymentTerms: poData.paymentTerms || 'Net 30 Days',
            issuedDate: poData.issuedDate || new Date().toISOString().split('T')[0],
            expectedDelivery: poData.expectedDelivery || '2-3 Days',
            receivedDate: null,
            receivedBy: null,
            notes: poData.notes || 'Purchased by Marcus Sterling, Procurement Head.'
        };
        orders.unshift(newPO);
        this.set(STORAGE_KEYS.PURCHASE_ORDERS, orders);
        return newPO;
    },

    // Update Purchase Order Status
    updatePurchaseOrderStatus: function (poId, newStatus) {
        const orders = this.get(STORAGE_KEYS.PURCHASE_ORDERS, []);
        const idx = orders.findIndex(p => p.id === poId);
        if (idx > -1) {
            orders[idx].status = newStatus;
            this.set(STORAGE_KEYS.PURCHASE_ORDERS, orders);
            return orders[idx];
        }
        return null;
    },

    // Receive Goods & Generate GRN (Goods Received Note)
    receiveGoods: function (poId) {
        const orders = this.get(STORAGE_KEYS.PURCHASE_ORDERS, []);
        const idx = orders.findIndex(p => p.id === poId);
        if (idx > -1) {
            const grnNum = `GRN-${Math.floor(100 + Math.random() * 900)}`;
            orders[idx].status = 'Delivered & Received';
            orders[idx].grnNumber = grnNum;
            orders[idx].receivedDate = new Date().toISOString().replace('T', ' ').slice(0, 16);
            orders[idx].receivedBy = 'Marcus Sterling (Purchase Head)';
            orders[idx].paymentStatus = 'Pending Accounts Clearance';
            this.set(STORAGE_KEYS.PURCHASE_ORDERS, orders);

            // Increment matching stock in menu items if any
            const menu = this.get(STORAGE_KEYS.MENU, []);
            let menuUpdated = false;
            (orders[idx].items || []).forEach(item => {
                const itemName = (item.name || '').toLowerCase();
                menu.forEach(dish => {
                    if (itemName.includes('salmon') && dish.name.toLowerCase().includes('salmon')) {
                        dish.stock = (dish.stock || 0) + 15;
                        menuUpdated = true;
                    } else if (itemName.includes('truffle') && dish.name.toLowerCase().includes('truffle')) {
                        dish.stock = (dish.stock || 0) + 20;
                        menuUpdated = true;
                    } else if (itemName.includes('wagyu') && dish.name.toLowerCase().includes('wagyu')) {
                        dish.stock = (dish.stock || 0) + 12;
                        menuUpdated = true;
                    }
                });
            });
            if (menuUpdated) {
                this.set(STORAGE_KEYS.MENU, menu);
            }

            return orders[idx];
        }
        return null;
    }
};

// Initialize on file load
StorageService.init();
