/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { Header } from './components/Header';
import { CurrentStopSelector } from './components/CurrentStopSelector';
import { EcoImpactCard } from './components/EcoImpactCard';
import { LoadGauge } from './components/LoadGauge';
import { RouteTimeline } from './components/RouteTimeline';
import { CheckinControls } from './components/CheckinControls';
import { PredictionChart } from './components/PredictionChart';
import { LiveActivityFeed } from './components/LiveActivityFeed';
import { SimulationBar } from './components/SimulationBar';
import { calculateFutureLoadVector } from './predictionEngine';
import { Vehicle, Route, PredictionState, CheckinLog } from './types';

// Structured Route 515A Definition with exact 5 stops and leg metrics
export const ROUTE_515A: Route = {
  id: 'route-515A',
  name: 'Route 515A (Tambaram West ⇄ Kovalam)',
  code: '515A Express',
  stops: [
    {
      id: 'stop-1',
      name: 'Tambaram West Bus Stand',
      eta: 'Departing',
      distance: '0.0 km',
      distanceToNext: 8.4,
      minutesToNext: 17,
      toNextStopDistance: '~8.4 km',
      toNextStopTime: '~17 minutes',
      zone: 'Tambaram Central',
      landmark: 'GST Road Transit Hub'
    },
    {
      id: 'stop-2',
      name: 'Vandalur Zoo',
      eta: '17 min',
      distance: '8.4 km',
      distanceToNext: 10.1,
      minutesToNext: 15,
      toNextStopDistance: '~10.1 km',
      toNextStopTime: '~15 minutes',
      zone: 'Vandalur Forest Corridor',
      landmark: 'Arignar Anna Zoological Park'
    },
    {
      id: 'stop-3',
      name: 'VIT Chennai',
      eta: '32 min',
      distance: '18.5 km',
      distanceToNext: 11.3,
      minutesToNext: 22,
      toNextStopDistance: '~11.3 km',
      toNextStopTime: '~22 minutes',
      zone: 'Academic Corridor (VK Road)',
      landmark: 'VIT Chennai Main Campus Gate'
    },
    {
      id: 'stop-4',
      name: 'Kelambakkam Bus Terminal',
      eta: '54 min',
      distance: '29.8 km',
      distanceToNext: 4.9,
      minutesToNext: 14,
      toNextStopDistance: '~4.9 km',
      toNextStopTime: '~14 minutes',
      zone: 'OMR Junction',
      landmark: 'Kelambakkam Bazaar & ECR Link'
    },
    {
      id: 'stop-5',
      name: 'Kovalam Bus Stand',
      eta: '1 hr 8 min',
      distance: '34.7 km',
      distanceToNext: 0,
      minutesToNext: 0,
      toNextStopDistance: 'Terminal',
      toNextStopTime: 'End of Route',
      zone: 'ECR Coastal Gateway',
      landmark: 'Kovalam Beach Terminal'
    }
  ]
};

export const INITIAL_VEHICLE_515A: Vehicle = {
  id: 'bus-515A',
  route_id: 'route-515A',
  max_capacity: 50,
  current_load: 24,
  current_stop: 'Tambaram West Bus Stand',
  current_stop_idx: 0,
  speed_kmh: 38,
  driver_name: 'Venkatesh Iyer',
  license_plate: 'TN-09-N-5151',
  updated_at: new Date().toISOString()
};

