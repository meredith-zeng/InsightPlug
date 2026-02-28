import React, { useMemo, useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { ELECTRICITY_RATES, EV_MODELS, REGIONS } from '../services/dataCatalog';
import { buildExpertReply } from '../services/localAdvisor';
import { buildOpenAIReply, isOpenAIConfigured } from '../services/openaiAdvisor';
import { marked } from 'marked';
import ResultsPanel from './ResultsPanel';
import TheoryExplainer from './TheoryExplainer';
import { Icons } from '../constants';
import { createLimiter } from '../services/apiLimiter';

const SimulationLab: React.FC<{ profile: UserProfile, setProfile: (p: UserProfile) => void }> = ({ profile, setProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const limiterRef = useRef(createLimiter('insightplug-chat', { maxPerMinute: 6, maxTotal: 20 }));

  const PUBLIC_RATE_MULTIPLIER = 2.5;
  const USE_OPENAI = isOpenAIConfigured();

  // Debug: Log OpenAI mode status
  console.log('[SimulationLab] USE_OPENAI:', USE_OPENAI);

  const calculateMetrics = useMemo(() => {
    const milesPerMonth = profile.dailyMiles * 30.4;

    // Monthly fuel costs
    const legacyCost = Math.round((milesPerMonth / profile.iceMpg) * profile.gasPrice);

    // EV operating costs
    const stateRate = ELECTRICITY_RATES.find(r => r.state === profile.region.state)?.pricePerKwh || 0.1789;
    const blendedEvRate = (profile.homeChargingRatio * stateRate) + ((1 - profile.homeChargingRatio) * (stateRate * PUBLIC_RATE_MULTIPLIER));
    const efficientCost = Math.round((milesPerMonth / profile.evEfficiency) * blendedEvRate);

    const monthlySurplus = legacyCost - efficientCost;
    const dailyAssetUtilization = (profile.dailyMiles / profile.ev.epaRange) * 100;
    const interval = Math.floor(profile.ev.epaRange / profile.dailyMiles);

    // TCO Calculation
    const ownershipYears = 5;
    const annualFuelCost = legacyCost * 12;
    const annualEvEnergyCost = efficientCost * 12;
    const annualDepreciation = profile.icePrice * 0.15;
    const annualEvDepreciation = profile.evPrice * 0.10;

    const totalIceCost = (profile.icePrice) + (annualFuelCost * ownershipYears) +
                         (annualDepreciation * ownershipYears) +
                         (profile.maintenanceSavingPerYear * 3 * ownershipYears);

    const totalEvCost = (profile.evPrice) + (annualEvEnergyCost * ownershipYears) +
                        (annualEvDepreciation * ownershipYears) +
                        (profile.maintenanceSavingPerYear * ownershipYears);

    const tcoSavings = totalIceCost - totalEvCost;
    const breakEvenMiles = (profile.icePrice - profile.evPrice) /
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
    const limit = limiterRef.current.checkAndRecord();
    if (!limit.allowed) {
      const seconds = limit.retryAfterMs ? Math.ceil(limit.retryAfterMs / 1000) : null;
      const reason = limit.reason === 'total'
        ? 'You have reached the 20-question limit for this session.'
        : `Too many requests. Please wait ${seconds ?? 30}s and try again.`;
      setMessages(prev => [...prev, { role: 'model', content: reason }]);
      return;
    }
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setChatInput('');
    setIsTyping(true);
    try {
      let reply: string;

      console.log('[sendMessage] USE_OPENAI:', USE_OPENAI);

      if (USE_OPENAI) {
        console.log('[sendMessage] Attempting OpenAI API call...');
        try {
          reply = await buildOpenAIReply(profile, calculateMetrics, text);
          console.log('[sendMessage] OpenAI response received');
        } catch (openaiErr) {
          console.error('[sendMessage] OpenAI API failed, falling back to rule-based:', openaiErr);

          // Check if it's a 401 permission error
          const errorMsg = openaiErr instanceof Error ? openaiErr.message : String(openaiErr);
          if (errorMsg.includes('401') || errorMsg.includes('insufficient permissions')) {
            // Add a helpful message to the user
            setMessages(prev => [...prev, {
              role: 'model',
              content: `⚠️ **OpenAI API Configuration Issue**\n\nYour API key lacks necessary permissions. Please:\n1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)\n2. Create a new key with "model.request" permission\n3. Update \`.env.local\` with the new key\n4. Restart the dev server\n\nFalling back to rule-based responses for now...`
            }]);
            await new Promise(resolve => setTimeout(resolve, 350));
          }

          reply = buildExpertReply(profile, calculateMetrics, text);
        }
      } else {
        console.log('[sendMessage] Using rule-based response');
        reply = buildExpertReply(profile, calculateMetrics, text);
      }

      await new Promise(resolve => setTimeout(resolve, 350));
      setMessages(prev => [...prev, { role: 'model', content: reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

      {/* LEFT SIDEBAR */}
      <div className="lg:col-span-1 flex flex-col gap-6">

        {/* Quick Config */}
        <aside className="w-full bg-white rounded-[24px] border border-emerald-200 p-4 shadow-sm">
          <div className="text-[11px] font-black text-emerald-700 uppercase tracking-widest mb-3">Quick Config</div>
          <div className="space-y-3">
            <select
              value={profile.region.fips}
              onChange={(e) => {
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
              className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
            >
              {REGIONS.map(r => (
                <option key={r.fips} value={r.fips}>{r.name}, {r.state}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <select
                  value={profile.ev.model}
                  onChange={(e) => {
                    const ev = EV_MODELS.find(m => m.model === e.target.value) || EV_MODELS[0];
                    setProfile({
                      ...profile,
                      ev,
                      evPrice: ev.msrp,
                      icePrice: ev.iceBenchmark?.price || profile.icePrice,
                      iceMpg: ev.iceBenchmark?.mpg || profile.iceMpg
                    });
                  }}
                  className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                >
                  {EV_MODELS.map(ev => (
                    <option key={ev.model} value={ev.model}>{ev.publicLabel || ev.label}</option>
                  ))}
                </select>
              </div>
              <div className="group relative">
                <Icons.Info className="w-4 h-4 text-slate-400 hover:text-emerald-600 cursor-help transition-colors" />
                <div className="absolute right-0 top-full mt-1 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div>{profile.ev.detailLabel || profile.ev.label}</div>
                  <div className="text-[10px] text-slate-300 font-normal mt-1">vs {profile.ev.iceBenchmark?.model}</div>
                </div>
              </div>
            </div>

            <input
              type="number"
              value={profile.dailyMiles}
              onChange={e => setProfile({
                ...profile,
                dailyMiles: parseFloat(e.target.value) || 0,
                annualMileage: (parseFloat(e.target.value) || 0) * 365
              })}
              className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              placeholder="Daily miles"
            />

            <div>
              <div className="flex justify-between text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">
                <span>Home Charge</span>
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
            </div>
          </div>
        </aside>

        {/* Economic Framework - Theory Explainers */}
        <div className="space-y-3">
          <div className="text-sm font-black text-slate-900 uppercase tracking-widest px-1">Economic Framework</div>
          <p className="text-[9px] text-slate-500 italic px-1">Learn the theory behind each signal</p>
          <TheoryExplainer signal="surplus" />
          <TheoryExplainer signal="dau" />
          <TheoryExplainer signal="charging" />
        </div>

        {/* Expert Chat */}
        <aside className="w-full bg-slate-900 rounded-[24px] overflow-hidden flex flex-col border border-white/10 shadow-2xl">
          <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-5 bg-emerald-500 rounded-full shadow-xl shadow-emerald-500/50"></div>
              <div>
                <h3 className="text-base font-black text-white tracking-tight">Expert</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AI-Powered</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[9px] font-bold rounded-full transition-all border border-white/10"
            >
              {isChatOpen ? '−' : '+'}
            </button>
          </header>

          {/* Disclaimer */}
          <div className="px-4 py-3 bg-slate-800/50 border-b border-white/5">
            <p className="text-[9px] text-slate-400 leading-tight italic">
              ⓘ Educational tool only. Explanations help you understand economic trade-offs. Not financial advice. Consult a financial advisor for investment decisions.
            </p>
          </div>

          <div id="expert-chat-body" className={isChatOpen ? 'flex flex-col flex-1' : 'hidden'}>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent min-h-[300px]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg text-[12px] leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-white/10 text-white rounded-tr-none border border-white/10 font-bold' 
                      : 'bg-white/5 text-slate-300 border border-white/5 rounded-tl-none font-medium'
                  }`}>
                    {m.role === 'model' ? (
                      <div dangerouslySetInnerHTML={{ __html: marked.parse(m.content) }} />
                    ) : (
                      <span>{m.content}</span>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] font-black text-emerald-500/60 uppercase animate-pulse">Expert thinking...</div>}
            </div>

            <div className="px-4 py-2 flex flex-wrap gap-1 shrink-0">
              {['Savings?', 'Range?', 'Charging?'].map(p => (
                <button
                  key={p} onClick={() => sendMessage(p)}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 rounded-lg text-[9px] font-bold transition-all"
                >
                  {p}
                </button>
              ))}
            </div>

            <form onSubmit={e => { e.preventDefault(); sendMessage(chatInput); }} className="p-4 bg-slate-900 border-t border-white/5 flex gap-2 shrink-0">
              <input
                value={chatInput} onChange={e => setChatInput(e.target.value)}
                placeholder="Ask..."
                className="flex-1 bg-white/10 border border-white/10 text-white placeholder:text-slate-500 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              <button type="submit" disabled={isTyping} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-lg shadow-emerald-600/30">
                Send
              </button>
            </form>
            <div className="px-4 pb-3 text-[9px] text-slate-500 italic">
              Remaining questions: {limiterRef.current.peek().remaining ?? 0} / {limiterRef.current.options.maxTotal}
            </div>
          </div>
        </aside>

      </div>

      {/* RIGHT SIDE - MAIN METRICS */}
      <div className="lg:col-span-2">
        <ResultsPanel
          profile={profile}
          legacyCost={calculateMetrics.legacyCost}
          efficientCost={calculateMetrics.efficientCost}
          monthlySurplus={calculateMetrics.monthlySurplus}
          dailyAssetUtilization={calculateMetrics.dailyAssetUtilization}
          interval={calculateMetrics.interval}
        />
      </div>

    </div>
  );
};

export default SimulationLab;

