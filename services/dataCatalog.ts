
import { EVModel, RegionData, StateElectricity } from '../types';

export const EV_MODELS: EVModel[] = [
  { make: "Tesla", model: "Model 3 RWD", batteryCapacity: 60.5, epaRange: 267, label: "Tesla Model 3 RWD" },
  { make: "Ford", model: "Mustang Mach-E", batteryCapacity: 70, epaRange: 300, label: "Ford Mustang Mach-E" },
  { make: "Chevrolet", model: "Bolt EV", batteryCapacity: 60, epaRange: 259, label: "Chevrolet Bolt EV" },
  { make: "Hyundai", model: "IONIQ 5", batteryCapacity: 77.4, epaRange: 303, label: "Hyundai IONIQ 5" },
  { make: "Nissan", model: "LEAF", batteryCapacity: 40, epaRange: 149, label: "Nissan LEAF (40kWh)" },
  { make: "Rivian", model: "R1S", batteryCapacity: 135, epaRange: 295, label: "Rivian R1S" },
  { make: "Lucid", model: "Air", batteryCapacity: 118, epaRange: 516, label: "Lucid Air" },
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
