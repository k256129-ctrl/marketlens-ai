# MarketLens AI — Intelligent Local Commerce & Business Decision-Support Platform

**MarketLens AI** is a full-stack SaaS commerce intelligence platform enabling retail operators, multi-shop owners, and commercial analysts to track multi-store inventory, benchmark product prices across local merchants, manage shop profiles, and evaluate commercial expansion locations.

---

## 1. Architecture & Stack

- **Frontend:** React 18, Vite 6, React Router 7, Recharts, Lucide React, Modular CSS Design System (`#087F5B` Emerald & `#F5F7F6` Off-White with Dark Mode).
- **Backend:** Python 3.11+, FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2 validation, OpenAPI/Swagger documentation.
- **Database:** SQLite (`marketlens.db`) out of the box for instant zero-config local development; PostgreSQL-ready via `DATABASE_URL`.
- **Standard Ports:**
  - Backend API: `` (Swagger UI: `/docs`)
  - Frontend App: `http://localhost:5173`

---

## 2. Database Schema (Normalized 6-Table Design)

1. `categories` — Product verticals with brand color tokens.
2. `businesses` — Registered storefronts/merchants with location, owner contact, status, and ratings.
3. `products` — Canonical commercial SKUs linked to `categories`.
4. `inventory_items` — Junction & stock ledger (`business_id`, `product_id`, `unit_price`, `cost_price`, `quantity`, `min_stock_level`) with a composite unique constraint `(business_id, product_id)`.
5. `location_metrics` — Commercial corridor benchmarks (`avg_monthly_rent_usd`, `competition_index`, `foot_traffic_score`, `opportunity_score`, and explicit `data_source_type` transparency tags).
6. `activity_logs` — Immutable audit stream recording CRUD mutations and low-stock alerts.

---

## 3. Quick Start & Installation

### A. Start the FastAPI Backend (Port 8000)

```bash
cd backend
python -m venv .venv

# Activate virtual environment:
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

On first boot, FastAPI automatically creates all relational tables and seeds 5 realistic businesses, 10 canonical products, 17 cross-shop inventory entries, and 6 location benchmarks.

### B. Start the React + Vite Frontend (Port 5173)

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 4. Testing Instructions

Run automated API integration & CRUD tests via Pytest:

```bash
cd backend
pytest -v
```

---

## 5. Production Build & PostgreSQL Deployment

### Frontend Production Bundle
```bash
cd frontend
npm run build
# Outputs optimized static assets to frontend/dist/
```

### Production Database & Server
1. Set `DATABASE_URL="postgresql+psycopg2://user:password@db-host:5432/marketlens_db"` in `backend/.env`.
2. Set `CORS_ORIGINS="https://your-production-domain.com"`.
3. Launch with Gunicorn + Uvicorn workers:
```bash
cd backend
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```
