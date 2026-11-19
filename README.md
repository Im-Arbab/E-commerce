# E-commerce — LappyShop Refurbished Laptops & Phones

A MERN storefront for inspected refurbished laptops, with customer accounts, admin management,
Stripe Checkout, and a community marketplace for new and used phones.

## Tech Stack

- **Frontend:** React 18 (Vite), React Router, Tailwind CSS, Axios, react-hot-toast, react-icons
- **Backend:** Node.js, Express, MongoDB + Mongoose
- **Auth:** JWT stored in httpOnly cookies (role-based: `user` / `admin`)...
- **Payments:** Stripe Checkout + webhook confirmation
- **Uploads:** Multer (local disk storage, served statically)
- **Marketplace:** Seller-submitted mobile listings, admin review, private buyer/seller messages
- **Service requests:** Laptop rental and office setup requests, routed to the admin sales inbox

## Project Structure

```
laptop-store/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # User, Product, Order (Mongoose schemas)
│   ├── controllers/              # Route handler logic
│   ├── routes/                   # Express routers
│   ├── middleware/                # auth (JWT), admin guard, error handler, multer
│   ├── seeder/seedData.js        # 44 sample laptops + 20 demo phone listings
│   ├── utils/generateToken.js
│   └── server.js                 # App entry point
└── frontend/
    └── src/
        ├── api/                  # Axios instance + grouped endpoint calls
        ├── context/              # AuthContext, CartContext
        ├── components/
        │   ├── common/           # ProductCard, GradeBadge, Rating, Pagination, route guards...
        │   ├── layout/           # Navbar, Footer
        │   └── admin/            # AdminLayout, ProductFormModal
        ├── pages/                # Home, Shop, ProductDetail, Cart, Checkout, Login, Register,
        │   │                     #   Profile, OrderHistory, OrderDetail, NotFound
        │   └── admin/            # AdminDashboard, AdminProducts, AdminOrders, AdminUsers
        └── App.jsx                # Route definitions
```

## Features

**Customers**
- Browse, search, filter (brand/category/condition/price), and sort products
- Product detail pages with spec sheets, condition grading (A/B/C), and reviews
- Persistent cart (localStorage), checkout with shipping address form
- Secure Stripe Checkout payment
- Order history and order detail/status tracking
- Account registration/login/profile editing

**Admin Panel** (`/admin`, requires an admin account)
- Dashboard with revenue, order counts, and status breakdown
- Product management: create/edit/delete, multi-image upload, dedicated inline stock editor
- Order management: view all orders, update order status (Processing → Shipped → Delivered)
- User management: search users, promote/demote admin role, block/unblock, delete

**Mobile marketplace**
- Individuals and stores can submit new or used phone listings
- Browse phone listings by category, brand, and budget range
- Listings stay private until an admin approves them in `/admin/mobiles`
- Buyers and sellers can message without publishing personal phone numbers or email addresses
- Sellers can view conversations from the account menu under **Buyer Inquiries**

**Sales requests**
- Visitors can request laptop rental options or an office laptop setup from the homepage
- Requests are saved to the admin **Sales Requests** inbox at `/admin/service-inquiries`

## Setup

### Prerequisites
- Node.js 18+
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)
- A Stripe account (free, test mode) for payment keys

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Copy `backend/.env.example` to `backend/.env` and edit it:
```
MONGO_URI=mongodb://127.0.0.1:27017/laptop_store   # or your Atlas connection string
JWT_SECRET=some_long_random_string
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:5173
```

Seed a database with 44 sample laptops and 20 phone marketplace listings. The seeder fills missing sample models and preserves existing data; it never creates a production admin unless `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are set:
```bash
npm run seed
```
In development, this also creates a demo customer (`customer@laptopstore.com`, password `DEMO_CUSTOMER_PASSWORD` or `customer123`) if one does not exist. Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `.env` to create a non-default admin account. Existing records are preserved.

Start the API:
```bash
npm run dev      # nodemon, http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`, so no CORS
config is needed locally.

### 3. Stripe Webhook (for local testing)

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli), then:
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```
Copy the `whsec_...` secret it prints into your backend `.env` as `STRIPE_WEBHOOK_SECRET`.

Use Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC, to complete a
test purchase end to end (order is marked paid and stock is decremented automatically).

## Production Build and domain deployment

```bash
cd frontend && npm run build      # outputs frontend/dist
```
With `NODE_ENV=production`, `backend/server.js` serves `frontend/dist` directly. For a single-service deployment, build the frontend and run the backend as the Node service; configure MongoDB Atlas, `JWT_SECRET`, production Stripe keys, the Stripe webhook endpoint (`https://your-domain/api/payments/webhook`), and `CLIENT_URL` to your HTTPS domain. Uploaded laptop images currently use local disk storage, so configure persistent storage or move uploads to an object store before using a host with ephemeral disks. The domain must point to the deployed service and HTTPS must be enabled by the hosting provider.

## Notes

- Sample seed entries are demonstration catalog data and share sample laptop photography. Replace them with inventory, accurate condition/battery details, and photographs you have rights to use before accepting orders.
- The mobile marketplace uses HTTPS image links supplied by sellers; images are not uploaded to the server.
- Stock is decremented only after payment is confirmed (via the Stripe webhook or the
  `/orders/:id/pay` fallback), so it's never reduced for abandoned checkouts.
- Prices and stock are always re-validated server-side at order creation — the client
  cart is never trusted for final pricing.
  
