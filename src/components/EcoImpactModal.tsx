import React from 'react';
import { X, Leaf, Trees, Fuel, ShieldCheck, TrendingDown, Bus } from 'lucide-react';
import { EcoStats } from '../types';

interface EcoImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  ecoStats: EcoStats;
}

export const EcoImpactModal: React.FC<EcoImpactModalProps> = ({
  isOpen,
  onClose,
  ecoStats
}) => {
  if (!isOpen) return null;

  const { co2SavedKg, totalTrips, distanceTraveledKm, treesEquivMonths, fuelSavedLiters } = ecoStats;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl relative overflow-hidden">
        {/* Top ambient glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Your Carbon Offset Impact</h2>
            <p className="text-xs text-slate-400">Route 515A Public Transit vs Personal Vehicle</p>
          </div>
        </div>

        {/* Big Highlight Hero Card */}
        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-850 p-5 rounded-2xl border border-emerald-500/30 mb-6 text-center">
          <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider block mb-1">
            Total Carbon Emissions Avoided
          </span>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-black text-white">{co2SavedKg.toFixed(2)}</span>
            <span className="text-2xl font-bold text-emerald-400">kg CO₂</span>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            By choosing bus-515A instead of driving a personal vehicle across the Tambaram-Kovalam corridor
          </p>
        </div>

        {/* Impact Breakdown Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-800 text-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-1.5">
              <Bus className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Trips</span>
            <span className="text-xl font-black text-slate-100">{totalTrips}</span>
            <span className="text-[10px] text-slate-500 block">check-ins</span>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-800 text-center">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-1.5">
              <Fuel className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Fuel Saved</span>
            <span className="text-xl font-black text-teal-400">{fuelSavedLiters.toFixed(1)}</span>
            <span className="text-[10px] text-slate-500 block">liters petrol</span>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-800 text-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-1.5">
              <Trees className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Tree Impact</span>
            <span className="text-xl font-black text-emerald-400">{treesEquivMonths.toFixed(1)}</span>
            <span className="text-[10px] text-slate-500 block">tree-months</span>
          </div>
        </div>

        {/* Corridor Fact Box */}
        <div className="bg-slate-850/70 rounded-xl p-3.5 border border-slate-800 text-xs text-slate-300 space-y-2 mb-6">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <TrendingDown className="w-4 h-4" />
            <span>Chennai Transit Environmental Fact</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Every passenger on Route 515A (34.7 km full run from Tambaram West to Kovalam) reduces city traffic congestion and saves approximately <strong className="text-slate-200">~140 grams of CO₂ per kilometer</strong> compared to single-occupancy cars.
          </p>
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
