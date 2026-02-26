import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { UserProfile, CostDataPoint } from '../types';
import { buildLocalSummary } from '../services/localAdvisor';
import { Icons } from '../constants';

interface AnalysisDashboardProps {
  profile: UserProfile;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ profile }) => {
  const data: CostDataPoint[] = useMemo(() => {
    const points: CostDataPoint[] = [];
    // Updated property names to match types.ts
    let iceTotal = profile.icePrice;
    let evTotal = profile.evPrice - profile.taxIncentive;

    points.push({ year: 0, iceTotal, evTotal, savings: iceTotal - evTotal });

    for (let year = 1; year <= profile.ownershipYears; year++) {
      // Updated property names to match types.ts
      const annualGasCost = (profile.annualMileage / profile.iceMpg) * profile.gasPrice;
      const annualElectricCost = (profile.annualMileage / profile.evEfficiency) * profile.electricRate;
      
      // Rough maintenance estimate: Gas cars $1200/yr, EV $400/yr
      iceTotal += annualGasCost + 1200;
      evTotal += annualElectricCost + 400;

      points.push({
        year,
        iceTotal: Math.round(iceTotal),
        evTotal: Math.round(evTotal),
        savings: Math.round(iceTotal - evTotal)
      });
    }
    return points;
  }, [profile]);

  const aiSummary = useMemo(() => buildLocalSummary(profile, data), [profile, data]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <div className="lg:col-span-2 glass rounded-2xl p-4 sm:p-6 shadow-sm min-h-[320px] sm:min-h-[400px]">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Icons.Zap className="text-emerald-500" />
            Cumulative Cost Comparison
          </h3>
          <div className="h-[220px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="iceTotal" 
                  name="Gas Vehicle (ICE)" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="evTotal" 
                  name="Electric Vehicle (EV)" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="glass rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Icons.Info className="text-blue-500" />
            AI Expert Analysis
          </h3>
          
          {aiSummary && (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <p className="text-sm font-medium text-emerald-800 mb-1">Estimated Savings</p>
                <p className="text-3xl font-bold text-emerald-600">${aiSummary.totalSavings.toLocaleString()}</p>
                <p className="text-xs text-emerald-700 mt-2">Break-even in approx. <strong>{aiSummary.breakEvenYear} years</strong></p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-700">Key Insights:</p>
                {aiSummary.keyInsights.map((insight, idx) => (
                  <div key={idx} className="flex gap-2 text-sm text-slate-600">
                    <Icons.Check className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm font-bold text-blue-800 mb-1">The Verdict:</p>
                <p className="text-sm text-blue-700 leading-relaxed italic">"{aiSummary.recommendation}"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
