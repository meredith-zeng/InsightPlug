
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, Line, ComposedChart } from 'recharts';
import { UserProfile, ChatMessage } from '../types';
import { EV_MODELS, REGIONS, ELECTRICITY_RATES } from '../services/dataCatalog';
import { startResearchChat } from '../services/geminiService';
import { Icons } from '../constants';
import { marked } from 'marked';

const SimulationLab: React.FC<{ profile: UserProfile, setProfile: (p: UserProfile) => void }> = ({ profile, setProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = startResearchChat(profile);
    setChatSession(session);
    setMessages([{ 
      role: 'model', 
      content: `Lab initialized for **${profile.region.name}**. I'm monitoring the economic delta between gas and electric. What specific cost barrier should we investigate first?` 
    }]);
  }, [profile.region.fips, profile.ev.model]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const costData = useMemo(() => {
    const points = [];
    const stateRate = ELECTRICITY_RATES.find(r => r.state === profile.region.state)?.pricePerKwh || 0.15;
    const publicRate = 0.45; 
    const effectiveEvRate = (profile.homeChargingRatio * stateRate) + ((1 - profile.homeChargingRatio) * publicRate);
    
    let iceTotal = profile.icePrice;
    let evTotal = profile.evPrice - profile.taxIncentive;
    const annualMiles = profile.region.dailyMiles * 365;

    for (let i = 0; i <= 12; i++) {
      if (i > 0) {
        const gasCost = (annualMiles / profile.iceMpg) * profile.gasPrice;
        const maintenanceIce = 1200;
        const electricCost = (annualMiles / profile.ev.epaRange) * profile.ev.batteryCapacity * effectiveEvRate;
        const maintenanceEv = 400;
        iceTotal += gasCost + maintenanceIce;
        evTotal += electricCost + maintenanceEv;
      }
      points.push({ 
        year: i, 
        ice: Math.round(iceTotal), 
        ev: Math.round(evTotal),
        gap: Math.round(Math.abs(iceTotal - evTotal))
      });
    }
    return points;
  }, [profile]);

  const breakEvenYear = useMemo(() => {
    const crossover = costData.find(d => d.ev < d.ice);
    return crossover ? crossover.year : null;
  }, [costData]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setIsTyping(true);
    try {
      const stream = await chatSession.sendMessageStream({ message: userMsg });
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

  const renderMarkdown = (content: string) => {
    return { __html: marked.parse(content) };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      
      {/* COLUMN 1: CONTROLS (LEFT) */}
      <div className="lg:col-span-3 space-y-4">
        <div className="glass p-6 rounded-3xl space-y-6 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lab Controls</h4>
          
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Location</label>
            <select 
              value={profile.region.fips} 
              onChange={(e) => setProfile({...profile, region: REGIONS.find(r => r.fips === e.target.value)!})}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            >
              {REGIONS.map(r => <option key={r.fips} value={r.fips}>{r.name}, {r.state}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">EV Selection</label>
            <select 
              value={profile.ev.model}
              onChange={(e) => setProfile({...profile, ev: EV_MODELS.find(m => m.model === e.target.value)!})}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              {EV_MODELS.map(m => <option key={m.model} value={m.model}>{m.label}</option>)}
            </select>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Charging Habits</label>
              <span className="text-emerald-600 font-black text-xs">{Math.round(profile.homeChargingRatio * 100)}% Home</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05" 
              value={profile.homeChargingRatio}
              onChange={(e) => setProfile({...profile, homeChargingRatio: parseFloat(e.target.value)})}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
            />
            <div className="flex justify-between text-[8px] font-black text-slate-400 mt-2">
              <span>OUTSIDE</span>
              <span>RESIDENTIAL</span>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100/60 p-5 rounded-3xl shadow-sm">
           <div className="flex items-center gap-2 mb-3">
              <Icons.Info size={14} className="text-emerald-500" />
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Regional Fact</h4>
           </div>
           <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
             Average residents in <b>{profile.region.name}</b> spend <b>${(profile.region.dailyMiles * 365 / profile.iceMpg * profile.gasPrice).toLocaleString()}</b> on gas yearly. An EV reduces this to roughly <b>$450</b>.
           </p>
        </div>
      </div>

      {/* COLUMN 2: ANALYSIS & CHAT (CENTER) */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="glass p-8 rounded-[40px] shadow-sm border-slate-200/60">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Lifetime Ownership</h3>
              <div className="text-5xl font-extrabold tracking-tighter text-slate-900 flex items-baseline gap-2">
                ${(costData[10].ice - costData[10].ev).toLocaleString()}
                <span className="text-[10px] font-bold text-emerald-500 tracking-normal bg-emerald-50 px-2 py-0.5 rounded-full uppercase">10Y Net Savings</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase">ROI Point</p>
              <p className="text-lg font-black text-slate-800 italic">{breakEvenYear ? `Year ${breakEvenYear}` : 'Never'}</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={costData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'}}
                  itemStyle={{fontSize: '11px', fontWeight: 700}}
                />
                <Line type="monotone" dataKey="ice" name="Gas (ICE)" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="ev" name="Electric (EV)" stroke="#10b981" strokeWidth={4} dot={false} />
                {breakEvenYear && (
                  <ReferenceLine x={breakEvenYear} stroke="#10b981" strokeWidth={1} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHAT INTERFACE */}
        <div className="glass rounded-[40px] shadow-sm flex flex-col h-[400px] border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expert Consultation Session</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
            </div>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 chat-scroll bg-white/20">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none shadow-sm' 
                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-200 shadow-sm'
                }`}>
                  {m.role === 'model' ? (
                    <div className="prose prose-slate max-w-none prose-sm" dangerouslySetInnerHTML={renderMarkdown(m.content)} />
                  ) : (
                    <p className="font-medium">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 items-center text-slate-400 text-[10px] font-bold uppercase tracking-widest pl-2">
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce delay-150"></span>
                </span>
                Refining Analysis
              </div>
            )}
          </div>

          <div className="p-4 bg-white/50 border-t border-slate-100">
            <form onSubmit={sendMessage} className="relative flex gap-2">
              <input 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask about home installation costs or battery life..."
                className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
              <button disabled={isTyping} className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-black disabled:opacity-50 transition-colors">
                <Icons.Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* COLUMN 3: DE-BIASING (RIGHT) */}
      <div className="lg:col-span-3 space-y-6">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Behavioral Biases</h4>
        
        <div className="space-y-4">
          <div className="p-6 rounded-[32px] border border-red-100 bg-red-50/30 space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <Icons.Info size={16} strokeWidth={3} />
              <span className="text-[10px] font-extrabold uppercase tracking-tight">Focus Bias</span>
            </div>
            <p className="text-[11px] text-red-900/70 leading-relaxed font-medium">
              You're likely fixated on the <span className="font-bold text-red-950">${profile.evPrice.toLocaleString()}</span> initial cost. However, the EV's fuel cost per mile is <b>75% lower</b> than your current gas car.
            </p>
          </div>

          <div className="p-6 rounded-[32px] border border-blue-100 bg-blue-50/30 space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <Icons.Zap size={16} strokeWidth={3} />
              <span className="text-[10px] font-extrabold uppercase tracking-tight">Range Illusion</span>
            </div>
            <p className="text-[11px] text-blue-900/70 leading-relaxed font-medium">
              Your average daily drive of <b>{profile.region.dailyMiles.toFixed(1)} miles</b> consumes only <b>{Math.round((profile.region.dailyMiles / profile.ev.epaRange) * 100)}%</b> of your battery. You have enough "fuel" for <b>{Math.floor(profile.ev.epaRange / profile.region.dailyMiles)} days</b> of typical use.
            </p>
          </div>

          <div className="p-6 rounded-[32px] border border-emerald-100 bg-emerald-50/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600">
              <Icons.Check size={16} strokeWidth={3} />
              <span className="text-[10px] font-extrabold uppercase tracking-tight">Maintenance Drift</span>
            </div>
            <p className="text-[11px] text-emerald-900/70 leading-relaxed font-medium">
              Traditional cars have roughly <b>2,000</b> moving parts in the drivetrain. EVs have about <b>20</b>. This is why you save <b>$800+</b> every single year.
            </p>
          </div>
        </div>

        <div className="glass p-6 rounded-[32px] shadow-sm text-center border-slate-200/40">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Insight Summary</p>
           <div className="text-[12px] text-slate-600 leading-relaxed font-medium px-2 italic">
             "Over a 10-year period, this switch is the economic equivalent of receiving a <b>$2,000 annual raise</b> tax-free."
           </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationLab;
