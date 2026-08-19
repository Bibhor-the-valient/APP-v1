import React, { useState } from 'react';
import { LogIn, LogOut, Leaf, Check, Users, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckinControlsProps {
  onCheckin: (action: 'boarding' | 'alighting', count: number) => Promise<boolean>;
  currentLoad: number;
  maxCapacity: number;
  isSubmitting: boolean;
  userStopName?: string;
}

export const CheckinControls: React.FC<CheckinControlsProps> = ({
  onCheckin,
  currentLoad,
  maxCapacity,
  isSubmitting,
  userStopName = 'Tambaram West Bus Stand'
}) => {
  const [selectedCount, setSelectedCount] = useState<number>(1);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const triggerEcoConfetti = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.8 },
        colors: ['#10b981', '#34d399', '#059669', '#6ee7b7']
      });
    } catch {
      // safe fallback
    }
  };

  const handleAction = async (action: 'boarding' | 'alighting') => {
    if (isSubmitting) return;

    if (action === 'boarding' && currentLoad >= maxCapacity) {
      alert('Bus 515A is currently at maximum capacity (50/50)!');
      return;
    }
    if (action === 'alighting' && currentLoad <= 0) {
      return;
    }

    setLastAction(action);
    const success = await onCheckin(action, selectedCount);
    if (success && action === 'boarding') {
      triggerEcoConfetti();
    }
    setTimeout(() => setLastAction(null), 2000);
  };

  const isFull = currentLoad >= maxCapacity;
  const isEmpty = currentLoad <= 0;
  const legCo2Saved = (selectedCount * 1.42).toFixed(2);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>Frictionless Transit Check-in</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </h2>
          <p className="text-xs text-slate-400">
            Checking in at <span className="text-emerald-300 font-semibold">{userStopName}</span> saves <span className="text-emerald-400 font-bold">~{legCo2Saved} kg CO₂</span> vs driving
          </p>
        </div>

        {/* Multi-passenger party selector */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          <span className="text-[11px] text-slate-400 font-medium px-2 hidden sm:inline flex items-center gap-1">
            <Users className="w-3 h-3" /> Party:
          </span>
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => setSelectedCount(num)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedCount === num
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              +{num}
            </button>
          ))}
        </div>
      </div>

      {/* Two Large Frictionless Touch Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* "I'm Boarding" Button */}
        <button
          id="btn-boarding"
          onClick={() => handleAction('boarding')}
          disabled={isSubmitting || isFull}
          className={`relative group overflow-hidden rounded-2xl p-4 sm:p-5 flex items-center justify-between text-left transition-all duration-300 transform active:scale-98 shadow-lg ${
            isFull
              ? 'bg-slate-800 opacity-60 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 border border-emerald-400/30 shadow-emerald-950/40 hover:shadow-emerald-500/20'
          }`}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-200 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-400/20">
                Tap to Board ({selectedCount > 1 ? `+${selectedCount}` : '+1'})
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              I'm Boarding
            </div>
            <p className="text-xs text-emerald-100/90 mt-0.5 flex items-center gap-1 font-medium">
              <Leaf className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>Saves {legCo2Saved} kg CO₂ on Route 515A</span>
            </p>
          </div>

          <div className="relative z-10 w-12 h-12 rounded-xl bg-emerald-500/30 border border-emerald-300/30 flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
            {lastAction === 'boarding' ? (
              <Check className="w-6 h-6 text-emerald-200 animate-bounce" />
            ) : (
              <LogIn className="w-6 h-6 text-emerald-100" />
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>

        {/* "I'm Exiting" Button */}
        <button
          id="btn-exiting"
          onClick={() => handleAction('alighting')}
          disabled={isSubmitting || isEmpty}
          className={`relative group overflow-hidden rounded-2xl p-4 sm:p-5 flex items-center justify-between text-left transition-all duration-300 transform active:scale-98 shadow-lg ${
            isEmpty
              ? 'bg-slate-800 opacity-60 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-br from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 border border-slate-700 hover:border-slate-600 shadow-slate-950/40'
          }`}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700">
                Tap to Exit ({selectedCount > 1 ? `-${selectedCount}` : '-1'})
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              I'm Exiting
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Trip completed • Space freed for waiting riders
            </p>
          </div>

          <div className="relative z-10 w-12 h-12 rounded-xl bg-slate-700/50 border border-slate-600 flex items-center justify-center text-slate-300 shadow-inner group-hover:scale-110 transition-transform">
            {lastAction === 'alighting' ? (
              <Check className="w-6 h-6 text-emerald-300 animate-bounce" />
            ) : (
              <LogOut className="w-6 h-6 text-slate-300" />
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </div>

      {isFull && (
        <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
          <span>Vehicle capacity limit reached (50/50). Boarding will reopen once riders alight.</span>
        </div>
      )}
    </div>
  );
};
