# The Grand Aurelia Hotel & Resort
## Complete Hotel Management System (HMS) Prototype

A modern, professional, fully responsive Hotel Management System prototype built with **HTML5, CSS3, Bootstrap 5.3, Bootstrap Icons, Vanilla JavaScript, and Browser Local Storage** for complete client-side data persistence.

---

## 🌟 Key Features

1. **5 Primary Logins & Role-Based Access Control (RBAC)**:
   - **5 Predefined Primary Accounts** featuring custom executive and operational dashboards:
     - **1. Admin**: Master administrative control across rooms, staff, POS, activities, inventory, and global settings.
     - **2. Purchase**: Procurement and supply chain management, certified luxury resort suppliers, purchase orders pipeline, delivery schedules, and Goods Received Note (GRN) inventory intake.
     - **3. Accounts**: Financial payments ledger, Credit Card vs. Debit Card transaction audit, gateway MDR fee deductions, 1-click batch gateway reconciliation, and CSV export.
     - **4. Manager**: Front-of-house and back-of-house floor operations, kitchen order queues, room availability oversight, and staff supervision.
     - **5. MD (Managing Director)**: High-level executive boardroom dashboard with real-time Net Operating Profit (42.4% margin), RevPAR ($492), ADR ($545), 90.2% occupancy, VIP folio sign-offs, and department revenue split.
     *(Front Desk Receptionist, Guest Customer, and Waiter accounts are also readily available for complete resort testing).*
   - **One-Click Demo Role Switcher**: Available directly on `login.html` and in the navigation topbar for frictionless testing.

2. **Resort Activities & Experiences Prebooking Portal (`activities.html`)**:
   - **Curated Luxury Experiences**: Prebook private catamaran charters, botanical aromatherapy spas, scuba diving reef excursions, candlelight beachfront dinners, golf masterclasses, and helicopter island tours.
   - **Category Filters & Search**: Filter by *Spa & Wellness, Ocean & Watersports, Culinary Masterclasses, Sports & Adventure, Romantic Experiences*.
   - **Interactive Prebooking Modal**: Real-time duration math, slot scheduling, guest counter, and subtotal + 5% resort tax computation.
   - **Instant Digital Voucher Passes**: Scalloped pass generator featuring unique voucher ID (`ACT-XXXX`), QR code pass validation, and booking cancellation safeguards.

3. **Multi-Channel Payment Gateway Engine (`js/payments.js`)**:
   - **Credit Card Gateway**: Interactive card visual mockup with live typing preview (card number, cardholder name, expiry), 1-click test cards (Visa Platinum, Mastercard World, Amex Centurion), and CVV masking.
   - **Debit Card Gateway**: Direct bank debit settlement simulation supporting RuPay Debit, HDFC Visa Debit, and Mastercard Debit.
   - **UPI / QR Code & Net Banking**: Instant QR payment simulation and one-click bank selection (HDFC, SBI, ICICI, Axis).
   - **3D Secure / Bank OTP Verification Modal**: Realistic two-factor SMS OTP verification with countdown timer, auto-fill `123456`, and transaction settlement simulation.
   - **Automated Ledgering & Printable Tax Receipts**: Saves all transactions to `hotel_payments` with printable tax invoices (`@media print`).

4. **Hotel Room Booking & Housekeeping (`room-booking.html` & `rooms.html`)**:
   - **Online Suites Booking**: Instant date range duration calculation, nightly rate math, and integrated online card gateway settlement.
   - **Front Desk Workflow**: Receptionist and Admin can check guests in (*Occupied*) and out (*Cleaning turnover*).
   - **Room Inventory**: Filter by category (*Standard, Deluxe, Suite*) and adjust room statuses.

5. **Customer Website & Fine Dining Online Ordering**:
   - **Luxury Landing Page (`index.html`)**: Michelin hero section, 5 role credentials, highlights bar, suites showcase, curated activities showcase, and guest feedback.
   - **Interactive Menu (`menu.html`)**: Category filters, vegetarian toggle, quantity selectors, and stock levels.
   - **Persistent Cart (`cart.html`) & Multi-Mode Checkout (`checkout.html`)**: Dine-In (with table), Room Delivery (with suite number), or Takeaway, integrated with the Credit/Debit Card Gateway.

6. **Interactive Restaurant POS (`pos.html`) & Kitchen Display System (`kds.html`)**:
   - High-speed touch POS with 10 tables across 5 zones, running folios, cooking modifiers, and real-time KDS tickets.

7. **Financial & Operational Intelligence (`reports.html`)**:
   - Live revenue calculations combining Dining, Hotel Suites, and Resort Activities Prebookings with 5% tax audits.

---

## 🔑 Predefined Demo Login Credentials

| Role | Demo Email | Demo Password | Primary Permissions & Features |
| :--- | :--- | :--- | :--- |
| **1. Admin** | `admin@hotel.demo` | `Admin@123` | Full access across all 15 modules, staff, inventory, payments, reports |
| **2. Purchase** | `purchase@hotel.demo` | `Purchase@123` | Certified luxury suppliers, purchase order procurement pipeline, goods received (GRN) intake |
| **3. Accounts** | `accounts@hotel.demo` | `Accounts@123` | Financial payments ledger, gateway MDR reconciliation, credit vs debit audit, CSV export |
| **4. Manager** | `manager@hotel.demo` | `Manager@123` | Floor operations, room status management, live KDS kitchen queues, staff coordination |
| **5. MD (Director)** | `md@hotel.demo` | `Md@123` | Executive boardroom analytics, Net Operating Margin, RevPAR, ADR, VIP guest folios |

