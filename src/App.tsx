/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Header } from './components/Header';
import { LoadGauge } from './components/LoadGauge';
import { CheckinControls } from './components/CheckinControls';
import { RouteTimeline } from './components/RouteTimeline';
import { PredictionChart } from './components/PredictionChart';
import { LiveActivityFeed } from './components/LiveActivityFeed';
import { SimulationBar } from './components/SimulationBar';
import { KarmaModal } from './components/KarmaModal';
import { calculateFutureLoadVector } from './predictionEngine';
import { Vehicle, Route, PredictionState, CheckinLog, UserStats } from './types';

// Default initial state
const INITIAL_ROUTE: Route = {
  id: 'route-101',
  name: 'Downtown Express Line',
  code: 'Line 42',
  stops: [
    { id: 'stop-1', name: 'Central Station', eta: 'Departing', distance: '0.0 km', zone: 'Downtown Corridor', landmark: 'Grand Concourse' },
    { id: 'stop-2', name: 'Tech Innovation Hub', eta: '4 min', distance: '1.8 km', zone: 'Tech District', landmark: 'Silicon Plaza Tower' },
    { id: 'stop-3', name: 'Civic Center Plaza', eta: '9 min', distance: '4.2 km', zone: 'Government Quarter', landmark: 'City Hall & Library' },
    { id: 'stop-4', name: 'University Medical Campus', eta: '15 min', distance: '6.7 km', zone: 'Academic Heights', landmark: 'Memorial Hospital Gate' },
    { id: 'stop-5', name: 'Riverfront Terminal', eta: '22 min', distance: '9.5 km', zone: 'Harbor Gateway', landmark: 'Ferry Piers' }
  ]
};

