import React, { useState } from 'react';
import { UserProfile } from '../types';
import { EV_MODELS, REGIONS, ELECTRICITY_RATES } from '../services/dataCatalog';
import { Icons } from '../constants';

interface ConfigurationWizardProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  onComplete: () => void;
}

const ConfigurationWizard: React.FC<ConfigurationWizardProps> = ({ profile, setProfile, onComplete }) => {
  const [showAboutModal, setShowAboutModal] = useState(false);
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
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                  <Icons.ElectricCar className="w-6 h-6" />
                </div>
              </div>
              <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">InsightPlug</h1>
              <p className="text-sm text-slate-600 mb-6">See how much time and money an EV actually saves you based on your daily routine</p>

              {/* Simple benefit icons */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">See Your Real Savings</h3>
                    <p className="text-xs text-slate-600">Monthly fuel costs compared to gas</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Forget the Gas Station!</h3>
                    <p className="text-xs text-slate-600">Charge at home overnight while you sleep</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Your Local Area</h3>
                    <p className="text-xs text-slate-600">Based on your state's electricity rates</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={() => setShowAboutModal(true)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold underline"
              >
                About this tool
              </button>
            </div>
          </div>
        </div>

        {/* Right: Compact Configuration */}
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-200 overflow-hidden">
          <div className="p-6 space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-900">Tell Us Your Routine</h2>
              <p className="text-sm text-slate-600">See your personalized savings in seconds</p>
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

      {/* About This Tool Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAboutModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-black text-slate-900">About InsightPlug</h2>
              <button onClick={() => setShowAboutModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">×</button>
            </div>

            <div className="space-y-5 text-sm text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900">
                InsightPlug helps you understand the real costs and benefits of electric vehicle ownership based on your personal routine.
              </p>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h3 className="font-bold text-emerald-900 mb-2">🎓 Research Foundation</h3>
                <p className="text-emerald-800 text-xs">
                  This tool applies <strong>Gary Becker's Household Production Theory</strong> to address consumer cost misperceptions about electric vehicles.
                  Rather than overwhelming you with data, we surface economically meaningful signals grounded in your local conditions.
                </p>
              </div>

              {/* Formulas */}
              <h3 className="font-bold text-slate-900">🧮 How We Calculate</h3>

              <div className="space-y-3">
                <div className="border-l-4 border-emerald-500 pl-4">
                  <h4 className="font-semibold text-slate-900 mb-1">💰 Monthly Fuel Savings</h4>
                  <div className="bg-slate-50 rounded p-2 font-mono text-xs text-slate-700 mb-1">
                    <div>Gas cost = (miles/month ÷ MPG) × gas price</div>
                    <div>EV cost = (miles/month ÷ mi/kWh) × blended rate</div>
                    <div className="mt-1 font-bold">Savings = Gas cost − EV cost</div>
                  </div>
                  <p className="text-xs text-slate-500">Blended rate = home % × residential rate (EIA) + public % × public charging rate (AAA). Public charging averages ~$0.40/kWh nationally — about 2× residential.</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-slate-900 mb-1">🔋 Daily Battery Usage (DAU)</h4>
                  <div className="bg-slate-50 rounded p-2 font-mono text-xs text-slate-700 mb-1">
                    DAU = (daily miles ÷ EPA range) × 100%
                  </div>
                  <p className="text-xs text-slate-500">Low DAU means the vehicle is over-provisioned — you're paying for more range than your routine needs.</p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-slate-900 mb-1">⏱️ Charging Interval</h4>
                  <div className="bg-slate-50 rounded p-2 font-mono text-xs text-slate-700 mb-1">
                    Interval = floor(EPA range ÷ daily miles) days
                  </div>
                  <p className="text-xs text-slate-500">Estimated days between home charges at your driving pace.</p>
                </div>
              </div>

              {/* Data Sources */}
              <h3 className="font-bold text-slate-900">📊 Data Sources</h3>

              <div className="space-y-2 text-xs">
                <div className="border border-slate-200 rounded-lg p-3">
                  <div className="font-semibold text-slate-800 mb-0.5">Daily Miles per Capita</div>
                  <div className="text-slate-500">Replica — county-level average daily miles traveled per adult (2023). Used as your region's baseline driving figure. <a href="https://www.replicahq.com/post/the-average-american-adult-travels-more-than-40-miles-per-day-in-2023-see-how-residents-in-your-county-rank" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Source</a>.</div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3">
                  <div className="font-semibold text-slate-800 mb-0.5">Residential Electricity Rates (home charging)</div>
                  <div className="text-slate-500">EIA <em>Electric Power Monthly</em>, Table 5.6.A — Average Price by State, December 2025 (preliminary). Updated monthly. 11 states covered: NY, CA, TX, FL, WA, MA, IL, GA, AZ, CO, OR. <a href="https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Source</a>.</div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3">
                  <div className="font-semibold text-slate-800 mb-0.5">Public Charging Rates (away from home)</div>
                  <div className="text-slate-500">AAA <em>EV Charging Prices</em> — per-state daily average across all commercial/public charging (L1/L2/L3). U.S. avg: 41.7 ¢/kWh. Per-state values stored for 11 states (NY, CA, TX, FL, WA, MA, IL, GA, AZ, CO, OR); other states fall back to the U.S. average. <a href="https://gasprices.aaa.com/ev-charging-prices/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Source</a>.</div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3">
                  <div className="font-semibold text-slate-800 mb-0.5">Gasoline Price</div>
                  <div className="text-slate-500">EIA Weekly U.S. All Grades All Formulations Retail Gasoline Prices — national average. Default set to $4.25/gal (week of 2026-04-13). Updated weekly by EIA. <a href="https://www.eia.gov/dnav/pet/pet_pri_gnd_a_epm0_pte_dpgal_w.htm" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Source</a>.</div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3">
                  <div className="font-semibold text-slate-800 mb-0.5">EV & ICE Vehicle Specs</div>
                  <div className="text-slate-500">fueleconomy.gov Side-by-Side Comparison (U.S. DOE / EPA, model year 2025). EPA range, MPGe, and MSRP for Tesla Model 3 LR RWD and Model Y LR RWD; Toyota Corolla and RAV4 as ICE benchmarks. MSRP data from Edmunds. <a href="https://www.fueleconomy.gov/feg/Find.do?action=sbsSelect" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Source</a>.</div>
                </div>
              </div>

              <p className="text-slate-500 italic text-xs pt-4 border-t border-slate-200">
                Research by Yulin Zeng, Sharon Hsiao, Yuhong Liu (Santa Clara University)
              </p>
            </div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationWizard;






