# Rasoi Food Delivery WebApp

Full-stack multi-role food delivery platform with realtime order tracking, role-specific dashboards, and hybrid recommendation logic for both restaurants and food items.

## Highlights

- Multi-role auth: `User`, `RestaurantOwner`, `DeliveryBoy`, `Admin`
- Restaurant discovery with search + dietary filters (`all`, `veg`, `jain`, `non-veg`)
- Cart + checkout simulation with delivery address/location capture
- Strict order lifecycle:
  - `pending -> accepted -> preparing -> ready -> picked -> delivered`
  - `rejected` as terminal failure state
- Delivery dashboard only exposes orders in `ready` state for pickup
- Socket-based live order tracking and map route updates
- Owner, delivery, and admin analytics dashboards
- Context-aware + hybrid recommendations:
  - Restaurant recommendations
  - Food recommendations

## Monorepo Structure

```
└── 📁Rasoi-Food-Delivery-WebApp
    └── 📁backend
        └── 📁automation
            ├── removeUnverifiedAccounts.js
        └── 📁config
            ├── db.js
        └── 📁controllers
            ├── admin.controls.js
            ├── auth.controls.js
            ├── delivery.controls.js
            ├── order.controls.js
            ├── owner.controls.js
            ├── restaurant.controls.js
        └── 📁middlewares
            ├── AuthValidation.js
            ├── catchAsyncError.js
            ├── error.js
        └── 📁models
            ├── menu.model.js
            ├── order.model.js
            ├── restaurant.model.js
            ├── users.model.js
        └── 📁routes
            ├── admin.routes.js
            ├── auth.routes.js
            ├── delivery.routes.js
            ├── order.routes.js
            ├── owner.routes.js
            ├── restaurant.routes.js
        └── 📁seed
            ├── seedHomeData.js
        └── 📁tests
            ├── _http-mocks.js
            ├── auth-validation.middleware.test.js
            ├── delivery-owner.controller.test.js
            ├── insights-utils.test.js
            ├── order-model.test.js
            ├── order.controller.test.js
            ├── pathfinding-utils.test.js
        └── 📁utils
            ├── insights.js
            ├── pathfinding.js
            ├── sendEmail.js
            ├── sendToken.js
        ├── .env
        ├── index.js
        ├── package-lock.json
        ├── package.json
        ├── socket.js
    └── 📁frontend
        └── 📁src
            └── 📁components
                ├── DeliveryMap.jsx
                ├── EarningsChart.jsx
                ├── LineChart.jsx
                ├── MenuCard.jsx
                ├── RestaurantCard.jsx
                ├── SiteFooter.jsx
                ├── SiteHeader.jsx
                ├── TopNav.jsx
            └── 📁pages
                ├── AdminDashboard.jsx
                ├── AdminLogin.jsx
                ├── DeliveryDashboard.jsx
                ├── ForgotPassword.jsx
                ├── Home.jsx
                ├── Login.jsx
                ├── OtpVerification.jsx
                ├── OwnerDashboard.jsx
                ├── OwnerSetupRestaurant.jsx
                ├── ResetPassword.jsx
                ├── RestaurantMenu.jsx
                ├── SignUp.jsx
            ├── App.jsx
            ├── index.css
            ├── main.jsx
            ├── socket.js
        ├── eslint.config.js
        ├── index.html
        ├── package-lock.json
        ├── package.json
        ├── vite.config.js
    └── 📁tests  -- project details file
        ├── project_features_and_tech_stack.txt
        ├── recommendation_algorithm_details.txt
        ├── website_test_cases.txt
    ├── .gitignore
    ├── index.html
    └── README.md
```

## Tech Stack

### Backend

- Node.js (ESM)
- Express 5
- MongoDB + Mongoose
- JWT + cookie-based auth
- Socket.IO (realtime tracking)
- bcryptjs, nodemailer, node-cron, dotenv

### Frontend

- React 19 + Vite
- React Router
- Tailwind CSS
- Axios
- React Toastify
- Leaflet (maps)
- Chart.js + react-chartjs-2
- socket.io-client

