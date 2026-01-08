
export interface EVModel {
  make: string;
  model: string;
  batteryCapacity: number;
  epaRange: number;
  label: string;
}

export interface RegionData {
  fips: string;
  name: string;
  state: string;
  dailyMiles: number;
}

export interface StateElectricity {
  state: string;
  pricePerKwh: number; // in dollars, e.g., 0.15
}

export interface UserProfile {
  region: RegionData;
  ev: EVModel;
  homeChargingRatio: number; // 0 to 1
  ownershipYears: number;
  gasPrice: number;
  iceMpg: number;
  icePrice: number;
  evPrice: number;
  taxIncentive: number;
  // Added missing fields to resolve TS errors in components and constants
  annualMileage: number;
  electricRate: number;
  evEfficiency: number;
  maintenanceSavingPerYear: number;
  homeChargingAccess: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// Added missing interfaces for AnalysisDashboard
export interface CostDataPoint {
  year: number;
  iceTotal: number;
  evTotal: number;
  savings: number;
}

export interface AISummary {
  totalSavings: number;
  breakEvenYear: number;
  keyInsights: string[];
  recommendation: string;
}
