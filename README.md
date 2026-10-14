# The Grand Aurelia Hotel & Resort
## Complete Hotel Management System (HMS) Prototype

A modern, professional, fully responsive Hotel Management System prototype built with **HTML5, CSS3, Bootstrap 5.3, Bootstrap Icons, Vanilla JavaScript, and Browser Local Storage** for complete client-side data persistence.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**:
   - **5 Predefined Demo Accounts** with tailored dashboards, sidebar navigation, and strict JavaScript permission enforcement.
   - **One-Click Demo Role Switcher**: Available in the topbar dropdown and login page for frictionless evaluation.

2. **Customer Website & Fine Dining Online Ordering**:
   - **Luxury Landing Page (`index.html`)**: Hero section, chef's signature dishes, suite showcase, interactive guest feedback, and hotel concierge details.
   - **Interactive Menu (`menu.html`)**: Category filters (*Starters, Main Course, Snacks, Beverages, Desserts*), live search, vegetarian toggle, quantity selectors, and real-time stock counters with low-stock alerts.
   - **Persistent Cart (`cart.html`)**: Live quantity adjustments, line subtotals, configurable 5% tax calculations, and clear cart options.
   - **Multi-Mode Checkout (`checkout.html`)**: Supports **Dine-In** (with table selection), **Room Delivery** (with suite number), or **Takeaway / Pickup**.

3. **Payment Gateway Module (Razorpay Simulation)**:
   - **Razorpay Sandbox Checkout Modal**: Simulates online Card, UPI QR, and Net Banking payments.
   - **Offline Options**: Pay at Counter / Room Folio Charge and Cash on Delivery.
   - **Printable Tax Invoices**: Formatted with print styles (`@media print`) and printable via `window.print()`.
   - *Architecture Notice: Clearly separates demo frontend simulation from production backend payment verification.*

4. **Restaurant Table Booking (`table-booking.html`)**:
   - **Double-Booking Collision Prevention**: Rejects overlapping bookings for the same table and time slot.
   - **Seating Capacity Validation**: Enforces party size &le; table seating capacity.
   - **Live Floor Status Map**: Tracks *Available*, *Reserved*, and *Occupied* tables with status controls for staff.

5. **Hotel Room Booking & Housekeeping (`room-booking.html` & `rooms.html`)**:
   - **Suite Reservation Engine**: Automatic night calculation, stay subtotal, 5% resort tax, and instant confirmation.
   - **Front Desk Workflow**: Receptionist and Admin can check guests in (*Occupied*) and out (*Cleaning turnover*).
   - **Room Inventory**: Filter by category (*Standard, Deluxe, Suite*) and adjust room statuses.

6. **Kitchen Inventory & Stock Management (`inventory.html`)**:
   - Automatically decrements stock when food orders are confirmed.
   - Low-stock warning badges (&le; 5 units) and automatic *Sold Out* disablement at 0 units.
   - Quick +5 stock restock buttons and full dish price/title editor.

7. **Staff Administration (`staff.html`)**:
   - Admin management of internal employees, role assignments, and active/inactive status toggling.

8. **Live Financial & Operational Reports (`reports.html`)**:
   - All analytics computed directly from saved Local Storage records (no hardcoded metrics).
   - Gross revenue, dining vs room revenue breakdown, tax collections, top-selling dishes, and cancellation audit logs.

9. **Mobile-First Responsiveness**:
   - **Desktop**: Full left sidebar with luxury gold accents.
   - **Mobile**: Fixed bottom navigation bar with icons and labels + offcanvas drawer for "More" pages. Content padding ensures no buttons are covered.

---

## 🔑 Predefined Demo Login Credentials

| Role | Demo Email | Demo Password | Primary Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hotel.demo` | `Admin@123` | Full access across all 14 modules, staff, inventory, payments, reports |
| **Manager** | `manager@hotel.demo` | `Manager@123` | Operations, kitchen order queue, table & room availability, reports |
| **Receptionist** | `reception@hotel.demo` | `Reception@123` | Front desk guest check-in/out, room bookings, table reservations |
| **Waiter** | `waiter@hotel.demo` | `Waiter@123` | Floor tables, punch dine-in orders, update kitchen preparation stages |
| **Customer** | `customer@hotel.demo` | `Customer@123` | Browse menu, order food, book tables & suites, view own order history |

> **Quick Testing Tip**: On `login.html`, click any of the 5 role chips to instantly autofill credentials and sign in with a single click. Once logged in, use the **Switch Demo Role** dropdown in the top header to effortlessly test other roles without logging out.

---

## 🚀 How to Run Locally

Because this is a pure HTML5/CSS3/JavaScript prototype with no backend server or npm build steps required, you can run it in any modern web browser:

### Option 1: Direct File Launch
Double-click `index.html` or open `file:///c:/Users/Admin/Documents/Prototypes/HMS/index.html` directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.

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
- `hotel_users`: User accounts and roles.
- `hotel_session`: Current authenticated user session.
- `hotel_menu`: Culinary items, prices, dietary types, and stock levels.
- `hotel_cart`: User's active shopping cart items and quantities.
- `hotel_orders`: Order histories, statuses (*Pending, Confirmed, Preparing, Ready, Delivered, Cancelled*), and payment details.
- `hotel_tables`: Restaurant tables, locations, capacities, and floor statuses.
- `hotel_table_bookings`: Table reservations with dates, times, and guests.
- `hotel_rooms`: Hotel suites, nightly rates, capacities, and statuses (*Available, Occupied, Reserved, Cleaning*).
- `hotel_room_bookings`: Hotel stay folios, check-in/out dates, and guest records.
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
