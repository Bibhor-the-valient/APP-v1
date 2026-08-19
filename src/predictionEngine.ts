import { Stop, StopPrediction, PredictionState } from './types';

/**
 * ============================================================================
 * PHASE 2: LINEAR ALGEBRAIC PREDICTION ENGINE (Route 515A)
 * ============================================================================
 * 
 * Mathematical Formulation:
 * Let L_0 = [ L_current ] be the 1D state vector of the current passenger load.
 * Let B = [ b_1, b_2, b_3 ]^T be the historical boarding vector for subsequent stops.
 * Let A = [ a_1, a_2, a_3 ]^T be the historical alighting vector for subsequent stops.
 * 
 * Transition equation for future stop k (k ∈ {1, 2, 3}):
 *    L_k = min(C_max, max(0, L_{k-1} + b_k - a_k))
 * 
 * Route 515A Corridor:
 * 1. Tambaram West Bus Stand (To next: ~8.4 km | ~17 min)
 * 2. Vandalur Zoo (To next: ~10.1 km | ~15 min)
 * 3. VIT Chennai (To next: ~11.3 km | ~22 min)
 * 4. Kelambakkam Bus Terminal (To next: ~4.9 km | ~14 min)
 * 5. Kovalam Bus Stand (Terminal)
 */

export const HISTORICAL_BOARDING_PROFILES_515A: Record<number, number[]> = {
  0: [14, 8, 4],   // At Tambaram West: high boarding for Vandalur Zoo, VIT Chennai, Kelambakkam
  1: [12, 10, 3],  // At Vandalur Zoo: boarding for VIT & Kelambakkam
  2: [8, 12, 2],   // At VIT Chennai: students boarding towards Kelambakkam & Kovalam
  3: [5, 2, 0],    // At Kelambakkam: boarding for Kovalam Beach
  4: [1, 0, 0],    // At Kovalam: terminal turnaround
};

export const HISTORICAL_ALIGHTING_PROFILES_515A: Record<number, number[]> = {
  0: [4, 12, 15],  // At Tambaram West: alightings down the corridor
  1: [8, 14, 9],   // At Vandalur Zoo: zoo tourists and students
  2: [15, 8, 12],  // At VIT Chennai: heavy student alightings
  3: [14, 16, 5],  // At Kelambakkam: OMR IT tech commuters alighting
  4: [22, 0, 0],   // At Kovalam: full terminal alighting
};

export function calculateFutureLoadVector(
  L_current: number,
  maxCapacity: number = 50,
  currentStopIdx: number = 0,
  routeStops: Stop[] = [],
  horizon: number = 3
): PredictionState {
  const numStops = routeStops.length || 5;
  
  const baseB = HISTORICAL_BOARDING_PROFILES_515A[currentStopIdx] || [8, 6, 3];
  const baseA = HISTORICAL_ALIGHTING_PROFILES_515A[currentStopIdx] || [7, 10, 12];

  const B_vector: number[] = [];
  const A_vector: number[] = [];
  const L_future_vector: number[] = [];
  const stopsForecast: StopPrediction[] = [];

  let rollingLoad = L_current;

  for (let step = 1; step <= horizon; step++) {
    const targetIdx = (currentStopIdx + step) % numStops;
    const stopObj = routeStops[targetIdx] || {
      id: `stop-${targetIdx + 1}`,
      name: `Stop ${targetIdx + 1}`,
      eta: `+${step * 15}m`,
      distance: `${(step * 8.5).toFixed(1)} km`,
      zone: 'Transit Corridor',
      landmark: 'Corridor Stop'
    };

    const b_k = baseB[step - 1] ?? Math.floor(Math.random() * 8 + 2);
    const a_k = baseA[step - 1] ?? Math.floor(Math.random() * 10 + 3);

    B_vector.push(b_k);
    A_vector.push(a_k);

    const netFlow = b_k - a_k;
    rollingLoad = Math.max(0, Math.min(maxCapacity, rollingLoad + netFlow));
    L_future_vector.push(rollingLoad);

    const percentage = Math.round((rollingLoad / maxCapacity) * 100);
    const statusLevel: 'low' | 'moderate' | 'high' = 
      percentage < 50 ? 'low' : percentage <= 80 ? 'moderate' : 'high';

    const seatsAvailable = Math.max(0, Math.round(maxCapacity * 0.7) - rollingLoad);
    const standingAvailable = Math.max(0, maxCapacity - rollingLoad - seatsAvailable);

    stopsForecast.push({
      stopIndex: targetIdx,
      stopName: stopObj.name,
      eta: stopObj.eta || `+${step * 15} min`,
      predictedLoad: rollingLoad,
      predictedPercentage: percentage,
      expectedBoarding: b_k,
      expectedAlighting: a_k,
      statusLevel,
      seatsAvailable,
      standingAvailable
    });
  }

  const formulaString = `L_{t+k} = min(${maxCapacity}, max(0, L_t + \\sum_{i=1}^k (b_i - a_i)))`;

  return {
    currentLoad: L_current,
    maxCapacity,
    predictedVector: L_future_vector,
    stopsForecast,
    historicalBoardingMatrix: B_vector,
    historicalAlightingMatrix: A_vector,
    formulaString
  };
}
