# 🥗 FoodSense: AI Demand Forecasting & Food Waste Analytics Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](LICENSE)
[![Release](https://img.shields.io/badge/Release-v1.0.0-blue.svg)]()
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript-61dafb.svg?logo=react&logoColor=black)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![ML Engine](https://img.shields.io/badge/ML%20Engine-Holt--Winters%20%7C%20statsmodels-f59e0b.svg)](https://www.statsmodels.org)
[![Pytest](https://img.shields.io/badge/Tests-38%20Passed-success.svg?logo=pytest&logoColor=white)]()
[![Playwright](https://img.shields.io/badge/Playwright-E2E%20Verified-purple.svg?logo=playwright&logoColor=white)]()
[![Localization](https://img.shields.io/badge/Languages-EN%20%7C%20සිංහල%20%7C%20தமிழ்-emerald.svg)]()

> **FoodSense** is an enterprise-grade demand forecasting and perishable food waste analytics SaaS platform engineered specifically for commercial kitchens, multi-branch restaurant chains, and supermarket networks in Sri Lanka. It replaces guesswork procurement with machine-learning-assisted replenishment, real-time multi-tier expiry salvage markdowns, recipe bill-of-materials explosion, counterfactual waste modeling, and IPCC-aligned carbon footprint tracking.

---

## 📑 Table of Contents
1. [📌 The Problem & Solution](#-the-problem--solution)
2. [🛠️ Tech Stack](#️-tech-stack)
3. [🏛️ System Architecture](#️-system-architecture)
4. [🔐 Demo Accounts & Role Matrix](#-demo-accounts--role-matrix)
5. [✨ Core Platform Capabilities](#-core-platform-capabilities)
6. [🚀 Quick Start Guide](#-quick-start-guide)
7. [🎬 5-Minute Product Walkthrough](#-5-minute-product-walkthrough)
8. [📸 Visual Showcase](#-visual-showcase)
9. [🧪 Testing & Quality Assurance](#-testing--quality-assurance)
10. [📐 UI Conventions & Overlay Architecture](#-ui-conventions--overlay-architecture)
11. [📊 Mathematical & Methodological Foundations](#-mathematical--methodological-foundations)
12. [🗺️ Roadmap & Future Vision](#️-roadmap--future-vision)
13. [📄 License](#-license)

---

## 📌 The Problem & Solution

### ⚠️ The Industry Problem
Commercial food operators in Sri Lanka routinely procure and prepare food based on subjective intuition, memory, and static spreadsheets. This causes severe operational vulnerabilities:
- **Weekend Surges vs. Mid-Week Waste**: Over-ordering on Monday mornings leads to severe spoilage dumpster write-offs by Wednesday and Thursday.
- **Inflated Cost of Goods**: Perishable waste inflates operational costs by **8% to 15%**, eroding already thin restaurant and supermarket margins.
- **Environmental Toll**: Tonnes of edible perishable food decompose in local municipal landfills, generating methane and greenhouse gas emissions.

### 💡 The FoodSense Solution
FoodSense acts as an intelligent operating system for food inventory:
1. 📈 **Dual-Horizon Demand Forecasts**: Holt-Winters exponential smoothing ($s=7$ weekly seasonality) with rolling 28-day backtesting and 95% confidence intervals.
2. 🛒 **Automated PO Recommendations**: Safety-stock-aware replenishment calculations rounded to vendor pack sizes with expiry-aware deductions.
3. 🏷️ **Dynamic Salvage Markdowns**: Automated price-elasticity recommendations (20%–50% discounts) for batches expiring within 24–72 hours to salvage revenue before spoilage.
4. 🍲 **Recipe BOM Explosion**: Translates forecasted dish orders (Kottu, Rice & Curry, Biryani) into precise raw ingredient procurement requirements.
5. 🤝 **Charity Surplus Redistribution**: Seamless dispatch workflow routing near-expiry edible food to verified Sri Lankan food banks.
6. 🌍 **ESG & Carbon Footprint Audit**: IPCC and Central Environmental Authority (CEA) aligned calculations with one-click vector PDF generation.

---

## 🛠️ Tech Stack

| Domain | Technologies & Libraries | Highlights |
| :--- | :--- | :--- |
| **⚡ Backend API** | Python 3.11+ / 3.13, FastAPI, Uvicorn ASGI | Asynchronous, auto-documented Swagger & OpenAPI schemas |
| **💾 Persistence & ORM** | SQLite (`foodsense.db`), SQLAlchemy 2.0 ORM | Fully normalized relational schema with indexing |
| **🛡️ Authentication** | Pydantic v2, Python-Jose (JWT), Passlib (Bcrypt) | Role-Based Access Control (RBAC): Admin, Manager, Staff |
| **🧠 Data Science & ML** | `statsmodels`, `scikit-learn`, `pandas`, `numpy` | Holt-Winters Exponential Smoothing, 28-day MAE/RMSE/MAPE backtesting |
| **📄 Vector Reporting** | ReportLab | Server-side vector PDF generation with custom typography |
| **💻 Frontend Client** | React 19, TypeScript, Vite | Zero runtime overhead, strict typing, modular hooks |
| **🎨 Styling & Tokens** | Tailwind CSS, Custom Design System | Linear/Stripe inspired dark/light themes with WCAG AA contrast |
| **📊 Visualizations** | Recharts, SVG Sparklines | Responsive timeseries with confidence bounds, heatmaps, scatter matrix |
| **🌐 Localization (i18n)**| React Context Engine | Dynamic trilingual switching: **English**, **Sinhala (සිංහල)**, **Tamil (தமிழ்)** |
| **🧪 Testing Suite** | Pytest, Playwright | 38 backend unit/integration tests, cross-viewport browser testing |

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph Client ["💻 Client Tier (React 19 + TypeScript + Tailwind CSS)"]
        direction TB
        UI["🎨 Dashboard & Shell<br/><i>Responsive Design System</i>"]
        Nav["🧭 Sidebar & Navigation<br/><i>User Account & Branch Switcher</i>"]
        Search["🔍 Command Palette (⌘K)<br/><i>Instant Omnisearch & Routing</i>"]
        Visuals["📊 Recharts Visualizer<br/><i>Confidence Bands, Heatmap, Scatter</i>"]
        i18n["🌐 Localization Engine<br/><i>English • සිංහල • தமிழ்</i>"]
        Overlays["🪟 Accessible Overlay Hub<br/><i>Focus Trap, Dual-Event Backdrop</i>"]
    end

    subgraph API ["⚡ API Gateway & Security Layer (FastAPI ASGI)"]
        direction TB
        AuthService["🛡️ JWT & RBAC Engine<br/><i>Admin • Store Manager • Staff</i>"]
        DataIngest["📥 Two-Stage CSV/XLSX Ingestion<br/><i>Row-Level Schema Validation</i>"]
        Endpoints["🔌 REST Resource Routers<br/><i>/kpis • /forecast • /recommendations<br/>/alerts • /insights • /sustainability • /reports</i>"]
    end

    subgraph Engine ["🧠 Predictive Intelligence & Analytics Engine"]
        direction TB
        HW["📈 Holt-Winters Additive Forecaster<br/><i>Weekly Seasonality (s=7) + Trend</i>"]
        Backtest["⚖️ 28-Day Backtest Competitor<br/><i>Auto-Selection via MAE / RMSE / MAPE</i>"]
        PO["🛒 Safety Stock & PO Generator<br/><i>Lead-Time Demand + Pack Rounding</i>"]
        Salvage["🏷️ Price Elasticity Salvage<br/><i>Dynamic Expiry Discount Optimization</i>"]
        BOM["🍲 Recipe BOM Explosion<br/><i>Finished Dishes to Raw Ingredients</i>"]
        WeatherReg["🌦️ Cultural & Weather Regressors<br/><i>Poya, Monsoon Rain, Vesak Demand</i>"]
    end

    subgraph Persistence ["💾 Persistence & Output Tier"]
        direction TB
        DB[("🗄️ Relational Database<br/><i>SQLite via SQLAlchemy 2.0 ORM</i>")]
        PDFGen["📄 ReportLab PDF Generator<br/><i>Executive ESG Sustainability Audits</i>"]
        Digest["📧 Automated Digest Dispatcher<br/><i>HTML Telemetry & Status Previews</i>"]
    end

    %% Tier Connections
    Client <-->|REST JSON + Bearer JWT| API
    API -->|Sales & Telemetry Stream| Engine
    Engine -->|Optimal Orders & Predictions| API
    API <-->|SQLAlchemy Sessions| DB
    API -->|Render Executive Summaries| PDFGen
    API -->|Dispatch Operations| Digest

    classDef clientStyle fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef apiStyle fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#f8fafc;
    classDef engineStyle fill:#312e81,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
    classDef dbStyle fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#f8fafc;

    class UI,Nav,Search,Visuals,i18n,Overlays clientStyle;
    class AuthService,DataIngest,Endpoints apiStyle;
    class HW,Backtest,PO,Salvage,BOM,WeatherReg engineStyle;
    class DB,PDFGen,Digest dbStyle;
```

---

## 🔐 Demo Accounts & Role Matrix

FoodSense incorporates **Role-Based Access Control (RBAC)** out of the box. Three distinct operational personas are pre-seeded into the database:

| Persona | Email | Password | Role & Scope of Permissions |
| :--- | :--- | :--- | :--- |
| **Store Manager** | `manager@foodsense.lk` | `demo1234` | **Analytical & Procurement Access**: Forecasts, replenishment POs, expiry markdowns, charity donations, profit margins, sustainability audits, and event schedules. |
| **Admin** | `admin@foodsense.lk` | `demo1234` | **Full Platform Authority**: Multi-branch administration, supplier networks, business settings, model tuning, and global target management. |
| **Kitchen Staff** | `staff@foodsense.lk` | `demo1234` | **Operational Tablet Access**: 10-second touch-friendly Quick Waste Log, batch receiving, Recipe BOM inspection, and live notifications. |

> [!TIP]
> **1-Click Demo Login**: The login screen features convenient one-click persona switcher buttons, allowing instantaneous role switching during demonstrations.

---

## ✨ Core Platform Capabilities

### 1. 📊 Executive KPI Dashboard & Real-Time Analytics
* **Uniform Metrics Grid**: Six normalized, single-line KPI cards displaying Waste Rate %, Spoilage Cost (LKR), Forecast Accuracy %, Estimated Cost Savings (LKR), Expiring Batches, and Avoided $\text{CO}_2\text{e}$.
* **Compact Presentation**: Tabular numerals with compact abbreviations (`LKR 2.90M`, `11.97t`, `88.3%`) and lossless full values in hover tooltips.
* **Day-of-Week Spoilage Heatmap**: Pinpoints weekly surges and exposes why Monday over-procurement causes mid-week dumpster waste.
* **Counterfactual What-If Simulator**: Interactive sliders adjusting staff recommendation compliance (50%–100%) and salvage markdown rates (10%–50%) to project recoverable profit.

### 2. 📈 Machine-Learning Demand Forecasting (`/forecasts`)
* **Dual Prediction Horizons**: 7-day and 14-day rolling demand forecasts per SKU.
* **Automated Algorithm Tournament**: Compares three time-series algorithms on a 28-day rolling window:
  - **Holt-Winters Exponential Smoothing**: Additive weekly seasonality ($s=7$) + additive trend.
  - **7-Day Moving Average**: Rolling mean adjusted by day-of-week ratio coefficients.
  - **Naive Seasonal Baseline**: 7-day seasonal lag repeat heuristic.
* **Statistical Explainability (STL)**: Deconstructs raw sales timeseries into underlying **Trend**, **Weekly Seasonality**, and **Residual Noise**.
* **95% Confidence Intervals**: Visualized via upper and lower bounds ($\pm 1.96 \times \text{RMSE}$) to guide safety stock sizing.

### 3. 🛒 Smart Replenishment & Purchase Orders (`/recommendations`)
* **Precise Buffer Policy**:
  $$\text{Recommended Order} = \left\lceil \frac{\max(0, \text{Demand}_{\text{LeadTime}} + \text{SafetyStock} - \text{UsableStock})}{\text{PackSize}} \right\rceil \times \text{PackSize}$$
* **Expiry-Aware Deductions**: Excludes inventory batches expiring before the scheduled delivery date.
* **Automated Vendor Dispatch**: One-click export generating supplier-ready CSV purchase orders.

### 4. 🏷️ Dynamic Expiry Salvage Markdowns (`/alerts`)
* **Multi-Tier Color-Coded Alerts**: Critical ($\le 1$ day, Red), Warning (2–3 days, Orange), and Notice (4–7 days, Yellow).
* **Price Elasticity Salvage Optimizer**: Suggests optimal markdown discounts (20%–50%) based on remaining shelf-life to salvage revenue before expiration.
* **One-Click Lifecycle Updates**: Marks batches as discounted, instantly logging recovered revenue.

### 5. 💡 Smart Operational Insights (`/insights`)
* **Automated Telemetry Diagnostics**: Natural language operational findings ranked by estimated LKR savings:
  - *"Cooked meals account for 38.2% of total waste cost due to single-day shelf life. Transition to batch cooking."*
  - *"Bread waste is 32% higher on Mondays. Trim Monday purchase orders by 15%."*
* **One-Click Action Workflow**: Direct "Apply Recommendation" button with celebratory feedback and audit trail tracking.

### 6. 🌦️ Cultural & Weather Impact Analytics (`/events`)
* **Sri Lankan Cultural Calendar**: Integrated holidays, Full Moon Poya days, Sinhala & Tamil New Year (April), Vesak (May vegetarian shift), and festive seasons.
* **Monsoon Weather Regressors**: Models precipitation effects on dine-in footfall versus takeout delivery surges.
* **Custom Event Scheduler**: Enables managers to register private banquets, promotions, and sporting events.

### 7. 🤝 Surplus Food Donation Tracker (`/donations`)
* **Charity Redistribution Pipeline**: Routes surplus edible food to verified Sri Lankan food banks (e.g. *Sahana Community Kitchen*, *Sri Lanka Food Bank*, *Robin Hood Army*).
* **Community Impact Counter**: Real-time tracking of meals donated, kilograms diverted from landfills, and monetary tax credits in LKR.

### 8. 🌍 Sustainability Scorecard & PDF Export (`/sustainability`)
* **IPCC / CEA Environmental Indicators**:
  - Greenhouse gas avoidance: $2.5\text{ kg CO}_2\text{e} / \text{kg waste saved}$
  - Water footprint conservation: $1,200\text{ liters} / \text{kg wasted food}$
  - Landfill diversion: $1\text{ kg} / \text{kg waste averted}$
  - Human meal equivalent: $0.4\text{ kg edible food} = 1\text{ meal}$
* **Vector PDF Audit Export**: Generates a high-resolution, branded executive sustainability audit report using Python ReportLab.

### 9. 🎯 Operational Goal Setting & Progress (`/goals`)
* **Target Categories**: Waste reduction percentages and financial recovery targets.
* **Visual Progress Dials**: Circular SVG progress meters with color-coded status badges (`On Track`, `At Risk`, `Achieved`).

### 10. 💰 Profit & Margin Analysis (`/margins`)
* **4-Quadrant Unit Economics Matrix**: Plots Waste Cost (LKR) on the X-axis against Net Margin % on the Y-axis:
  - **Quadrant I (High Margin, Low Waste)**: Core Profit Drivers (Promote & protect)
  - **Quadrant II (Low Margin, Low Waste)**: Volume Staples (Maintain par levels)
  - **Quadrant III (Low Margin, High Waste)**: Critical Problem SKUs (Reduce orders or bundle)
  - **Quadrant IV (High Margin, High Waste)**: Hidden Drainers (Tighten safety stocks)

### 11. 🏢 Multi-Outlet Enterprise Support (`/outlets`)
* **Branch Locations**: Pre-configured with strategic branches across Sri Lanka:
  - `Colombo Central` (Flagship Urban Supermarket & Delicatessen)
  - `Kandy City` (High-Volume Hill Country Restaurant)
  - `Galle Fort` (Coastal Heritage Bistro & Seafood Kitchen)
* **Branch Benchmarking Leaderboard**: Side-by-side performance comparisons on Accuracy %, Waste %, and Savings.

### 12. 🚚 Supplier Network & Price Tracking (`/suppliers`)
* **Vendor Directory**: Pre-seeded with regional suppliers (*CIC Agri*, *Highland Dairy*, *Pelwatte*, *Ceylon Fresh Seafoods*).
* **Price Trajectory Telemetry**: Charts 12-week price histories and flags inflation spikes ($>10\%$).

### 13. 🍲 Recipe BOM Ingredient Explosion (`/recipes`)
* **Commercial Kitchen Mode**: Deconstructs dishes (Chicken Kottu, Rice & Curry, Seafood Fried Rice) into raw ingredient components to compute upstream inventory depletion.

### 14. 🌐 Trilingual Localization (EN / SI / TA)
* Complete trilingual coverage across navigation menus, dashboard KPIs, forms, and alerts:
  - 🇬🇧 **English** (`en`)
  - 🇱🇰 **Sinhala** (`si` — සිංහල)
  - 🇱🇰 **Tamil** (`ta` — தமிழ்)

### 15. ⏱️ 10-Second Quick Waste Station (`/quick-log`)
* Touch-optimized tablet interface for chefs and kitchen hands to record waste in fast-paced shifts with one tap.

---

## 🚀 Quick Start Guide

### 📋 Prerequisites
- **Python 3.11+** installed (`python --version`)
- **Node.js v18+** and **npm** installed (`node --version`)

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone https://github.com/Sadeep78/foodsense.git
cd foodsense

# 1. Install Backend Dependencies
cd backend
pip install -r requirements.txt

# 2. Install Frontend Dependencies
cd ../frontend
npm install
cd ..
```

### 2️⃣ Initialize Database & Seed Sample Data

```bash
python backend/app/seed/generate_sample_data.py
```

### 3️⃣ Launch the Full Platform

Launch both the FastAPI backend (`http://localhost:8000`) and the Vite React frontend (`http://localhost:5173`) with a single command:

#### Option A: Node Runner (Cross-Platform / Recommended)
```bash
node run.js
```

#### Option B: Windows PowerShell Script
```powershell
.\start.ps1
```

#### Option C: Windows Batch Script
```cmd
start.bat
```

#### Option D: Individual Terminals
```bash
# Terminal 1: FastAPI Backend
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Vite React Frontend
cd frontend
npm run dev
```

### 4️⃣ Access URLs
* 💻 **Web Application**: [http://localhost:5173](http://localhost:5173)
* 📖 **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* 📑 **Alternative ReDoc API Docs**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🎬 5-Minute Product Walkthrough

| Timestamp | Route | Demonstration Script & Technical Value |
| :--- | :--- | :--- |
| **0:00 – 0:40** | `/login` | **Role-Based Authentication**: *"FoodSense tackles the multi-million rupee food waste dilemma in Sri Lankan hospitality and retail. We offer 3 personas. I'll sign in as Store Manager with 1-click."* |
| **0:40 – 1:30** | `/` | **Executive Dashboard**: *"Real-time telemetry: Our waste rate is 7.8% representing LKR 2.90M in losses, but our forecasting has saved LKR 1.73M and avoided 11.97 tonnes of CO2e. The day-of-week heatmap demonstrates weekend volume surges explaining why Monday over-procurement causes mid-week waste."* |
| **1:30 – 2:15** | `/forecasts` | **Demand Forecasting & STL Explainability**: *"On a rolling 28-day window, FoodSense evaluates Holt-Winters, Moving Average, and Naive Seasonal models. Holt-Winters achieves 82.3% accuracy on Chicken Rice & Curry. Clicking 'Explainability' reveals the STL decomposition into Trend, Seasonality, and Residuals."* |
| **2:15 – 2:55** | `/recommendations` | **Automated Replenishment**: *"Forecasts are translated into purchase orders using lead time demand, safety stocks, and pack size rounding. For Special Chicken Kottu, usable stock is zero; the model recommends ordering exactly 100 portions tagged as URGENT."* |
| **2:55 – 3:35** | `/alerts` | **Dynamic Salvage Markdowns**: *"Batches expiring within 24 hours trigger automated salvage discounts (e.g. 30% off), recovering LKR 4,500 rather than writing off the entire batch as loss. Alternatively, surplus food can be dispatched directly to charity partners."* |
| **3:35 – 4:15** | `/margins` | **4-Quadrant Unit Economics**: *"Our scatter matrix plots waste cost against net margin, instantly isolating high-loss items in Quadrant III to re-engineer recipes or adjust par levels."* |
| **4:15 – 4:45** | `/sustainability` | **ESG Audit PDF Export**: *"Computes IPCC and CEA-aligned metrics. With one click, managers generate a branded vector PDF audit report using Python ReportLab."* |
| **4:45 – 5:00** | `/quick-log` | **Mobile Quick Log & Localization**: *"For kitchen staff, our touch-friendly Quick Waste Log allows 10-second logging on tablets. Seamless language switching between English, Sinhala, and Tamil."* |

---

## 📸 Visual Showcase

### 📊 Core Analytics & Forecasting
| 🔐 Role-Based Login Portal | 📈 Executive Analytics Dashboard |
| :---: | :---: |
| ![Login Portal](docs/screenshots/01_login.png) | ![Executive Dashboard](docs/screenshots/02_dashboard.png) |

| 📉 Demand Forecasting Engine | 🔬 Forecast Explainability (STL Decomposition) |
| :---: | :---: |
| ![Demand Forecasts](docs/screenshots/04_forecasts.png) | ![Forecast Explainability](docs/screenshots/22_forecast_explainability_modal.png) |

| 🛒 Smart Replenishment Orders | ⚠️ Color-Coded Expiry Risk Alerts |
| :---: | :---: |
| ![Order Recommendations](docs/screenshots/05_recommendations.png) | ![Expiry Alerts](docs/screenshots/06_alerts.png) |

---

### 💡 Waste Reduction, Salvage & Financial Modeling
| 💡 Smart Insights Engine | 🏷️ Dynamic Price Elasticity Markdowns |
| :---: | :---: |
| ![Smart Insights](docs/screenshots/12_smart_insights_page.png) | ![Dynamic Markdowns](docs/screenshots/14_dynamic_markdown_suggestions.png) |

| 🤝 Surplus Food Donation Tracker | 🎯 Strategic Target Setting & Progress |
| :---: | :---: |
| ![Food Donations](docs/screenshots/15_food_donations_page.png) | ![Waste Goals](docs/screenshots/17_waste_goals_page.png) |

| 💰 4-Quadrant Profit & Margin Scatter | 🎛️ Counterfactual What-If Simulator |
| :---: | :---: |
| ![Profit Margins](docs/screenshots/19_profit_margins_quadrant.png) | ![What-If Simulator](docs/screenshots/07_reports_what_if.png) |

---

### 🏢 Enterprise Operations & Sustainability
| 🌍 Sustainability Scorecard & Badges | 🏢 Multi-Outlet Leaderboard |
| :---: | :---: |
| ![Sustainability Scorecard](docs/screenshots/23_sustainability_scorecard.png) | ![Outlets Leaderboard](docs/screenshots/26_outlets_leaderboard.png) |

| 🚚 Supplier Telemetry & Price Trends | 🍲 Recipe BOM Ingredient Explosion |
| :---: | :---: |
| ![Supplier Trajectory](docs/screenshots/27_supplier_price_trajectory.png) | ![Recipe Explosion](docs/screenshots/28_recipe_ingredient_explosion.png) |

| 🌦️ Weather & Event Impact Calendar | 🔔 In-App Notification Center |
| :---: | :---: |
| ![Events Calendar](docs/screenshots/20_weather_and_events_calendar.png) | ![Notification Center](docs/screenshots/24_notifications_center.png) |

---

### 📱 Staff Operations, Localization & Responsive Layouts
| ⏱️ 10-Second Touch Waste Station | 🇱🇰 Trilingual UI: Sinhala (සිංහල) |
| :---: | :---: |
| ![Quick Waste Log](docs/screenshots/29_quick_waste_logging.png) | ![Sinhala Localization](docs/screenshots/30_multilanguage_sinhala.png) |

| 🇱🇰 Trilingual UI: Tamil (தமிழ்) | 🌙 Premium Dark Mode Dashboard |
| :---: | :---: |
| ![Tamil Localization](docs/screenshots/31_multilanguage_tamil.png) | ![Dark Mode](docs/screenshots/09_dark_mode_dashboard.png) |

| 📱 Mobile Responsive Viewport (390x844) | 📱 Tablet Responsive Viewport (768x1024) |
| :---: | :---: |
| ![Mobile Viewport](docs/screenshots/33_responsive_mobile_dashboard.png) | ![Tablet Viewport](docs/screenshots/34_responsive_tablet_margins.png) |

---

## 🧪 Testing & Quality Assurance

The platform is fortified by a comprehensive testing pyramid combining automated unit tests, mathematical audits, fault-tolerance tests, and end-to-end browser audits:

### 1️⃣ Pytest Backend Test Suite (38 Passed)
```bash
cd backend
python -m pytest
```

```
============================= test session starts =============================
platform win32 -- Python 3.13.7, pytest-9.1.1, pluggy-1.7.0
rootdir: C:\Users\DELL\Desktop\FoodSense
configfile: pytest.ini
collected 38 items

tests\test_api.py .......                                                [ 18%]
tests\test_forecasting.py ....                                           [ 28%]
tests\test_phase_a.py ....                                               [ 39%]
tests\test_phase_b.py ...                                                [ 47%]
tests\test_phase_c_d_e.py ........                                       [ 68%]
tests\test_qa_edge_cases.py .....                                        [ 81%]
tests\test_recommendations.py ...                                        [ 89%]
tests\test_validation.py ....                                            [100%]

====================== 38 passed in 21.15s ======================
```

### 2️⃣ Ground-Truth Database Mathematical Verification
Audited via `python scripts/qa_verification.py` comparing raw SQLite records directly against KPI API calculation services:

| Operational Metric | Raw Database Ground Truth | KPI Calculation Service | Verification Status |
| :--- | :---: | :---: | :---: |
| **Food Waste Percentage (%)** | **8.1%** | **8.1%** | `EXACT MATCH` |
| **Cost of Perishable Waste** | **Rs. 11,938,818** | **Rs. 11,938,818** | `EXACT MATCH` |
| **Estimated Cost Savings (Est.)** | **Rs. 6,599,355** | **Rs. 6,599,355** | `EXACT MATCH` |
| **Estimated CO2 Avoided (Est.)** | **45,662.5 kg** | **45,662.5 kg** | `EXACT MATCH` |

*Audited across 6,570 sales records and 3,881 inventory batch receipts spanning 18 products.*

### 3️⃣ Forecasting Model Tournament & Backtesting Results

| Product ID & Name | Champion Model | MAE | RMSE | MAPE (%) | Accuracy (%) | Tournament Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `PRD-CKD-001` Chicken Rice & Curry | **Holt-Winters Additive** | **14.96** | **23.20** | **17.69%** | **82.31%** | `Selected (Lowest MAPE)` |
| `PRD-BAK-001` Kimbula Banis | **Holt-Winters Additive** | **4.54** | **6.16** | **8.19%** | **91.81%** | `Selected (Lowest MAPE)` |
| `PRD-DAI-001` Highland Fresh Milk | **Holt-Winters Additive** | **4.86** | **8.05** | **8.69%** | **91.31%** | `Selected (Lowest MAPE)` |

### 4️⃣ Playwright End-to-End Browser Audit
- **Zero Console Errors**: Verified across all 18 routes on Desktop (1440x900), Tablet (768x1024), and Mobile (390x844).
- **Zero Horizontal Overflow**: `scrollWidth === clientWidth` strictly verified across all breakpoints.

---

## 📐 UI Conventions & Overlay Architecture

FoodSense implements an enterprise-grade overlay system adhering to WAI-ARIA authoring practices, unified across all dialogs, drawers, popovers, and notifications:

```mermaid
flowchart TD
    User([👤 User Action]) --> Trigger{Interaction Type}
    
    Trigger -->|Click Outside| DualCheck{Mousedown & Mouseup<br/>Both on Backdrop?}
    DualCheck -->|No - Drag or Text Select| Ignore[Preserve Overlay State]
    DualCheck -->|Yes| DirtyCheck{Form has<br/>Unsaved Changes?}
    
    DirtyCheck -->|No| Close[Close Overlay & Restore Focus]
    DirtyCheck -->|Yes| Prompt[Show Stacked Alert:<br/>Discard Unsaved Changes?]
    
    Prompt -->|Keep Editing| Return[Stay in Form]
    Prompt -->|Discard Changes| Discard[Close All & Reset State]
    
    Trigger -->|Press Escape| StackMgr[Global Overlay Stack Manager]
    StackMgr --> TopLayer[Dismiss Strictly Top-Most Overlay Layer]
```

---

## 📊 Mathematical & Methodological Foundations

### 1. Holt-Winters Additive Exponential Smoothing
For time series $y_t$ with seasonal period $s = 7$ (days in a week):
$$\ell_t = \alpha (y_t - s_{t-s}) + (1 - \alpha)(\ell_{t-1} + b_{t-1})$$
$$b_t = \beta (\ell_t - \ell_{t-1}) + (1 - \beta) b_{t-1}$$
$$s_t = \gamma (y_t - \ell_t) + (1 - \gamma) s_{t-s}$$
$$\hat{y}_{t+h} = \ell_t + h b_t + s_{t-s+h_m}$$
where $\alpha, \beta, \gamma \in [0, 1]$ are smoothing parameters estimated by maximum likelihood.

### 2. Evaluation Metrics (Rolling 28-Day Backtesting)
$$\text{MAE} = \frac{1}{n}\sum_{t=1}^n |y_t - \hat{y}_t| \qquad \text{RMSE} = \sqrt{\frac{1}{n}\sum_{t=1}^n (y_t - \hat{y}_t)^2}$$
$$\text{MAPE} = \frac{100\%}{n}\sum_{t=1}^n \left|\frac{y_t - \hat{y}_t}{y_t}\right| \qquad \text{Accuracy} = \max(0, 100 - \text{MAPE})$$

### 3. Replenishment Order Policy
$$\text{Safety Stock} = Z_{\alpha} \times \sigma_{\text{lead}} \times \sqrt{L} \approx \text{SafetyStock\%} \times \text{Demand}_{\text{LeadTime}}$$
$$\text{Net Deficit} = \max\Big(0, \, \text{Demand}_{\text{LeadTime}} + \text{SafetyStock} - \text{UsableStock}\Big)$$
$$\text{Order Qty} = \left\lceil \frac{\text{Net Deficit}}{\text{PackSize}} \right\rceil \times \text{PackSize}$$

### 4. Environmental Impact Factors
- **Greenhouse Gas Emissions**: $2.5\text{ kg CO}_2\text{e} / \text{kg food waste}$ (IPCC Waste Model / Central Environmental Authority of Sri Lanka standard).
- **Embedded Water Footprint**: $1,200\text{ liters} / \text{kg food waste}$ (Water Footprint Network perishable benchmark).
- **Nutritional Equivalence**: $0.4\text{ kg edible food} = 1\text{ nutritious meal portion}$.

---

## 🗺️ Roadmap & Future Vision

1. 🔄 **Direct POS & ERP Cloud Sync**: Bidirectional synchronization with commercial Point of Sale systems (Keells POS, Arpico ERP, Singer POS) via scheduled webhooks.
2. 🤖 **Deep Neural Time-Series Models**: Ingesting high-dimensional exogenous time series (real-time Colombo rainfall radar, wholesale Pettah market auction prices) using **Temporal Fusion Transformers (TFT)**.
3. 📱 **Automated Barcode & RFID Dock Scanning**: Native mobile companion app enabling dock workers to scan incoming batch barcodes upon receiving.
4. 🚛 **Inter-Branch Stock Balancing**: Automated transfer recommendations directing surplus near-expiry stock from low-traffic branches to high-velocity metropolitan outlets before spoilage occurs.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright © 2026 Sasanka Sadeep. All rights reserved.
