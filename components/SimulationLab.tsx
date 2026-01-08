
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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

  const calculateZoom = (miles: number) => {
    if (miles <= 5) return 14;
    if (miles <= 10) return 13;
    if (miles <= 20) return 12;
    if (miles <= 40) return 11;
    if (miles <= 80) return 10;
    return 9;
  };

  const dynamicZoom = useMemo(() => calculateZoom(profile.dailyMiles), [profile.dailyMiles]);
  const freeMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(profile.region.name + ', ' + profile.region.state)}&t=&z=${dynamicZoom}&ie=UTF8&iwloc=&output=embed`;

  const metrics = useMemo(() => {
    const milesPerMonth = profile.dailyMiles * 30.4;
    const gasCost = Math.round((milesPerMonth / profile.iceMpg) * profile.gasPrice);
    const stateRate = ELECTRICITY_RATES.find(r => r.state === profile.region.state)?.pricePerKwh || 0.15;
    const effectiveEvRate = (profile.homeChargingRatio * stateRate) + ((1 - profile.homeChargingRatio) * 0.45);
    const electricCost = Math.round((milesPerMonth / profile.evEfficiency) * effectiveEvRate);
    
    const monthlySaving = (gasCost + 80) - (electricCost + 20); 
    const priceGap = profile.evPrice - profile.icePrice - profile.taxIncentive;
    const yearsToBreakEven = priceGap / (monthlySaving * 12);
    const tenYearSaving = (monthlySaving * 12 * 10) - priceGap;

    return {
      chartData: [
        { name: 'ICE Cost', value: gasCost + 80, type: 'ice' },
        { name: 'EV Cost', value: electricCost + 20, type: 'ev' }
      ],
      monthlySaving: Math.round(monthlySaving),
      electricCost,
      gasCost,
      priceGap: Math.max(0, priceGap),
      yearsToBreakEven: yearsToBreakEven.toFixed(1),
      tenYearSaving: Math.round(tenYearSaving)
    };
  }, [profile]);

  const batteryUsagePct = Math.min(100, (profile.dailyMiles / profile.ev.epaRange) * 100);
  const daysOfRange = Math.floor(profile.ev.epaRange / profile.dailyMiles);

  const GUIDED_FAQS = [
    { label: "Is public charging accessible?", query: `Show me the public charging density in ${profile.region.name} based on the map view.` },
    { label: "How is the ROI calculated?", query: "Can you break down the break-even math considering local electricity rates?" },
    { label: "What about long distance?", query: "I occasionally travel outside this map view. How does the range hold up for longer trips?" }
  ];

  useEffect(() => {
    const session = startResearchChat(profile);
    setChatSession(session);
    
    const welcome = `
### 📍 Geographic Anchor: ${profile.region.name}
I have calibrated the map scale (Zoom: ${dynamicZoom}) to represent your daily activity radius of **${profile.dailyMiles} miles**.

**Your Personalized Grounding:**
- **Spatial Context**: The visible map area covers your primary daily driving reach.
- **Energy Perspective**: In ${profile.region.name}, a gas vehicle "leaks" cash across this map. With an EV, you only consume **${batteryUsagePct.toFixed(1)}%** of your battery capacity to cover this entire visible terrain.
- **Charging Profile**: With **${profile.homeChargingRatio * 100}%** home charging access, your "invisible fuel station" is already operational.

