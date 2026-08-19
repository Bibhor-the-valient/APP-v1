import React from 'react';
import { X, Award, Leaf, Zap, ShieldCheck, Flame, Trophy, Star } from 'lucide-react';
import { UserStats } from '../types';

interface KarmaModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
}

export const KarmaModal: React.FC<KarmaModalProps> = ({
  isOpen,
  onClose,
  userStats
}) => {
  if (!isOpen) return null;

  const badges = [
    {
      name: 'First Pulse',
      desc: 'Completed your first live transit check-in',
      earned: userStats.totalCheckins >= 1,
      icon: Zap,
      color: 'cyan'
    },
    {
      name: 'Crowd Hero',
      desc: 'Provided 5+ live crowd updates to commuters',
      earned: userStats.totalCheckins >= 5,
      icon: ShieldCheck,
      color: 'emerald'
    },
    {
      name: 'Eco Commuter',
      desc: 'Saved 2.5kg of urban carbon emissions',
      earned: userStats.co2SavedKg >= 2.5,
      icon: Leaf,
      color: 'green'
    },
    {
      name: 'Corridor Sentinel',
      desc: 'Earned 100+ CommuterPulse karma points',
      earned: userStats.karmaPoints >= 100,
      icon: Trophy,
      color: 'amber'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Commuter Karma & Impact</h2>
            <p className="text-xs text-slate-400">Crowdsourced transit intelligence rewards</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Karma</span>
            <span className="text-2xl font-black text-amber-400">{userStats.karmaPoints}</span>
            <span className="text-[10px] text-slate-500 block">points</span>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Check-ins</span>
            <span className="text-2xl font-black text-cyan-400">{userStats.totalCheckins}</span>
            <span className="text-[10px] text-slate-500 block">contributions</span>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">CO₂ Offset</span>
            <span className="text-2xl font-black text-emerald-400">{userStats.co2SavedKg.toFixed(1)}</span>
            <span className="text-[10px] text-slate-500 block">kg saved</span>
          </div>
        </div>

        {/* Badges List */}
        <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>Transit Achievements</span>
        </h3>

        <div className="space-y-2.5 mb-6">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  badge.earned
                    ? 'bg-slate-850/90 border-slate-700/80 text-white'
                    : 'bg-slate-900/40 border-slate-850 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    badge.earned ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold">{badge.name}</h4>
                    <p className="text-[11px] text-slate-400">{badge.desc}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  badge.earned
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {badge.earned ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-750 font-bold text-sm text-slate-200 border border-slate-700 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};
