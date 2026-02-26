import React, { useMemo, useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { REGIONS, EV_MODELS, ELECTRICITY_RATES } from '../services/dataCatalog';
import { buildExpertReply } from '../services/localAdvisor';
import { Icons } from '../constants';
import { marked } from 'marked';
import ResultsPanel from './ResultsPanel';

const SimulationLab: React.FC<{ profile: UserProfile, setProfile: (p: UserProfile) => void }> = ({ profile, setProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const PUBLIC_RATE_MULTIPLIER = 2.5;

  const calculateMetrics = useMemo(() => {
    const milesPerMonth = profile.dailyMiles * 30.4;
    const annualMiles = profile.dailyMiles * 365;

    // Monthly fuel costs
    const legacyCost = Math.round((milesPerMonth / profile.iceMpg) * profile.gasPrice);
    
    // EV operating costs
    const stateRate = ELECTRICITY_RATES.find(r => r.state === profile.region.state)?.pricePerKwh || 0.1789;
    const blendedEvRate = (profile.homeChargingRatio * stateRate) + ((1 - profile.homeChargingRatio) * (stateRate * PUBLIC_RATE_MULTIPLIER));
    const efficientCost = Math.round((milesPerMonth / profile.evEfficiency) * blendedEvRate);
    
    const monthlySurplus = legacyCost - efficientCost;
    const dailyAssetUtilization = (profile.dailyMiles / profile.ev.epaRange) * 100;
    const interval = Math.floor(profile.ev.epaRange / profile.dailyMiles);

    // TCO Calculation (5-year ownership)
    const ownershipYears = 5;
    const annualFuelCost = legacyCost * 12;
    const annualEvEnergyCost = efficientCost * 12;
    const annualDepreciation = profile.icePrice * 0.15; // Assume 15% annual depreciation
    const annualEvDepreciation = profile.evPrice * 0.10; // EV depreciation slightly lower

    const totalIceCost = (profile.icePrice) + (annualFuelCost * ownershipYears) +
                         (annualDepreciation * ownershipYears) +
                         (profile.maintenanceSavingPerYear * 3 * ownershipYears); // 3x maintenance for ICE

    const totalEvCost = (profile.evPrice - profile.taxIncentive) + (annualEvEnergyCost * ownershipYears) +
                        (annualEvDepreciation * ownershipYears) +
                        (profile.maintenanceSavingPerYear * ownershipYears);

    const tcoSavings = totalIceCost - totalEvCost;
    const breakEvenMiles = (profile.icePrice - (profile.evPrice - profile.taxIncentive)) /
                          ((profile.gasPrice / profile.iceMpg) - (blendedEvRate / profile.evEfficiency));

    return {
      legacyCost,
      efficientCost,
      monthlySurplus,
      dailyAssetUtilization: Math.min(100, dailyAssetUtilization),
      interval: Math.max(1, interval),
      tcoSavings: Math.round(tcoSavings),
      breakEvenMiles: Math.round(breakEvenMiles),
      totalIceCost: Math.round(totalIceCost),
      totalEvCost: Math.round(totalEvCost),
    };
  }, [profile]);



  useEffect(() => {
    const welcome = `
**EV ECO EXPERT ONLINE**
I've analyzed your mobility constraints:
*   **Time Gain**: Refuel every **${calculateMetrics.interval} days**.
*   **Cash Flow**: Recapture **$${calculateMetrics.monthlySurplus}** monthly.
*   **Asset Use**: **${calculateMetrics.dailyAssetUtilization.toFixed(1)}%** daily utilization.

How can I help you optimize further?
    `;
    setMessages([{ role: 'model', content: welcome }]);
  }, [profile.region.fips, profile.ev.model, profile.dailyMiles, calculateMetrics]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setChatInput('');
    setIsTyping(true);
    try {
      const reply = buildExpertReply(profile, calculateMetrics, text);
      await new Promise(resolve => setTimeout(resolve, 350));
      setMessages(prev => [...prev, { role: 'model', content: reply }]);
    } catch (err) { console.error(err); } finally { setIsTyping(false); }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">

      {/* COLUMN 1: CONFIGURATION (Left Sidebar) */}
      <aside className="w-full lg:w-[280px] glass rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 flex flex-col gap-6 shrink-0 border-slate-200/50">
        <header className="flex items-center gap-3 shrink-0">
          <div className="w-1 h-5 bg-slate-900 rounded-full"></div>
          <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Configuration</h2>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto chat-scroll pr-1">
          <section className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Geographic Anchor</label>
            <select 
              value={profile.region.fips}
              onChange={(e) => {
                const r = REGIONS.find(reg => reg.fips === e.target.value)!;
                setProfile({ ...profile, region: r, dailyMiles: r.dailyMiles });
              }}
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
            >
              {REGIONS.map(r => <option key={r.fips} value={r.fips}>{r.name}</option>)}
            </select>
          </section>

          <section className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Vehicle Profile</label>
            <select 
              value={profile.ev.model}
              onChange={(e) => {
                const m = EV_MODELS.find(ev => ev.model === e.target.value)!;
                setProfile({
                  ...profile,
                  ev: m,
                  evPrice: m.msrp,
                  iceMpg: m.iceBenchmark?.mpg || 28,
                  icePrice: m.iceBenchmark?.price || 32000,
                });
              }}
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
            >
              {EV_MODELS.map(ev => <option key={ev.model} value={ev.model}>{ev.label}</option>)}
            </select>
          </section>

          <div className="grid grid-cols-2 gap-3">
            <section className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Efficiency</label>
              <input 
                type="number" value={profile.evEfficiency}
                onChange={e => setProfile({...profile, evEfficiency: parseFloat(e.target.value) || 0})}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-lg p-2.5 text-xs font-bold outline-none"
              />
            </section>
            <section className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Battery</label>
              <input 
                type="number" value={profile.ev.batteryCapacity}
                readOnly
                className="w-full bg-slate-100 border border-slate-200/60 rounded-lg p-2.5 text-xs font-bold outline-none text-slate-400"
              />
            </section>
          </div>

          <section className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Daily Travel (mi)</label>
            <input 
              type="number" value={profile.dailyMiles}
              onChange={e => setProfile({...profile, dailyMiles: parseFloat(e.target.value) || 0})}
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-sm font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm"
            />
          </section>

          <section className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Home Charging</label>
              <span className="text-[10px] font-black text-emerald-600">{Math.round(profile.homeChargingRatio * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="100" value={profile.homeChargingRatio * 100}
              onChange={e => setProfile({...profile, homeChargingRatio: parseFloat(e.target.value) / 100})}
              className="w-full accent-emerald-500 h-1 bg-slate-100 rounded-full appearance-none cursor-pointer"
            />
          </section>

          <section className="space-y-2 pt-3 border-t border-slate-100">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-3">Vehicle Pricing (2026)</div>
            <div className="space-y-2">
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">EV MSRP</div>
                <div className="text-lg font-black text-emerald-600">${profile.evPrice.toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Benchmark ICE</div>
                <div className="text-lg font-black text-slate-900">${profile.icePrice.toLocaleString()}</div>
                <div className="text-[8px] text-slate-400 mt-1">{profile.ev.iceBenchmark?.model || 'N/A'}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Price Premium</div>
                <div className="text-lg font-black text-blue-600">${(profile.evPrice - profile.icePrice).toLocaleString()}</div>
              </div>
            </div>
          </section>
        </div>

        <div className="shrink-0 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Icons.Info size={12} className="text-slate-400" />
            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Logic Insight</span>
          </div>
          <p className="text-[8px] text-slate-400 leading-normal">
            Money Signal = [Legacy Cost] - [Blended EV Cost].<br/>
            Legacy: (Miles / MPG) * Gas Price<br/>
            Blended: Efficiency * (Home Rate% + Public Rate% * {PUBLIC_RATE_MULTIPLIER})
          </p>
        </div>
      </aside>

      {/* COLUMN 2: MAIN SIGNALS (Center Stack) */}
      <ResultsPanel
        profile={profile}
        legacyCost={calculateMetrics.legacyCost}
        efficientCost={calculateMetrics.efficientCost}
        monthlySurplus={calculateMetrics.monthlySurplus}
        dailyAssetUtilization={calculateMetrics.dailyAssetUtilization}
        interval={calculateMetrics.interval}
      />

      {/* COLUMN 3: LLM EXPERT (Right Sidebar) */}
      <aside className="w-full lg:w-[380px] bg-slate-900 rounded-[28px] sm:rounded-[40px] shadow-2xl flex flex-col overflow-hidden shrink-0 border border-white/5">
        <header className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between gap-4 bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-emerald-500/20 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <Icons.Zap size={16} fill="currentColor" />
              </div>
            </div>
            <div>
              <h2 className="text-white font-black text-lg uppercase tracking-widest leading-none">EV Eco Expert</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active reasoning</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsChatOpen(prev => !prev)}
            className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
            aria-expanded={isChatOpen}
            aria-controls="expert-chat-body"
          >
            {isChatOpen ? 'Collapse' : 'Expand'}
          </button>
        </header>

        <div id="expert-chat-body" className={isChatOpen ? 'flex flex-col flex-1' : 'hidden'}>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 chat-scroll bg-transparent">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-5 rounded-[24px] shadow-sm text-xs leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-white/10 text-white rounded-tr-none border border-white/10 font-bold' 
                    : 'bg-white/5 text-slate-300 border border-white/5 rounded-tl-none font-medium'
                }`}>
                  {m.role === 'model' ? (
                    <div className="prose prose-invert prose-sm max-w-none text-[12px] leading-relaxed" dangerouslySetInnerHTML={{ __html: marked.parse(m.content) }} />
                  ) : (
                    <span>{m.content}</span>
                  )}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[9px] font-black text-emerald-500/50 uppercase animate-pulse flex items-center gap-2 pl-2 tracking-widest">Expert Thinking...</div>}
          </div>

          <div className="px-6 sm:px-8 pb-3 flex flex-wrap gap-2 shrink-0">
            {['5-year savings?', 'Home charging impact?', 'Battery capacity?'].map(p => (
              <button
                key={p} onClick={() => sendMessage(p)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white border border-white/5 rounded-full text-[9px] font-bold transition-all"
              >
                {p}
              </button>
            ))}
          </div>

          <form onSubmit={e => { e.preventDefault(); sendMessage(chatInput); }} className="p-6 sm:p-8 bg-slate-900 border-t border-white/5 flex gap-3 shrink-0">
            <input
              value={chatInput} onChange={e => setChatInput(e.target.value)}
              placeholder="Question the trade-offs..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700 font-bold"
            />
            <button disabled={isTyping} className="bg-emerald-500 text-slate-900 p-4 rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/10 shrink-0">
              <Icons.Send size={22} />
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
};

export default SimulationLab;