Would you like to see specific charging hubs within this visible radius?
    `;
    setMessages([{ role: 'model', content: welcome }]);
  }, [profile.region.fips, profile.ev.model, profile.dailyMiles, dynamicZoom, profile.homeChargingRatio]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const updateRegion = (fips: string) => {
    const region = REGIONS.find(r => r.fips === fips)!;
    setProfile({ ...profile, region, dailyMiles: region.dailyMiles, annualMileage: region.dailyMiles * 365 });
  };

  const updateDailyMiles = (val: string) => {
    const miles = Math.max(0, parseFloat(val) || 0);
    setProfile({ ...profile, dailyMiles: miles, annualMileage: miles * 365 });
  };

  const updateHomeRatio = (val: string) => {
    setProfile({ ...profile, homeChargingRatio: parseFloat(val) / 100 });
  };

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT: CONTROLS & MAP */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* LIFE DYNAMICS CARD */}
        <div className="glass p-6 rounded-[32px] space-y-6 shadow-sm border-slate-200/40">
          <header className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Life Dynamics</h4>
          </header>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase">Primary Region</label>
              <select 
                value={profile.region.fips}
                onChange={(e) => updateRegion(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all cursor-pointer"
              >
                {REGIONS.map(r => <option key={r.fips} value={r.fips}>{r.name} ({r.state})</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase">Daily Commute (Miles)</label>
              <div className="relative">
                <input 
                  type="number" value={profile.dailyMiles}
                  onChange={(e) => updateDailyMiles(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">MILES</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase">Home Charging Ratio</label>
                <span className="text-[11px] font-black text-emerald-600">{Math.round(profile.homeChargingRatio * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={profile.homeChargingRatio * 100}
                onChange={(e) => updateHomeRatio(e.target.value)}
                className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                <span>Public only</span>
                <span>Home prioritized</span>
              </div>
            </div>
          </div>
        </div>

        {/* PERSONALIZED GEOGRAPHIC REACH MAP */}
        <div className="glass rounded-[32px] overflow-hidden shadow-sm border-slate-200/40 flex flex-col bg-white transition-all duration-500">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <div className="flex flex-col">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Geospatial Reach</span>
               <span className="text-[11px] font-extrabold text-slate-900">{profile.dailyMiles} mi Radius</span>
             </div>
             <div className="px-2 py-1 bg-blue-100 rounded-md">
               <span className="text-[8px] font-black text-blue-700 uppercase">Scale Context Active</span>
             </div>
          </div>
          <div className="h-52 w-full relative group">
            <iframe
              key={freeMapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={freeMapUrl}
            ></iframe>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="w-24 h-24 border-2 border-blue-500/20 rounded-full bg-blue-500/5 animate-pulse"></div>
            </div>
          </div>
          <div className="p-4 bg-slate-900 text-white">
             <div className="space-y-2">
               <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Trip Cost within this area</p>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-black text-white">Approx. $${(metrics.electricCost / 30).toFixed(2)} EV</span>
                 <span className="text-[9px] font-bold text-emerald-400 uppercase">75% CHEAPER THAN GAS</span>
               </div>
             </div>
          </div>
        </div>

        {/* ROI PROJECTION CARD */}
        <div className="p-6 rounded-[32px] bg-white border-2 border-slate-100 shadow-xl space-y-5 relative overflow-hidden">
           <div className="relative z-10">
             <div className="flex items-center gap-2 mb-4">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Break-even Horizon</span>
             </div>
             <div className="space-y-1">
               <div className="text-4xl font-black text-slate-900">{metrics.yearsToBreakEven} Years</div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">to full capital recovery</p>
             </div>
             <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
               <div className="flex justify-between items-center">
                 <span className="text-[10px] text-slate-400 font-bold uppercase">10-Year Net Gain</span>
                 <span className="text-sm font-black text-emerald-600">${metrics.tenYearSaving.toLocaleString()}</span>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* CENTER: ANALYSIS LABS */}
      <div className="lg:col-span-6 space-y-6">
        {/* LAB 1: COST COMPARISON */}
        <div className="glass p-8 rounded-[40px] shadow-sm border-slate-200/60">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Monthly Energy Expenditure</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Localized to ${profile.region.state} Utility Tariffs</p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
             <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.chartData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: 'transparent'}} 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                      formatter={(val) => [`$${val}/month`, '']}
                    />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={50}>
                      {metrics.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.type === 'ice' ? '#94a3b8' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
             <div className="space-y-5">
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Monthly Surplus</p>
                   <div className="flex items-baseline gap-2">
                     <span className="text-3xl font-black text-slate-900">${metrics.monthlySaving}</span>
                     <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Retained Assets</span>
                   </div>
                </div>
                <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                  In **${profile.region.name}**, gasoline is a recurrent capital loss. Electricity, managed at home, converts that loss into predictable savings.
                </p>
             </div>
          </div>
        </div>

        {/* LAB 2: RANGE REALITY */}
        <div className="glass p-8 rounded-[40px] shadow-sm border-slate-200/60">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Range Grounding: Daily Reach</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Operationalized for ${profile.dailyMiles} miles/day</p>
            </div>
          </header>

          <div className="space-y-8">
             <div className="relative h-16 bg-slate-100 rounded-2xl overflow-hidden border-2 border-white shadow-inner">
                <div 
                  className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-1000 flex items-center justify-center shadow-lg"
                  style={{ width: `${batteryUsagePct}%` }}
                >
                  <span className="text-[10px] font-black text-white px-3">Daily Burn</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-end px-4">
                  <span className="text-[11px] font-black text-blue-600 uppercase bg-white/80 px-2 py-1 rounded-lg">
                    REMAINING {(100-batteryUsagePct).toFixed(0)}%
                  </span>
                </div>
             </div>

             <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-5 rounded-3xl bg-slate-50 border border-slate-100">
                   <div className="text-2xl font-black text-slate-900">{batteryUsagePct.toFixed(1)}%</div>
                   <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">Daily Drain</div>
                </div>
                <div className="text-center p-5 rounded-3xl bg-slate-50 border border-slate-100">
                   <div className="text-2xl font-black text-slate-900">{daysOfRange} Days</div>
                   <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">Cycle Duration</div>
                </div>
                <div className="text-center p-5 rounded-3xl bg-blue-50 border border-blue-100">
                   <div className="text-2xl font-black text-blue-600">{profile.ev.epaRange}mi</div>
                   <div className="text-[9px] font-bold text-blue-400 uppercase mt-1">Full Range</div>
                </div>
             </div>
             
             <p className="text-[12px] text-slate-500 text-center font-bold px-6 italic leading-relaxed">
               "Range anxiety is a psychological barrier. For your commute in ${profile.region.name}, you are empirically safe with over **${(100-batteryUsagePct).toFixed(0)}%** buffer daily."
             </p>
          </div>
        </div>
      </div>

      {/* RIGHT: AI ASSISTANT */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="glass rounded-[32px] shadow-sm flex flex-col h-[700px] border-slate-200/60 overflow-hidden bg-white/40">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/80">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Regional Expert</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">Contextual Grounding Active</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 chat-scroll">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[95%] p-4 rounded-3xl text-[13.5px] shadow-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {m.role === 'model' ? (
                    <div className="prose prose-slate max-w-none prose-sm" dangerouslySetInnerHTML={{ __html: marked.parse(m.content) }} />
                  ) : (
                    <span className="font-semibold">{m.content}</span>
                  )}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse pl-2">Analyzing spatial data...</div>}
            
            {!isTyping && (
              <div className="pt-4 flex flex-col gap-2.5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Localized Queries:</p>
                {GUIDED_FAQS.map((faq, i) => (
                  <button 
                    key={i}
                    onClick={() => sendMessage(faq.query)}
                    className="text-[11.5px] font-bold text-slate-700 bg-white border border-slate-200 px-4 py-3 rounded-2xl hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all text-left shadow-sm"
                  >
                    {faq.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); sendMessage(chatInput); }} className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              value={chatInput} onChange={e => setChatInput(e.target.value)}
              placeholder="Ask about local charging hubs..."
              className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
            />
            <button disabled={isTyping} className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-black transition-colors">
              <Icons.Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SimulationLab;
