import React from 'react';
import { MapPin, Navigation, Clock, CheckCircle2, Bus, ChevronDown, ArrowDown, User, Edit3 } from 'lucide-react';
import { Route, Vehicle, Stop } from '../types';

interface RouteTimelineProps {
  route: Route;
  vehicle: Vehicle;
  selectedStopId: string;
  onChangeStop?: () => void;
}

export const RouteTimeline: React.FC<RouteTimelineProps> = ({
  route,
  vehicle,
  selectedStopId,
  onChangeStop
}) => {
  const allStops = route.stops || [];
  const selectedIndex = allStops.findIndex((s) => s.id === selectedStopId);
  const currentIdx = selectedIndex >= 0 ? selectedIndex : 0;

  // Filter stops starting from the selected stop
  const remainingStops = allStops.slice(currentIdx);
  const stopsRemainingCount = remainingStops.length;
  const isAtFinalStop = currentIdx === allStops.length - 1;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl">
      {/* Header with Journey summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400" />
              <span>Your Journey</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Bus 515A
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {isAtFinalStop ? (
              <span className="text-emerald-400 font-semibold">You've reached the final stop.</span>
            ) : (
              <span>
                <strong className="text-emerald-300 font-bold">{stopsRemainingCount} stop{stopsRemainingCount > 1 ? 's' : ''} remaining</strong> along Route 515A corridor
              </span>
            )}
          </p>
        </div>

        {onChangeStop && (
          <button
            onClick={onChangeStop}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 transition-all hover:border-cyan-500/40"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Change Current Stop</span>
          </button>
        )}
      </div>

      {/* Vertical / Step-by-Step Connected Journey Timeline */}
      <div className="space-y-4">
        {remainingStops.map((stop, idx) => {
          const originalStopIndex = currentIdx + idx;
          const isUserStart = idx === 0;
          const isFinal = originalStopIndex === allStops.length - 1;
          const hasNextStop = idx < remainingStops.length - 1;

          return (
            <div key={stop.id} className="relative">
              {/* Card representing this stop */}
              <div
                className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                  isUserStart
                    ? 'bg-gradient-to-r from-emerald-950/80 via-slate-850 to-slate-900 border-emerald-400/50 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                    : isFinal
                    ? 'bg-slate-850/90 border-slate-700'
                    : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Stop Number & Name */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isUserStart
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {isUserStart ? <User className="w-4 h-4" /> : originalStopIndex + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono uppercase font-bold text-slate-400">
                          Stop #{originalStopIndex + 1}
                        </span>
                        {isUserStart && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Your Boarding Location
                          </span>
                        )}
                        {isFinal && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Final Destination
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                        {stop.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{stop.zone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Distance & Time to Next Stop */}
                  <div className="sm:text-right bg-slate-900/80 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-slate-800">
                    {!isFinal && stop.toNextStopDistance ? (
                      <div>
                        <span className="text-xs text-slate-400 font-medium block">
                          To next stop:
                        </span>
                        <span className="text-sm font-bold text-emerald-400">
                          {stop.toNextStopDistance} | {stop.toNextStopTime}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/90 text-slate-300 text-xs font-bold border border-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Final stop</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Connecting arrow / path line to next stop */}
              {hasNextStop && (
                <div className="flex items-center justify-center my-1.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-medium text-emerald-400/80 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800">
                    <ArrowDown className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                    <span>Next Leg ({stop.toNextStopDistance} • {stop.toNextStopTime})</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
