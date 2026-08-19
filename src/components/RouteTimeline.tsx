import React from 'react';
import { MapPin, Navigation, Clock, CheckCircle2, Bus, ChevronRight, User } from 'lucide-react';
import { Route, Vehicle, StopPrediction } from '../types';

interface RouteTimelineProps {
  route: Route;
  vehicle: Vehicle;
  predictions: StopPrediction[];
  userStopId?: string;
  onManualAdvance?: () => void;
}

export const RouteTimeline: React.FC<RouteTimelineProps> = ({
  route,
  vehicle,
  predictions,
  userStopId,
  onManualAdvance
}) => {
  const currentIdx = vehicle.current_stop_idx || 0;
  const stops = route.stops || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Route 515A: 5-Stop Corridor Timeline</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Tambaram West ⇄ Kovalam via Vandalur Zoo, VIT Chennai & Kelambakkam • Driver: Venkatesh Iyer
          </p>
        </div>

        {onManualAdvance && (
          <button
            onClick={onManualAdvance}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Advance bus to next stop in simulation"
          >
            <span>Next Stop</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Visual Timeline Nodes */}
      <div className="relative">
        {/* Continuous Connecting Line */}
        <div className="hidden md:block absolute top-1/2 left-6 right-6 h-1 bg-slate-800 -translate-y-1/2 z-0" />
        
        {/* Colored Completed Segment */}
        <div
          className="hidden md:block absolute top-1/2 left-6 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 -translate-y-1/2 z-0 transition-all duration-700"
          style={{
            width: `${Math.min(100, Math.max(0, (currentIdx / (stops.length - 1)) * 100))}%`
          }}
        />

        {/* 5-Stop Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-2.5 relative z-10">
          {stops.map((stop, idx) => {
            const isCurrent = idx === currentIdx;
            const isPassed = idx < currentIdx;
            const isUserLocation = stop.id === userStopId;

            // Find matching prediction for future stops
            const stopForecast = predictions.find(p => p.stopIndex === idx);

            return (
              <div
                key={stop.id}
                className={`relative rounded-xl p-3.5 transition-all duration-300 border ${
                  isCurrent
                    ? 'bg-gradient-to-b from-emerald-950/80 to-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-400/20'
                    : isUserLocation
                    ? 'bg-slate-850/90 border-cyan-500/60 ring-1 ring-cyan-400/30'
                    : isPassed
                    ? 'bg-slate-900/60 border-slate-800 opacity-75'
                    : 'bg-slate-850/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Node Indicator */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {isCurrent ? (
                      <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/40">
                        <Bus className="w-4 h-4 text-slate-950 animate-pulse" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
                      </div>
                    ) : isPassed ? (
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-800 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 font-mono text-xs font-bold">
                        {idx + 1}
                      </div>
                    )}
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Stop #{idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {isUserLocation && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-0.5">
                        <User className="w-2.5 h-2.5" /> You
                      </span>
                    )}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isCurrent
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isPassed
                        ? 'bg-slate-800 text-slate-500'
                        : 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                    }`}>
                      {isCurrent ? 'Current' : isPassed ? 'Departed' : stop.eta}
                    </span>
                  </div>
                </div>

                {/* Stop Name */}
                <div className="my-1">
                  <h3 className={`text-sm font-bold truncate ${isCurrent ? 'text-emerald-200' : 'text-slate-100'}`}>
                    {stop.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{stop.zone}</span>
                  </p>
                </div>

                {/* Next Stop Distance & Time (Prompt Requirement) */}
                {stop.toNextStopDistance && stop.toNextStopDistance !== 'Terminal' ? (
                  <div className="mt-2 py-1 px-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] text-slate-300">
                    <div className="font-medium text-emerald-400/90">
                      To next stop: {stop.toNextStopDistance} | {stop.toNextStopTime}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 py-1 px-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400">
                    Terminal Stop • ECR
                  </div>
                )}

                {/* Stop Crowding / Prediction Pill */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono text-[10px]">{stop.distance}</span>
                  
                  {isCurrent ? (
                    <span className="font-semibold text-emerald-400 flex items-center gap-1 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      At Station
                    </span>
                  ) : isPassed ? (
                    <span className="text-slate-500 text-[11px]">Departed</span>
                  ) : stopForecast ? (
                    <span className={`font-semibold flex items-center gap-1 text-[11px] ${
                      stopForecast.statusLevel === 'low'
                        ? 'text-emerald-400'
                        : stopForecast.statusLevel === 'moderate'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}>
                      <span>~{stopForecast.predictedLoad} pax</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">{stop.eta}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
