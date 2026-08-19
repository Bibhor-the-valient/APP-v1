import React from 'react';
import { Zap, Play, Pause, FastForward, RotateCcw, Flame } from 'lucide-react';

interface SimulationBarProps {
  simulationActive: boolean;
  onToggleSimulation: () => void;
  onStepNextStop: () => void;
  onTriggerSurge: (type: 'surge_board' | 'surge_exit') => void;
  onResetVehicle: () => void;
}

export const SimulationBar: React.FC<SimulationBarProps> = ({
  simulationActive,
  onToggleSimulation,
  onStepNextStop,
  onTriggerSurge,
  onResetVehicle
}) => {
  return (
    <div className="bg-slate-900/95 border border-purple-900/40 rounded-2xl p-4 sm:p-5 text-white shadow-xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Title and description */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-purple-200">
                Hackathon Demo & Traffic Simulation Engine
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Phase 4 Script & Loop
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generates random 1-3 user check-ins every 5s and automatically moves bus every 30s
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Pause / Resume Button */}
          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              simulationActive
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {simulationActive ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Sim (5s)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resume Sim</span>
              </>
            )}
          </button>

          {/* Advance Next Stop */}
          <button
            onClick={onStepNextStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 transition-all hover:scale-105 active:scale-95"
            title="Move vehicle to next stop"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Next Stop</span>
          </button>

          {/* Surge Rush Hour Test */}
          <button
            onClick={() => onTriggerSurge('surge_board')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-600/20 to-orange-600/20 hover:from-amber-600/30 hover:to-orange-600/30 text-amber-300 border border-amber-500/30 transition-all active:scale-95"
            title="Simulate sudden peak hour rush (+6 boardings)"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>+6 Rush Surge</span>
          </button>

          {/* Reset Bus */}
          <button
            onClick={onResetVehicle}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all"
            title="Reset bus to Central Station (22 load)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
