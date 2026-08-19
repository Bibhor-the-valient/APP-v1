import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import initSqlJs, { Database } from 'sql.js';

const PORT = 3000;
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS enabled
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());

// 5-stop Route 515A transit corridor
export const ROUTE_DATA = {
  id: 'route-515A',
  name: 'Route 515A (Tambaram West ⇄ Kovalam)',
  code: '515A Express',
  stops: [
    {
      id: 'stop-1',
      name: 'Tambaram West Bus Stand',
      eta: 'Departing',
      distance: '0.0 km',
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
      toNextStopDistance: 'Terminal',
      toNextStopTime: 'End of Route',
      zone: 'ECR Coastal Gateway',
      landmark: 'Kovalam Beach Terminal'
    }
  ]
};

// Historical matrix profiles for Route 515A corridor
const HISTORICAL_BOARDING = [
  [14, 8, 4],   // At Tambaram West: high boarding for Vandalur, VIT, Kelambakkam
  [12, 10, 3],  // At Vandalur Zoo: boarding for VIT & Kelambakkam
  [8, 12, 2],   // At VIT Chennai: students boarding towards Kelambakkam & Kovalam
  [5, 2, 0],    // At Kelambakkam: boarding for Kovalam beach
  [1, 0, 0]     // At Kovalam: terminal turnaround
];

const HISTORICAL_ALIGHTING = [
  [4, 12, 15],  // At Tambaram West: alightings down the corridor
  [8, 14, 9],   // At Vandalur Zoo: tourists alight
  [15, 8, 12],  // At VIT Chennai: massive student alightings
  [14, 16, 5],  // At Kelambakkam: OMR IT commuters alight
  [22, 0, 0]    // At Kovalam: full terminal alighting
];

// SQLite In-Memory Database Holder
let db: Database | null = null;

// Simulation State
let simulationActive = true;
let simulationInterval: NodeJS.Timeout | null = null;
let stopAdvanceInterval: NodeJS.Timeout | null = null;

// Linear Algebra State Vector Prediction Engine
function computePrediction(L_current: number, currentStopIdx: number, maxCapacity: number = 50) {
  const baseB = HISTORICAL_BOARDING[currentStopIdx] || [8, 6, 3];
  const baseA = HISTORICAL_ALIGHTING[currentStopIdx] || [7, 10, 12];

  const B_vector: number[] = [];
  const A_vector: number[] = [];
  const L_future_vector: number[] = [];
  const stopsForecast = [];

  let rollingLoad = L_current;
  const numStops = ROUTE_DATA.stops.length;

  for (let step = 1; step <= 3; step++) {
    const targetIdx = (currentStopIdx + step) % numStops;
    const stopObj = ROUTE_DATA.stops[targetIdx];

    const b_k = baseB[step - 1] ?? Math.floor(Math.random() * 8 + 2);
    const a_k = baseA[step - 1] ?? Math.floor(Math.random() * 10 + 3);

    B_vector.push(b_k);
    A_vector.push(a_k);

    const netFlow = b_k - a_k;
    rollingLoad = Math.max(0, Math.min(maxCapacity, rollingLoad + netFlow));
    L_future_vector.push(rollingLoad);

    const percentage = Math.round((rollingLoad / maxCapacity) * 100);
    const statusLevel = percentage < 50 ? 'low' : percentage <= 80 ? 'moderate' : 'high';
    const seatsAvailable = Math.max(0, Math.round(maxCapacity * 0.7) - rollingLoad);
    const standingAvailable = Math.max(0, maxCapacity - rollingLoad - seatsAvailable);

    stopsForecast.push({
      stopIndex: targetIdx,
      stopName: stopObj.name,
      eta: stopObj.eta,
      predictedLoad: rollingLoad,
      predictedPercentage: percentage,
      expectedBoarding: b_k,
      expectedAlighting: a_k,
      statusLevel,
      seatsAvailable,
      standingAvailable
    });
  }

  return {
    currentLoad: L_current,
    maxCapacity,
    predictedVector: L_future_vector,
    stopsForecast,
    historicalBoardingMatrix: B_vector,
    historicalAlightingMatrix: A_vector,
    formulaString: `L_{t+k} = min(${maxCapacity}, max(0, L_t + \\sum_{i=1}^k (b_i - a_i)))`
  };
}

