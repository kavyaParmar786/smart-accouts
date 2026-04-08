# 💹 SmartAccounts — AI-Powered Accounting SaaS

A production-ready, full-stack accounting SaaS application built with React, Node.js, Express, and MongoDB.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

---

## ⚙️ Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

Server runs at: `http://localhost:5000`

**`.env` file:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartaccounts
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

## 🎨 Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 📁 Project Structure

```
smartaccounts/
├── server/
│   ├── index.js                    # Express app entry
│   ├── controllers/
│   │   ├── auth.controller.js      # Register, login, profile
│   │   ├── business.controller.js  # Multi-business management
│   │   ├── transaction.controller.js
│   │   ├── invoice.controller.js   # Invoices + payment tracking
│   │   ├── inventory.controller.js # Products + stock management
│   │   ├── category.controller.js  # Custom categories
│   │   └── report.controller.js    # P&L, trends, AI insights
│   ├── models/
│   │   ├── user.model.js
│   │   ├── business.model.js
│   │   ├── transaction.model.js
│   │   ├── invoice.model.js
│   │   ├── product.model.js
│   │   └── category.model.js
│   ├── routes/                     # RESTful API routes
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT + RBAC
│   │   ├── error.middleware.js     # Global error handler
│   │   └── validate.middleware.js  # Joi validation
│   └── utils/
│       ├── db.js                   # MongoDB connection
│       ├── jwt.js                  # Token helpers
│       └── response.js             # Standardized responses
│
└── client/
    └── src/
        ├── App.jsx                 # Router with auth guards
        ├── main.jsx                # Entry + Toaster
        ├── store/authStore.js      # Zustand global state
        ├── services/api.js         # Axios + all API calls
        ├── utils/helpers.js        # Formatters, CSV export
        ├── components/
        │   ├── ui/index.jsx        # Full UI component library
        │   ├── charts/             # Chart.js wrappers
        │   └── layout/AppLayout.jsx # Sidebar + header
        └── pages/
            ├── auth/               # Login + Register
            ├── dashboard/          # Main dashboard
            ├── transactions/       # Income & expenses CRUD
            ├── invoices/           # Invoice builder + PDF
            ├── inventory/          # Product management
            ├── reports/            # P&L, trends, analytics
            └── settings/           # Profile, business, security
```

---

## 🔐 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |
| PUT | `/api/auth/switch-business/:id` | Switch active business |

### Transactions
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/transactions?businessId=` | List with filters |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update |
| DELETE | `/api/transactions/:id` | Delete |

### Invoices
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/invoices?businessId=` | List invoices |
| POST | `/api/invoices` | Create invoice |
| POST | `/api/invoices/:id/payment` | Record payment |

### Reports
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/reports/dashboard?businessId=` | Dashboard stats + AI insights |
| GET | `/api/reports/pl?businessId=&year=` | Profit & Loss |
| GET | `/api/reports/monthly-trend` | Monthly chart data |
| GET | `/api/reports/category-breakdown` | Category pie chart |

---

## ✨ Features

- **Multi-Business** — Create and switch between multiple businesses
- **Transactions** — Full income/expense CRUD with filters, search, CSV export
- **Invoices** — GST-ready invoice builder with PDF download via jsPDF
- **Inventory** — Product management with stock adjustment and low-stock alerts
- **Reports** — P&L, monthly trends, category breakdown charts
- **AI Insights** — JS-based logic generating business health messages
- **Auth** — JWT with bcrypt, role-based access (Admin/Staff)
- **Dark UI** — Premium SaaS-quality dark theme with animations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| State | Zustand with persistence |
| Charts | Chart.js + react-chartjs-2 |
| PDF | jsPDF + jspdf-autotable |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | Joi |
| HTTP | Axios with interceptors |
| Toasts | react-hot-toast |
