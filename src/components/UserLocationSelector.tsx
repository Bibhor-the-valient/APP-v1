import React, { useState } from 'react';
import { MapPin, Navigation2, Check, Bus, Clock, Leaf, ArrowRight, Sparkles } from 'lucide-react';
import { Route, Vehicle, Stop } from '../types';

interface UserLocationSelectorProps {
  route: Route;
  vehicle: Vehicle;
  userStopId: string;
  onSelectStop: (stopId: string) => void;
  co2SavedKg: number;
}

export const UserLocationSelector: React.FC<UserLocationSelectorProps> = ({
  route,
  vehicle,
  userStopId,
  onSelectStop,
  co2SavedKg
}) => {
  const [isChanging, setIsChanging] = useState<boolean>(false);
  const stops = route.stops || [];
  const selectedStop = stops.find(s => s.id === userStopId) || stops[0];
  const userStopIndex = stops.findIndex(s => s.id === userStopId);
  const currentBusIndex = vehicle.current_stop_idx || 0;

  // Calculate relation between Bus and User Stop
  const diff = userStopIndex - currentBusIndex;
  let statusMessage = '';
  let statusBadge = '';
  let badgeColor = 'cyan';

  if (diff === 0) {
    statusBadge = 'Bus At Your Stop Now';
    badgeColor = 'emerald';
    statusMessage = `Bus 515A (Driver: Venkatesh Iyer) is currently boarding at ${selectedStop.name}!`;
  } else if (diff > 0) {
    statusBadge = `${diff} Stop${diff > 1 ? 's' : ''} Away (${selectedStop.eta || '~15m'})`;
    badgeColor = 'cyan';
    statusMessage = `Bus 515A is approaching from ${vehicle.current_stop || 'Tambaram West'} towards ${selectedStop.name}.`;
  } else {
    statusBadge = 'Bus Has Passed Your Stop';
    badgeColor = 'amber';
    statusMessage = `Bus 515A is currently ahead at ${vehicle.current_stop || 'Kovalam'}. Next bus scheduled shortly.`;
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-750 rounded-2xl p-4 sm:p-5 text-white shadow-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Stop selector question & active location */}
        <div className="flex items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                Your Boarding Stop
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                badgeColor === 'emerald'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                  : badgeColor === 'cyan'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {statusBadge}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-base sm:text-lg font-black text-white truncate">
                {selectedStop.name}
              </h2>
              <button
                onClick={() => setIsChanging(!isChanging)}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline font-semibold shrink-0"
              >
                {isChanging ? 'Done' : 'Change Stop'}
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-0.5">
              {statusMessage}
            </p>
          </div>
        </div>

        {/* Right: Personal CO2 Offset Impact Summary */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-emerald-900/40 rounded-xl p-2.5 px-3.5 shrink-0 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Carbon Offset</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-400">
                {co2SavedKg.toFixed(2)} kg CO₂ Saved
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline border-l border-slate-800 pl-3">
            vs. Personal Car
          </span>
        </div>
      </div>

      {/* Expandable / Clickable Stop Selector Grid */}
      {isChanging && (
        <div className="mt-4 pt-4 border-t border-slate-800 animate-fade-in">
          <p className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center gap-1.5">
            <Navigation2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select where you are currently waiting on Route 515A:</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {stops.map((stop, idx) => {
              const isSelected = stop.id === userStopId;
              const isBusHere = idx === currentBusIndex;

              return (
                <button
                  key={stop.id}
                  onClick={() => {
                    onSelectStop(stop.id);
                    setIsChanging(false);
                  }}
                  className={`p-3 rounded-xl text-left transition-all border relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-950/70 border-emerald-400 text-white shadow-md shadow-emerald-950/50 ring-1 ring-emerald-400/40'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                        Stop #{idx + 1}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold truncate text-slate-100">
                      {stop.name}
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{stop.toNextStopDistance || stop.distance}</span>
                    {isBusHere && (
                      <span className="text-cyan-400 font-bold flex items-center gap-0.5">
                        <Bus className="w-2.5 h-2.5" /> Bus Here
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
