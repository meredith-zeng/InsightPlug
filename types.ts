
export interface EVModel {
  make: string;
  model: string;
  batteryCapacity: number;
  epaRange: number;
  label: string;
}

export interface RegionData {
  fips: string;
  name: string; // The County name
  state: string;
  dailyMiles: number;
}

export interface StateElectricity {
  state: string;
  pricePerKwh: number; // in dollars
}

export interface UserProfile {
  region: RegionData;
  ev: EVModel;
  homeChargingRatio: number;
  ownershipYears: number;
  gasPrice: number;
  iceMpg: number;
  icePrice: number;
  evPrice: number;
  taxIncentive: number;
  annualMileage: number;
  dailyMiles: number;
  electricRate: number;
  evEfficiency: number;
  maintenanceSavingPerYear: number;
  homeChargingAccess: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface AISummary {
  totalSavings: number;
  breakEvenYear: number;
  keyInsights: string[];
  recommendation: string;
}

// Added missing CostDataPoint interface for the AnalysisDashboard component
export interface CostDataPoint {
  year: number;
  iceTotal: number;
  evTotal: number;
  savings: number;
}
