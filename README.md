# InsightPlug - EV Economic Literacy Tool

A research-oriented web application that provides personalized Electric Vehicle (EV) cost assessments with local, rule-based explanations and geographic grounding. Built to help users make informed decisions about EV adoption through interactive simulations and economic analysis.

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
The analysis view with a left sidebar layout:
- **Left**: Quick configuration, economic framework, expert chat
- **Right**: Results dashboard (cost metrics, DAU, map, charging interval)

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

### **Local Advisor** (`localAdvisor.ts`)
Rule-based logic for generating contextual responses without external API calls.

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

## 📊 Data Sources & Assumptions

- **Electricity Rates**: State-by-state averages based on EIA data
- **EV Models**: Representative SUV/Sedan categories with detailed benchmarks
- **Depreciation**: 15% annual for ICE, 10% for EV
- **Maintenance Savings**: $500/year for EV vs ICE
- **Public Charging**: 2.5x more expensive than home charging

---

## 🧪 Features in Detail

### Cost Calculation Logic

```
Monthly Legacy (ICE) Cost = (Miles / MPG) × Gas Price
Monthly EV Cost = (Miles / Efficiency) × Blended Rate
Blended Rate = (Home% × Home Rate) + (Public% × Home Rate × 2.5)
Monthly Surplus = Legacy Cost - EV Cost
```

### TCO (Total Cost of Ownership)

Factors included:
- Initial purchase price
- Fuel/energy costs over 5 years
- Depreciation
- Maintenance costs

---

## 🤝 Contributing

This is a private research project. For questions or collaboration inquiries, please contact the maintainer.

---

## 📄 License

**Private Project** - All rights reserved.
