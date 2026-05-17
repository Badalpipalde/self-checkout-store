# 🛒 ScanCart — Self-Checkout Store System

> A production-ready scan-and-go retail platform. Customers scan product barcodes, add to cart, pay digitally, and exit with a secure QR verification token — no queues, no cashier.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, Redux Toolkit, Framer Motion |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs + Google OAuth (Passport.js) |
| Payments | Razorpay |
| Barcode Scan | html5-qrcode |
| QR Generation | qrcode + AES-256 encryption |
| Charts | Chart.js + react-chartjs-2 |
| Media | Cloudinary + Multer |
| Real-time | Socket.IO |

---

## 📁 Folder Structure

```
self-checkout-store/
├── backend/
│   ├── src/
│   │   ├── config/         # DB, Cloudinary, Passport
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, admin, upload
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   └── utils/          # Token, QR, Socket
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # All route pages
│   │   ├── services/       # Axios API calls
│   │   ├── store/          # Redux slices
│   │   └── App.jsx
│   └── index.html
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Razorpay test account
- Cloudinary account

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend `.env`** (copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/self-checkout
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d
QR_ENCRYPTION_KEY=your-32-character-encryption-key!
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Server: http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# App: http://localhost:5173
```

---

## 🔑 Default User Roles

Create users manually in MongoDB and set their `role` field:

| Role | Access |
|---|---|
| `customer` | Scan, cart, pay, QR exit token |
| `staff` | QR verification panel |
| `admin` | Full dashboard, product CRUD, analytics |

**Quick admin setup** — after registering, use MongoDB Compass or Atlas to set:
```json
{ "role": "admin" }
```

---

## 💳 Test Payment

Use Razorpay test credentials:
- **Card:** `4111 1111 1111 1111` · Exp: any future date · CVV: any 3 digits
- **UPI:** `success@razorpay`

---

## 📱 Customer Flow

```
1. Register/Login
2. Go to /scan — point camera at barcode
3. Product popup appears — add to cart
4. Go to /cart — review items + GST
5. Click "Proceed to Payment"
6. Razorpay modal opens — pay
7. /qr-success — show QR to staff
8. Staff scans QR at /staff — verified ✓
```

---

## 🔐 Security Features

- JWT authentication with 7-day expiry
- AES-256-CBC encrypted QR tokens
- QR tokens expire after 4 hours
- HMAC-SHA256 payment signature verification
- Role-based access control (customer/staff/admin)
- Rate limiting (200 req/15min)
- Helmet.js security headers
- CORS protection

---

## 🌐 API Endpoints

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | JWT |
| GET | `/api/products/barcode/:barcode` | Public |
| GET | `/api/products` | Public |
| POST | `/api/cart/add` | Customer |
| POST | `/api/orders/create` | Customer |
| POST | `/api/payment/create-order` | Customer |
| POST | `/api/payment/verify` | Customer |
| POST | `/api/qr/generate/:orderId` | Customer |
| POST | `/api/qr/verify` | Staff/Admin |
| GET | `/api/admin/stats` | Admin |
| GET | `/api/admin/analytics/daily-revenue` | Admin |
| POST | `/api/products` | Admin |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |

---

## 🌟 Features at a Glance

- ✅ JWT + Google OAuth authentication
- ✅ Live barcode scanning (html5-qrcode)
- ✅ Smart cart with localStorage persistence
- ✅ Real-time GST (18%) calculation
- ✅ Razorpay payment integration
- ✅ AES-256 encrypted QR exit tokens
- ✅ Staff webcam QR verification panel
- ✅ Admin dashboard with Chart.js analytics
- ✅ Product CRUD with Cloudinary image upload
- ✅ Socket.IO real-time inventory updates
- ✅ Glassmorphism dark UI with Framer Motion
- ✅ Mobile-first responsive design
- ✅ Role-based access control

---

## 📄 License

MIT — Built with ❤️ using the MERN stack
