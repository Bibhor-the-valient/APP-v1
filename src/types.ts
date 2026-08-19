export interface Stop {
  id: string;
  name: string;
  eta: string;
  distance: string;
  distanceToNext?: number; // km
  minutesToNext?: number; // minutes
  toNextStopDistance?: string;
  toNextStopTime?: string;
  zone: string;
  landmark: string;
}

export interface Route {
  id: string;
  name: string;
  code: string;
  stops: Stop[];
}

export interface Vehicle {
  id: string;
  route_id: string;
  max_capacity: number;
  current_load: number;
  current_stop: string;
  current_stop_idx: number;
  speed_kmh: number;
  driver_name: string;
  license_plate: string;
  updated_at: string;
}

export interface StopPrediction {
  stopIndex: number;
  stopName: string;
  eta: string;
  predictedLoad: number;
  predictedPercentage: number;
  expectedBoarding: number;
  expectedAlighting: number;
  statusLevel: 'low' | 'moderate' | 'high';
  seatsAvailable: number;
  standingAvailable: number;
}

export interface PredictionState {
  currentLoad: number;
  maxCapacity: number;
  predictedVector: number[];
  stopsForecast: StopPrediction[];
  historicalBoardingMatrix: number[];
  historicalAlightingMatrix: number[];
  formulaString: string;
}

export interface CheckinLog {
  id: string;
  timestamp: string;
  action: 'boarding' | 'alighting' | 'stop_arrival';
  delta: number;
  newLoad: number;
  source: 'user' | 'simulator' | 'sensor' | 'admin';
  stopName: string;
  co2SavedLegKg?: number;
}

export interface EcoStats {
  co2SavedKg: number;
  totalTrips: number;
  distanceTraveledKm: number;
  treesEquivMonths: number;
  fuelSavedLiters: number;
}
