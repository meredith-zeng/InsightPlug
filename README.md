# InsightPlug

An EV economic literacy tool that helps consumers understand the real cost and convenience trade-offs of switching from a gas vehicle to an EV, grounded in their specific location and driving habits.

**Live demo:** deployed on Vercel  
**Stack:** React + TypeScript, Vite, Tailwind CSS, Vercel serverless functions, OpenAI GPT-4o-mini

---

## How It Works

Users configure their profile (region, EV model, daily miles, home charging ratio) and the app computes three economic signals in real time. An AI assistant (GPT-4o-mini) answers follow-up questions grounded in those signals.

---

## Economic Model & Formulas

All calculations are in `components/SimulationLab.tsx` (`calculateMetrics` useMemo).

### 1. Monthly Gas Cost (Legacy TCO)

```
legacyCost = (dailyMiles × 30.4 / iceMpg) × gasPrice
```

- `dailyMiles` — county-level per-capita average (miles/day), from FHWA data
- `iceMpg` — EPA combined MPG of the ICE benchmark vehicle
- `gasPrice` — U.S. regular conventional gasoline price ($/gal), default $3.45 (EIA 2026)

### 2. Monthly EV Operating Cost (Efficient TCO)

```
blendedRate = homeChargingRatio × stateRate
            + (1 - homeChargingRatio) × stateRate × 2.5

efficientCost = (dailyMiles × 30.4 / evEfficiency) × blendedRate
```

- `stateRate` — state-level residential electricity rate ($/kWh), from EIA Electric Power Monthly
- `homeChargingRatio` — user-configured fraction of charging done at home (0–1)
- `2.5` — public charger price multiplier (public rates average ~2.5× residential)
- `evEfficiency` — EV efficiency in miles/kWh, default 3.8 mi/kWh for modern EVs

### 3. Monthly Surplus

```
monthlySurplus = legacyCost - efficientCost
```

Positive = EV saves money each month vs. gas. Negative = EV costs more to operate.

### 4. Daily Asset Utilization (DAU)

```
dailyAssetUtilization = (dailyMiles / epaRange) × 100    [capped at 100%]
```

Measures what fraction of the battery's EPA range is actually consumed per day. Low DAU (e.g. 10%) indicates the selected EV is over-provisioned for the user's daily needs.

### 5. Charging Interval

```
interval = floor(epaRange / dailyMiles)    [minimum 1 day]
```

Estimated number of days between home charges at the user's driving pace.

---

## Data Sources

### 1. Daily Vehicle Miles Traveled per Capita by County

**File:** `data_sources/Daily Miles per Capita.csv`  
**Publisher:** Federal Highway Administration (FHWA)  
**Update frequency:** No fixed schedule; released periodically as part of national travel surveys. The version used here reflects a recent survey cycle (county-level estimates).

**Schema (CSV, one row per county):**

| Column | Description |
|--------|-------------|
| `Name` | County name (e.g. "Kings County, NY") |
| `State` | Two-letter state abbreviation |
| `FIPS` | 5-digit county FIPS code — used as the primary key in `dataCatalog.ts` |
| `Geo Unit` | Geography type (always "county" here) |
| `Population` | County population |
| `Total Miles` | Total daily miles traveled across all modes in the county |
| `Total Miles per Cap` | **The value we use** — average daily miles per person across all modes |
| `Vehicle per Cap Miles` | Daily miles by private auto only |
| `Private Auto Total Miles` | Absolute private auto miles |
| `Transit Total Miles` | Transit miles |
| `Biking/Walking Total Miles` | Active transport miles |
| `% Vehicle Miles` | Share of total miles that are by vehicle |

We use `Total Miles per Cap` (not `Vehicle per Cap Miles`) as `dailyMiles` in the model — it captures the full mobility footprint, consistent with a user replacing all motorized trips with an EV.

---

### 2. State Residential Electricity Rates

**File:** `data_sources/Electric Power Monthly - U.S. Energy Information Administration (EIA).pdf`  
**Table:** 5.6.A — *Average Price of Electricity to Ultimate Customers by End-Use Sector, by State*  
**Publisher:** U.S. Energy Information Administration (EIA), Form EIA-861M (Monthly Electric Power Industry Report)  
**Update frequency:** Monthly. The PDF snapshot used here covers **December 2025** (preliminary) and December 2024 (final).

**Schema (state × sector matrix, cents per kWh):**

| Column group | Description |
|---|---|
| Residential | Rate paid by household customers — **the value we use** |
| Commercial | Rate paid by businesses |
| Industrial | Rate paid by industrial facilities |
| Transportation | Rate paid for EV charging infrastructure |
| All Sectors | Blended average |

