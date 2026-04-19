import { UserProfile, AISummary, CostDataPoint } from '../types';
import { ELECTRICITY_RATES, PUBLIC_CHARGING_US_AVG } from './dataCatalog';

type ExpertMetrics = {
  chargingFrequency?: number;
  monthlyFuelSavings?: number;
  dailyBatteryAdequacy?: number;
};

const normalize = (input: string) => input.toLowerCase();

const toCurrency = (value: number) => `$${Math.round(value).toLocaleString()}`;

const estimateMonthlySavings = (profile: UserProfile) => {
  const monthlyGas = (profile.annualMileage / profile.iceMpg) * profile.gasPrice / 12;
  const stateEntry = ELECTRICITY_RATES.find(r => r.state === profile.region.state);
  const homeRate = stateEntry?.pricePerKwh ?? profile.electricRate;
  const publicRate = stateEntry?.publicPricePerKwh ?? PUBLIC_CHARGING_US_AVG;
  const blendedRate = profile.homeChargingRatio * homeRate + (1 - profile.homeChargingRatio) * publicRate;
  const monthlyElectric = (profile.annualMileage / profile.evEfficiency) * blendedRate / 12;
  return monthlyGas - monthlyElectric;
};

const estimateBreakEvenYears = (profile: UserProfile, monthlySavings: number) => {
  if (monthlySavings <= 0) return null;
  const upfrontGap = profile.evPrice - profile.icePrice;
  if (upfrontGap <= 0) return 0;
  return upfrontGap / (monthlySavings * 12);
};

export const buildAssistantReply = (profile: UserProfile, input: string) => {
  const intent = normalize(input);
  const batteryAdequacy = (profile.dailyMiles / profile.ev.epaRange) * 100;
  const chargingFrequency = Math.max(1, Math.floor(profile.ev.epaRange / profile.dailyMiles));
  const monthlySavings = estimateMonthlySavings(profile);
  const breakEvenYears = estimateBreakEvenYears(profile, monthlySavings);

  if (/(tax|credit|incentive)/.test(intent)) {
    return 'Tax credits are not included in this analysis.';
  }

  if (/(charging|charge|home)/.test(intent)) {
    const homeShare = Math.round(profile.homeChargingRatio * 100);
    return `With about ${homeShare}% home charging, you would refuel roughly every ${chargingFrequency} days based on your current driving.`;
  }

  if (/(range|utilization|adequacy)/.test(intent)) {
    return `Your selected EV range is ${profile.ev.epaRange} miles. Daily use is about ${batteryAdequacy.toFixed(1)}% of that capacity.`;
  }

  if (/(savings|cost|payback|break even|breakeven)/.test(intent)) {
    const savingsLine = monthlySavings >= 0
      ? `Estimated monthly operating savings are about ${toCurrency(monthlySavings)}.`
      : `Estimated monthly operating cost is higher by about ${toCurrency(Math.abs(monthlySavings))}.`;
    const breakEvenLine = breakEvenYears === null
      ? 'Break-even depends on usage changes.'
      : `Estimated break-even is about ${breakEvenYears.toFixed(1)} years.`;
    return `${savingsLine} ${breakEvenLine}`;
  }

  return `Ask about charging, range, or cost trade-offs and I will break it down.`;
};

export const buildExpertReply = (profile: UserProfile, metrics: ExpertMetrics, input: string) => {
  const intent = normalize(input);
  const chargingFrequency = metrics.chargingFrequency ?? Math.max(1, Math.floor(profile.ev.epaRange / profile.dailyMiles));
  const batteryAdequacy = metrics.dailyBatteryAdequacy ?? (profile.dailyMiles / profile.ev.epaRange) * 100;
  const monthlyFuelSavings = metrics.monthlyFuelSavings ?? estimateMonthlySavings(profile);

  if (/(savings|cost|payback|break even|breakeven)/.test(intent)) {
    const deltaLine = monthlyFuelSavings >= 0
      ? `Monthly fuel savings are around ${toCurrency(monthlyFuelSavings)}.`
      : `Monthly fuel cost is higher by around ${toCurrency(Math.abs(monthlyFuelSavings))}.`;
    return `${deltaLine} Overuse is not required; the key is how often you refuel and the blended energy rate.`;
  }

  if (/(charging|charge|home)/.test(intent)) {
    return `You can refuel about every ${chargingFrequency} days at your current driving pace. A higher home charging share improves the cash flow signal.`;
  }

  if (/(range|utilization|adequacy)/.test(intent)) {
    return `Daily battery adequacy is about ${batteryAdequacy.toFixed(1)}% of your EPA range (${profile.ev.epaRange} miles), so range buffer is healthy.`;
  }

  return `I can explain monthly fuel savings, charging frequency, or battery adequacy trade-offs if you specify a focus.`;
};

export const buildLocalSummary = (profile: UserProfile, data: CostDataPoint[]): AISummary => {
  const lastPoint = data[data.length - 1];
  const breakEven = data.find(point => point.savings >= 0 && point.year >= 0)?.year ?? profile.ownershipYears;
  const monthlySavings = estimateMonthlySavings(profile);
  const batteryAdequacy = (profile.dailyMiles / profile.ev.epaRange) * 100;
  const chargingFrequency = Math.max(1, Math.floor(profile.ev.epaRange / profile.dailyMiles));
  const totalSavings = Math.max(0, lastPoint.savings);

  const recommendation = lastPoint.savings >= 0
    ? `Projected total cost advantage for EV is about ${toCurrency(lastPoint.savings)} over ${profile.ownershipYears} years.`
    : `Projected total cost advantage for ICE is about ${toCurrency(Math.abs(lastPoint.savings))} over ${profile.ownershipYears} years.`;

  return {
    totalSavings,
    breakEvenYear: breakEven,
    keyInsights: [
      `Daily battery adequacy is about ${batteryAdequacy.toFixed(1)}% of range, leaving buffer for variability.`,
      `Charging frequency is roughly every ${chargingFrequency} days at current usage.`,
      `Estimated monthly fuel savings are ${toCurrency(monthlySavings)}.`
    ],
    recommendation
  };
};
