# InsightPlug - EV Economic Literacy Tool

A research-oriented web application that provides personalized Electric Vehicle (EV) cost assessments with AI-driven explanations and geographic grounding. Built to help users make informed decisions about EV adoption through interactive simulations and real-time economic analysis.

---

## 🚀 Features

### 📊 **Interactive Simulation Lab**
- **Real-time TCO Analysis**: Compare Total Cost of Ownership between EV and ICE vehicles
- **Geographic Anchoring**: Region-specific electricity rates, gas prices, and incentives
- **Dynamic Configuration**: Adjust daily mileage, home charging ratio, vehicle efficiency, and more
- **Break-even Analysis**: Calculate miles needed to recover EV price premium

### 🤖 **AI-Powered Expert Chat**
- **Integrated Chat Assistant**: Get personalized insights based on your specific profile
- **Context-Aware Responses**: AI understands your configuration and provides tailored advice
- **Rule-Based & LLM Support**: Local advisor logic with optional Gemini/OpenAI integration
- **Quick Prompts**: Pre-configured questions for common scenarios

### 📈 **Data Visualization**
- **Cost Comparison Charts**: Visualize monthly fuel costs (EV vs ICE)
- **Savings Dashboard**: Track monthly surplus and annual savings projections
- **Asset Utilization Metrics**: Understand daily range usage and charging intervals
- **5-Year TCO Projections**: Long-term cost analysis with depreciation

### 🌍 **Geographic Intelligence**
- **Multi-Region Support**: Pre-configured data for various US regions
- **State-Specific Electricity Rates**: Accurate pricing based on location
- **Blended Charging Costs**: Accounts for home vs. public charging mix
- **Geolocation Permissions**: Browser-based location detection (optional)

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, TypeScript |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS 3.4, PostCSS, Autoprefixer |
| **Charts** | Recharts 3.6 |
| **AI Services** | Google Gemini API, OpenAI API |
| **Markdown** | Marked (for chat rendering) |

---

## 📦 Installation

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** or **yarn**

### Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React & React DOM
- TypeScript
- Vite
- Tailwind CSS & PostCSS
- Recharts
- Marked

---

## 🚀 Quick Start

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

The app will be available at `http://localhost:3000` (or next available port).

### Production Build

Create an optimized production build:

```bash
npm run build
```

Output will be generated in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

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
│   ├── SimulationLab.tsx     # Main simulation interface (3-column layout)
│   ├── ResultsPanel.tsx      # Central dashboard with metrics & charts
│   ├── AnalysisDashboard.tsx # Additional analysis views
│   ├── Calculator.tsx        # Calculation utilities
│   └── ChatAssistant.tsx     # Chat UI components
│
├── services/                  # Business logic & data services
│   ├── dataCatalog.ts        # EV models, regions, electricity rates
│   ├── priceData.ts          # Historical pricing data
│   ├── localAdvisor.ts       # Rule-based AI logic
│   ├── geminiService.ts      # Google Gemini API integration
│   └── openaiService.ts      # OpenAI API integration
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
The main hub featuring a 3-column responsive layout:
- **Left**: Configuration panel (region, vehicle, pricing, efficiency)
- **Center**: Results dashboard (cost metrics, charts, TCO analysis)
- **Right**: AI expert chat interface

### **ResultsPanel** (`ResultsPanel.tsx`)
Displays key economic signals:
- Monthly fuel cost comparison
- Monthly surplus (savings)
- Daily asset utilization (% of range used)
- Charging interval (days between charges)
- Break-even mileage

### **Data Catalog** (`dataCatalog.ts`)
Centralized data repository:
- EV models with specs (EPA range, MSRP)
- ICE benchmarks for comparison
- Regional data (states, electricity rates)
- Default assumptions (2026 pricing)

### **Local Advisor** (`localAdvisor.ts`)
Rule-based AI logic for generating contextual responses without external API calls.

---

## 🔧 Configuration

### Environment Variables (Optional)

For AI chat features, you can configure API keys:

```bash
# .env (not included in repo)
VITE_OPENAI_API_KEY=your_openai_api_key
```

### Default Settings (2026)

The app includes realistic 2026 defaults:
- **Gas Price**: $3.45/gallon
- **Electricity Rate**: $0.1789/kWh (national average)
- **Federal Tax Credit**: $7,500
- **EV Efficiency**: 3.8 miles/kWh
- **ICE Efficiency**: 28 MPG (varies by model)
- **Public Charging Multiplier**: 2.5x home rate

---

## 📊 Data Sources & Assumptions

- **Electricity Rates**: State-by-state averages based on EIA data
- **EV Models**: Real-world specifications (Tesla, Rivian, Ford, etc.)
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
- Federal tax incentives
- Fuel/energy costs over 5 years
- Depreciation
- Maintenance costs

---

## 🤝 Contributing

This is a private research project. For questions or collaboration inquiries, please contact the maintainer.

---

## 📄 License

**Private Project** - All rights reserved.

---

## 🐛 Troubleshooting

### Build Errors

If you encounter PostCSS/Tailwind errors:
```bash
npm install --save-dev tailwindcss postcss autoprefixer
```

### Port Already in Use

Vite will automatically try the next available port (3000 → 3001 → 3002, etc.)

### Type Errors

Ensure TypeScript is properly configured:
```bash
npm install --save-dev typescript @types/node
```

---

## 📮 Contact & Support

For issues, suggestions, or research collaboration, please open an issue or contact the project maintainer.

---

**Built with ⚡ by the InsightPlug Team**

