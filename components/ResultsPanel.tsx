import React from 'react';
import { UserProfile } from '../types';

interface ResultsPanelProps {
  profile: UserProfile;
  legacyCost: number;
  efficientCost: number;
  monthlySurplus: number;
  dailyAssetUtilization: number;
  interval: number;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  profile,
  legacyCost,
  efficientCost,
  monthlySurplus,
  dailyAssetUtilization,
  interval
}) => {
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(profile.region.name + ', ' + profile.region.state)}&t=&z=${profile.dailyMiles <= 20 ? 12 : 11}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="flex-1 flex flex-col gap-6">

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 h-fit shrink-0">
        {/* Monthly Surplus - Left */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] p-8 sm:p-10 shadow-lg shadow-slate-200/20 border border-slate-100 min-h-[240px] flex flex-col justify-center">
          <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Monthly Surplus</div>
          <div className="text-[12px] font-bold text-slate-400 uppercase tracking-tight mb-8">Disposable Income Liquidity</div>
          <div className="space-y-3">
            <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Legacy TCO</div>
            <div className="text-4xl sm:text-5xl font-black text-slate-900">${legacyCost}</div>
          </div>
        </div>

        {/* Central Large Value */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] p-8 sm:p-10 shadow-lg shadow-slate-200/20 border border-slate-100 min-h-[240px] flex flex-col items-center justify-center">
          <span className="text-5xl sm:text-6xl font-black text-emerald-600 tracking-tighter leading-none mb-3">+${monthlySurplus}</span>
          <span className="text-[12px] font-black text-emerald-600 uppercase tracking-widest text-center">Immediate Liquidity / Mo</span>
        </div>

        {/* TCO Comparison - Right */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] p-8 sm:p-10 shadow-lg shadow-slate-200/20 border border-slate-100 min-h-[240px] flex flex-col justify-center">
          <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8">TCO Comparison</div>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-black text-slate-400 uppercase tracking-tight">Legacy TCO</span>
              <span className="text-3xl sm:text-4xl font-black text-slate-900">${legacyCost}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-black text-emerald-600 uppercase tracking-tight">Efficient TCO</span>
              <span className="text-3xl sm:text-4xl font-black text-emerald-600">${efficientCost}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row - DAU and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 flex-1 min-h-0">
        {/* Daily Asset Utilization */}
        <div className="bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-lg shadow-slate-200/20 border border-slate-100 flex flex-col">
          <div className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">Daily Asset Utilization (DAU)</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-6">Allocative Efficiency of Capital</div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-baseline mb-6">
              <span className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter leading-none">{dailyAssetUtilization.toFixed(1)}</span>
              <span className="text-2xl sm:text-3xl text-slate-200 ml-2 font-black">%</span>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, dailyAssetUtilization)}%` }}
              ></div>
            </div>

            <div>
              <div className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">Capital State</div>
              <div className="text-lg sm:text-xl font-black text-orange-500 uppercase">Over-Provisioned</div>
            </div>
          </div>
        </div>

        {/* Spatial Grounding - Map */}
        <div className="bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-lg shadow-slate-200/20 border border-slate-100 flex flex-col overflow-hidden relative">
          <div className="absolute top-6 right-6 bg-slate-900 text-white text-[9px] font-black px-4 py-2 rounded-full z-10">
            Status: Tracking
          </div>

          <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1 shrink-0">Spatial Grounding</div>
          <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-tight mb-4 shrink-0">{profile.region.name} ({profile.region.state})</div>

          <div className="flex-1 rounded-2xl overflow-hidden relative bg-slate-50 border border-slate-100 min-h-[220px] sm:min-h-[280px] mb-4">
            <iframe
              key={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              src={mapUrl}
              loading="lazy"
            ></iframe>
            <div className="absolute inset-0 pointer-events-none border-[6px] border-white/50 rounded-2xl"></div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{profile.dailyMiles.toFixed(1)}MI</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Daily Sector</div>
          </div>
        </div>
      </div>

      {/* Bottom - Charging Interval Signal */}
      <div className="bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-lg shadow-slate-200/20 border border-slate-100 shrink-0">
        <div className="inline-block bg-slate-900 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest mb-4">
          Charging Interval Signal
        </div>

        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-4">Time-Efficiency Modulation</div>

        <div className="text-4xl sm:text-6xl font-black text-slate-900 mb-4">
          Every <span className="text-emerald-600">{interval}</span> Days
        </div>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Reduction in labor-intensive refueling events. Shadow cost of time minimized for <span className="text-emerald-600 font-bold">94% of operation</span>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Active Autonomy Cycle</div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Interaction Events / Mo</div>
            <div className="text-2xl font-black text-slate-900">2</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;

