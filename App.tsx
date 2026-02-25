
import React, { useState } from 'react';
import { UserProfile } from './types';
import { EV_MODELS, REGIONS } from './services/dataCatalog';
import SimulationLab from './components/SimulationLab';

const App: React.FC = () => {
  const defaultEV = EV_MODELS[0];
  const [profile, setProfile] = useState<UserProfile>({
    region: REGIONS[0],
    ev: defaultEV,
    homeChargingRatio: 0.75,
    ownershipYears: 10,
    gasPrice: 3.45, // Updated to 2026 average
    iceMpg: defaultEV.iceBenchmark?.mpg || 28,
    icePrice: defaultEV.iceBenchmark?.price || 32000,
    evPrice: defaultEV.msrp,
    taxIncentive: 7500, // Federal tax credit (may vary)
    annualMileage: REGIONS[0].dailyMiles * 365,
    dailyMiles: REGIONS[0].dailyMiles,
    electricRate: 0.1789, // Updated to 2026 national average
    evEfficiency: 3.8, // kWh/mile for modern EVs
    maintenanceSavingPerYear: 500, // EV maintenance savings vs ICE
    homeChargingAccess: true
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f8fafc] overflow-hidden">
      <nav className="z-50 py-6 shrink-0">
        <div className="max-w-[1700px] mx-auto w-full px-12 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-black italic shadow-xl">IP</div>
            <div>
              <div className="font-extrabold text-xl tracking-tighter text-slate-900 leading-none flex items-center gap-1">
                InsightPlug<div className="w-1 h-1 rounded-full bg-emerald-500 mt-1"></div>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5 block">Intelligent Mobility Advisor</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active System</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-[1700px] mx-auto w-full px-12 pb-8 overflow-hidden">
        <SimulationLab profile={profile} setProfile={setProfile} />
      </main>
    </div>
  );
};

export default App;
