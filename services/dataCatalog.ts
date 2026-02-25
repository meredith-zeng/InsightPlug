
import { EVModel, RegionData, StateElectricity } from '../types';

export const EV_MODELS: EVModel[] = [
  {
    make: "Tesla", model: "Model 3 RWD", batteryCapacity: 60, epaRange: 272, label: "Tesla Model 3 RWD (2026)",
    msrp: 42990,
    iceBenchmark: { model: "Honda Civic/Toyota Corolla", price: 28000, mpg: 33 }
  },
  {
    make: "Tesla", model: "Model Y RWD", batteryCapacity: 75, epaRange: 260, label: "Tesla Model Y RWD (2026)",
    msrp: 46990,
    iceBenchmark: { model: "Honda CR-V/Toyota RAV4", price: 32000, mpg: 28 }
  },
  {
    make: "Chevrolet", model: "Bolt EV", batteryCapacity: 65, epaRange: 259, label: "Chevrolet Bolt EV (2026)",
    msrp: 28200,
    iceBenchmark: { model: "Honda Civic", price: 28000, mpg: 33 }
  },
  {
    make: "Chevrolet", model: "Bolt EUV", batteryCapacity: 65, epaRange: 247, label: "Chevrolet Bolt EUV (2026)",
    msrp: 31200,
    iceBenchmark: { model: "Honda HR-V", price: 30000, mpg: 31 }
  },
  {
    make: "Ford", model: "Mustang Mach-E RWD", batteryCapacity: 70, epaRange: 312, label: "Ford Mustang Mach-E RWD (2026)",
    msrp: 42900,
    iceBenchmark: { model: "Ford Escape/Toyota RAV4", price: 34000, mpg: 27 }
  },
  {
    make: "Ford", model: "F-150 Lightning Pro", batteryCapacity: 131, epaRange: 240, label: "Ford F-150 Lightning Pro (2026)",
    msrp: 56995,
    iceBenchmark: { model: "Ford F-150 EcoBoost", price: 38000, mpg: 21 }
  },
  {
    make: "Hyundai", model: "IONIQ 6 SE RWD", batteryCapacity: 53, epaRange: 361, label: "Hyundai IONIQ 6 SE RWD (2026)",
    msrp: 34950,
    iceBenchmark: { model: "Toyota Camry/Honda Accord", price: 32000, mpg: 32 }
  },
  {
    make: "Hyundai", model: "IONIQ 5 RWD", batteryCapacity: 58, epaRange: 303, label: "Hyundai IONIQ 5 RWD (2026)",
    msrp: 41100,
    iceBenchmark: { model: "Honda CR-V/Mazda CX-5", price: 33000, mpg: 28 }
  },
  {
    make: "Kia", model: "EV6 RWD", batteryCapacity: 58, epaRange: 282, label: "Kia EV6 RWD (2026)",
    msrp: 41900,
    iceBenchmark: { model: "Hyundai Tucson/Kia Sportage", price: 34000, mpg: 28 }
  },
  {
    make: "Nissan", model: "LEAF Plus", batteryCapacity: 62, epaRange: 226, label: "Nissan LEAF Plus (2026)",
    msrp: 34950,
    iceBenchmark: { model: "Honda Civic", price: 28000, mpg: 33 }
  },
  {
    make: "Nissan", model: "Ariya RWD", batteryCapacity: 63, epaRange: 228, label: "Nissan Ariya RWD (2026)",
    msrp: 40150,
    iceBenchmark: { model: "Toyota Camry", price: 32000, mpg: 31 }
  },
  {
    make: "BMW", model: "i4 eDrive40", batteryCapacity: 81, epaRange: 301, label: "BMW i4 eDrive40 (2026)",
    msrp: 59700,
    iceBenchmark: { model: "BMW 440i", price: 55000, mpg: 24 }
  },
  {
    make: "Volkswagen", model: "ID.4 Standard", batteryCapacity: 62, epaRange: 275, label: "Volkswagen ID.4 Standard (2026)",
    msrp: 38995,
    iceBenchmark: { model: "VW Tiguan/Honda CR-V", price: 33000, mpg: 27 }
  },
  {
    make: "Lucid", model: "Air Standard Range", batteryCapacity: 88, epaRange: 420, label: "Lucid Air Standard (2026)",
    msrp: 69900,
    iceBenchmark: { model: "BMW 7 Series/Mercedes S-Class", price: 85000, mpg: 22 }
  },
  {
    make: "Rivian", model: "R1S Dual Motor", batteryCapacity: 135, epaRange: 330, label: "Rivian R1S Dual Motor (2026)",
    msrp: 75750,
    iceBenchmark: { model: "Cadillac Escalade/Land Rover Range Rover", price: 85000, mpg: 18 }
  },
  {
    make: "Polestar", model: "3 Single Motor", batteryCapacity: 111, epaRange: 315, label: "Polestar 3 Single Motor (2026)",
    msrp: 73550,
    iceBenchmark: { model: "Porsche Macan/BMW X5", price: 70000, mpg: 20 }
  },
];