Each row is a state or Census division. We extract the **Residential, December 2025** column for the three states covered:

| State | Residential rate used | Source value |
|-------|-----------------------|--------------|
| NY | $0.2224/kWh | 22.24 ¢/kWh (Middle Atlantic → New York row) |
| CA | $0.2951/kWh | 34.71 ¢/kWh Pacific Contiguous → California (preliminary Dec 2025) |
| TX | $0.1446/kWh | 15.87 ¢/kWh West South Central → Texas |

> Note: CA rate in `dataCatalog.ts` ($0.2951) reflects a slightly earlier snapshot; the Dec 2025 preliminary figure is 34.71 ¢/kWh and may be updated in a future release.

---

### 3. U.S. Retail Gasoline Price

**File:** `data_sources/Regular_Conventional_price.xls`  
**Publisher:** U.S. Energy Information Administration (EIA) — Weekly Retail Gasoline and Diesel Prices  
**Update frequency:** Weekly (every Monday for the prior week). The XLS contains the full historical weekly series.

**What it contains:** Weekly U.S. average retail price for regular conventional gasoline ($/gallon), broken down by region (U.S. total, PADD regions). We use the **U.S. national average**, set to **$3.45/gal** as the 2026 baseline default in `App.tsx`.

---

### 4. EV & ICE Vehicle Specs

**File:** `data_sources/Car-Models-compare-Side-by-Side.pdf`  
**Source:** [fueleconomy.gov](https://www.fueleconomy.gov) — Side-by-Side Vehicle Comparison tool  
**Publisher:** U.S. Department of Energy / U.S. Environmental Protection Agency (EPA), administered by Oak Ridge National Laboratory  
**Update frequency:** Annually, when EPA releases model-year ratings. The snapshot used covers **model year 2025**.

**What it contains:** A four-vehicle comparison (Tesla Model 3 LR RWD, Tesla Model Y LR RWD, Toyota RAV4, Toyota Corolla) showing:

| Field | Description |
|-------|-------------|
| MSRP | Manufacturer suggested retail price |
| EPA Range | Total range for EVs (miles); tank size for ICE |
| MPGe / MPG | Combined, city, highway efficiency |
| Annual Fuel Cost | Estimated annual cost at standard assumptions (15,000 mi/yr, 45% hwy / 55% city) |
| Cost to Drive 25 Miles | $/25 mi at current fuel prices |
| You Save | 5-year fuel savings vs. average new vehicle (28 MPG baseline) |

Values extracted into `services/dataCatalog.ts`:

| Vehicle | MSRP | EPA Range | MPG/MPGe |
|---------|------|-----------|----------|
| Tesla Model 3 LR RWD (2025) | $42,490 | 363 mi | 137 MPGe combined |
| Tesla Model Y LR RWD (2025) | $44,990 | 337 mi | 125 MPGe combined |
| Toyota Corolla (ICE benchmark) | $25,183 avg | — | 34 MPG combined |
| Toyota RAV4 (ICE benchmark) | $33,403 avg | — | 30 MPG combined |

MSRP and tank data provided by Edmunds.com, Inc. per fueleconomy.gov footnotes.

---

### EV Models Included

| EV | EPA Range | MSRP | ICE Benchmark |
|----|-----------|------|---------------|
| Tesla Model 3 Long Range RWD (2025) | 363 mi | $42,490 | Toyota Corolla — $25,183 / 34 MPG combined |
| Tesla Model Y Long Range RWD (2025) | 337 mi | $44,990 | Toyota RAV4 — $33,403 / 30 MPG combined |

### Regions Covered

Counties in **New York**, **California** (Bay Area, Southern CA, Sacramento, Northern CA), and **Texas** (Dallas, Houston). Each county uses its FHWA per-capita daily miles figure directly.

---

## Architecture

```
ConfigurationWizard   →   SimulationLab
  (user profile)            ├── calculateMetrics (formulas above)
                            ├── ResultsPanel (visualizations)
                            ├── Charging Interval card
                            └── AI chat → POST /api/chat → OpenAI GPT-4o-mini
```

The AI assistant receives the user's computed metrics and profile as context. It is instructed to explain trade-offs through the Money and Time dimensions, address behavioral biases (temporal discounting, range anxiety), and keep responses grounded in the user's specific numbers.

### Chat API

`api/chat.ts` is a Vercel serverless function. It reads `OPENAI_API_KEY` from Vercel environment variables — the key is never exposed to the browser.

Rate limiting: 6 requests/minute, 20 requests/session (enforced client-side in `services/apiLimiter.ts`).

---

## Setup

```bash
npm install
npm run dev
```

For the AI chat to work in production, set `OPENAI_API_KEY` in Vercel → Project Settings → Environment Variables, then redeploy.
