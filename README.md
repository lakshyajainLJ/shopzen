# ShopZen 2.0 — Production-Grade, Secure & AI-Enabled E-Commerce Application

ShopZen 2.0 is a modern, full-stack, secure e-commerce platform built with Flask, MongoDB Atlas, React, TypeScript, Vite, and OpenAI.

---

## 🏗 Architecture Overview

```
                          ┌──────────────────────────┐
                          │   React 18 + TypeScript  │
                          │        (Vite SPA)        │
                          └─────────────┬────────────┘
                                        │ REST API (JWT Header)
                                        ▼
                          ┌──────────────────────────┐
                          │     Flask 3.1 Backend    │
                          │   (Service Architecture) │
                          └─────────────┬────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
 ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
 │  MongoDB Atlas DB    │   │  OpenAI API / Tools  │   │  Flask Pytest Suite  │
 │ (Users, Carts, etc.) │   │ (Chat, Vectors, etc.)│   │   (Coverage > 70%)   │
 └──────────────────────┘   └──────────────────────┘   └──────────────────────┘
```

---

## 🚀 Key Upgrades & Features

### 🔐 1. Real Backend Authentication & RBAC Security
* **JWT Authentication**: Password hashing with `bcrypt` and JWT claims.
* **Server-Side Admin Verification**: Admin endpoints (`/admin/users`, `/admin/orders`, `/products` mutations) are protected with `@admin_required` server-side middleware.
* **Role Invariants**: Frontend flags and `sessionStorage` dependencies have been completely removed. Registration defaults to `role: user`.

### 📦 2. MongoDB Atlas & Canonical Data Models
* **Environment Connection**: Connects to MongoDB Atlas via `MONGODB_URI` and `MONGODB_DATABASE`.
* **Automated Indexing**: Unique index on `users.email`, plus indexes on `products.category`, `products.name`, `orders.user_id`, and `orders.created_at`.
* **Canonical Model**: Standardized product schema (`id`, `name`, `description`, `price`, `category`, `image`, `stock`, `created_at`, `updated_at`).

### 🛒 3. Server-Authoritative Checkout & Order Engine
* **Inventory Invariants**: Live price re-syncing and stock validation (`stock >= quantity`) on cart and checkout.
* **Financial Calculations**: Backend calculates `subtotal`, `discount`, `tax`, `shipping`, and `total`. Never trusts client-provided totals.
* **Price Snapshots**: Orders store `name_snapshot` and `price_snapshot` for historical integrity. Atomic stock decrementing upon placement.

### 🤖 4. AI Features Suite
* **AI Shopping Assistant (`POST /ai/chat`)**: Slide-over AI drawer powered by OpenAI function calling (`search_products`, `get_product_details`, `get_recommendations`).
* **Semantic Vector Search (`POST /ai/semantic-search`)**: Natural language text embeddings and vector similarity queries.
* **Personalized Recommendation Engine (`GET /recommendations`)**: Transparent scoring model analyzing purchase history, wishlist items, and category preferences.
* **AI Review Summarization (`POST /ai/summarize-reviews`)**: Summarizes verified customer reviews into pros, cons, and overall verdict.
* **Admin AI Description Generator (`POST /admin/ai/generate-description`)**: Generates SEO-rich product descriptions for admin review and approval.

---

## 🛠 Technology Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6, TanStack React Query, Lucide Icons, Radix UI (Shadcn), Vitest.
* **Backend**: Flask 3.1, Flask-JWT-Extended, PyMongo, bcrypt, OpenAI Python SDK, Pytest.
* **Database**: MongoDB Atlas.
* **Deployment**: Docker, Docker Compose, Gunicorn.

---

## 🔑 Environment Variables

### Backend Configuration (`backend/.env`)

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=shopzen
JWT_SECRET_KEY=prod_super_secret_jwt_key_shopzen_2026_x938
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
PORT=5000
```

### Frontend Configuration (`shopzenLJ/.env`)

```env
VITE_API_URL=http://localhost:5000
```

---

## 💻 Local Development Setup

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
pip install -r requirements.txt
pip install pytest pytest-cov openai python-dotenv gunicorn

# Run backend dev server
python app.py
```

### 2. Frontend Setup

```bash
cd shopzenLJ
npm install
npm run dev
```

---

## 🧪 Testing Suite

### Backend Pytest Suite (>70% Coverage)

```bash
cd backend
.\venv\Scripts\pytest.exe -v
.\venv\Scripts\pytest.exe --cov=services --cov=routes --cov=middleware --cov=models -v
```

### Frontend Vitest Suite & Type Check

```bash
cd shopzenLJ
npx tsc --noEmit
npm run test
```

---

## 🐳 Production Deployment (Docker)

```bash
# Build and launch multi-container stack with Docker Compose
docker-compose up --build -d
```

Check health status at `http://localhost:5000/health`.

---

## 📄 License
MIT License. Created for ShopZen 2.0 Engineering Upgrade.