*(Also available: **Receptionist** `reception@hotel.demo` / `Reception@123`, **Customer** `customer@hotel.demo` / `Customer@123`, and **Waiter** `waiter@hotel.demo` / `Waiter@123`)*

> **Quick Testing Tip**: On `login.html`, click any of the 5 numbered role buttons (`1. Admin`, `2. Purchase`, `3. Accounts`, `4. Manager`, `5. MD`) to instantly auto-fill credentials and sign in with a single click. You can also quick-switch between roles at any time from the topbar avatar dropdown.

---

## 🚀 How to Run Locally

Because this is a pure HTML5/CSS3/JavaScript prototype with no backend server or npm build steps required, you can run it in any modern web browser:

### Option 1: Direct File Launch
Double-click `index.html` or open `file:///c:/Users/Admin/Documents/Prototypes/HMS_Prototype/index.html` directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.

### Option 2: Using Any Lightweight HTTP Server
If you prefer running through `localhost`:
```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js npx serve
npx serve .
```
Then navigate to `http://localhost:8000`.

---

## 💾 Local Storage Architecture

Data is stored persistently in the user's browser under the following keys:
- `hotel_users`: User accounts and roles (Admin, MD, Accounts, Receptionist, Customer, Manager, Waiter).
- `hotel_session`: Current authenticated user session.
- `hotel_activities`: Catalog of resort leisure experiences (Spa, Catamaran, Scuba, Golf, etc.).
- `hotel_activity_bookings`: Prebooked activity tickets and digital voucher passes.
- `hotel_payments`: Multi-channel gateway ledger (Credit Card, Debit Card, UPI, Net Banking, status, card brand, last4, MDR fees).
- `hotel_rooms`: Hotel suites, nightly rates, capacities, and statuses (*Available, Occupied, Reserved, Cleaning*).
- `hotel_room_bookings`: Hotel stay folios, check-in/out dates, and guest records.
- `hotel_menu`: Culinary items, prices, dietary types, and stock levels.
- `hotel_cart`: User's active shopping cart items and quantities.
- `hotel_orders`: Dining orders, statuses, and payment details.
- `hotel_tables`: Restaurant tables, locations, capacities, and floor statuses.
- `hotel_table_bookings`: Table reservations with dates, times, and guests.
- `hotel_feedback`: Customer ratings and reviews.
- `hotel_settings`: Hotel metadata, tax rates (5%), currency symbol, and contact info.

### Resetting Demo Data
To restore pristine default sample data at any time:
1. Go to **Profile** (`profile.html`) or the footer on `index.html`.
2. Click **"Reset Prototype Local Storage"**.
3. Confirm the dialog; all Local Storage keys will re-initialize to their default states.

---

## 💳 Payment Gateway Integration Note

- **Prototype Simulation**: This prototype features a realistic Razorpay checkout interface simulation (supporting test Card numbers, UPI QR, and Net Banking callbacks). Offline payments (*Pay at Counter* and *Cash on Delivery*) are also supported.
- **Production Architecture**: A production deployment requires a backend server (e.g. Node.js, Python, Java, or PHP) to:
  1. Create a server-side order with the Razorpay API using your private API secret.
  2. Receive the checkout signature payload on payment completion.
  3. Verify the HMAC SHA256 signature before marking the order as `Successful` in a secure database.
  4. Never store raw card numbers, CVVs, or gateway private keys in frontend Local Storage.

---

## 📁 Project File Directory

```
HMS/
├── index.html            # Luxury Hotel Landing Page
├── login.html            # Sign In with 1-click Demo credentials
├── dashboard.html        # Dynamic Role-Adaptive Management Dashboard
├── menu.html             # Customer & Staff Food Menu Catalog
├── cart.html             # Shopping Cart Review & Line Items
├── checkout.html         # Dining Checkout & Payment Gateway Selector
├── orders.html           # Order Management & Status Tracking
├── table-booking.html    # Restaurant Table Reservations & Floor Map
├── room-booking.html     # Hotel Suite Stay Reservations
├── rooms.html            # Room Inventory & Housekeeping
├── staff.html            # Staff & Role Account Administration
├── inventory.html        # Menu Stock & Price Management
├── reports.html          # Financial Intelligence & Operational Reports
├── profile.html          # User Profile & Permissions Matrix
├── README.md             # Project Documentation & Run Guide
├── css/
│   └── style.css         # Luxury Navy & Gold Design System
└── js/
    ├── storage.js        # Local Storage Architecture & Seed Data
    ├── auth.js           # Authentication & RBAC Route Protection
    ├── payments.js       # Razorpay Simulation & Tax Invoices
    ├── menu.js           # Menu Catalog, Filters & Cart Stepper
    ├── orders.js         # Order Tracking & Status Workflows
    ├── bookings.js       # Table Conflict Checks & Room Stay Calculations
    ├── dashboard.js      # Live Metrics Calculation Engine
    └── app.js            # UI Engine, Mobile Bottom Bar & Toasts
```
