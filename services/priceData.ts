/**
 * 2026 EV and ICE Vehicle Price Data
 * Data Sources: EPA Official (Range, Battery Capacity), Manufacturer MSRP (2026 Model Year Prices)
 * Last Updated: February 2026
 */

export interface PriceDataSource {
  ev: {
    make: string;
    model: string;
    msrp: number;
    source: string;
  };
  benchmark: {
    model: string;
    price: number;
    mpg: number;
    source: string;
  };
  fuelPrice: number;
  electricPrice: number;
  dataDate: string;
}

export const PRICE_DATA_NOTES = `
## EV Price Data Sources (2026)

### Tesla
- **Model 3 RWD**: $42,990 - Official Website
- **Model Y RWD**: $46,990 - Official Website
  
### General Motors (Chevrolet)
- **Bolt EV**: $28,200 - 2026 MSRP (After Price Cut)
- **Bolt EUV**: $31,200 - 2026 MSRP

### Ford
- **Mustang Mach-E RWD**: $42,900 - 2026 MSRP
- **F-150 Lightning Pro**: $56,995 - Starting Price

### Hyundai / Kia
- **IONIQ 6 SE RWD**: $34,950 - 2026 MSRP
- **IONIQ 5 RWD**: $41,100 - 2026 MSRP
- **EV6 RWD**: $41,900 - 2026 MSRP

### Nissan
- **LEAF Plus (62kWh)**: $34,950 - 2026 MSRP
- **Ariya RWD**: $40,150 - 2026 MSRP

### Luxury Brands
- **BMW i4 eDrive40**: $59,700 - 2026 MSRP
- **Lucid Air Standard**: $69,900 - 2026 Price After Reduction
- **Polestar 3 Single Motor**: $73,550 - 2026 Price
- **Rivian R1S Dual Motor**: $75,750 - 2026 Price

## Benchmark ICE Selection Logic

To ensure fair comparison, each EV is paired with a functionally similar ICE vehicle:
- **Sedan EVs** → Benchmark against mainstream sedans (Honda Civic, Toyota Corolla, Toyota Camry)
- **SUV/Crossover EVs** → Benchmark against mainstream SUVs (Honda CR-V, Toyota RAV4, Mazda CX-5)
- **Pickup Trucks** → Benchmark against comparable displacement trucks (Ford F-150 EcoBoost)
- **Luxury EVs** → Benchmark against comparable luxury vehicles

## Key Price Indicators (2026)

### Fuel Price
- **National Average**: $3.45/gallon (February 2026)
- **Range**: $2.95-$3.95/gallon (varies by state)

### Electricity Price
- **National Average**: $0.1789/kWh (January 2026)
- **Lowest**: Washington State $0.1098/kWh
- **Highest**: Hawaii $0.4239/kWh

### Federal Tax Incentive
- **US Federal Tax Credit**: Up to $7,500 (2026)
- **Eligibility Requirements**:
  - Final assembly location in North America
  - MSRP Cap: $55,000 for sedans, $75,000 for SUVs/Trucks
  - Battery mineral content and domestic parts requirements

### State-Level Incentives (Example - New York State)
- **EV Charger Installation Subsidy**: Up to $2,500
- **Used EV Purchase Tax Exemption**: May apply
- **Public Charging Network**: Expanding

## TCO (Total Cost of Ownership) Calculation Assumptions

### 5-Year Ownership Period
- **Mileage**: 12,500 - 40,000 miles/year (depends on region)
- **ICE Depreciation**: 15% annual rate
- **EV Depreciation**: 10% annual rate (relatively stable)
- **ICE Maintenance**: $800-1,200/year
- **EV Maintenance**: $300-500/year (lower due to no fluid changes)
- **Tire Costs**: Similar, accounting for slightly higher EV weight

### Calculation Method
\`\`\`
ICE TCO = Purchase Price + (Annual Fuel Cost × 5) + (Annual Depreciation × 5) + (Annual Maintenance × 5)
EV TCO = (Purchase Price - Tax Credit) + (Annual Energy Cost × 5) + (Annual Depreciation × 5) + (Annual Maintenance × 5)
\`\`\`

## Energy Cost Comparison

### Monthly Operating Cost Example (Brooklyn, 15.4 miles/day)
- **ICE Vehicle** (Honda Civic, 33 MPG, $3.45/gallon):
  - Monthly fuel cost: ~$47
  
- **Electric Vehicle** (Tesla Model 3, 3.8 kWh/mile, $0.22/kWh average with public):
  - Monthly electricity cost: ~$34
  - **Monthly Savings**: ~$13 × 12 = **$156/year**

### 5-Year Energy Cost Savings
- Average annual savings: $156 × 12 = $1,872
- Total 5-year savings: ~$9,360 (energy only)

## Data Accuracy

✓ **EPA Data**: Official EPA range and battery capacity (2025-2026 MY)
✓ **MSRP**: Manufacturer official 2026 model year prices (excludes destination fee)
✓ **Fuel Price**: EIA (US Energy Information Administration) February 2026 average
✓ **Electricity Price**: EIA January 2026 average retail price (residential)
✓ **Tax Incentives**: Current 2026 IRA regulations

## Limitations

⚠ **Not Included**:
- Registration and insurance costs
- Repair costs variations (e.g., battery replacement)
- Parking and charging infrastructure costs
- State and local incentives (varies significantly by state)
- Used battery residual values (varies year to year)

⚠ **Assumptions**:
- Home charging access availability
- Public fast charging prices remain constant
- Fuel prices remain stable
- Electricity prices grow 2% annually

## Continuous Update Plan
- Update MSRP and fuel/electricity prices quarterly
- Monitor new vehicle launches and discontinuations
- Track state incentive policy changes
- Update EPA range ratings
`;

export const CALCULATION_FORMULAS = {
  monthlyFuelCost: "Monthly Miles ÷ Fuel Economy × Fuel Price",
  monthlyElectricityCost: "Monthly Miles ÷ EV Efficiency × Blended Rate (Home % + Public % × 2.5)",
  monthlySurplus: "Monthly Fuel Cost - Monthly Electricity Cost",
  dailyAssetUtilization: "(Daily Miles ÷ EPA Range) × 100%",
  chargingInterval: "EPA Range ÷ Daily Miles",
  tco5Year: "Purchase Price + (Annual Operating Cost × 5) + (Annual Depreciation × 5) - Tax Credit",
  breakEvenMiles: "(EV Price Premium) ÷ (Fuel Cost/Mile - EV Cost/Mile)",
};

export const REAL_WORLD_EFFICIENCY = {
  evAverageMilePerKwh: "3.2-4.2 (real-world use, includes charging losses)",
  iceAverageMpg: "EPA Rating × 0.85 (real-world use factor)",
  notes: "Data based on US road testing and user reports",
};
