# InsightPlug - EV Economic Literacy Tool

A research-oriented web application that provides personalized Electric Vehicle (EV) cost assessments grounded in behavioral economics, local rule-based explanations, and geographic context. Built to help users make informed decisions about EV adoption by decomposing Total Cost of Ownership (TCO) into psychologically actionable signals: **Monthly Surplus** (addressing temporal discounting) and **Daily Asset Utilization** (addressing capital efficiency).

**Key Innovation**: Rather than presenting abstract lifetime savings, InsightPlug reframes economic benefits through two complementary lenses:
- **Monthly Surplus**: Transforms $5,000 lifetime savings into $42/month disposable income
- **Daily Asset Utilization**: Reveals battery over-provisioning as an efficiency metric rather than a range-anxiety metric

---

## 🚀 Quick Start

### Local Development
```bash
git clone https://github.com/yourusername/InsightPlug.git
cd InsightPlug
npm install
npm run dev
```

Visit **http://localhost:3000**

The app works out-of-the-box with a rule-based expert advisor (no API key required).

### Production Deployment
1. Push code to GitHub
2. Connect to Vercel (https://vercel.com/new)
3. Deploy with one click
4. (Optional) Add `OPENAI_API_KEY` environment variable for AI features

See [Deployment Guide](#-deployment) below.

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, TypeScript, Vite 6 |
| **Styling** | Tailwind CSS 3.4, PostCSS, Autoprefixer |
| **Backend** | Vercel Serverless Functions (optional OpenAI integration) |
| **Utilities** | Marked (Markdown parsing), Recharts (visualization) |

---

## 📁 Project Structure

```
InsightPlug/
├── api/
│   └── chat.ts                # Vercel Serverless Function (OpenAI backend)
├── components/
│   ├── ConfigurationWizard.tsx # Configuration UI
│   ├── SimulationLab.tsx      # Analysis view with chat
│   ├── ResultsPanel.tsx       # Economic metrics display
│   ├── TheoryExplainer.tsx    # Educational content
│   └── ErrorBoundary.tsx      # Error handling
├── services/
│   ├── dataCatalog.ts         # EV models, regions, electricity rates
│   ├── localAdvisor.ts        # Rule-based expert logic
│   ├── openaiAdvisor.ts       # OpenAI API integration
│   ├── apiLimiter.ts          # Rate limiting
│   └── design-system.ts       # Design tokens
├── App.tsx                    # Main component
├── index.tsx                  # Entry point
├── types.ts                   # Type definitions
├── constants.tsx              # Icons and constants
├── vercel.json                # Vercel deployment config
├── vite.config.ts             # Vite config
├── tailwind.config.js         # Tailwind config
├── package.json               # Dependencies
└── README.md                  # This file
```

---

## 🎯 Core Features

### 1. Configuration Wizard
- Select US state/county (auto-load electricity rates & driving patterns)
- Choose EV model (Tesla, Chevy, Nissan, Hyundai, BMW, etc.)
- Input daily driving miles
- Set home charging availability percentage
- Real-time TCO calculation

### 2. Simulation Lab
**Left Sidebar** (Controls & Education):
- Quick configuration panel
- Expandable theory cards explaining Money and Time dimensions
- Expert chat interface (rule-based or AI-powered)

**Right Panel** (Results):
- **Money Dimension**: Monthly Surplus, Daily Asset Utilization (DAU)
- **Time Dimension**: Charging Interval, Access Friction
- Geographic context via Google Maps embed

### 3. Economic Signals
- **Monthly Surplus**: Immediate disposable income (combat temporal discounting)
- **Daily Asset Utilization**: Battery efficiency metric (reveal capital over-provisioning)
- **Charging Interval**: Days between charges (quantify labor savings)
- **Access Friction**: Distance to nearest fast charger + detour time

### 4. Expert Chat
Two modes:
- **Rule-Based** (default): Fast, free, no API required
  - Pattern-matching via `services/localAdvisor.ts`
  - Covers: savings, range, charging, payback period, utilization
  - Rate limited: 6 msgs/min, 20 total/session
  
- **OpenAI Mode** (optional): Real-time, intelligent, context-aware
  - Powered by GPT-4o-mini via Vercel backend
  - Grounded in Becker's Household Production Theory
  - Requires `OPENAI_API_KEY` in Vercel environment variables
  - Cost: ~$0.0001-$0.0003 per response

---

## 🧠 Theoretical Foundation: Becker's Household Production Theory

InsightPlug applies **Gary Becker's Household Production Theory** to EV adoption:

### Core Model
Households face two binding constraints:
1. **Money Constraint**: Budget, capital allocation, liquidity
2. **Time Constraint**: Labor availability, opportunity cost, convenience

### EV Application
Vehicles are capital assets that convert money + time into mobility:

**Money Dimension**:
- **Problem**: EVs require higher upfront capital but lower operating costs
  - Consumers suffer temporal discounting: undervalue future savings
  - Consumers obsess over abstract lifetime TCO
- **Solution**: InsightPlug reframes as **monthly disposable income**
  - $5,000 lifetime savings → $42/month
  - Psychologically present, actionable

**Time Dimension**:
- **Problem**: EVs offer labor savings (no refueling) but require charging time planning
  - Abstract labor savings are invisible
  - Charging time trade-offs are unclear
- **Solution**: InsightPlug quantifies:
  - Charging Interval: "Every 7 days" (vs daily gas)
  - Time Savings: "8.7 hours/year avoided refueling"
  - Access Friction: "1.2 miles to nearest fast charger"

### Economic Signals
InsightPlug decomposes EV adoption decisions into observable signals:

| Signal | Formula | Insight |
|--------|---------|---------|
| **Monthly Surplus** | (Gas Cost - EV Cost) per month | Immediate liquidity gain |
| **DAU** | (Daily Miles / EPA Range) × 100 | Capital efficiency; low % = over-provisioned |
| **Charging Interval** | EPA Range / Daily Miles | Labor frequency reduction |
| **Access Friction** | Detour distance + time to chargers | Time cost of charging infrastructure |

---

## 💰 Economic Calculations

### Monthly Surplus
```
Legacy Cost ($/month) = (Daily Miles × 30.4 / ICE MPG) × Gas Price
EV Cost ($/month) = (Daily Miles × 30.4 / EV Efficiency) × Blended Rate

Blended Rate = (Home% × State Rate) + ((1 - Home%) × State Rate × 2.5)
  where: Home% = home charging ratio (0-1)
         State Rate = grid electricity price (2026 EIA data)
         2.5 = public charging markup (DCFC/L2 pricing)

Monthly Surplus = Legacy Cost - EV Cost
```

**Example** (40 mi/day, 28 MPG vehicle, $3.45/gal):
- Legacy: (40 × 30.4 ÷ 28) × $3.45 = $150/month
- EV (3.8 kWh/mi, 75% home, $0.1789/kWh): $78/month
- **Monthly Surplus: $72/month**

### Daily Asset Utilization (DAU)
```
DAU (%) = (Daily Miles / EPA Range) × 100
Status = "Over-Provisioned" if DAU < 30%, else "Optimally Utilized"
```

**Example** (40 mi/day, 300-mile range):
- DAU = (40 ÷ 300) × 100 = **13.3%**
- Meaning: Only 13.3% of battery capacity is used daily
- Insight: 86.7% over-provisioning; marginal value of extra range ≈ $0

### Charging Interval
```
Charging Interval (days) = EPA Range / Daily Miles
Annual Fuel Events = 365 / Charging Interval
Time Savings ≈ (52 - Annual Fuel Events) × 10 min per event per year
```

**Example** (300 mi range, 40 mi/day):
- Charging Interval = 7.5 days ≈ 7 days
- ICE: ~52 refueling events/year × 10 min = 520 min/year
- EV: Home charging (autonomous) = 0 min labor
- **Savings: 8.7 hours/year**

### 5-Year TCO
```
ICE TCO = Purchase Price 
         + (Annual Fuel × 5)
         + (Annual Maintenance @ $1,500 × 5)
         + (Depreciation @ 15% annually × 5)

EV TCO = Purchase Price
        + (Annual Energy × 5)
        + (Annual Maintenance @ $500 × 5)   [savings]
        + (Depreciation @ 10% annually × 5)

Advantage = ICE TCO - EV TCO
```

---

## 🔐 OpenAI Integration (Secure Backend Model)

### Architecture
Instead of exposing the API key to the browser, InsightPlug uses a **secure backend** approach:

```
Browser (Frontend)
    ↓ POST /api/chat
    │ (user input, no API key)
    ↓
Vercel Serverless Function (/api/chat.ts)
    ↓ Uses OPENAI_API_KEY from environment
    │ (never exposed to client)
    ↓
OpenAI API
    ↓
Response back to Browser
```

**Benefits**:
- ✅ API key never reaches the browser
- ✅ Frontend code is open-source safe
- ✅ Production-ready security model
- ✅ Automatic fallback to rule-based mode if API fails

### Setup Instructions

#### Option A: Production (Recommended)
1. **Deploy to Vercel**
   ```bash
   git push origin main
   # Vercel auto-deploys
   ```

2. **Set OpenAI API Key in Vercel**
   - Vercel Dashboard → Project Settings → Environment Variables
   - Add: `OPENAI_API_KEY` = `sk-proj-your-key`
   - Save and redeploy

3. **Test**
   - Visit your Vercel URL
   - Chat with the expert
   - Should see OpenAI responses (more intelligent than rule-based)

#### Option B: Local Development (No OpenAI)
```bash
npm run dev
```
- Works with rule-based advisor
- No API key needed
- Good for local testing

### Cost
- **Model**: GPT-4o-mini
- **Per response**: ~$0.00008 (extremely cheap)
- **1,000 responses**: ~$0.08
- **Monthly budget**: Can set via OpenAI dashboard

### Troubleshooting
- **Issue**: Chat returns "Backend API call failed"
  - **Solution**: Check Vercel environment variable is set
  
- **Issue**: Chat returns rule-based responses instead of AI
  - **Solution**: API key not configured; either is fine for MVP
  
- **Issue**: 401 Authentication Error
  - **Solution**: Rotate API key at https://platform.openai.com/api-keys

See `OPENAI_BACKEND_SETUP_CN.md` for detailed setup.

---

## 🚀 Deployment

### Prerequisites
- GitHub account (free)
- Vercel account (free, sign up with GitHub)
- (Optional) OpenAI API key for AI chat

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial commit: InsightPlug EV analysis tool"
git push origin main
```

### Step 2: Deploy to Vercel
**Option A: Automatic (Recommended)**
- Vercel monitors your GitHub repo
- Every push to `main` automatically redeploys
- No additional steps needed!

**Option B: Manual**
1. Visit https://vercel.com/new
2. Import your GitHub repository
3. Click "Deploy"
4. Get your public URL (e.g., `https://insightplug-abc123.vercel.app`)

### Step 3 (Optional): Enable OpenAI Chat
1. Vercel Dashboard → Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your OpenAI key
3. Click "Redeploy"

### Verification
- Visit your Vercel URL
- Application loads
- Configuration wizard works
- Chat (rule-based by default) works
- Maps embed loads

### Custom Domain
1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records (Vercel will guide you)
4. Wait 24 hours for DNS propagation

---

## 🏗️ Development

### Install Dependencies
```bash
npm install
```

### Local Server
```bash
npm run dev
```
Runs on http://localhost:3000 with hot-reload.

### Build for Production
```bash
npm run build
```
Generates optimized `dist/` folder.

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally.

---

## 📊 Data Sources (2026)

All data represents 2026 forecasts/estimates:

| Category | Source | Note |
|----------|--------|------|
| **Gas Price** | EIA | $3.45/gallon |
| **Electricity Rates** | EIA | State-by-state, ~$0.1789/kWh national avg |
| **EV Models** | Manufacturer MSRP | Tesla, Chevy, Nissan, Hyundai, BMW, etc. |
| **Regional Mileage** | NHTS 2017 | County-level daily miles |
| **EV Efficiency** | EPA estimates | 3.8 kWh/mile (configurable per model) |
| **ICE Benchmark** | Auto industry | 28 MPG default, model-specific available |

See `services/dataCatalog.ts` for full data catalogs.

---

## 🔒 Security

### API Key Safety
- ✅ `.env.local` not committed (in `.gitignore`)
- ✅ OpenAI key stored in Vercel (server-side only)
- ✅ No secrets in frontend code
- ✅ No secrets in GitHub repo

### Best Practices
- Rotate API keys every 6 months
- Monitor API usage at https://platform.openai.com/usage
- Set spending limits on OpenAI dashboard
- Use environment-specific keys for dev/prod

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `README.md` | This file; overview & quick start |
| `COMPLETE_DEPLOYMENT_CN.md` | Full Chinese deployment guide |
| `OPENAI_BACKEND_SETUP_CN.md` | OpenAI backend configuration (Chinese) |
| `API_SECURITY_GUIDE.md` | API security best practices |
| `VERCEL_DEPLOYMENT_CN.md` | Detailed Vercel deployment steps (Chinese) |

---

## 🧪 Testing

### Unit Tests (Future)
```bash
npm test
```

### Manual Testing Checklist
- [ ] Configuration wizard loads
- [ ] Can select region, EV model, input miles
- [ ] Economic signals calculate correctly
- [ ] Chat responds (rule-based)
- [ ] Maps embed displays
- [ ] Mobile responsive
- [ ] Error boundary catches errors

---

## 🎨 UI/UX Principles

InsightPlug follows a **research-backed, minimal design system**:

- **Color**: Emerald (#059669) for positive financial signals
- **Typography**: Clear hierarchy; no decorative fonts
- **Spacing**: 8px grid system; generous whitespace
- **Cards**: White background, 16px border-radius, subtle shadow
- **Accessibility**: WCAG AA contrast ratios, semantic HTML

See `services/design-system.ts` for design tokens.

---

## 📈 Performance

### Optimizations
- Vite 6 for fast bundling
- React 19 with concurrent features
- Lazy-loading Google Maps
- `useMemo()` for expensive calculations
- Rate limiting prevents API abuse

### Bundle Size
- Gzip: ~82 kB (with all dependencies)
- Fast initial load (<2s on 4G)

---

## 🐛 Known Issues & Limitations

- Google Maps requires public embedding (no API key needed, but iframe-based)
- Rule-based chat has limited pattern matching
- Mobile: Maps view may be small on narrow screens
- Chat is rate-limited (20 msgs/session)

---

## 🤝 Contributing

This is a private research project. For collaboration inquiries, contact the maintainer.

---

## 📄 License

**Private Project** – All rights reserved. Copyright © 2026.

---

## 🙋 Support

For issues, feature requests, or questions:
1. Check existing documentation
2. Review `OPENAI_BACKEND_SETUP_CN.md` for setup issues
3. Check browser console (F12) for error logs
4. Review Vercel deployment logs

---

## 📝 Changelog

### v1.0 (March 2026)
- ✨ Secure OpenAI backend integration via Vercel Functions
- ✨ Rule-based expert advisor (always available)
- ✨ Behavioral economics framework (Becker's theory)
- ✨ Real-time economic signal calculation
- ✨ Google Maps geographic grounding
- ✨ Rate limiting & abuse prevention
- ✨ Mobile-responsive design

---

**Last Updated**: March 2, 2026

**Status**: Production-ready

**Deployment**: Vercel

**Frontend**: React 19, TypeScript, Vite 6

**Backend**: Vercel Serverless Functions (optional OpenAI)
