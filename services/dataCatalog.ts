import { EVModel, RegionData, StateElectricity } from '../types';

export const EV_MODELS: EVModel[] = [
  {
    make: "Tesla",
    model: "Model 3 Long Range RWD",
    epaRange: 363, // Official EPA combined range (363 miles Total Range)
    label: "Tesla Model 3 Long Range RWD (2025)",
    publicLabel: "Electric Sedan (Long Range)",
    detailLabel: "Tesla Model 3 Long Range RWD (2025)",
    msrp: 42490, // Official MSRP ($42,490)
    iceBenchmark: {
      model: "Toyota Corolla", // Industry-standard ICE competitor benchmark for the Model 3
      price: 25183, // Average selling price across trims (Note: Not from the original document; used as an external reference benchmark)
      mpg: 34 // Combined MPG
    }
  },
  {
    make: "Tesla",
    model: "Model Y Long Range RWD",
    epaRange: 337, // Official EPA combined range (337 miles Total Range)
    label: "Tesla Model Y Long Range RWD (2025)",
    publicLabel: "Electric SUV (Long Range)",
    detailLabel: "Tesla Model Y Long Range RWD (2025)",
    msrp: 44990, // Official MSRP ($44,990)
    iceBenchmark: {
      model: "Toyota RAV4", // The ICE vehicle used for comparison in the original document
      price: 33403, // Average of the MSRP range from the document: ($29,250 + $37,555) / 2 = $33,402.5, rounded to 33403
      mpg: 30 // EPA combined MPG provided in the original document
    }
  }
];

export const ELECTRICITY_RATES: StateElectricity[] = [
    { state: "NY", pricePerKwh: 0.2224 },
    { state: "CA", pricePerKwh: 0.2951 },
    { state: "TX", pricePerKwh: 0.1446 }
];

export const REGIONS: RegionData[] = [
  // New York
  { fips: "36047", name: "Kings County (Brooklyn)", state: "NY", dailyMiles: 15.489 },
  { fips: "36061", name: "New York County (Manhattan)", state: "NY", dailyMiles: 12.888 },

  // California - Bay Area & Central Valley
  { fips: "06075", name: "San Francisco County", state: "CA", dailyMiles: 24.816 },
  { fips: "06001", name: "Alameda County", state: "CA", dailyMiles: 37.139 },
  { fips: "06081", name: "San Mateo County", state: "CA", dailyMiles: 36.624 },
  { fips: "06085", name: "Santa Clara County", state: "CA", dailyMiles: 35.79 },
  { fips: "06013", name: "Contra Costa County", state: "CA", dailyMiles: 45.419 },

  // California - Southern California
  { fips: "06037", name: "Los Angeles County", state: "CA", dailyMiles: 36.544 },
  { fips: "06059", name: "Orange County", state: "CA", dailyMiles: 36.16 },
  { fips: "06073", name: "San Diego County", state: "CA", dailyMiles: 40.651 },
  { fips: "06083", name: "Santa Barbara County", state: "CA", dailyMiles: 41.617 },

  // California - Interior/Sacramento
  { fips: "06067", name: "Sacramento County", state: "CA", dailyMiles: 39.306 },
  { fips: "06113", name: "Yolo County", state: "CA", dailyMiles: 40.823 },
  { fips: "06095", name: "Solano County", state: "CA", dailyMiles: 48.503 },
  { fips: "06071", name: "San Bernardino County", state: "CA", dailyMiles: 51.001 },

  // California - Northern
  { fips: "06057", name: "Nevada County", state: "CA", dailyMiles: 55.448 },
  { fips: "06011", name: "Colusa County", state: "CA", dailyMiles: 69.035 },

  // Texas
  { fips: "48113", name: "Dallas County", state: "TX", dailyMiles: 39.9 },
  { fips: "48201", name: "Harris County (Houston)", state: "TX", dailyMiles: 42.5 },
];

export const DATA_SOURCE = {
  name: "EPA Fuel Economy & EIA Energy Data",
  url: "https://www.fueleconomy.gov",
  lastUpdated: "February 2026"
};
