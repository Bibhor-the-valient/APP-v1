import React from 'react';
import { Leaf, Info, Car, Bus, Trees } from 'lucide-react';

interface EcoImpactCardProps {
  startingStopName: string;
  journeyDistanceKm: number;
  co2AvoidedKg: number;
}

export const EcoImpactCard: React.FC<EcoImpactCardProps> = ({
  startingStopName,
  journeyDistanceKm,
  co2AvoidedKg
}) => {
  const isFinalStop = journeyDistanceKm <= 0;

  return (
    <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
      {/* Subtle green ambient environmental glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Main CO2 metric block */}
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-950/50">
              <Leaf className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-300 flex items-center gap-1.5">
                <span>Estimated CO₂ Avoided</span>
                <span className="text-[10px] font-normal bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-200 border border-emerald-500/20">
                  {journeyDistanceKm.toFixed(1)} km journey
                </span>
              </span>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                  {co2AvoidedKg.toFixed(2)}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-400">
                  kg CO₂
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium max-w-xl">
                {isFinalStop ? (
                  <span>You are at the final stop (Kovalam Bus Stand). Your journey completed with zero further emissions.</span>
                ) : (
                  <span>Your public transport journey helps reduce emissions compared with travelling alone by car.</span>
                )}
              </p>
            </div>
          </div>

          {/* Quick comparative context box */}
          <div className="bg-slate-950/70 border border-emerald-500/20 rounded-xl p-3 sm:p-3.5 w-full sm:w-auto shrink-0 flex items-center justify-around sm:flex-col sm:items-end gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Bus className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">Bus 515A</span>
              <span className="text-slate-400 text-[11px]">(Transit)</span>
            </div>
            <div className="text-[11px] text-slate-400 text-right">
              vs. <Car className="w-3.5 h-3.5 inline mx-0.5 text-amber-400" /> Single-driver Car
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">
              ~0.12 kg CO₂/km avoided
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
