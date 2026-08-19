import React, { useState } from 'react';
import { MapPin, Navigation, ArrowRight, AlertCircle } from 'lucide-react';
import { Stop } from '../types';

interface CurrentStopSelectorProps {
  stops: Stop[];
  selectedStopId: string;
  onConfirmStop: (stopId: string) => void;
  isInitialSelection?: boolean;
}

export const CurrentStopSelector: React.FC<CurrentStopSelectorProps> = ({
  stops,
  selectedStopId,
  onConfirmStop,
  isInitialSelection = false
}) => {
  const [currentChoice, setCurrentChoice] = useState<string>(selectedStopId || '');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChoice) {
      setError('Please select your current bus stop.');
      return;
    }
    setError('');
    onConfirmStop(currentChoice);
  };

  return (
    <div className={`bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border rounded-2xl p-5 sm:p-7 text-white shadow-2xl relative overflow-hidden transition-all ${
      isInitialSelection 
        ? 'border-emerald-500/40 ring-1 ring-emerald-500/20 max-w-xl mx-auto my-6' 
        : 'border-slate-800'
    }`}>
      {/* Background soft glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Where are you now?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Select your current bus stop to see your journey.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="bus-stop-select" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Bus Stop on Route 515A
            </label>
            <div className="relative">
              <select
                id="bus-stop-select"
                value={currentChoice}
                onChange={(e) => {
                  setCurrentChoice(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-slate-950/90 border border-slate-750 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 rounded-xl px-4 py-3 text-slate-100 text-sm font-medium transition-all appearance-none cursor-pointer pr-10"
              >
                <option value="" disabled>
                  -- Select your bus stop ▼ --
                </option>
                {stops.map((stop) => (
                  <option key={stop.id} value={stop.id} className="bg-slate-900 text-slate-100 py-1">
                    {stop.name}
                  </option>
                ))}
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                <Navigation className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Validation Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-950/50 border border-rose-800/60 p-2.5 rounded-xl animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            id="btn-show-my-journey"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/20 transition-all transform active:scale-98 cursor-pointer"
          >
            <span>Show My Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
