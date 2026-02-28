# InsightPlug - EV Economic Literacy Tool

A research-oriented web application that provides personalized Electric Vehicle (EV) cost assessments grounded in behavioral economics, local rule-based explanations, and geographic context. Built to help users make informed decisions about EV adoption by decomposing Total Cost of Ownership (TCO) into psychologically actionable signals: **Monthly Surplus** (addressing temporal discounting) and **Daily Asset Utilization** (addressing capital efficiency).

**Key Innovation**: Rather than presenting abstract lifetime savings, InsightPlug reframes economic benefits through two complementary lenses:
- **Monthly Surplus**: Transforms $5,000 lifetime savings into $42/month disposable income
- **Daily Asset Utilization**: Reveals battery over-provisioning as an efficiency metric rather than a range-anxiety metric

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, TypeScript |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS 3.4, PostCSS, Autoprefixer |
| **Markdown** | Marked (for chat rendering) |

---

## 📁 Project Structure

```
InsightPlug/
├── App.tsx                    # Main application component
├── index.tsx                  # Application entry point
├── types.ts                   # TypeScript type definitions
├── constants.tsx              # Global constants (icons, etc.)
├── index.css                  # Global styles & Tailwind imports
│
├── components/                # React components
│   ├── ConfigurationWizard.tsx # Step-1 configuration UI
│   ├── SimulationLab.tsx      # Analysis view (left sidebar + metrics)
│   ├── ResultsPanel.tsx       # Metrics & maps
│   ├── TheoryExplainer.tsx    # Theory explanations (expandable)
│   └── ErrorBoundary.tsx      # UI error boundary
│
├── services/                  # Business logic & data services
│   ├── dataCatalog.ts        # EV models, regions, electricity rates
│   ├── localAdvisor.ts       # Local expert reasoning
│   └── apiLimiter.ts         # Per-browser rate limiting
│
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── package.json              # Dependencies & scripts
└── metadata.json             # App metadata & permissions
```

---

## 🎯 Key Components

### **SimulationLab** (`SimulationLab.tsx`)
The primary analysis interface with asymmetric layout:

**Left Sidebar** (Control & Education):
- Quick configuration panel (region, EV model, daily miles, home charging %)
- Three expandable theory cards explaining Money dimension signals
- Expert AI chat interface with rate-limiting (20 questions/session)
  - **Rule-based mode** (default): Keyword pattern matching via `buildExpertReply()`
  - **OpenAI mode** (optional): Real-time responses from GPT-4 with context injection

**Right Panel** (Results Dashboard):
- **Top Row**: Monthly Surplus (immediate liquidity), TCO comparison, EV cost breakdown
- **Middle Row**: Daily Asset Utilization (%) with capital state indicator + geographic grounding map
- **Bottom Section**: Charging interval (days between charges) and time efficiency metrics

**Calculation Engine**: Uses `calculateMetrics` useMemo hook to compute all economic signals in real-time

---

### **ResultsPanel** (`ResultsPanel.tsx`)
Displays the Money dimension through four key visualizations:

1. **Monthly Surplus Card**
   - Shows Legacy TCO (monthly fuel cost for ICE)
   - Central large display: +$XX/month in immediate disposable income
   - Reframes savings from lifetime abstractions to monthly liquidity

2. **TCO Comparison Card**
   - Legacy Total Cost vs Efficient (EV) Total Cost
   - 5-year ownership horizon
   - Clear visual contrast with color coding (gray vs emerald)

3. **Daily Asset Utilization Card**
   - Percentage bar visualization (0–100%)
   - Capital state indicator: "Over-Provisioned" or "Optimally Utilized"
   - Subtly conveys capital efficiency without range-anxiety framing

4. **Geographic Context & Charging Interval**
   - Embedded Google Map showing user's region
   - Charging interval: "Every X Days" with interaction frequency
   - Links abstract metrics to spatial/temporal reality

---

### **TheoryExplainer** (`TheoryExplainer.tsx`)
Expandable educational cards for behavioral economics grounding:

