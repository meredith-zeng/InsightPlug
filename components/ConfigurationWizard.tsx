import React from 'react';
import { UserProfile } from '../types';
import { EV_MODELS, REGIONS, ELECTRICITY_RATES } from '../services/dataCatalog';
import { Icons } from '../constants';

interface ConfigurationWizardProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  onComplete: () => void;
}

const ConfigurationWizard: React.FC<ConfigurationWizardProps> = ({ profile, setProfile, onComplete }) => {
  const selectedRegion = REGIONS.find(r => r.fips === profile.region.fips) || REGIONS[0];
  const selectedEV = EV_MODELS.find(ev => ev.model === profile.ev.model) || EV_MODELS[0];

  return (
    <div className="min-h-screen w-full bg-emerald-50 text-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Visual Effects */}
        <div className="relative rounded-3xl overflow-hidden border border-emerald-200 bg-white p-6 min-h-[400px] flex flex-col justify-between">
          <div className="absolute inset-0">
            {/* Floating particles */}
            <div className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ top: '20%', left: '15%', animationDuration: '2s' }} />
            <div className="absolute w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" style={{ top: '60%', left: '25%', animationDuration: '3s', animationDelay: '0.5s' }} />
            <div className="absolute w-2 h-2 bg-emerald-300 rounded-full animate-pulse" style={{ top: '30%', right: '20%', animationDuration: '2.5s', animationDelay: '1s' }} />
            <div className="absolute w-1 h-1 bg-emerald-600 rounded-full animate-pulse" style={{ top: '70%', right: '15%', animationDuration: '3.5s', animationDelay: '1.5s' }} />
            <div className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ bottom: '20%', left: '30%', animationDuration: '2.2s', animationDelay: '0.8s' }} />

            {/* Large gradient orbs with stronger intensity */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-300/60 blur-3xl animate-pulse" />
            <div className="absolute -bottom-32 -right-24 w-96 h-96 bg-emerald-200/60 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/40 blur-2xl animate-pulse" style={{ animationDelay: '0.75s' }} />
            <div className="absolute bottom-10 left-10 w-64 h-64 bg-emerald-300/30 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Spinning rings with multiple layers */}
            <div className="absolute -top-16 right-8 w-56 h-56 rounded-full border-2 border-emerald-400/50 animate-spin" style={{ animationDuration: '20s' }} />
            <div className="absolute -top-12 right-12 w-48 h-48 rounded-full border border-emerald-300/30 animate-spin" style={{ animationDuration: '14s', animationDirection: 'reverse' }} />
            <div className="absolute bottom-20 left-16 w-40 h-40 rounded-full border border-emerald-400/40 animate-spin" style={{ animationDuration: '18s' }} />

            {/* Radial gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.15),_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_60%)]" />

            {/* Subtle grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.06)_1px,transparent_1px)] bg-[size:32px_32px]" />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-lg italic">IP</div>
              </div>
              <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">InsightPlug</h1>
              <p className="text-sm text-slate-600">EV Economic Literacy Tool</p>
            </div>
            <div className="text-xs text-slate-700 leading-relaxed space-y-2">
              <p className="font-bold text-slate-800">About InsightPlug</p>
              <p>
                InsightPlug applies <strong>Becker's Household Production Theory</strong> to address consumer cost misperceptions about electric vehicles. Rather than overwhelming you with data, we surface three economically meaningful signals grounded in your local conditions:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li><strong>Monthly Surplus</strong> - Immediate liquidity gains (combats temporal discounting)</li>
                <li><strong>Daily Asset Utilization</strong> - Capital allocation efficiency</li>
                <li><strong>Charging Interval</strong> - Labor reduction (combats time-intensive bias)</li>
              </ul>
              <p className="text-slate-500 italic text-[10px]">Research by Yulin Zeng, Sharon Hsiao, Yuhong Liu (Santa Clara University)</p>
            </div>
          </div>
        </div>

        {/* Right: Compact Configuration */}
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-200 overflow-hidden">
          <div className="p-6 space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-900">Quick Configuration</h2>
              <p className="text-sm text-slate-600">Adjust and continue</p>
            </div>

            {/* Location */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Icons.MapPin className="w-4 h-4 text-emerald-600" />
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Location</label>
              </div>
              <select
                value={profile.region.fips}
                onChange={e => {
                  const region = REGIONS.find(r => r.fips === e.target.value) || REGIONS[0];
                  const stateRate = ELECTRICITY_RATES.find(s => s.state === region.state);
                  setProfile({
                    ...profile,
                    region,
                    dailyMiles: region.dailyMiles,
                    annualMileage: region.dailyMiles * 365,
                    electricRate: stateRate?.pricePerKwh || profile.electricRate
                  });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {REGIONS.map(r => (
                  <option key={r.fips} value={r.fips}>
                    {r.name}, {r.state}
                  </option>
                ))}
              </select>
            </section>

            {/* EV */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Icons.Zap className="w-4 h-4 text-blue-600" />
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">EV Model</label>
                <div className="ml-auto group relative">
                  <Icons.Info className="w-4 h-4 text-slate-400 hover:text-blue-600 cursor-help transition-colors" />
                  <div className="absolute right-0 top-full mt-1 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <div>{selectedEV.detailLabel || selectedEV.label}</div>
                    <div className="text-[10px] text-slate-300 font-normal mt-1">vs {selectedEV.iceBenchmark?.model}</div>
                  </div>
                </div>
              </div>
              <select
                value={profile.ev.model}
                onChange={e => {
                  const ev = EV_MODELS.find(m => m.model === e.target.value) || EV_MODELS[0];
                  setProfile({
                    ...profile,
                    ev,
                    evPrice: ev.msrp,
                    icePrice: ev.iceBenchmark?.price || profile.icePrice,
                    iceMpg: ev.iceBenchmark?.mpg || profile.iceMpg
                  });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {EV_MODELS.map(ev => (
                  <option key={ev.model} value={ev.model}>
                    {ev.publicLabel || ev.label}
                  </option>
                ))}
              </select>
            </section>

            {/* Driving */}
            <section className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Daily Miles</label>
              <input
                type="number"
                value={profile.dailyMiles}
                onChange={e => setProfile({
                  ...profile,
                  dailyMiles: parseFloat(e.target.value) || 0,
                  annualMileage: (parseFloat(e.target.value) || 0) * 365
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </section>

            <section className="space-y-2">
              <div className="flex justify-between text-xs font-black text-slate-700 uppercase tracking-widest">
                <span>Home Charging</span>
                <span>{Math.round(profile.homeChargingRatio * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={profile.homeChargingRatio * 100}
                onChange={e => setProfile({...profile, homeChargingRatio: parseFloat(e.target.value) / 100})}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
              />
            </section>
          </div>

          <div className="bg-emerald-700 p-5">
            <button
              onClick={onComplete}
              className="w-full bg-white text-emerald-800 font-black text-base py-3 rounded-2xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
            >
              View My Analysis
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationWizard;

