import React from 'react';
import { Activity, LogIn, LogOut, Radio, Clock, MapPin, User, Cpu } from 'lucide-react';
import { CheckinLog } from '../types';

interface LiveActivityFeedProps {
  logs: CheckinLog[];
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ logs }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
            <Radio className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Live Transit Telemetry & Activity Feed
            </h2>
            <p className="text-xs text-slate-400">
              Real-time socket events from commuters and corridor IoT sensors
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
          {logs.length} events
        </span>
      </div>

      {/* Log list container */}
      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-72 pr-1 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <span>Awaiting live commuter check-ins or sensor events...</span>
          </div>
        ) : (
          logs.map((log) => {
            const isBoarding = log.action === 'boarding' || log.delta > 0;
            const isArrival = log.action === 'stop_arrival';
            const timeStr = log.timestamp
              ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : 'Just now';

            return (
              <div
                key={log.id}
                className="bg-slate-850/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700/80 rounded-xl p-3 flex items-center justify-between gap-3 transition-all text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Icon badge */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isArrival
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : isBoarding
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {isArrival ? (
                      <MapPin className="w-4 h-4" />
                    ) : isBoarding ? (
                      <LogIn className="w-4 h-4" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-200">
                        {isArrival ? 'Stop Arrival' : isBoarding ? 'Passenger Boarded' : 'Passenger Alighted'}
                      </span>
                      <span className={`font-mono font-bold px-1.5 py-0.2 rounded text-[11px] ${
                        isBoarding ? 'text-emerald-400 bg-emerald-950/60' : 'text-amber-400 bg-amber-950/60'
                      }`}>
                        {log.delta >= 0 ? `+${log.delta}` : log.delta} pax
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <span>{log.stopName || 'Central Station'}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-300 font-mono">Load: {log.newLoad}/50</span>
                    </p>
                  </div>
                </div>

                {/* Right side: Source pill & Time */}
                <div className="flex flex-col items-end shrink-0 gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                    log.source === 'user'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : log.source === 'sensor'
                      ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                      : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                  }`}>
                    {log.source === 'user' ? (
                      <>
                        <User className="w-2.5 h-2.5" />
                        <span>You</span>
                      </>
                    ) : log.source === 'sensor' ? (
                      <>
                        <Radio className="w-2.5 h-2.5" />
                        <span>IoT Sensor</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="w-2.5 h-2.5" />
                        <span>Simulator</span>
                      </>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{timeStr}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
