import React, { useState } from 'react';

interface TheoryExplainerProps {
  signal: 'surplus' | 'dau' | 'charging' | 'framework';
}

const TheoryExplainer: React.FC<TheoryExplainerProps> = ({ signal }) => {
  const [isOpen, setIsOpen] = useState(false);

  const explanations: Record<string, any> = {
    framework: {
      title: "Money-Time Framework",
      subtitle: "Becker's Household Production Theory",
      icon: "💰",
      keyMessage: "EV adoption governed by Money & Time constraints",
      points: [
        "InsightPlug applies Becker's Household Production Theory",
        "Money: Budget and capital allocation efficiency",
        "Time: Labor intensity and opportunity cost",
        "Vehicle = capital asset determining conversion efficiency"
      ],
      color: "bg-slate-50 border-slate-200",
      accentColor: "text-slate-700"
    },
    surplus: {
      title: "Monthly Surplus",
      subtitle: "Temporal Discounting",
      icon: "💵",
      keyMessage: "Reframe savings as immediate monthly gains",
      points: [
        "People undervalue future savings",
        "$5,000 over 10 years → $42/month",
        "Makes benefit psychologically present"
      ],
      color: "bg-emerald-50 border-emerald-200",
      accentColor: "text-emerald-700"
    },
    dau: {
      title: "Daily Asset Utilization",
      subtitle: "Capital Efficiency",
      icon: "📊",
      keyMessage: "Reveal battery over-provisioning",
      points: [
        "20 mi/day with 300 mi range = 6.7% utilization",
        "Indicates inefficient capital allocation",
        "Shifts focus from range anxiety to economics"
      ],
      color: "bg-blue-50 border-blue-200",
      accentColor: "text-blue-700"
    },
    charging: {
      title: "Charging Interval",
      subtitle: "Time Cost Reduction",
      icon: "⚡",
      keyMessage: "Quantify avoided refueling labor",
      points: [
        "Consumers overestimate charging frequency",
        "Charge every 14 days = 84% fewer interactions",
        "Lowers perceived time cost of ownership"
      ],
      color: "bg-orange-50 border-orange-200",
      accentColor: "text-orange-700"
    }
  };

  const exp = explanations[signal];

  return (
    <div className={`rounded-2xl border-2 p-4 space-y-3 ${exp.color}`}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between hover:opacity-75 transition-opacity group"
      >
        <div className="flex gap-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{exp.icon}</span>
          <div className="text-left flex-1 min-w-0">
            <div className={`text-sm font-black ${exp.accentColor} uppercase tracking-widest leading-tight`}>
              {exp.title}
            </div>
            <div className="text-[11px] font-bold text-slate-500 mt-0.5">{exp.subtitle}</div>
          </div>
        </div>
        <div className={`text-lg font-black text-slate-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>

      {/* Content - Expanded */}
      {isOpen && (
        <div className="space-y-1.5 pt-1.5 border-t border-current border-opacity-15">
          {/* Key Message */}
          <div className={`p-2 rounded-lg bg-white/50 border-l-2 ${exp.accentColor}`}>
            <p className={`text-[10px] font-bold ${exp.accentColor}`}>
              {exp.keyMessage}
            </p>
          </div>

          {/* Points */}
          <div className="space-y-1 pl-1">
            {exp.points.map((point: string, idx: number) => (
              <div key={idx} className="flex gap-1.5">
                <span className={`text-xs ${exp.accentColor} flex-shrink-0 mt-0.5`}>→</span>
                <p className="text-[10px] text-slate-700 leading-relaxed">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TheoryExplainer;