export const ELECTRICITY_RATES: StateElectricity[] = [
  { state: "CT", pricePerKwh: 0.2988 }, { state: "ME", pricePerKwh: 0.2742 }, { state: "MA", pricePerKwh: 0.2961 },
  { state: "NH", pricePerKwh: 0.2815 }, { state: "RI", pricePerKwh: 0.2702 }, { state: "VT", pricePerKwh: 0.2082 },
  { state: "NJ", pricePerKwh: 0.1770 }, { state: "NY", pricePerKwh: 0.2224 }, { state: "PA", pricePerKwh: 0.1810 },
  { state: "IL", pricePerKwh: 0.1571 }, { state: "IN", pricePerKwh: 0.1494 }, { state: "MI", pricePerKwh: 0.1884 },
  { state: "OH", pricePerKwh: 0.1538 }, { state: "WI", pricePerKwh: 0.1688 }, { state: "IA", pricePerKwh: 0.1331 },
  { state: "KS", pricePerKwh: 0.1338 }, { state: "MN", pricePerKwh: 0.1473 }, { state: "MO", pricePerKwh: 0.1258 },
  { state: "NE", pricePerKwh: 0.1120 }, { state: "ND", pricePerKwh: 0.1101 }, { state: "SD", pricePerKwh: 0.1232 },
  { state: "DE", pricePerKwh: 0.1573 }, { state: "DC", pricePerKwh: 0.1645 }, { state: "FL", pricePerKwh: 0.1521 },
  { state: "GA", pricePerKwh: 0.1369 }, { state: "MD", pricePerKwh: 0.1660 }, { state: "NC", pricePerKwh: 0.1293 },
  { state: "SC", pricePerKwh: 0.1368 }, { state: "VA", pricePerKwh: 0.1426 }, { state: "WV", pricePerKwh: 0.1405 },
  { state: "AL", pricePerKwh: 0.1463 }, { state: "KY", pricePerKwh: 0.1265 }, { state: "MS", pricePerKwh: 0.1323 },
  { state: "TN", pricePerKwh: 0.1219 }, { state: "AR", pricePerKwh: 0.1225 }, { state: "LA", pricePerKwh: 0.1155 },
  { state: "OK", pricePerKwh: 0.1208 }, { state: "TX", pricePerKwh: 0.1446 }, { state: "AZ", pricePerKwh: 0.1402 },
  { state: "CO", pricePerKwh: 0.1430 }, { state: "ID", pricePerKwh: 0.1105 }, { state: "MT", pricePerKwh: 0.1254 },
  { state: "NV", pricePerKwh: 0.1667 }, { state: "NM", pricePerKwh: 0.1385 }, { state: "UT", pricePerKwh: 0.1120 },
  { state: "WY", pricePerKwh: 0.1146 }, { state: "CA", pricePerKwh: 0.2951 }, { state: "OR", pricePerKwh: 0.1273 },
  { state: "WA", pricePerKwh: 0.1098 }, { state: "AK", pricePerKwh: 0.2390 }, { state: "HI", pricePerKwh: 0.4239 }
];

export const REGIONS: RegionData[] = [
  { fips: "36047", name: "Kings County (Brooklyn)", state: "NY", dailyMiles: 15.4 },
  { fips: "36005", name: "Bronx County", state: "NY", dailyMiles: 16.5 },
  { fips: "36061", name: "New York County (Manhattan)", state: "NY", dailyMiles: 12.8 },
  { fips: "36081", name: "Queens County", state: "NY", dailyMiles: 20.3 },
  { fips: "06075", name: "San Francisco County", state: "CA", dailyMiles: 24.8 },
  { fips: "06037", name: "Los Angeles County", state: "CA", dailyMiles: 32.2 },
  { fips: "48113", name: "Dallas County", state: "TX", dailyMiles: 39.9 },
  { fips: "48201", name: "Harris County (Houston)", state: "TX", dailyMiles: 42.5 },
  { fips: "12086", name: "Miami-Dade County", state: "FL", dailyMiles: 31.5 },
  { fips: "17031", name: "Cook County (Chicago)", state: "IL", dailyMiles: 30.2 },
  { fips: "53033", name: "King County (Seattle)", state: "WA", dailyMiles: 36.5 },
  { fips: "13121", name: "Fulton County (Atlanta)", state: "GA", dailyMiles: 38.4 }
];
