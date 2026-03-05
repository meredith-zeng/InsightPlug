import React, { useMemo, useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { ELECTRICITY_RATES, EV_MODELS, REGIONS } from '../services/dataCatalog';
import { buildExpertReply } from '../services/localAdvisor';
import { buildOpenAIReply, isOpenAIConfigured } from '../services/openaiAdvisor';
import { marked } from 'marked';
import { Icons } from '../constants';
import { createLimiter } from '../services/apiLimiter';

const SimulationLab: React.FC<{ profile: UserProfile, setProfile: (p: UserProfile) => void }> = ({ profile, setProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const limiterRef = useRef(createLimiter('insightplug-chat', { maxPerMinute: 6, maxTotal: 20 }));

  const PUBLIC_RATE_MULTIPLIER = 2.5;
  const USE_OPENAI = isOpenAIConfigured();

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

    return {
      legacyCost,
      efficientCost,
      monthlySurplus,
      dailyAssetUtilization: Math.min(100, dailyAssetUtilization),
      interval: Math.max(1, interval),
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

      if (USE_OPENAI) {
        try {
          reply = await buildOpenAIReply(profile, calculateMetrics, text);
        } catch (openaiErr) {
          const errorMsg = openaiErr instanceof Error ? openaiErr.message : String(openaiErr);
          if (errorMsg.includes('401') || errorMsg.includes('Authentication')) {
            setMessages(prev => [...prev, {
              role: 'model',
              content: `⚠️ **OpenAI API Configuration Issue**\n\nThe backend cannot access the OpenAI API key. Please:\n1. Visit your Vercel Dashboard → Project Settings → Environment Variables\n2. Ensure \`OPENAI_API_KEY\` is set with a valid key\n3. Redeploy the project\n\nFalling back to rule-based responses for now...`
            }]);
            await new Promise(resolve => setTimeout(resolve, 350));
          }
          reply = buildExpertReply(profile, calculateMetrics, text);
        }
      } else {
        reply = buildExpertReply(profile, calculateMetrics, text);
      }

      await new Promise(resolve => setTimeout(resolve, 350));
      setMessages(prev => [...prev, { role: 'model', content: reply }]);
    } catch (err) {
      // Silent error handling
    } finally {
      setIsTyping(false);
    }
  };

  const mapUrl = `https://www.google.com/maps?q=electric+vehicle+charging+stations+in+${encodeURIComponent(profile.region.name).replace(/%20/g, '+').replace(/%28/g, '').replace(/%29/g, '')},+${profile.region.state}&output=embed`;

  // Calculate access friction (simplified: based on charger availability and detour)
  const accessFriction = useMemo(() => {
    // Base estimate: longer daily miles = more potential friction
    const homeChargeDeficit = (1 - profile.homeChargingRatio) * 100;
    const estimatedDetourMiles = Math.max(0, (homeChargeDeficit / 100) * 2);
    const avgDetourMinutes = Math.round(estimatedDetourMiles * 2.5); // ~2.5 min per mile
    return { detourMinutes: avgDetourMinutes, homeChargingPercent: Math.round(profile.homeChargingRatio * 100) };
  }, [profile.homeChargingRatio]);

  return (
    <div className="relative w-full" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <div className="max-w-[1400px] mx-auto px-6 py-12">

        {/* TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ===== LEFT COLUMN: Configuration & Economic Framework (3 columns = ~300px) ===== */}
          <div className="lg:col-span-3 space-y-5">

            {/* Quick Config Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-900 mb-4 uppercase tracking-widest">Configuration</h3>

              <div className="space-y-3">
                {/* Region */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Location</label>
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
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {REGIONS.map(r => (
                      <option key={r.fips} value={r.fips}>{r.name}, {r.state}</option>
                    ))}
                  </select>
                </div>

                {/* Vehicle */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Vehicle</label>
                  <div className="flex gap-1">
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
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      {EV_MODELS.map(ev => (
                        <option key={ev.model} value={ev.model}>{ev.publicLabel || ev.label}</option>
                      ))}
                    </select>
                    <div className="group relative">
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <Icons.Info className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <div>{profile.ev.detailLabel || profile.ev.label}</div>
                        <div className="text-gray-300 text-xs mt-0.5">vs {profile.ev.iceBenchmark?.model}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Miles */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Daily Miles</label>
                  <input
                    type="number"
                    value={profile.dailyMiles}
                    onChange={e => {
                      const daily = parseFloat(e.target.value) || 0;
                      setProfile({
                        ...profile,
                        dailyMiles: daily,
                        annualMileage: daily * 365
                      });
                    }}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Home Charge Slider */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Home Charge</label>
                    <span className="text-xs font-semibold text-emerald-700">{Math.round(profile.homeChargingRatio * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={profile.homeChargingRatio * 100}
                    onChange={e => setProfile({...profile, homeChargingRatio: parseFloat(e.target.value) / 100})}
                    className="w-full h-1.5 bg-gray-300 rounded-full appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* How It Works Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">How It Works</h3>
                <button
                  onClick={() => setShowAboutModal(true)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold underline"
                >
                  Learn more
                </button>
              </div>
              <p className="text-xs text-gray-600 italic mb-6 pb-4 border-b border-gray-200">
                We compare your costs in two key areas
              </p>

              {/* Two Simple Cards */}
              <div className="grid grid-cols-1 gap-4">
                {/* MONEY Card */}
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💰</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-emerald-900 text-sm mb-1">Budget</h4>
                      <p className="text-xs text-emerald-700 leading-relaxed">
                        How much you'll spend on fuel each month
                      </p>
                    </div>
                  </div>
                </div>

                {/* TIME Card */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⏱️</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 text-sm mb-1">Convenience</h4>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        How often you need to refuel or recharge
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== RIGHT COLUMN: MONEY & TIME Dimensions (9 columns) ===== */}
          <div className="lg:col-span-9 space-y-10">

            {/* Recommendation Banner */}
            {(() => {
              const isHighSavings = calculateMetrics.monthlySurplus >= 50;
              const isGoodUtilization = calculateMetrics.dailyAssetUtilization < 50;
              const isEasyCharging = calculateMetrics.interval >= 5;
              const overallGood = (isHighSavings && isGoodUtilization) || (isHighSavings && isEasyCharging);

              return (
                <div className={`rounded-2xl p-6 border-2 ${
                  overallGood 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : calculateMetrics.monthlySurplus > 0 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">
                      {overallGood ? '✅' : calculateMetrics.monthlySurplus > 0 ? '💡' : '⚠️'}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${
                        overallGood 
                          ? 'text-emerald-900' 
                          : calculateMetrics.monthlySurplus > 0 
                            ? 'text-blue-900' 
                            : 'text-orange-900'
                      }`}>
                        {overallGood
                          ? `An Electric ${profile.ev.label.split(' ')[0]} is a highly cost-effective choice for your routine!`
                          : calculateMetrics.monthlySurplus > 0
                            ? `An Electric ${profile.ev.label.split(' ')[0]} could work well for you with some planning`
                            : 'Electric vehicles may be challenging for your current situation'}
                      </h3>
                      <p className={`text-sm ${
                        overallGood 
                          ? 'text-emerald-700' 
                          : calculateMetrics.monthlySurplus > 0 
                            ? 'text-blue-700' 
                            : 'text-orange-700'
                      }`}>
                        {overallGood
                          ? `You'll save $${calculateMetrics.monthlySurplus}/month and only need to charge every ${calculateMetrics.interval} days. Your daily ${profile.dailyMiles.toFixed(0)}-mile routine is perfect for EV ownership.`
                          : calculateMetrics.monthlySurplus > 0
                            ? `You'll save $${calculateMetrics.monthlySurplus}/month. ${calculateMetrics.dailyAssetUtilization > 70 ? 'You may need to charge frequently.' : 'Consider your charging access carefully.'}`
                            : `Based on your ${profile.dailyMiles.toFixed(0)}-mile daily routine and local electricity rates, a gas vehicle may currently be more economical. Electricity costs $${calculateMetrics.efficientCost}/mo vs gas at $${calculateMetrics.legacyCost}/mo.`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ===== SECTION 1: BUDGET & SAVINGS ===== */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Money Dimension</h2>
                <p className="text-sm text-gray-600 mt-1">Budget & Capital Efficiency</p>
              </div>

              {/* Two Signal Cards: Monthly Surplus & Daily Asset Utilization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Card A: Monthly Surplus */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Monthly Surplus</h3>
                  </div>

                  {/* Primary Metric */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-emerald-600">+${calculateMetrics.monthlySurplus}</span>
                      <span className="text-lg font-medium text-gray-500">/mo</span>
                    </div>
                  </div>

                  {/* Context Explanation */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Net fuel savings after electricity cost, relative to gas baseline.
                    </p>
                  </div>

                  {/* Micro Visual: Comparison Bar */}
                  <div className="mb-6 space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-600">Gas monthly</span>
                        <span className="text-sm font-semibold text-gray-900">${calculateMetrics.legacyCost}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-400" style={{width: '100%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-600">EV monthly</span>
                        <span className="text-sm font-semibold text-emerald-600">${calculateMetrics.efficientCost}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600" style={{width: `${Math.min(100, (calculateMetrics.efficientCost / calculateMetrics.legacyCost) * 100)}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card B: Daily Asset Utilization */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Daily Battery Usage</h3>
                  </div>

                  {/* Primary Metric with Status Badge */}
                  <div className="mb-4">
                    <div className="flex items-start gap-3 flex-wrap">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold text-gray-900">{calculateMetrics.dailyAssetUtilization.toFixed(1)}</span>
                        <span className="text-lg font-medium text-gray-500">%</span>
                      </div>
                      {calculateMetrics.dailyAssetUtilization < 30 && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full self-center">✓ Excellent range buffer</span>
                      )}
                      {calculateMetrics.dailyAssetUtilization >= 30 && calculateMetrics.dailyAssetUtilization < 70 && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full self-center">✓ Well balanced</span>
                      )}
                      {calculateMetrics.dailyAssetUtilization >= 70 && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full self-center">⚠ May need frequent charging</span>
                      )}
                    </div>
                  </div>

                  {/* Context Explanation */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      You use {calculateMetrics.dailyAssetUtilization.toFixed(1)}% of battery per day, leaving plenty of range for unexpected trips.
                    </p>
                  </div>

                  {/* Micro Visual: Utilization Progress */}
                  <div className="mb-6 space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-600">Daily usage</span>
                        <span className="text-sm font-semibold text-emerald-600">{profile.dailyMiles.toFixed(1)} mi</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600" style={{width: `${Math.min(100, calculateMetrics.dailyAssetUtilization)}%`}}></div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      Range available: <span className="font-semibold">{profile.ev.epaRange} mi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== SECTION 2: TIME DIMENSION ===== */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Time Dimension</h2>
                <p className="text-sm text-gray-600 mt-1">Labor & Access Cost Reduction</p>
              </div>

              {/* Three Component Layout: Charging Interval | Access Friction + Map */}
              <div className="space-y-5">

                {/* Cards Row: Charging Interval & Access Friction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Card A: Charging Interval */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Charging Interval</h3>
                    </div>

                    {/* Primary Metric */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-gray-900">Every</span>
                      </div>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-6xl font-bold text-blue-600">{calculateMetrics.interval}</span>
                        <span className="text-lg font-medium text-gray-500">days</span>
                      </div>
                    </div>

                    {/* Context Explanation */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Estimated recharge frequency based on battery capacity and daily mileage.
                      </p>
                    </div>

                    {/* Micro Visual: Timeline Chip */}
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <Icons.Zap className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">{Math.round(30 / calculateMetrics.interval)} charges/month</span>
                      </div>
                    </div>

                    {/* Local Grounding */}
                    <div className="text-xs text-gray-500 border-t border-gray-200 pt-4">
                      Grounded in {profile.region.name}, {profile.region.state} + your {Math.round(profile.annualMileage / 365)} mi/day pattern
                    </div>
                  </div>

                  {/* Card B: Access Friction */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Access Friction</h3>
                    </div>

                    {/* Primary Metric */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold text-blue-600">+{accessFriction.detourMinutes}</span>
                        <span className="text-lg font-medium text-gray-500">min avg detour</span>
                      </div>
                    </div>

                    {/* Context Explanation */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Additional time cost driven by charger availability and detour distance.
                      </p>
                    </div>

                    {/* Micro Visual: Supporting Metrics */}
                    <div className="mb-6 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Home charging access</span>
                        <span className="font-semibold text-gray-900">{accessFriction.homeChargingPercent}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{width: `${accessFriction.homeChargingPercent}%`}}></div>
                      </div>
                    </div>

                    {/* Local Grounding */}
                    <div className="text-xs text-gray-500 border-t border-gray-200 pt-4">
                      Grounded in {profile.region.name}, {profile.region.state} + your {Math.round(profile.annualMileage / 365)} mi/day pattern
                    </div>
                  </div>
                </div>

                {/* Map Panel */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Icons.MapPin className="w-5 h-5 text-gray-500" />
                      Nearby Charging Stations
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Charging stations available in {profile.region.name}, {profile.region.state}</p>
                  </div>

                  <div className="rounded-xl overflow-hidden bg-gray-50 border border-gray-200" style={{minHeight: '300px'}}>
                    <iframe
                      key={mapUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: '300px' }}
                      src={mapUrl}
                      loading="lazy"
                    ></iframe>
                  </div>

                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                    <p>
                      Map shows available EV charging stations near you for both daily use and longer trips.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE CHAT - Floating at bottom right */}
      <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[90vw]">
        <div className="bg-slate-900 rounded-[20px] overflow-hidden flex flex-col border border-white/10 shadow-2xl">
          <header
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-4 flex justify-between items-center border-b border-white/10 cursor-pointer hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-5 bg-emerald-500 rounded-full shadow-xl shadow-emerald-500/50"></div>
              <div>
                <h3 className="text-base font-black text-white tracking-tight">Expert Assistant</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AI-Powered</p>
              </div>
            </div>
            <button
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-full transition-all border border-white/10"
            >
              {isChatOpen ? '−' : '+'}
            </button>
          </header>

          {isChatOpen && (
            <>
              {/* Disclaimer */}
              <div className="px-4 py-3 bg-slate-800/50 border-b border-white/5">
                <p className="text-[9px] text-slate-400 leading-tight italic">
                  ⓘ Educational tool only. Not financial advice.
                </p>
              </div>

              <div className="flex flex-col max-h-[500px]">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-transparent">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-lg text-[11px] leading-relaxed ${
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

                <div className="px-4 py-2 flex flex-wrap gap-1 shrink-0 border-t border-white/5">
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
                    <Icons.Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="px-4 pb-3 text-[9px] text-slate-500 italic">
                  Questions: {limiterRef.current.peek().remaining ?? 0} / {limiterRef.current.options.maxTotal}
                </div>
              </div>
            </>
          )}
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

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
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

              <h3 className="font-bold text-slate-900 mt-6">What We Measure:</h3>

              <div className="space-y-3">
                <div className="border-l-4 border-emerald-500 pl-4">
                  <h4 className="font-semibold text-slate-900">💰 Estimated Monthly Fuel Savings</h4>
                  <p className="text-xs">Immediate savings you'll see each month (combats temporal discounting bias where people undervalue future savings)</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-slate-900">🔋 Daily Battery Usage</h4>
                  <p className="text-xs">Shows how much of your battery capacity you actually use daily, helping you understand if you have enough range buffer</p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-slate-900">⏱️ Charging Frequency</h4>
                  <p className="text-xs">How often you need to charge vs how often you'd need to visit a gas station, quantifying time savings</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h3 className="font-bold text-blue-900 mb-2">📊 Data Sources</h3>
                <p className="text-blue-800 text-xs">
                  We use 2026 forecasts from the U.S. Energy Information Administration (EIA) for electricity and gas prices,
                  EPA estimates for vehicle efficiency, and National Household Travel Survey data for regional driving patterns.
                </p>
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

export default SimulationLab;





