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

// Residential rates: EIA Electric Power Monthly, Table 5.6.A (Dec 2025 preliminary, $/kWh)
// Public charging rates: AAA EV Charging Prices (2025), commercial/public avg across L1/L2/L3
// NY / CA / TX residential values preserved from an earlier EIA snapshot (see README note).
// New states use the Dec 2025 preliminary Residential column directly.
export const ELECTRICITY_RATES: StateElectricity[] = [
    { state: "NY", pricePerKwh: 0.2224, publicPricePerKwh: 0.399 },
    { state: "CA", pricePerKwh: 0.2951, publicPricePerKwh: 0.465 },
    { state: "TX", pricePerKwh: 0.1446, publicPricePerKwh: 0.415 },
    { state: "FL", pricePerKwh: 0.1502, publicPricePerKwh: 0.411 },
    { state: "WA", pricePerKwh: 0.1333, publicPricePerKwh: 0.396 },
    { state: "MA", pricePerKwh: 0.3088, publicPricePerKwh: 0.395 },
    { state: "IL", pricePerKwh: 0.1707, publicPricePerKwh: 0.433 },
    { state: "GA", pricePerKwh: 0.1367, publicPricePerKwh: 0.419 },
    { state: "AZ", pricePerKwh: 0.1546, publicPricePerKwh: 0.437 },
    { state: "CO", pricePerKwh: 0.1612, publicPricePerKwh: 0.376 },
    { state: "OR", pricePerKwh: 0.1494, publicPricePerKwh: 0.406 }
];

// AAA national average for fallback when state is not in the table
export const PUBLIC_CHARGING_US_AVG = 0.417;

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

  // Florida
  { fips: "12086", name: "Miami-Dade County", state: "FL", dailyMiles: 31.553 },
  { fips: "12011", name: "Broward County", state: "FL", dailyMiles: 34.921 },
  { fips: "12095", name: "Orange County (Orlando)", state: "FL", dailyMiles: 41.034 },
  { fips: "12057", name: "Hillsborough County (Tampa)", state: "FL", dailyMiles: 39.632 },

  // Washington
  { fips: "53033", name: "King County (Seattle)", state: "WA", dailyMiles: 36.591 },
  { fips: "53053", name: "Pierce County (Tacoma)", state: "WA", dailyMiles: 43.39 },
  { fips: "53061", name: "Snohomish County", state: "WA", dailyMiles: 44.975 },

  // Massachusetts
  { fips: "25025", name: "Suffolk County (Boston)", state: "MA", dailyMiles: 21.206 },
  { fips: "25017", name: "Middlesex County", state: "MA", dailyMiles: 32.372 },
  { fips: "25021", name: "Norfolk County", state: "MA", dailyMiles: 34.008 },
  { fips: "25027", name: "Worcester County", state: "MA", dailyMiles: 41.719 },

  // Illinois
  { fips: "17031", name: "Cook County (Chicago)", state: "IL", dailyMiles: 30.205 },
  { fips: "17043", name: "DuPage County", state: "IL", dailyMiles: 35.786 },
  { fips: "17097", name: "Lake County", state: "IL", dailyMiles: 40.882 },

  // Georgia
  { fips: "13121", name: "Fulton County (Atlanta)", state: "GA", dailyMiles: 38.452 },
  { fips: "13089", name: "DeKalb County", state: "GA", dailyMiles: 39.819 },
  { fips: "13067", name: "Cobb County", state: "GA", dailyMiles: 41.037 },
  { fips: "13135", name: "Gwinnett County", state: "GA", dailyMiles: 45.633 },

  // Arizona
  { fips: "04013", name: "Maricopa County (Phoenix)", state: "AZ", dailyMiles: 39.735 },
  { fips: "04019", name: "Pima County (Tucson)", state: "AZ", dailyMiles: 36.604 },

  // Colorado
  { fips: "08031", name: "Denver County", state: "CO", dailyMiles: 30.341 },
  { fips: "08005", name: "Arapahoe County", state: "CO", dailyMiles: 34.761 },
  { fips: "08059", name: "Jefferson County", state: "CO", dailyMiles: 37.437 },
  { fips: "08041", name: "El Paso County (Colorado Springs)", state: "CO", dailyMiles: 39.631 },

  // Oregon
  { fips: "41051", name: "Multnomah County (Portland)", state: "OR", dailyMiles: 30.607 },
  { fips: "41067", name: "Washington County", state: "OR", dailyMiles: 35.305 },
  { fips: "41005", name: "Clackamas County", state: "OR", dailyMiles: 41.958 },
];

export const DATA_SOURCE = {
  name: "EPA Fuel Economy & EIA Energy Data",
  url: "https://www.fueleconomy.gov",
  lastUpdated: "February 2026"
};