- **Monthly Surplus Card** (`signal="surplus"`)
  - Title: "Monthly Surplus" | Subtitle: "Temporal Discounting"
  - Explains: Why people undervalue future savings; psychological benefit of monthly framing
  
- **DAU Card** (`signal="dau"`)
  - Title: "Daily Asset Utilization" | Subtitle: "Capital Efficiency"
  - Explains: Why battery over-provisioning reveals inefficient capital allocation
  
- **Charging Card** (`signal="charging"`)
  - Title: "Charging Interval" | Subtitle: "Time Cost Reduction"
  - Explains: Quantified labor savings from reduced fuel events

- **Framework Card** (`signal="framework"`)
  - Becker's Household Production Theory foundation
  - Money vs Time constraints as primary EV adoption determinants

---

### **ResultsPanel** (`ResultsPanel.tsx`)
Displays key economic signals:
- Monthly surplus
- TCO comparison
- Daily asset utilization (% of range used)
- Charging interval (days between charges)

### **TheoryExplainer** (`TheoryExplainer.tsx`)
Expandable theory cards that connect each signal to the underlying reasoning framework.

### **Data Catalog** (`dataCatalog.ts`)
Centralized data repository:
- EV model types (public labels) with detailed benchmarks
- ICE benchmarks for comparison
- Regional data (states, electricity rates)
- Default assumptions (2026 pricing)

---

## 🧠 Theoretical Foundation

### Becker's Household Production Theory

InsightPlug applies **Gary Becker's Household Production Theory** to EV adoption:

**Core Premise**: Households are constrained by two scarce resources:
1. **Money** (budget, capital allocation, liquidity)
2. **Time** (labor, opportunity cost, convenience)

**Application to EV Adoption**:
- Vehicles are capital assets that convert money + time inputs into mobility outputs
- EV advantages compound across both dimensions:
  - **Money**: Lower operating costs (energy < fuel), but higher upfront capital
  - **Time**: Reduced refueling labor (home charging), but potential charging time trade-offs

**InsightPlug's Role**: 
- Decompose these constraints into visible, actionable signals
- Monthly Surplus → Makes money constraint comprehensible
- Daily Asset Utilization → Reveals capital efficiency
- Charging Interval → Quantifies time constraint improvements

---

## 🔧 Configuration

### Default Settings (2026)

The app includes realistic 2026 defaults:
- **Gas Price**: $3.45/gallon
- **Electricity Rate**: $0.1789/kWh (national average)
- **EV Efficiency**: 3.8 miles/kWh
- **ICE Efficiency**: 28 MPG (varies by model)
- **Public Charging Multiplier**: 2.5x home rate

### Rate Limiting

To avoid abuse, the expert chat is rate limited per browser (localStorage):
- **Max total questions**: 20
- **Max per minute**: 6

Limits are enforced in `services/apiLimiter.ts` and persisted in local storage.

---

## 📊 Data Sources & Assumptions (2026)

### Fuel & Energy
- **Gas Price**: $3.45/gallon (2026 forecast)
- **Electricity Rate**: $0.1789/kWh (national average, state-specific overrides available)
- **Public Charging Multiplier**: 2.5× home charging rate (markup for DCFC/L2)

### Vehicle Efficiency
- **ICE Efficiency**: 28 MPG (varies by model; configurable)
- **EV Efficiency**: 3.8 kWh/mile (modern EV average; configurable)
- **EV Efficiency Range**: 3.5–4.5 kWh/mile depending on model class

### Financial Assumptions
- **Purchase Prices**: 2026 MSRP data from major EV manufacturers
- **ICE Depreciation**: 15% annually (standard auto industry baseline)
- **EV Depreciation**: 10% annually (reflects improving battery technology & perceived value retention)
- **EV Maintenance Savings**: $500/year vs ICE (no oil changes, longer brake life, etc.)
- **Ownership Horizon**: 5 years (standard auto loan term) and configurable to 10 years

### Regional Data
- **States Covered**: All 50 US states + DC (via EIA electricity rate data)
- **County-Level Daily Miles**: Based on NHTS data (National Household Travel Survey 2017)
- **State Electricity Rates**: EIA, U.S. Energy Information Administration (updated 2026)

