import React, { useState } from 'react';
import { TrendingUp, Calculator, ArrowUpRight, ArrowDownRight, Layers, Sparkles, Info } from 'lucide-react';
import { PredictionState } from '../types';

interface PredictionChartProps {
  prediction: PredictionState;
  currentStopName: string;
}

export const PredictionChart: React.FC<PredictionChartProps> = ({
  prediction,
  currentStopName
}) => {
  const [showMathDetails, setShowMathDetails] = useState(false);

  const {
    currentLoad,
    maxCapacity = 50,
    predictedVector = [],
    stopsForecast = [],
    historicalBoardingMatrix = [],
    historicalAlightingMatrix = [],
    formulaString
  } = prediction;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Predictive Crowd Intelligence (Next 3 Stops)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Linear algebraic state-space model based on current load vector <span className="font-mono text-cyan-300">L_current = [{currentLoad}]</span>
          </p>
        </div>

        <button
          onClick={() => setShowMathDetails(!showMathDetails)}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-indigo-500/30 transition-all hover:border-indigo-400"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>{showMathDetails ? 'Hide Linear Algebra' : 'Show Math Vector Model'}</span>
        </button>
      </div>

      {/* 3-Stop Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {stopsForecast.map((forecast, idx) => {
          const b_val = historicalBoardingMatrix[idx] ?? forecast.expectedBoarding;
          const a_val = historicalAlightingMatrix[idx] ?? forecast.expectedAlighting;
          const netChange = b_val - a_val;
          const pct = forecast.predictedPercentage;

          let badgeColor = 'emerald';
          if (pct >= 80) badgeColor = 'rose';
          else if (pct >= 50) badgeColor = 'amber';

          return (
            <div
              key={idx}
              className="bg-slate-850/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between hover:border-slate-750 transition-all shadow-md"
            >
              {/* Step indicator top */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/20">
                    + {idx + 1} Stop ({forecast.eta})
                  </span>

                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    badgeColor === 'emerald'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : badgeColor === 'amber'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {forecast.statusLevel} crowd
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 truncate mb-1">
                  {forecast.stopName}
                </h3>

                {/* Predicted Load Value */}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className={`text-3xl font-black ${
                    badgeColor === 'emerald' ? 'text-emerald-400' : badgeColor === 'amber' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {forecast.predictedLoad}
                  </span>
                  <span className="text-sm text-slate-500 font-semibold">/ {maxCapacity} cap</span>
                  <span className="text-xs font-mono text-slate-400">({pct}%)</span>
                </div>

                {/* Horizontal Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      badgeColor === 'emerald'
                        ? 'bg-emerald-400'
                        : badgeColor === 'amber'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Historical Flow Matrix Breakdown */}
              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+{b_val} Boarding</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-300 font-medium justify-end">
                  <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>-{a_val} Alighting</span>
                </div>
                <div className="col-span-2 flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                  <span>Net Flow: {netChange >= 0 ? `+${netChange}` : netChange} pax</span>
                  <span>{forecast.seatsAvailable} seats open</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Linear Algebra State Vector Mathematical Breakdown Drawer */}
      {showMathDetails && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-indigo-900/40 text-xs font-mono text-slate-300 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Layers className="w-4 h-4" />
            <span>Mathematical State Space Vector Modeling</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1 font-sans">Current State Vector:</span>
              <p className="text-cyan-300 font-bold">L_0 = [ {currentLoad} ] ∈ ℝ¹ (Capacity C_max = 50)</p>
              <p className="text-slate-400 mt-1">Current Stop: "{currentStopName}"</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1 font-sans">Historical Matrices (Next 3 Stops):</span>
              <p className="text-emerald-300">B_vector = [ {historicalBoardingMatrix.join(', ')} ]ᵀ (Boarding)</p>
              <p className="text-amber-300">A_vector = [ {historicalAlightingMatrix.join(', ')} ]ᵀ (Alighting)</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1 font-sans">Discrete State Space Formula:</span>
            <code className="text-indigo-300 text-xs sm:text-sm">
              L_future = min(50, max(0, L_0 + C · (B - A))) = [ {predictedVector.join(', ')} ]
            </code>
            <p className="text-[11px] text-slate-400 mt-1 font-sans">
              Where C is the lower-triangular causal accumulation matrix propagating net passenger flows across consecutive transit stops.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