// Initialize SQLite Schema & Seed Data with bus-515A and Venkatesh Iyer
async function initDatabase() {
  const SQL = await initSqlJs();
  db = new SQL.Database();

  // 1. Create SQLite table for vehicles
  db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      route_id TEXT NOT NULL,
      max_capacity INTEGER NOT NULL DEFAULT 50,
      current_load INTEGER NOT NULL DEFAULT 24,
      current_stop TEXT NOT NULL,
      current_stop_idx INTEGER NOT NULL DEFAULT 0,
      speed_kmh INTEGER NOT NULL DEFAULT 38,
      driver_name TEXT NOT NULL DEFAULT 'Venkatesh Iyer',
      license_plate TEXT NOT NULL DEFAULT 'TN-09-N-5151',
      updated_at TEXT NOT NULL
    );
  `);

  // 2. Create SQLite table for checkin logs
  db.run(`
    CREATE TABLE IF NOT EXISTS checkin_logs (
      id TEXT PRIMARY KEY,
      vehicle_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      action TEXT NOT NULL,
      delta INTEGER NOT NULL,
      new_load INTEGER NOT NULL,
      source TEXT NOT NULL,
      stop_name TEXT NOT NULL,
      co2_saved_kg REAL NOT NULL DEFAULT 0.0
    );
  `);

  // Insert initial bus-515A with driver Venkatesh Iyer
  const now = new Date().toISOString();
  db.run(`
    INSERT OR REPLACE INTO vehicles (
      id, route_id, max_capacity, current_load, current_stop, current_stop_idx, speed_kmh, driver_name, license_plate, updated_at
    ) VALUES (
      'bus-515A', 'route-515A', 50, 24, 'Tambaram West Bus Stand', 0, 42, 'Venkatesh Iyer', 'TN-09-N-5151', '${now}'
    );
  `);

  console.log('✅ SQLite in-memory database initialized for bus-515A (Driver: Venkatesh Iyer, Capacity: 50)');
}

// Database helper queries
function getVehicle(id: string = 'bus-515A') {
  if (!db) return null;
  const res = db.exec(`SELECT * FROM vehicles WHERE id = '${id}'`);
  if (!res.length || !res[0].values.length) return null;
  const cols = res[0].columns;
  const row = res[0].values[0];
  const vehicleObj: Record<string, any> = {};
  cols.forEach((col, idx) => {
    vehicleObj[col] = row[idx];
  });
  return vehicleObj;
}

function updateVehicleLoad(vehicleId: string = 'bus-515A', delta: number, source: string = 'user', selectedStop?: string) {
  if (!db) return null;
  const v = getVehicle(vehicleId);
  if (!v) return null;

  const maxCap = v.max_capacity || 50;
  const currentLoad = v.current_load;
  const newLoad = Math.max(0, Math.min(maxCap, currentLoad + delta));
  const now = new Date().toISOString();
  const stopName = selectedStop || v.current_stop || ROUTE_DATA.stops[v.current_stop_idx]?.name || 'Tambaram West Bus Stand';

  // Calculate CO2 savings for this public transit leg (~1.4 kg average CO2 avoided per rider vs personal petrol car on Route 515A)
  const co2SavedLegKg = delta > 0 ? Number((Math.abs(delta) * 1.42).toFixed(2)) : 0;

  db.run(`
    UPDATE vehicles 
    SET current_load = ${newLoad}, updated_at = '${now}' 
    WHERE id = '${vehicleId}';
  `);

  const logId = 'log-' + Math.random().toString(36).substring(2, 9);
  const action = delta >= 0 ? 'boarding' : 'alighting';
  db.run(`
    INSERT INTO checkin_logs (id, vehicle_id, timestamp, action, delta, new_load, source, stop_name, co2_saved_kg)
    VALUES ('${logId}', '${vehicleId}', '${now}', '${action}', ${delta}, ${newLoad}, '${source}', '${stopName.replace(/'/g, "''")}', ${co2SavedLegKg});
  `);

  const updatedVehicle = getVehicle(vehicleId);
  const prediction = computePrediction(newLoad, updatedVehicle.current_stop_idx, maxCap);

  const logEntry = {
    id: logId,
    timestamp: now,
    action,
    delta,
    newLoad,
    source,
    stopName,
    co2SavedLegKg
  };

  return { vehicle: updatedVehicle, prediction, log: logEntry };
}

function advanceVehicleStop(vehicleId: string = 'bus-515A') {
  if (!db) return null;
  const v = getVehicle(vehicleId);
  if (!v) return null;

  const numStops = ROUTE_DATA.stops.length;
  const nextIdx = (v.current_stop_idx + 1) % numStops;
  const nextStopObj = ROUTE_DATA.stops[nextIdx];
  const now = new Date().toISOString();
  const speed = Math.floor(Math.random() * 20) + 30; // 30-50 km/h

  // Realistic stop flow
  const boardingCount = Math.floor(Math.random() * 7) + 2;
  const alightingCount = Math.floor(Math.random() * 6) + 1;
  const netChange = boardingCount - alightingCount;
  const maxCap = v.max_capacity || 50;
  const newLoad = Math.max(0, Math.min(maxCap, v.current_load + netChange));

  db.run(`
    UPDATE vehicles 
    SET current_stop_idx = ${nextIdx}, 
        current_stop = '${nextStopObj.name.replace(/'/g, "''")}',
        current_load = ${newLoad},
        speed_kmh = ${speed},
        updated_at = '${now}'
    WHERE id = '${vehicleId}';
  `);

  const updatedVehicle = getVehicle(vehicleId);
  const prediction = computePrediction(newLoad, nextIdx, maxCap);

  const logId = 'stop-arr-' + Math.random().toString(36).substring(2, 9);
  db.run(`
    INSERT INTO checkin_logs (id, vehicle_id, timestamp, action, delta, new_load, source, stop_name, co2_saved_kg)
    VALUES ('${logId}', '${vehicleId}', '${now}', 'stop_arrival', ${netChange}, ${newLoad}, 'sensor', '${nextStopObj.name.replace(/'/g, "''")}', 0.0);
  `);

  return {
    vehicle: updatedVehicle,
    prediction,
    log: {
      id: logId,
      timestamp: now,
      action: 'stop_arrival',
      delta: netChange,
      newLoad,
      source: 'sensor',
      stopName: nextStopObj.name,
      co2SavedLegKg: 0
    }
  };
}

function getRecentLogs(limit: number = 20) {
  if (!db) return [];
  const res = db.exec(`SELECT * FROM checkin_logs ORDER BY timestamp DESC LIMIT ${limit}`);
  if (!res.length || !res[0].values.length) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => {
    const item: Record<string, any> = {};
    cols.forEach((col, idx) => {
      item[col] = row[idx];
    });
    return item;
  });
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// GET /api/status - Route 515A status
app.get('/api/status', (req: Request, res: Response) => {
  const vehicle = getVehicle('bus-515A');
  if (!vehicle) {
    return res.status(500).json({ error: 'Vehicle bus-515A not found' });
  }
  const prediction = computePrediction(vehicle.current_load, vehicle.current_stop_idx, vehicle.max_capacity);
  const logs = getRecentLogs(15);

  res.json({
    route: ROUTE_DATA,
    vehicle,
    prediction,
    logs,
    simulationActive,
    serverTime: new Date().toISOString()
  });
});

// POST /api/checkin - Boarding/Alighting for bus-515A
app.post('/api/checkin', (req: Request, res: Response) => {
  const { vehicle_id = 'bus-515A', action, count = 1, source = 'user', stop_name } = req.body;

  let delta = 0;
  if (action === 'boarding' || action === '+1' || action === 1) {
    delta = Math.abs(Number(count) || 1);
  } else if (action === 'alighting' || action === '-1' || action === -1) {
    delta = -Math.abs(Number(count) || 1);
  } else {
    return res.status(400).json({ error: 'Invalid action. Must be "boarding" or "alighting"' });
  }

  const result = updateVehicleLoad(vehicle_id, delta, source, stop_name);
  if (!result) {
    return res.status(500).json({ error: 'Failed to update bus-515A load' });
  }

  // Emit Socket.io load_update event
  io.emit('load_update', {
    vehicle: result.vehicle,
    prediction: result.prediction,
    log: result.log,
    timestamp: new Date().toISOString()
  });

  io.emit('capacity_update', {
    vehicle_id: result.vehicle.id,
    current_load: result.vehicle.current_load,
    max_capacity: result.vehicle.max_capacity,
    current_stop: result.vehicle.current_stop
  });

  res.json({
    success: true,
    message: `Passenger ${action} recorded on ${result.vehicle.id}`,
    vehicle: result.vehicle,
    prediction: result.prediction,
    log: result.log
  });
});

// POST /api/simulation/toggle
app.post('/api/simulation/toggle', (req: Request, res: Response) => {
  const { active } = req.body;
  simulationActive = typeof active === 'boolean' ? active : !simulationActive;
  io.emit('simulation_status', { active: simulationActive });
  res.json({ success: true, simulationActive });
});

// POST /api/simulation/step - Advance stop manually
app.post('/api/simulation/step', (req: Request, res: Response) => {
  const result = advanceVehicleStop('bus-515A');
  if (result) {
    io.emit('load_update', {
      vehicle: result.vehicle,
      prediction: result.prediction,
      log: result.log,
      timestamp: new Date().toISOString()
    });
    io.emit('stop_update', {
      current_stop: result.vehicle.current_stop,
      current_stop_idx: result.vehicle.current_stop_idx
    });
  }
  res.json({ success: true, result });
});

// POST /api/vehicle/reset
app.post('/api/vehicle/reset', (req: Request, res: Response) => {
  const { load = 24, stop_idx = 0 } = req.body;
  if (!db) return res.status(500).json({ error: 'DB not ready' });

  const now = new Date().toISOString();
  const stopName = ROUTE_DATA.stops[stop_idx]?.name || 'Tambaram West Bus Stand';

  db.run(`
    UPDATE vehicles 
    SET current_load = ${load}, current_stop_idx = ${stop_idx}, current_stop = '${stopName}', speed_kmh = 40, updated_at = '${now}'
    WHERE id = 'bus-515A';
  `);

  const updatedVehicle = getVehicle('bus-515A');
  const prediction = computePrediction(updatedVehicle.current_load, updatedVehicle.current_stop_idx, updatedVehicle.max_capacity);

  io.emit('load_update', {
    vehicle: updatedVehicle,
    prediction,
    log: {
      id: 'reset-' + Date.now(),
      timestamp: now,
      action: 'reset',
      delta: 0,
      newLoad: load,
      source: 'admin',
      stopName,
      co2SavedLegKg: 0
    }
  });

  res.json({ success: true, vehicle: updatedVehicle, prediction });
});

// Setup Simulation Loops
function setupSimulationLoops() {
  // 1. Random passenger traffic check-ins every 5 seconds (Phase 4 Prompt 4)
  simulationInterval = setInterval(() => {
    if (!simulationActive || !db) return;

    const count = Math.floor(Math.random() * 3) + 1;
    const isBoarding = Math.random() > 0.46;
    const delta = isBoarding ? count : -count;

    const result = updateVehicleLoad('bus-515A', delta, 'simulator');
    if (result) {
      console.log(`[SIMULATE] Traffic check-in on bus-515A: ${isBoarding ? 'BOARDING' : 'ALIGHTING'} ${count} pax -> Load: ${result.vehicle.current_load}/${result.vehicle.max_capacity} at ${result.vehicle.current_stop}`);
      io.emit('load_update', {
        vehicle: result.vehicle,
        prediction: result.prediction,
        log: result.log,
        timestamp: new Date().toISOString()
      });
    }
  }, 5000);

  // 2. Vehicle moves to next stop every 30 seconds
  stopAdvanceInterval = setInterval(() => {
    if (!simulationActive || !db) return;

    const result = advanceVehicleStop('bus-515A');
    if (result) {
      console.log(`[SIMULATE-ROUTE 515A] Bus arrived at: ${result.vehicle.current_stop} (Stop #${result.vehicle.current_stop_idx + 1}) | Driver: Venkatesh Iyer | Load: ${result.vehicle.current_load}/50`);
      io.emit('load_update', {
        vehicle: result.vehicle,
        prediction: result.prediction,
        log: result.log,
        timestamp: new Date().toISOString()
      });
      io.emit('stop_update', {
        current_stop: result.vehicle.current_stop,
        current_stop_idx: result.vehicle.current_stop_idx
      });
    }
  }, 30000);
}

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`[SOCKET] Client connected: ${socket.id}`);

  if (db) {
    const vehicle = getVehicle('bus-515A');
    if (vehicle) {
      const prediction = computePrediction(vehicle.current_load, vehicle.current_stop_idx, vehicle.max_capacity);
      socket.emit('load_update', {
        vehicle,
        prediction,
        logs: getRecentLogs(10)
      });
    }
  }

  socket.on('checkin', (data) => {
    const { action, count = 1, stop_name } = data;
    const delta = action === 'boarding' ? Math.abs(count) : -Math.abs(count);
    const result = updateVehicleLoad('bus-515A', delta, 'user', stop_name);
    if (result) {
      io.emit('load_update', {
        vehicle: result.vehicle,
        prediction: result.prediction,
        log: result.log,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET] Client disconnected: ${socket.id}`);
  });
});

// Boot Server
async function start() {
  await initDatabase();
  setupSimulationLoops();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚌 CommuterPulse Server running on http://0.0.0.0:${PORT} [Route 515A: Tambaram West ⇄ Kovalam]`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