## Setup

## 1) Clone

```bash
git clone <your-repo-url>
cd Rasoi-Food-Delivery-WebApp
```

## 2) Backend setup

```bash
cd backend
npm install
```

Create `backend/.env` (example):

```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/RasoiDb
JWT_SECRET=your-secret
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
FRONTEND_URL=http://localhost:5173
SMPT_HOST=smtp.gmail.com
SMPT_PORT=587
SMPT_MAIL=you@example.com
SMPT_PASSWORD=your-password
```

Run backend:

```bash
npm run dev
```

Optional seed:

```bash
npm run seed:home
```

## 3) Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

Default frontend URL: `http://localhost:5173`  
Backend URL used in app: `http://localhost:8000`

## Backend Test Cases (node:test)

Backend tests are in `backend/tests` using Node's built-in test runner.

### Run tests

```bash
cd backend
npm test
```

### Current automated test files

- `backend/tests/order-model.test.js`
  - verifies status enum and default `pending`
- `backend/tests/insights-utils.test.js`
  - validates sales/earnings aggregation math
- `backend/tests/pathfinding-utils.test.js`
  - validates route generation and distance output

## Frontend Routes

- `/` - Home
- `/signup`
- `/otp-verification/:email`
- `/login`
- `/password/forgot`
- `/password/reset/:token`
- `/owner/setup`
- `/owner/dashboard`
- `/delivery/dashboard`
- `/admin/login`
- `/admin/dashboard`
- `/restaurants/:restaurantId/menu`

## Core API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/otp-verification`
- `POST /api/auth/login`
- `POST /api/auth/admin/login`
- `GET /api/auth/logout`
- `GET /api/auth/user`
- `POST /api/auth/password/forgot`
- `PUT /api/auth/password/reset/:token`

### Restaurants & Recommendations

- `GET /api/restaurants`
- `GET /api/restaurants/:restaurantId/menu`
- `GET /api/restaurants/recommendations`
- `GET /api/restaurants/recommendations/foods`

### Orders (User)

- `POST /api/orders`
- `GET /api/orders/my`
- `GET /api/orders/:orderId/tracking`

### Owner

- `GET /api/owner/restaurant-status`
- `POST /api/owner/restaurant`
- `GET /api/owner/dashboard`
- `POST /api/owner/menu`
- `PUT /api/owner/menu/:menuId`
- `DELETE /api/owner/menu/:menuId`
- `PATCH /api/owner/orders/:orderId/status`

### Delivery

- `GET /api/delivery/dashboard`
- `PATCH /api/delivery/orders/:orderId/accept`
- `PATCH /api/delivery/orders/:orderId/live-location`
- `PATCH /api/delivery/orders/:orderId/delivered`

### Admin

- `GET /api/admin/dashboard`

## Order Lifecycle Rules

- Order creation starts at `pending`
- Owner transitions:
  - `pending -> accepted/rejected`
  - `accepted -> preparing/rejected`
  - `preparing -> ready/rejected`
- Delivery can accept only `ready` orders:
  - `ready -> picked`
- Delivery completion:
  - `picked -> delivered`

## Recommendation Logic Summary

Both recommenders use hybrid weighted scoring (no external ML framework):

- Context-aware: geolocation proximity + meal-time relevance + session/device
- Content-based: query/search history + cuisine/category matching + favorites
- Collaborative-like: historical order patterns

Mathematical components include:

- Haversine distance for location relevance
- Normalization to keep mixed features on comparable scale
- Weighted linear scoring and descending rank sort

Detailed algorithm explanation is documented in:
- `tests/recommendation_algorithm_details.txt`

## Additional Project Docs

- Manual test cases:
  - `tests/website_test_cases.txt`
- Feature and tech stack inventory:
  - `tests/project_features_and_tech_stack.txt`

## Notes

- This project currently includes a fake checkout simulation for local development.
- For production, integrate a real payment provider and harden security/observability.
