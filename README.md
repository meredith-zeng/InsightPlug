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

- `dailyMiles` — county-level per-capita average (miles/day), from Replica ([2023 county travel report](https://www.replicahq.com/post/the-average-american-adult-travels-more-than-40-miles-per-day-in-2023-see-how-residents-in-your-county-rank))
- `iceMpg` — EPA combined MPG of the ICE benchmark vehicle
- `gasPrice` — U.S. all grades all formulations retail gasoline price ($/gal), default $4.25 (EIA weekly, 2026-04-13)

### 2. Monthly EV Operating Cost (Efficient TCO)

```
blendedRate = homeChargingRatio × homeRate
            + (1 - homeChargingRatio) × publicRate

efficientCost = (dailyMiles × 30.4 / evEfficiency) × blendedRate
```

- `homeRate` — state-level residential electricity rate ($/kWh), from EIA Electric Power Monthly
- `publicRate` — state-level public/commercial EV charging rate ($/kWh), from AAA EV Charging Prices (L1/L2/L3 blended). Fallback is AAA U.S. average $0.417/kWh.
- `homeChargingRatio` — user-configured fraction of charging done at home (0–1)
- `evEfficiency` — EV efficiency in miles/kWh, default 3.8 mi/kWh for modern EVs

### 3. Monthly Fuel Savings

```
monthlyFuelSavings = legacyCost - efficientCost
```

Positive = EV saves money each month vs. gas (fuel/energy cost only — excludes depreciation, maintenance, insurance). Negative = EV costs more to operate.

### 4. Daily Battery Adequacy (DBA)

```
dailyBatteryAdequacy = (dailyMiles / epaRange) × 100    [capped at 100%]
```

Measures what fraction of the battery's EPA range is actually consumed per day. Low DBA (e.g. 10%) indicates the selected EV is over-provisioned for the user's daily needs.

### 5. Charging Frequency

```
chargingFrequency = floor(epaRange / dailyMiles)    [minimum 1 day]
```

Estimated number of days between home charges at the user's driving pace.

---

## Data Sources

### 1. Daily Vehicle Miles Traveled per Capita by County

**File:** `data_sources/Daily Miles per Capita.csv`  
**Publisher:** Replica ([replicahq.com](https://www.replicahq.com/post/the-average-american-adult-travels-more-than-40-miles-per-day-in-2023-see-how-residents-in-your-county-rank))  
**Update frequency:** Annual county-level travel estimates. The version used here is from Replica's 2023 report on per-adult daily travel by U.S. county.

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
**Table:** 5.6.A — *Average Price of Electricity to Ultimate Customers by End-Use Sector, by State* ([live table](https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a))  
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

Each row is a state or Census division. We extract the **Residential, December 2025** column for every covered state:

| State | Residential rate used | EIA Dec 2025 (¢/kWh) |
|-------|-----------------------|----------------------|
| NY | $0.2224/kWh | 27.39 |
| CA | $0.2951/kWh | 34.71 |
| TX | $0.1446/kWh | 15.87 |
| FL | $0.1502/kWh | 15.02 |
| WA | $0.1333/kWh | 13.33 |
| MA | $0.3088/kWh | 30.88 |
| IL | $0.1707/kWh | 17.07 |
| GA | $0.1367/kWh | 13.67 |
| AZ | $0.1546/kWh | 15.46 |
| CO | $0.1612/kWh | 16.12 |
| OR | $0.1494/kWh | 14.94 |

> Note: NY, CA, and TX values in `dataCatalog.ts` reflect an earlier EIA snapshot that slightly lags the Dec 2025 preliminary figure (e.g. CA's Dec 2025 prelim is 34.71 ¢/kWh vs. the $0.2951 stored value). Newer states use the Dec 2025 preliminary value directly.

---

### 3. Public / Commercial EV Charging Prices

**File:** `data_sources/AAA EV Charging Prices.pdf`  
**Publisher:** AAA — [EV Charging Prices](https://gasprices.aaa.com/ev-charging-prices/)  
**Update frequency:** Daily national and per-state averages across all commercial/public charging (Level 1, Level 2, and Level 3/DC Fast Charging). Snapshot used: April 2026.

**What it contains:** Per-state average retail price paid at public chargers, with charger counts per state. National average: **$0.417/kWh**. Values stored in `ELECTRICITY_RATES.publicPricePerKwh`:

| State | Public charging rate | Chargers sampled |
|-------|----------------------|------------------|
| NY | $0.399/kWh | 20,630 |
| CA | $0.465/kWh | 28,279 |
| TX | $0.415/kWh |  5,393 |
| FL | $0.411/kWh |  7,762 |
| WA | $0.396/kWh |  3,908 |
| MA | $0.395/kWh |  6,392 |
| IL | $0.433/kWh |  2,654 |
| GA | $0.419/kWh |  2,919 |
| AZ | $0.437/kWh |  1,867 |
| CO | $0.376/kWh |  3,214 |
| OR | $0.406/kWh |  1,923 |

Used in the `blendedRate` formula for the `(1 − homeChargingRatio)` portion of charging done away from home. For states not in the table, the U.S. average ($0.417/kWh) is used as a fallback via `PUBLIC_CHARGING_US_AVG`.

---

### 4. U.S. Retail Gasoline Price

**File:** `data_sources/PET_PRI_GND_A_EPM0_PTE_DPGAL_W.xls`  
**Publisher:** U.S. Energy Information Administration (EIA) — [Weekly U.S. All Grades All Formulations Retail Gasoline Prices](https://www.eia.gov/dnav/pet/pet_pri_gnd_a_epm0_pte_dpgal_w.htm)  
**Update frequency:** Weekly (every Monday for the prior week). The XLS contains the full historical weekly series (1993–present), plus regional (PADD), state, and city breakdowns.

**What it contains:** Weekly U.S. average retail price for all grades, all formulations motor gasoline ($/gallon), with national, PADD-region, state, and select-city series. We use the **U.S. national average** (`Data 1` sheet, series `EMM_EPM0_PTE_NUS_DPG`), set to **$4.25/gal** in `App.tsx` — the most recent weekly value (week of 2026-04-13).

---

### 5. EV & ICE Vehicle Specs

**File:** `data_sources/Car-Models-compare-Side-by-Side.pdf`  
**Source:** [fueleconomy.gov Side-by-Side Vehicle Comparison tool](https://www.fueleconomy.gov/feg/Find.do?action=sbsSelect)  
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

Counties in:

- **New York** — Brooklyn, Manhattan
- **California** — Bay Area, Southern CA, Sacramento, Northern CA (13 counties)
- **Texas** — Dallas, Houston
- **Florida** — Miami-Dade, Broward, Orange (Orlando), Hillsborough (Tampa)
- **Washington** — King (Seattle), Pierce (Tacoma), Snohomish
- **Massachusetts** — Suffolk (Boston), Middlesex, Norfolk, Worcester
- **Illinois** — Cook (Chicago), DuPage, Lake
- **Georgia** — Fulton (Atlanta), DeKalb, Cobb, Gwinnett
- **Arizona** — Maricopa (Phoenix), Pima (Tucson)
- **Colorado** — Denver, Arapahoe, Jefferson, El Paso (Colorado Springs)
- **Oregon** — Multnomah (Portland), Washington, Clackamas

Each county uses its Replica per-capita daily miles figure directly.

---

## Architecture

```
ConfigurationWizard   →   SimulationLab
  (user profile)            ├── calculateMetrics (formulas above)
                            ├── ResultsPanel (visualizations)
                            ├── Charging Frequency card
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
