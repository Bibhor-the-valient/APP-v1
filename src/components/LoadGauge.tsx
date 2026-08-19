import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, UserCheck, MapPin } from 'lucide-react';
import { Vehicle } from '../types';

interface LoadGaugeProps {
  vehicle: Vehicle;
  driverName?: string;
  vehicleName?: string;
}

export const LoadGauge: React.FC<LoadGaugeProps> = ({
  vehicle,
  driverName = 'Venkatesh Iyer',
  vehicleName = 'Bus 515A'
}) => {
  const currentLoad = vehicle.current_load;
  const maxCapacity = vehicle.max_capacity || 50;
  const percentage = Math.min(100, Math.max(0, Math.round((currentLoad / maxCapacity) * 100)));

  // Color Coding:
  // Green: <50%, Yellow: 50-80%, Red: >80%
  let statusColor = 'emerald';
  let statusText = 'Seats Available';
  let statusDescription = 'Low Crowd Level • Plenty of Comfortable Seating';
  let Icon = ShieldCheck;

  if (percentage >= 80) {
    statusColor = 'rose';
    statusText = 'Crowded / Near Capacity';
    statusDescription = 'High Passenger Density • Standing Room Only';
    Icon = AlertOctagon;
  } else if (percentage >= 50) {
    statusColor = 'amber';
    statusText = 'Moderate Passenger Load';
    statusDescription = 'Moderate Crowd • Limited Available Seats';
    Icon = AlertTriangle;
  }

  const seatsMax = Math.round(maxCapacity * 0.7); // 35 seats
  const seatsRemaining = Math.max(0, seatsMax - currentLoad);
  const standingPassengers = Math.max(0, currentLoad - seatsMax);

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
          statusColor === 'emerald'
            ? 'bg-emerald-500'
            : statusColor === 'amber'
            ? 'bg-amber-500'
            : 'bg-rose-500'
        }`}
      />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left: Prominent Crowd Number & Status */}
        <div className="flex-1 w-full text-center lg:text-left">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 border transition-all duration-300"
            style={{
              backgroundColor:
                statusColor === 'emerald'
                  ? 'rgba(16, 185, 129, 0.12)'
                  : statusColor === 'amber'
                  ? 'rgba(245, 158, 11, 0.12)'
                  : 'rgba(244, 63, 94, 0.12)',
              borderColor:
                statusColor === 'emerald'
                  ? 'rgba(16, 185, 129, 0.3)'
                  : statusColor === 'amber'
                  ? 'rgba(245, 158, 11, 0.3)'
                  : 'rgba(244, 63, 94, 0.3)',
              color:
                statusColor === 'emerald'
                  ? '#34d399'
                  : statusColor === 'amber'
                  ? '#fbbf24'
                  : '#fb7185'
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{statusText}</span>
          </div>

          <div className="flex items-baseline justify-center lg:justify-start gap-3 my-1">
            <span
              className={`text-5xl sm:text-6xl font-black tracking-tight transition-colors duration-500 ${
                statusColor === 'emerald'
                  ? 'text-emerald-400'
                  : statusColor === 'amber'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {currentLoad}
            </span>
            <span className="text-2xl sm:text-3xl text-slate-500 font-semibold">
              / {maxCapacity}
            </span>
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Passengers
            </span>
          </div>

          <p className="text-sm text-slate-300 font-medium mt-1">
            {statusDescription}
          </p>

          {/* Quick Metrics Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-850/80 rounded-xl p-2.5 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Seats Open</span>
              <span className="text-base sm:text-lg font-bold text-slate-100">{seatsRemaining} seats</span>
            </div>
            <div className="bg-slate-850/80 rounded-xl p-2.5 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Standing</span>
              <span className="text-base sm:text-lg font-bold text-slate-100">{standingPassengers} standing</span>
            </div>
            <div className="bg-slate-850/80 rounded-xl p-2.5 border border-slate-700/50 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Corridor Speed</span>
              <span className="text-base sm:text-lg font-bold text-cyan-400">{vehicle.speed_kmh || 38} km/h</span>
            </div>
          </div>
        </div>

        {/* Center / Right: Circular Radial Meter */}
        <div className="flex flex-col items-center justify-center relative">
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#1e293b"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={
                  statusColor === 'emerald'
                    ? '#10b981'
                    : statusColor === 'amber'
                    ? '#f59e0b'
                    : '#f43f5e'
                }
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold tracking-tight text-white">
                {percentage}%
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Capacity
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              &lt;50% Low
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              50-80% Mod
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              &gt;80% High
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle & Driver Info Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Vehicle Location:</span>
          <span className="font-semibold text-slate-200">{vehicle.current_stop || 'Tambaram West Bus Stand'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Bus: <strong className="text-slate-100">{vehicleName}</strong></span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Driver: <strong className="text-white">{driverName}</strong></span>
          </span>
        </div>
      </div>
    </div>
  );
};
