import React from 'react';
import { Bus, Wifi, Zap, Leaf } from 'lucide-react';
import { EcoStats } from '../types';

interface HeaderProps {
  isConnected: boolean;
  ecoStats: EcoStats;
  onOpenEcoModal: () => void;
  simulationActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  ecoStats,
  onOpenEcoModal,
  simulationActive
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Route info */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 text-white font-bold">
            <Bus className="w-5 h-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-300 border-2 border-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                CommuterPulse
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Route 515A
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="text-emerald-400 font-medium">Tambaram West ⇄ Kovalam</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-mono">bus-515A</span>
            </p>
          </div>
        </div>

        {/* Right Status & CO2 Offset Counter */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Simulation status pill */}
          <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            simulationActive 
              ? 'bg-purple-950/40 text-purple-300 border-purple-800/60'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <Zap className={`w-3.5 h-3.5 ${simulationActive ? 'text-purple-400 animate-bounce' : 'text-slate-500'}`} />
            <span>{simulationActive ? 'Live Simulator (5s)' : 'Sim Paused'}</span>
          </div>

          {/* Real-time Socket Connection Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="hidden sm:inline text-slate-300">{isConnected ? 'Live Socket' : 'Connecting...'}</span>
          </div>

          {/* CO2 Offset Counter (Scrapped point system, pure CO2 saved focus) */}
          <button
            onClick={onOpenEcoModal}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="View Your CO₂ Offset Impact Breakdown"
          >
            <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-xs sm:text-sm">{ecoStats.co2SavedKg.toFixed(2)}</span>
              <span className="text-[11px] text-emerald-200/80 font-normal">kg CO₂</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
