import React, { useState } from 'react';
import { UserProfile } from './types';
import { EV_MODELS, REGIONS } from './services/dataCatalog';
import ConfigurationWizard from './components/ConfigurationWizard';
import SimulationLab from './components/SimulationLab';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  const defaultEV = EV_MODELS[0];
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    region: REGIONS[0],
    ev: defaultEV,
    homeChargingRatio: 0.75,
    ownershipYears: 10,
    gasPrice: 3.45, // Updated to 2026 average
    iceMpg: defaultEV.iceBenchmark?.mpg || 28,
    icePrice: defaultEV.iceBenchmark?.price || 32000,
    evPrice: defaultEV.msrp,
    annualMileage: REGIONS[0].dailyMiles * 365,
    dailyMiles: REGIONS[0].dailyMiles,
    electricRate: 0.1789, // Updated to 2026 national average
    evEfficiency: 3.8, // kWh/mile for modern EVs
    maintenanceSavingPerYear: 500, // EV maintenance savings vs ICE
    homeChargingAccess: true
  });

  // Show Configuration Wizard first, then Analysis
  if (!showAnalysis) {
    return (
      <ErrorBoundary>
        <ConfigurationWizard profile={profile} setProfile={setProfile} onComplete={() => setShowAnalysis(true)} />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f8fafc]">
      <nav className="z-50 py-4 sm:py-6 shrink-0">
        <div className="max-w-[1700px] mx-auto w-full px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-black italic shadow-xl">IP</div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">InsightPlug</h1>
              <p className="text-[10px] font-semibold text-slate-500 tracking-tight">EV Economic Literacy Tool</p>
            </div>
          </div>
          <button
            onClick={() => setShowAnalysis(false)}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-all text-sm flex items-center gap-2 border border-slate-200"
          >
            ← Edit Configuration
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-[1700px] mx-auto w-full px-4 sm:px-6 lg:px-12 pb-6 sm:pb-8">
        <ErrorBoundary>
          <SimulationLab profile={profile} setProfile={setProfile} />
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default App;
