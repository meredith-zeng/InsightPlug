
import React, { useState } from 'react';
import { UserProfile } from './types';
import { EV_MODELS, REGIONS } from './services/dataCatalog';
import SimulationLab from './components/SimulationLab';
import { Icons } from './constants';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    region: REGIONS[0],
    ev: EV_MODELS[0],
    homeChargingRatio: 0.8,
    ownershipYears: 10,
    gasPrice: 3.50,
    iceMpg: 28,
    icePrice: 32000,
    evPrice: 45000,
    taxIncentive: 7500,
    annualMileage: 12000,
    dailyMiles: REGIONS[0].dailyMiles, // Initialize with regional average
    electricRate: 0.15,
    evEfficiency: 3.5,
    maintenanceSavingPerYear: 800,
    homeChargingAccess: true
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfdfe]">
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/60">
        <div className="max-w-[1600px] mx-auto w-full px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg">IP</div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">InsightPlug<span className="text-emerald-500">.</span></div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Economic De-biasing Module</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Session Status</span>
              <span className="text-[11px] font-black text-emerald-600">ACTIVE ANALYSIS</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <button className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">
              Data Sources
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-8 overflow-hidden">
        <SimulationLab profile={profile} setProfile={setProfile} />
      </main>

      <footer className="p-6 border-t border-slate-100 text-center text-slate-400 text-[9px] font-black uppercase tracking-[0.3em]">
        InsightPlug v3.1 // Personalizing the Electric Transition // Census Verified
      </footer>
    </div>
  );
};

export default App;
