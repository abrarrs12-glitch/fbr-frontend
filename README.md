# FBR Invoice Frontend (React)

A clean, production-ready React frontend for managing FBR digital invoices across multiple customers.

---

## Folder Structure

```
fbr-frontend/
├── index.html               ← Entry HTML (loads fonts, mounts React)
├── vite.config.js           ← Vite config (dev server + API proxy)
├── package.json             ← Dependencies
│
└── src/
    ├── main.jsx             ← React root
    ├── App.jsx              ← Routes: /login, /dashboard, /customers, /invoices
    ├── index.css            ← All global styles and design tokens
    │
    ├── context/
    │   └── AuthContext.jsx  ← Login state shared across the app
    │
    ├── services/
    │   └── api.js           ← All HTTP calls to the backend (auth, customers, invoices, FBR)
    │
    ├── components/
    │   └── Layout.jsx       ← Dark sidebar + page shell
    │
    └── pages/
        ├── LoginPage.jsx    ← Admin login screen
        ├── DashboardPage.jsx← Overview stats + recent invoices
        ├── CustomersPage.jsx← Add / edit / delete customers
        └── InvoicesPage.jsx ← Upload Excel, view invoices, sync to FBR
```

---

## Setup (Step by Step)

### 1. Install Node.js
Download from https://nodejs.org (LTS version)

### 2. Install dependencies
```bash
cd fbr-frontend
npm install
```

### 3. Make sure your backend is running
```bash
# In a separate terminal, in the fbr-backend folder:
npm run dev
# Backend must be on port 5000
```

### 4. Start the frontend
```bash
npm run dev
# Opens at http://localhost:3000
```

The Vite dev server automatically proxies `/api/*` requests to `http://localhost:5000`,
so you don't need to worry about CORS during development.

---

## Pages

| Page | URL | What it does |
|---|---|---|
| Login | `/login` | Admin sign-in |
| Dashboard | `/dashboard` | All-customer overview, stats, recent invoices |
| Customers | `/customers` | Add/edit/delete client businesses with FBR credentials |
| Invoices | `/invoices` | Upload Excel, filter invoices, sync to FBR, view IRNs |

---

## Connecting to Backend

All API calls are in `src/services/api.js`.  
The base URL is `/api` (proxied to `localhost:5000` in dev).

**For production**, change the `baseURL` in `src/services/api.js`:
```js
const API = axios.create({ baseURL: 'https://your-backend.railway.app' });
```

---

## Build for Production

```bash
npm run build
# Output goes to the /dist folder
# Upload /dist to any static host: Netlify, Vercel, Railway, etc.
```

---

## Deploying (Free)

**Frontend → Netlify (easiest)**
1. `npm run build`
2. Drag the `/dist` folder to https://app.netlify.com/drop
3. Done — live URL in seconds

**Or Vercel:**
1. Push to GitHub
2. Import repo at https://vercel.com
3. Set build command: `npm run build`, output: `dist`

**Don't forget** to set the backend URL in `api.js` before building!