### Data Catalog Source Files
See `services/dataCatalog.ts` for:
- `EV_MODELS[]` – Tesla, Chevy, Nissan, Hyundai, BMW, etc. (with ICE benchmarks)
- `REGIONS[]` – US counties with FIPS codes and regional daily mileage
- `ELECTRICITY_RATES[]` – State-by-state pricing
- `STATES[]` – State abbreviations and metadata

---

## 💰 Money Dimension: Economic Signals

InsightPlug decomposes TCO into two actionable economic signals grounded in behavioral economics:

### 1. **Monthly Surplus** (Temporal Discounting Mitigation)

**Problem Addressed**: People systematically undervalue future savings due to temporal discounting.

**Formula**:
```
Legacy Cost ($/month) = (Daily Miles × 30.4 / ICE MPG) × Gas Price
EV Cost ($/month) = (Daily Miles × 30.4 / EV Efficiency) × Blended Rate
Blended Rate = (Home% × State Rate) + ((1 - Home%) × State Rate × 2.5)
Monthly Surplus = Legacy Cost - EV Cost
```

**Example**:
- 40 daily miles, 28 MPG vehicle, $3.45/gallon gas
- Legacy: (40 × 30.4 ÷ 28) × $3.45 = **$150/month**
- EV at 3.8 kWh/mile, 75% home charging, $0.1789/kWh
- EV Cost: (40 × 30.4 ÷ 3.8) × blended rate = **$78/month**
- **Monthly Surplus: $72/month**

**Psychological Effect**: 
- Abstract: "$5,000 savings over 10 years" (difficult to process)
- Concrete: "$42/month in new disposable income" (psychologically present)

**Code Location**: `SimulationLab.tsx` lines 31–36

---

### 2. **Daily Asset Utilization (DAU)** (Capital Efficiency)

**Problem Addressed**: Consumers obsess over range (addressing range anxiety) while ignoring battery over-provisioning (a capital efficiency issue).

**Formula**:
```
DAU (%) = (Daily Miles / EPA Range) × 100
Capital State = Over-Provisioned if DAU < 30%
```

**Example**:
- 40 daily miles, Tesla Model 3 with 300-mile range
- DAU = (40 ÷ 300) × 100 = **13.3%**
- Interpretation: User only consumes 13.3% of battery capacity daily
- 86.7% of battery capacity is "over-provisioned"
- Marginal benefit of additional range ≈ $0

**Economic Interpretation**:
- Extra capital investment in battery capacity → Negligible additional utility
- Battery over-provisioning is economically inefficient
- Shifts focus from range anxiety to capital allocation rationality

**Code Location**: `SimulationLab.tsx` line 36

---

### 3. **Charging Interval** (Time Cost Reduction)

**Formula**:
```
Charging Interval (days) = EPA Range / Daily Miles
Interaction Frequency = 365 / Charging Interval
Time Savings ≈ (30 - Charging Interval) × 15 min per fuel event per year
```

**Example**:
- 300-mile range ÷ 40 daily miles = **7.5 days** (rounds to 7 days)
- vs. Traditional: refuel every 6-7 days (10 min × 52 events/year = 520 min labor)
- EV home charging: No labor (autonomous charging)
- **Annual time savings: ~8.7 hours of labor**

**Code Location**: `SimulationLab.tsx` line 37, `ResultsPanel.tsx` lines 118–148

---

### TCO (Total Cost of Ownership) Baseline

**5-Year Total Cost**:
```
ICE Total Cost = 
  Purchase Price 
  + (Annual Fuel Cost × 5 years)
  + (Annual Depreciation @ 15% × 5 years)
  + (Maintenance @ $1,500/year × 5 years)

EV Total Cost = 
  Purchase Price 
  + (Annual Energy Cost × 5 years)
  + (Annual Depreciation @ 10% × 5 years)
  - (Maintenance Savings @ $500/year × 5 years)

TCO Savings = ICE Total Cost - EV Total Cost
```

