/**
 * ============================================================================
 * PHASE 4: THE SIMULATION SCRIPT (Route 515A)
 * ============================================================================
 * Standalone Node.js simulation script (`simulate.js`).
 * Runs on a `setInterval` every 5 seconds, making random POST requests to
 * `http://localhost:3000/api/checkin` simulating 1 to 3 users either "boarding" or "alighting"
 * on bus-515A (Driver: Venkatesh Iyer).
 * 
 * Run with: `node simulate.js`
 */

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const VEHICLE_ID = 'bus-515A';
const INTERVAL_MS = 5000;

console.log('='.repeat(70));
console.log('🚀 COMMUTERPULSE ROUTE 515A SIMULATOR ACTIVE');
console.log(`📡 Target Server : ${SERVER_URL}/api/checkin`);
console.log(`🚌 Target Bus    : ${VEHICLE_ID} (Tambaram West ⇄ Kovalam)`);
console.log(`👨‍✈️ Bus Driver    : Venkatesh Iyer (TN-09-N-5151)`);
console.log(`⏱️ Interval      : Every ${INTERVAL_MS / 1000}s`);
console.log('='.repeat(70));

let tickCount = 0;

async function sendCheckin(action, count) {
  const payload = {
    vehicle_id: VEHICLE_ID,
    action: action,
    count: count,
    source: 'standalone_simulator'
  };

  try {
    const res = await fetch(`${SERVER_URL}/api/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error(`❌ [HTTP ${res.status}] Error posting check-in: ${res.statusText}`);
      return;
    }

    const data = await res.json();
    const { vehicle, prediction } = data;
    const pct = Math.round((vehicle.current_load / vehicle.max_capacity) * 100);
    const colorTag = pct < 50 ? '🟢 LOW' : pct <= 80 ? '🟡 MODERATE' : '🔴 HIGH';

    console.log(
      `[TICK #${tickCount.toString().padStart(3, '0')}] ` +
      `Simulated: ${action.toUpperCase()} (+${count}) on ${VEHICLE_ID} | ` +
      `Load: ${vehicle.current_load}/${vehicle.max_capacity} (${pct}%) [${colorTag}] | ` +
      `Stop: "${vehicle.current_stop}" | ` +
      `Forecast: [${prediction.predictedVector.join(', ')}]`
    );
  } catch (err) {
    console.error(`⚠️ Network error reaching server at ${SERVER_URL}:`, err.message);
  }
}

function runSimulationTick() {
  tickCount++;
  const count = Math.floor(Math.random() * 3) + 1;
  const action = Math.random() > 0.46 ? 'boarding' : 'alighting';
  sendCheckin(action, count);
}

runSimulationTick();
const timer = setInterval(runSimulationTick, INTERVAL_MS);

process.on('SIGINT', () => {
  clearInterval(timer);
  console.log('\n🛑 Simulation stopped.');
  process.exit(0);
});
