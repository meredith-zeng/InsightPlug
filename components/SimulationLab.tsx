
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { REGIONS, EV_MODELS, ELECTRICITY_RATES } from '../services/dataCatalog';
import { startResearchChat } from '../services/geminiService';
import { Icons } from '../constants';
import { marked } from 'marked';

const SimulationLab: React.FC<{ profile: UserProfile, setProfile: (p: UserProfile) => void }> = ({ profile, setProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const PUBLIC_RATE_MULTIPLIER = 2.5;

  const calculateMetrics = useMemo(() => {
    const milesPerMonth = profile.dailyMiles * 30.4;
    const legacyCost = Math.round((milesPerMonth / profile.iceMpg) * profile.gasPrice);
    
    const stateRate = ELECTRICITY_RATES.find(r => r.state === profile.region.state)?.pricePerKwh || 0.15;
    const blendedEvRate = (profile.homeChargingRatio * stateRate) + ((1 - profile.homeChargingRatio) * (stateRate * PUBLIC_RATE_MULTIPLIER));
    const efficientCost = Math.round((milesPerMonth / profile.evEfficiency) * blendedEvRate);
    
    const monthlySurplus = legacyCost - efficientCost;
    const dailyAssetUtilization = (profile.dailyMiles / profile.ev.epaRange) * 100;
    const interval = Math.floor(profile.ev.epaRange / profile.dailyMiles);

    return {
      legacyCost,
      efficientCost,
      monthlySurplus,
      dailyAssetUtilization: Math.min(100, dailyAssetUtilization),
      interval: Math.max(1, interval)
    };
  }, [profile]);

  const mapUrl = useMemo(() => {
    const zoom = profile.dailyMiles <= 20 ? 12 : 11;
    return `https://maps.google.com/maps?q=${encodeURIComponent(profile.region.name + ', ' + profile.region.state)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
  }, [profile.region, profile.dailyMiles]);

  useEffect(() => {
    const session = startResearchChat(profile);
    setChatSession(session);
    
    const welcome = `
**EV ECO EXPERT ONLINE**
I've analyzed your mobility constraints:
*   **Time Gain**: Refuel every **${calculateMetrics.interval} days**.
*   **Cash Flow**: Recapture **$${calculateMetrics.monthlySurplus}** monthly.
*   **Asset Use**: **${calculateMetrics.dailyAssetUtilization.toFixed(1)}%** daily utilization.

How can I help you optimize further?
    `;
    setMessages([{ role: 'model', content: welcome }]);
  }, [profile.region.fips, profile.ev.model, profile.dailyMiles]);

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
      const stream = await chatSession.sendMessageStream({ message: text });
      let fullText = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);
      for await (const chunk of stream) {
        fullText += chunk.text;
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1].content = fullText;
          return next;
        });
      }
    } catch (err) { console.error(err); } finally { setIsTyping(false); }
  };

  return (
    <div className="flex gap-6 h-full w-full overflow-hidden items-stretch">
      
      {/* COLUMN 1: CONFIGURATION (Left Sidebar) */}
      <aside className="w-[280px] glass rounded-[32px] p-6 flex flex-col gap-6 shrink-0 border-slate-200/50">
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
                setProfile({ ...profile, ev: m });
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
      <main className="flex-1 grid grid-rows-[auto_1fr_auto] gap-4 h-full overflow-hidden">
        
        {/* ROW 1: MONTHLY SURPLUS */}
        <div className="bg-white rounded-[32px] p-6 shadow-lg shadow-slate-200/20 border border-slate-100 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-0.5">Money Signal: Monthly Surplus</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-none">Immediate Disposable Income Recovery</p>
            </div>
            <div className="text-right">
              <span className="text-5xl font-black text-emerald-500 tracking-tighter leading-none">+${calculateMetrics.monthlySurplus}</span>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Available / Mo</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-[20px] bg-slate-50 border border-slate-100 text-center flex flex-col justify-center">
              <span className="text-[9px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">Legacy Liquidity Flow</span>
              <span className="text-2xl font-black text-slate-900">${calculateMetrics.legacyCost}</span>
            </div>
            <div className="p-4 rounded-[20px] bg-emerald-50/50 border border-emerald-100 text-center flex flex-col justify-center">
              <span className="text-[9px] font-black text-emerald-600 uppercase mb-0.5 tracking-widest">Efficient Liquidity Flow</span>
              <span className="text-2xl font-black text-emerald-500">${calculateMetrics.efficientCost}</span>
            </div>
          </div>
        </div>

        {/* ROW 2: ASSET UTILIZATION & MAP (Expanding Area) */}
        <div className="grid grid-cols-2 gap-4 min-h-0">
          {/* Asset Card */}
          <div className="bg-white rounded-[32px] p-6 shadow-lg shadow-slate-200/20 border border-slate-100 flex flex-col overflow-hidden">
            <header className="mb-2">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-0.5">Money Signal: Daily Asset Utilization</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Proportion of Capital Consumed per Cycle</p>
            </header>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-3 flex items-baseline">
                <span className="text-6xl font-black text-slate-900 tracking-tighter leading-none">{calculateMetrics.dailyAssetUtilization.toFixed(1)}</span>
                <span className="text-2xl text-slate-200 ml-2 font-black">%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${calculateMetrics.dailyAssetUtilization}%` }}
                ></div>
              </div>
            </div>

            <p className="mt-3 text-[10px] font-medium text-slate-500 leading-relaxed italic">
              Surfacing the share of battery capacity used vs. <span className="text-blue-600 font-black tracking-tight underline decoration-blue-200 underline-offset-2">Over-provisioned Capital.</span>
            </p>
          </div>

          {/* Map Card */}
          <div className="bg-white rounded-[32px] p-6 shadow-lg shadow-slate-200/20 border border-slate-100 flex flex-col overflow-hidden">
            <header className="mb-2">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-0.5">Active Mobility Zone</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Spatial Reach</p>
            </header>
            <div className="flex-1 rounded-2xl overflow-hidden relative bg-slate-50 border border-slate-100">
              <iframe 
                key={mapUrl}
                width="100%" height="100%" 
                style={{ border: 0 }} 
                src={mapUrl}
                loading="lazy"
              ></iframe>
              <div className="absolute inset-0 pointer-events-none border-[6px] border-white/50 rounded-2xl"></div>
              <div className="absolute top-2 left-2 right-2 text-center">
                <span className="bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black text-emerald-600 shadow-sm border border-emerald-50/50 uppercase tracking-widest">
                  {profile.dailyMiles} MI Life Circle
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: REFUELING SCHEDULE */}
        <div className="bg-white rounded-[32px] p-6 shadow-lg shadow-slate-200/20 border border-slate-100 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <div>
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-0.5">Refueling Schedule</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">30-Day Labor Cycle</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-slate-900">Every {calculateMetrics.interval} Days</span>
              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none mt-0.5">Automated Frequency</p>
            </div>
          </div>
          
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div className="grid grid-cols-7 gap-1.5 w-full">
              {Array.from({ length: 28 }).map((_, i) => {
                const day = i + 1;
                const isRefuel = day % calculateMetrics.interval === 1;
                return (
                  <div 
                    key={day} 
                    className={`aspect-square rounded-xl flex items-center justify-center relative transition-all duration-300 ${
                      isRefuel 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-slate-50/50 text-slate-300 border border-slate-100/50'
                    }`}
                  >
                    <span className="text-[10px] font-bold">{day}</span>
                    {isRefuel && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full ring-1 ring-slate-900"></div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center gap-10 pt-4 mt-2 border-t border-slate-50 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-slate-900"></div>
              <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{Math.ceil(28/calculateMetrics.interval)} Refuels</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-100"></div>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{28 - Math.ceil(28/calculateMetrics.interval)} Passive Days</span>
            </div>
          </div>
        </div>
      </main>

      {/* COLUMN 3: LLM EXPERT (Right Sidebar) */}
      <aside className="w-[380px] bg-slate-900 rounded-[40px] shadow-2xl flex flex-col overflow-hidden shrink-0 border border-white/5">
        <header className="p-8 border-b border-white/5 flex items-center gap-4 bg-slate-900/50 shrink-0">
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
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 chat-scroll bg-transparent">
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

        <div className="px-8 pb-3 flex flex-wrap gap-2 shrink-0">
          {['5-year savings?', 'Home charging impact?', 'Battery capacity?'].map(p => (
            <button 
              key={p} onClick={() => sendMessage(p)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white border border-white/5 rounded-full text-[9px] font-bold transition-all"
            >
              {p}
            </button>
          ))}
        </div>

        <form onSubmit={e => { e.preventDefault(); sendMessage(chatInput); }} className="p-8 bg-slate-900 border-t border-white/5 flex gap-3 shrink-0">
          <input 
            value={chatInput} onChange={e => setChatInput(e.target.value)}
            placeholder="Question the trade-offs..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700 font-bold"
          />
          <button disabled={isTyping} className="bg-emerald-500 text-slate-900 p-4 rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/10 shrink-0">
            <Icons.Send size={22} />
          </button>
        </form>
      </aside>
    </div>
  );
};

export default SimulationLab;