**Code Location**: `SimulationLab.tsx` lines 42–55

---

## 🔄 User Workflow

1. **Configuration Wizard** (Step 1)
   - Select region (affects daily miles baseline & electricity rates)
   - Choose EV model (sets EPA range, MSRP, ICE benchmark)
   - Input daily miles (personalizes all economic signals)
   - Adjust home charging ratio (0–100%)
   - Click "Analyze"

2. **Simulation Lab** (Step 2)
   - View all Money dimension signals on right panel
   - Adjust configuration in left sidebar (real-time recalculation)
   - Explore theory behind each signal (TheoryExplainer cards)
   - Ask expert AI questions about savings, range, charging, etc.
   - Rate-limited to 20 questions/session (anti-abuse)

3. **Expert Chat**
   - **Default**: Rule-based pattern matching (no API required)
   - **With API Key**: Real-time responses from OpenAI GPT-4 (set `VITE_OPENAI_API_KEY` in `.env.local`)
   - Supports questions about: savings, break-even, range, charging frequency, economic trade-offs
   - Automatic fallback to rule-based if API fails

4. **Go Back**
   - Click "← Edit Configuration" to return to wizard
   - Reconfigure and re-analyze to compare scenarios

---

## 🔐 OpenAI Integration (Optional)

### Enable Real-Time AI Chat

To get real-time responses from GPT-4 instead of rule-based answers:

#### Step 1: Get OpenAI API Key
1. Visit [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Copy the key (format: `sk-proj-...`)

#### Step 2: Configure .env.local
Create or edit `.env.local` in project root (same folder as `package.json`):

```bash
# .env.local
VITE_OPENAI_API_KEY=sk-proj-your-api-key-here
```

**Important**: Never commit `.env.local` to git (already in `.gitignore`)

#### Step 3: Start Dev Server
```bash
npm run dev
```

The app will auto-detect your API key and enable OpenAI mode.

#### Step 4: Test It
Ask the Expert Chat questions like:
- "Why is my battery over-provisioned?"
- "How should I think about upfront costs?"
- "What's the connection between daily miles and utilization?"

You'll get personalized, real-time responses!

### Configuration
```bash
# .env.local (optional settings)
VITE_OPENAI_API_KEY=sk-proj-xxxxx           # Required for OpenAI mode
VITE_OPENAI_MODEL=gpt-4o-mini              # Optional (default: gpt-4o-mini)
VITE_API_ENDPOINT=https://api.openai.com/v1/chat/completions  # Optional
```

### Cost
- **Per question**: ~$0.01-$0.03
- **20 questions/session**: ~$0.20-$0.60
- **Very cheap for low-traffic apps**

See [OPENAI_SETUP.md](./OPENAI_SETUP.md) for detailed setup and troubleshooting.

## ⚙️ Rate Limiting & Performance

**API Limiting** (`services/apiLimiter.ts`):
- **Per-session limit**: 20 total questions
- **Per-minute limit**: 6 questions
- Enforced via localStorage (survives page reloads)
- Graceful rate-limit messages when limits exceeded

**Performance Optimizations**:
- All calculations use React `useMemo()` to avoid recalculation on render
- Lazy-loaded Google Maps embed (spatial grounding)
- Markdown parsing via `marked` library (chat messages)

---

## 📦 Dependencies

**Core Framework**:
- `react@19.x` – UI components
- `typescript@5.x` – Type safety
- `vite@6.x` – Build tool & dev server

**Styling**:
- `tailwindcss@3.4.x` – Utility-first CSS
- `postcss@8.x` – CSS processing
- `autoprefixer@10.x` – Vendor prefixes

**Utilities**:
- `marked@11.x` – Markdown parsing (chat messages)

**Development**:
- `@types/react@19.x` – React type definitions
- `@types/node@20.x` – Node.js types

See `package.json` for exact versions and all dependencies.

---

## 🤝 Contributing

This is a private research project. For questions or collaboration inquiries, please contact the maintainer.

---

## 📄 License

**Private Project** - All rights reserved.