const INITIAL_VEHICLE: Vehicle = {
  id: 'bus-402',
  route_id: 'route-101',
  max_capacity: 50,
  current_load: 22,
  current_stop: 'Central Station',
  current_stop_idx: 0,
  speed_kmh: 36,
  driver_name: 'Alex Rivera',
  license_plate: 'CP-8492',
  updated_at: new Date().toISOString()
};

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [route, setRoute] = useState<Route>(INITIAL_ROUTE);
  const [vehicle, setVehicle] = useState<Vehicle>(INITIAL_VEHICLE);
  const [prediction, setPrediction] = useState<PredictionState>(() =>
    calculateFutureLoadVector(22, 50, 0, INITIAL_ROUTE.stops, 3)
  );
  const [logs, setLogs] = useState<CheckinLog[]>([]);
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isKarmaModalOpen, setIsKarmaModalOpen] = useState<boolean>(false);

  // Gamified User Stats with LocalStorage persistence
  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('commuter_stats');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      totalCheckins: 0,
      karmaPoints: 20,
      co2SavedKg: 0.8,
      rankTitle: 'Active Commuter',
      streakDays: 3
    };
  });

  const saveStats = useCallback((newStats: UserStats) => {
    setUserStats(newStats);
    try {
      localStorage.setItem('commuter_stats', JSON.stringify(newStats));
    } catch {
      // fallback
    }
  }, []);

  // 1. Initial State Fetch from API
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        if (data.route) setRoute(data.route);
        if (data.vehicle) setVehicle(data.vehicle);
        if (data.prediction) setPrediction(data.prediction);
        if (data.logs) setLogs(data.logs);
        if (typeof data.simulationActive === 'boolean') setSimulationActive(data.simulationActive);
      }
    } catch (err) {
      console.warn('Could not fetch initial status:', err);
    }
  }, []);

  // 2. Setup Socket.io connection (Prompt 3 requirement 1)
  useEffect(() => {
    fetchStatus();

    // Connect to Socket.io server on current origin
    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('⚡ Connected to CommuterPulse real-time Socket.io server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('⚠️ Disconnected from Socket.io server');
    });

    // Listen for 'load_update' event (Prompt 1 & 3 requirement)
    socketInstance.on('load_update', (data) => {
      if (data.vehicle) {
        setVehicle(data.vehicle);
      }
      if (data.prediction) {
        setPrediction(data.prediction);
      }
      if (data.log) {
        setLogs((prev) => [data.log, ...prev.slice(0, 24)]);
      }
    });

    // Listen for 'simulation_status' event
    socketInstance.on('simulation_status', (data) => {
      if (typeof data.active === 'boolean') {
        setSimulationActive(data.active);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [fetchStatus]);

  // 3. User Check-in Handler (Prompt 3 requirement 4)
  const handleCheckin = async (action: 'boarding' | 'alighting', count: number = 1): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // Send POST to /api/checkin
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: vehicle.id,
          action,
          count,
          source: 'user'
        })
      });

      if (!res.ok) {
        throw new Error('Checkin request failed');
      }

      const data = await res.json();
      if (data.vehicle) setVehicle(data.vehicle);
      if (data.prediction) setPrediction(data.prediction);
      if (data.log) setLogs((prev) => [data.log, ...prev.slice(0, 24)]);

      // Update user gamification stats
      const pointsEarned = action === 'boarding' ? 10 * count : 5 * count;
      const co2Delta = action === 'boarding' ? 0.4 * count : 0.1 * count;
      saveStats({
        ...userStats,
        totalCheckins: userStats.totalCheckins + 1,
        karmaPoints: userStats.karmaPoints + pointsEarned,
        co2SavedKg: userStats.co2SavedKg + co2Delta
      });

      return true;
    } catch (err) {
      console.error('Error during checkin:', err);
      // Fallback local update if offline
      const delta = action === 'boarding' ? count : -count;
      const nextLoad = Math.max(0, Math.min(vehicle.max_capacity, vehicle.current_load + delta));
      const updatedV: Vehicle = { ...vehicle, current_load: nextLoad };
      setVehicle(updatedV);
      setPrediction(calculateFutureLoadVector(nextLoad, vehicle.max_capacity, vehicle.current_stop_idx, route.stops));
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Hackathon Simulation Handlers
  const handleToggleSimulation = async () => {
    try {
      const res = await fetch('/api/simulation/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !simulationActive })
      });
      if (res.ok) {
        const data = await res.json();
        setSimulationActive(data.simulationActive);
      }
    } catch (err) {
      console.error('Error toggling simulation:', err);
      setSimulationActive(!simulationActive);
    }
  };

  const handleStepNextStop = async () => {
    try {
      const res = await fetch('/api/simulation/step', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setVehicle(data.result.vehicle);
          setPrediction(data.result.prediction);
          setLogs((prev) => [data.result.log, ...prev.slice(0, 24)]);
        }
      }
    } catch (err) {
      console.error('Error advancing stop:', err);
    }
  };

  const handleTriggerSurge = async (type: 'surge_board' | 'surge_exit') => {
    const action = type === 'surge_board' ? 'boarding' : 'alighting';
    await handleCheckin(action, 6);
  };

  const handleResetVehicle = async () => {
    try {
      const res = await fetch('/api/vehicle/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ load: 22, stop_idx: 0 })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.vehicle) setVehicle(data.vehicle);
        if (data.prediction) setPrediction(data.prediction);
      }
    } catch (err) {
      console.error('Error resetting vehicle:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans antialiased">
      {/* Top Header */}
      <Header
        isConnected={isConnected}
        userStats={userStats}
        onOpenKarmaModal={() => setIsKarmaModalOpen(true)}
        simulationActive={simulationActive}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Row 1: Prominent Bus Load Gauge */}
        <section aria-label="Current Bus Capacity">
          <LoadGauge vehicle={vehicle} />
        </section>

        {/* Row 2: Frictionless Check-in Buttons ("I'm Boarding" & "I'm Exiting") */}
        <section aria-label="Commuter Action Controls">
          <CheckinControls
            onCheckin={handleCheckin}
            currentLoad={vehicle.current_load}
            maxCapacity={vehicle.max_capacity}
            isSubmitting={isSubmitting}
          />
        </section>

        {/* Row 3: 5-Stop Route Timeline & Telemetry */}
        <section aria-label="5-Stop Route Corridor">
          <RouteTimeline
            route={route}
            vehicle={vehicle}
            predictions={prediction.stopsForecast}
            onManualAdvance={handleStepNextStop}
          />
        </section>

        {/* Row 4: Predictive Engine (3-Stop State Vector Forecast) */}
        <section aria-label="Linear Algebraic Load Forecasting">
          <PredictionChart
            prediction={prediction}
            currentStopName={vehicle.current_stop || 'Central Station'}
          />
        </section>

        {/* Row 5: Real-time Telemetry Activity Feed & Simulation Bar */}
        <div className="grid grid-cols-1 gap-6">
          <section aria-label="Hackathon Simulation Controls">
            <SimulationBar
              simulationActive={simulationActive}
              onToggleSimulation={handleToggleSimulation}
              onStepNextStop={handleStepNextStop}
              onTriggerSurge={handleTriggerSurge}
              onResetVehicle={handleResetVehicle}
            />
          </section>

          <section aria-label="Real-time Transit Activity Feed">
            <LiveActivityFeed logs={logs} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-400">
        <p>
          <strong className="text-slate-300">CommuterPulse</strong> • Real-time Transit Load Intelligence & State-Space Crowd Forecasting
        </p>
      </footer>

      {/* Gamified Karma Rewards Modal */}
      <KarmaModal
        isOpen={isKarmaModalOpen}
        onClose={() => setIsKarmaModalOpen(false)}
        userStats={userStats}
      />
    </div>
  );
}