// Deterministic distance from selected stop to final stop (Kovalam Bus Stand)
// Distances:
// Tambaram West -> Vandalur Zoo: 8.4 km
// Vandalur Zoo -> VIT Chennai: 10.1 km
// VIT Chennai -> Kelambakkam: 11.3 km
// Kelambakkam -> Kovalam: 4.9 km
const REMAINING_DISTANCES_KM: Record<string, number> = {
  'stop-1': 34.7, // 8.4 + 10.1 + 11.3 + 4.9 = 34.7 km
  'stop-2': 26.3, // 10.1 + 11.3 + 4.9 = 26.3 km
  'stop-3': 16.2, // 11.3 + 4.9 = 16.2 km
  'stop-4': 4.9,  // 4.9 km
  'stop-5': 0.0   // 0 km (Final stop)
};

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [route, setRoute] = useState<Route>(ROUTE_515A);
  const [vehicle, setVehicle] = useState<Vehicle>(INITIAL_VEHICLE_515A);
  const [prediction, setPrediction] = useState<PredictionState>(() =>
    calculateFutureLoadVector(24, 50, 0, ROUTE_515A.stops, 3)
  );
  const [logs, setLogs] = useState<CheckinLog[]>([]);
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // User Stop Selection State ("Where are you now?")
  // Persisted in state; if null, user sees initial stop selector first
  const [userSelectedStopId, setUserSelectedStopId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('user_current_stop_id') || null;
    } catch {
      return null;
    }
  });

  const [hasConfirmedJourney, setHasConfirmedJourney] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('user_current_stop_id'));
    } catch {
      return false;
    }
  });

  // Calculate deterministic CO2 avoided based on selected stop
  // Formula: CO2 avoided = journey distance × 0.12 kg CO2/km
  const activeStopId = userSelectedStopId || 'stop-1';
  const journeyDistanceKm = REMAINING_DISTANCES_KM[activeStopId] ?? 34.7;
  const co2AvoidedKg = useMemo(() => {
    return Number((journeyDistanceKm * 0.12).toFixed(2));
  }, [journeyDistanceKm]);

  const activeStopObj = useMemo(() => {
    return route.stops.find((s) => s.id === activeStopId) || route.stops[0];
  }, [route.stops, activeStopId]);

  // Handle Stop Confirmation
  const handleConfirmStop = (stopId: string) => {
    setUserSelectedStopId(stopId);
    setHasConfirmedJourney(true);
    try {
      localStorage.setItem('user_current_stop_id', stopId);
    } catch {
      // safe fallback
    }
  };

  // 1. Initial State Fetch from API
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        if (data.route) setRoute(data.route);
        if (data.vehicle) {
          // Ensure display names match prompt requirements
          setVehicle({
            ...data.vehicle,
            driver_name: 'Venkatesh Iyer'
          });
        }
        if (data.prediction) setPrediction(data.prediction);
        if (data.logs) setLogs(data.logs);
        if (typeof data.simulationActive === 'boolean') setSimulationActive(data.simulationActive);
      }
    } catch (err) {
      console.warn('Could not fetch initial status:', err);
    }
  }, []);

  // 2. Setup Socket.io connection
  useEffect(() => {
    fetchStatus();

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

    socketInstance.on('load_update', (data) => {
      if (data.vehicle) {
        setVehicle({
          ...data.vehicle,
          driver_name: 'Venkatesh Iyer'
        });
      }
      if (data.prediction) {
        setPrediction(data.prediction);
      }
      if (data.log) {
        setLogs((prev) => [data.log, ...prev.slice(0, 24)]);
      }
    });

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

  // 3. User Check-in Handler (Boarding / Exiting)
  const handleCheckin = async (action: 'boarding' | 'alighting', count: number = 1): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: 'bus-515A',
          action,
          count,
          source: 'user',
          stop_name: activeStopObj.name
        })
      });

      if (!res.ok) {
        throw new Error('Checkin request failed');
      }

      const data = await res.json();
      if (data.vehicle) {
        setVehicle({
          ...data.vehicle,
          driver_name: 'Venkatesh Iyer'
        });
      }
      if (data.prediction) setPrediction(data.prediction);
      if (data.log) setLogs((prev) => [data.log, ...prev.slice(0, 24)]);

      return true;
    } catch (err) {
      console.error('Error during checkin:', err);
      // Fallback local state update
      const delta = action === 'boarding' ? count : -count;
      const nextLoad = Math.max(0, Math.min(vehicle.max_capacity, vehicle.current_load + delta));
      const updatedV: Vehicle = {
        ...vehicle,
        current_load: nextLoad,
        driver_name: 'Venkatesh Iyer'
      };
      setVehicle(updatedV);
      setPrediction(calculateFutureLoadVector(nextLoad, vehicle.max_capacity, vehicle.current_stop_idx, route.stops));
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Simulation Handlers
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
          setVehicle({
            ...data.result.vehicle,
            driver_name: 'Venkatesh Iyer'
          });
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
        body: JSON.stringify({ load: 24, stop_idx: 0 })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.vehicle) {
          setVehicle({
            ...data.vehicle,
            driver_name: 'Venkatesh Iyer'
          });
        }
        if (data.prediction) setPrediction(data.prediction);
      }
    } catch (err) {
      console.error('Error resetting vehicle:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased">
      {/* Top Header */}
      <Header
        isConnected={isConnected}
        co2AvoidedKg={co2AvoidedKg}
        driverName="Venkatesh Iyer"
        vehicleName="Bus 515A"
        simulationActive={simulationActive}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* STEP 2: Initial Bus Stop Selection Screen if not selected yet */}
        {!hasConfirmedJourney ? (
          <section aria-label="Bus Stop Selection">
            <CurrentStopSelector
              stops={route.stops}
              selectedStopId={userSelectedStopId || ''}
              onConfirmStop={handleConfirmStop}
              isInitialSelection={true}
            />
          </section>
        ) : (
          <>
            {/* STEP 3 & STEP 4: Selected Journey Dashboard */}

            {/* Quick Stop Location Selector Card / Change Stop Bar */}
            <section aria-label="Current Bus Stop Selection">
              <CurrentStopSelector
                stops={route.stops}
                selectedStopId={activeStopId}
                onConfirmStop={handleConfirmStop}
                isInitialSelection={false}
              />
            </section>

            {/* Prominent Environmental Impact Card (CO2 Emissions Avoided) */}
            <section aria-label="Environmental CO2 Impact">
              <EcoImpactCard
                startingStopName={activeStopObj.name}
                journeyDistanceKm={journeyDistanceKm}
                co2AvoidedKg={co2AvoidedKg}
              />
            </section>

            {/* Prominent Bus Load Gauge & Driver Info */}
            <section aria-label="Current Bus Capacity">
              <LoadGauge
                vehicle={vehicle}
                driverName="Venkatesh Iyer"
                vehicleName="Bus 515A"
              />
            </section>

            {/* Frictionless Check-in Controls */}
            <section aria-label="Commuter Action Controls">
              <CheckinControls
                onCheckin={handleCheckin}
                currentLoad={vehicle.current_load}
                maxCapacity={vehicle.max_capacity}
                isSubmitting={isSubmitting}
                userStopName={activeStopObj.name}
              />
            </section>

            {/* 5-Stop Route Timeline starting from selected stop */}
            <section aria-label="Route 515A Journey Timeline">
              <RouteTimeline
                route={route}
                vehicle={vehicle}
                selectedStopId={activeStopId}
                onChangeStop={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </section>

            {/* Predictive Crowd Intelligence Forecast */}
            <section aria-label="Predictive Passenger Load Forecasting">
              <PredictionChart
                prediction={prediction}
                currentStopName={vehicle.current_stop || 'Tambaram West Bus Stand'}
              />
            </section>

            {/* Real-time Telemetry Activity Feed & Simulation Bar */}
            <div className="grid grid-cols-1 gap-6">
              <section aria-label="Hackathon Simulation Engine">
                <SimulationBar
                  simulationActive={simulationActive}
                  onToggleSimulation={handleToggleSimulation}
                  onStepNextStop={handleStepNextStop}
                  onTriggerSurge={handleTriggerSurge}
                  onResetVehicle={handleResetVehicle}
                />
              </section>

              <section aria-label="Live Telemetry Stream">
                <LiveActivityFeed logs={logs} />
              </section>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-400">
        <p>
          <strong className="text-slate-300">CommuterPulse</strong> • Bus 515A (Tambaram West ⇄ Kovalam) • Driver: Venkatesh Iyer • Real-time Crowd Intelligence & CO₂ Tracking
        </p>
      </footer>
    </div>
  );
}
