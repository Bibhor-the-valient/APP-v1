import React from 'react';
import { Bus, Wifi, Zap, Leaf, UserCheck } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  co2AvoidedKg: number;
  driverName?: string;
  vehicleName?: string;
  simulationActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  co2AvoidedKg,
  driverName = 'Venkatesh Iyer',
  vehicleName = 'Bus 515A',
  simulationActive = false
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Bus Info */}
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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {vehicleName}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-300 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-cyan-400 inline" />
                Driver: <strong className="text-white font-semibold">{driverName}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-medium hidden sm:inline">Tambaram West ⇄ Kovalam</span>
            </p>
          </div>
        </div>

        {/* Right: Real-time Socket & CO2 Offset Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time Socket Connection Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="hidden sm:inline text-slate-300">{isConnected ? 'Live' : 'Connecting...'}</span>
          </div>

          {/* Environmental CO2 Avoided Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-sm">
            <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-xs sm:text-sm">{co2AvoidedKg.toFixed(2)}</span>
              <span className="text-[11px] text-emerald-200 font-normal">kg CO₂</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
