// TCP Congestion Control Simulation Engine

export type TCPVariant = 'tahoe' | 'reno' | 'cubic' | 'adaptive';

export type NetworkScenario = 'mobile' | 'wifi' | 'datacenter';

export interface SimulationConfig {
  scenario: NetworkScenario;
  duration: number; // in time units
  initialCwnd: number;
  ssthresh: number;
}

export interface DataPoint {
  time: number;
  cwnd: number;
  event?: 'loss' | 'timeout' | 'ack';
}

export interface SimulationResult {
  variant: TCPVariant;
  data: DataPoint[];
  throughput: number;
  fairness: number;
  stability: number;
}

// Scenario-specific packet loss probabilities
const SCENARIO_CONFIG: Record<NetworkScenario, { lossRate: number; name: string; description: string }> = {
  mobile: {
    lossRate: 0.08,
    name: 'Mobile Network',
    description: 'High loss rate (8%), variable RTT, frequent handoffs'
  },
  wifi: {
    lossRate: 0.03,
    name: 'Home Wi-Fi',
    description: 'Moderate loss rate (3%), interference, shared medium'
  },
  datacenter: {
    lossRate: 0.005,
    name: 'Data Center',
    description: 'Low loss rate (0.5%), low latency, high bandwidth'
  }
};

export function getScenarioConfig(scenario: NetworkScenario) {
  return SCENARIO_CONFIG[scenario];
}

// Simulate TCP Tahoe
function simulateTahoe(config: SimulationConfig): DataPoint[] {
  const { duration, initialCwnd, ssthresh } = config;
  const lossRate = SCENARIO_CONFIG[config.scenario].lossRate;
  const data: DataPoint[] = [];
  
  let cwnd = initialCwnd;
  let currentSsthresh = ssthresh;
  let inSlowStart = true;

  for (let t = 0; t <= duration; t++) {
    // Check for packet loss
    if (Math.random() < lossRate) {
      currentSsthresh = Math.max(cwnd / 2, 2);
      cwnd = initialCwnd; // Reset to initial
      inSlowStart = true;
      data.push({ time: t, cwnd, event: 'loss' });
      continue;
    }

    data.push({ time: t, cwnd, event: 'ack' });

    if (inSlowStart) {
      cwnd *= 2; // Exponential growth
      if (cwnd >= currentSsthresh) {
        cwnd = currentSsthresh;
        inSlowStart = false;
      }
    } else {
      cwnd += 1; // Linear growth (congestion avoidance)
    }

    cwnd = Math.min(cwnd, 128); // Max window
  }

  return data;
}

// Simulate TCP Reno
function simulateReno(config: SimulationConfig): DataPoint[] {
  const { duration, initialCwnd, ssthresh } = config;
  const lossRate = SCENARIO_CONFIG[config.scenario].lossRate;
  const data: DataPoint[] = [];
  
  let cwnd = initialCwnd;
  let currentSsthresh = ssthresh;
  let inSlowStart = true;
  let dupAckCount = 0;

  for (let t = 0; t <= duration; t++) {
    // Check for packet loss
    if (Math.random() < lossRate) {
      // Simulate fast retransmit with 50% probability
      if (Math.random() < 0.5 && cwnd > 4) {
        // Fast retransmit - halve the window
        currentSsthresh = Math.max(cwnd / 2, 2);
        cwnd = currentSsthresh + 3; // Fast recovery
        inSlowStart = false;
        data.push({ time: t, cwnd, event: 'loss' });
      } else {
        // Timeout - go back to slow start
        currentSsthresh = Math.max(cwnd / 2, 2);
        cwnd = initialCwnd;
        inSlowStart = true;
        data.push({ time: t, cwnd, event: 'timeout' });
      }
      continue;
    }

    data.push({ time: t, cwnd, event: 'ack' });

    if (inSlowStart) {
      cwnd *= 2;
      if (cwnd >= currentSsthresh) {
        cwnd = currentSsthresh;
        inSlowStart = false;
      }
    } else {
      cwnd += 1;
    }

    cwnd = Math.min(cwnd, 128);
  }

  return data;
}

// Simulate TCP CUBIC
function simulateCubic(config: SimulationConfig): DataPoint[] {
  const { duration, initialCwnd, ssthresh } = config;
  const lossRate = SCENARIO_CONFIG[config.scenario].lossRate;
  const data: DataPoint[] = [];
  
  let cwnd = initialCwnd;
  let wMax = ssthresh;
  let k = 0;
  let tSinceLastLoss = 0;
  const C = 0.4;
  const beta = 0.7;
  let inSlowStart = true;

  for (let t = 0; t <= duration; t++) {
    if (Math.random() < lossRate) {
      wMax = cwnd;
      cwnd = Math.max(cwnd * beta, 2);
      k = Math.cbrt(wMax * (1 - beta) / C);
      tSinceLastLoss = 0;
      inSlowStart = false;
      data.push({ time: t, cwnd, event: 'loss' });
      continue;
    }

    data.push({ time: t, cwnd, event: 'ack' });

    if (inSlowStart && cwnd < ssthresh) {
      cwnd *= 2;
      if (cwnd >= ssthresh) {
        inSlowStart = false;
      }
    } else {
      // CUBIC function
      tSinceLastLoss++;
      const target = C * Math.pow(tSinceLastLoss - k, 3) + wMax;
      cwnd = Math.max(cwnd + (target - cwnd) * 0.1, cwnd + 0.5);
    }

    cwnd = Math.min(cwnd, 128);
  }

  return data;
}

// Simulate Adaptive TCP
function simulateAdaptive(config: SimulationConfig): DataPoint[] {
  const { duration, initialCwnd, ssthresh } = config;
  const lossRate = SCENARIO_CONFIG[config.scenario].lossRate;
  const data: DataPoint[] = [];
  
  let cwnd = initialCwnd;
  let currentSsthresh = ssthresh;
  let inSlowStart = true;
  let recentLosses = 0;
  let aggressiveness = 1.0;

  for (let t = 0; t <= duration; t++) {
    // Adapt aggressiveness based on loss history
    if (t % 10 === 0) {
      if (recentLosses > 2) {
        aggressiveness = Math.max(0.3, aggressiveness - 0.2);
      } else if (recentLosses === 0) {
        aggressiveness = Math.min(1.5, aggressiveness + 0.1);
      }
      recentLosses = 0;
    }

    if (Math.random() < lossRate) {
      recentLosses++;
      // Adaptive response based on network conditions
      const reductionFactor = 0.5 + (0.3 * (1 - aggressiveness));
      currentSsthresh = Math.max(cwnd * reductionFactor, 2);
      cwnd = currentSsthresh;
      inSlowStart = false;
      data.push({ time: t, cwnd, event: 'loss' });
      continue;
    }

    data.push({ time: t, cwnd, event: 'ack' });

    if (inSlowStart) {
      cwnd *= (1.5 + 0.5 * aggressiveness);
      if (cwnd >= currentSsthresh) {
        cwnd = currentSsthresh;
        inSlowStart = false;
      }
    } else {
      cwnd += aggressiveness;
    }

    cwnd = Math.min(cwnd, 128);
  }

  return data;
}

// Calculate metrics
function calculateMetrics(data: DataPoint[]): { throughput: number; stability: number } {
  const cwndValues = data.map(d => d.cwnd);
  
  // Throughput: average cwnd (simplified)
  const throughput = cwndValues.reduce((a, b) => a + b, 0) / cwndValues.length;
  
  // Stability: inverse of variance (smoother = more stable)
  const mean = throughput;
  const variance = cwndValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / cwndValues.length;
  const stability = Math.max(0, 100 - Math.sqrt(variance) * 2);
  
  return { throughput, stability };
}

// Main simulation function
export function runSimulation(
  scenario: NetworkScenario,
  duration: number = 100
): SimulationResult[] {
  const config: SimulationConfig = {
    scenario,
    duration,
    initialCwnd: 2,
    ssthresh: 32
  };

  const simulators: Record<TCPVariant, (config: SimulationConfig) => DataPoint[]> = {
    tahoe: simulateTahoe,
    reno: simulateReno,
    cubic: simulateCubic,
    adaptive: simulateAdaptive
  };

  const results: SimulationResult[] = [];
  const allThroughputs: number[] = [];

  for (const variant of Object.keys(simulators) as TCPVariant[]) {
    const data = simulators[variant](config);
    const { throughput, stability } = calculateMetrics(data);
    allThroughputs.push(throughput);
    
    results.push({
      variant,
      data,
      throughput,
      fairness: 0, // Will calculate after all runs
      stability
    });
  }

  // Calculate Jain's Fairness Index
  const sumThroughput = allThroughputs.reduce((a, b) => a + b, 0);
  const sumSquaredThroughput = allThroughputs.reduce((a, b) => a + b * b, 0);
  const fairnessIndex = Math.pow(sumThroughput, 2) / (allThroughputs.length * sumSquaredThroughput);

  // Assign fairness to all results
  results.forEach(r => {
    r.fairness = fairnessIndex * 100;
  });

  return results;
}

// Determine winner based on weighted metrics
export function determineWinner(
  results: SimulationResult[],
  weights: { throughput: number; fairness: number; stability: number } = { throughput: 0.5, fairness: 0.25, stability: 0.25 }
): { winner: TCPVariant; scores: Record<TCPVariant, number>; explanation: string } {
  const scores: Record<TCPVariant, number> = {} as Record<TCPVariant, number>;
  
  // Normalize metrics
  const maxThroughput = Math.max(...results.map(r => r.throughput));
  const maxStability = Math.max(...results.map(r => r.stability));
  
  results.forEach(r => {
    const normalizedThroughput = r.throughput / maxThroughput;
    const normalizedFairness = r.fairness / 100;
    const normalizedStability = r.stability / maxStability;
    
    scores[r.variant] = 
      weights.throughput * normalizedThroughput +
      weights.fairness * normalizedFairness +
      weights.stability * normalizedStability;
  });

  const winner = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0] as TCPVariant;
  
  const explanations: Record<TCPVariant, string> = {
    tahoe: "TCP Tahoe's conservative approach provides reliable recovery but sacrifices throughput due to full window resets on loss.",
    reno: "TCP Reno's fast retransmit/recovery maintains better throughput than Tahoe while handling moderate loss scenarios effectively.",
    cubic: "TCP CUBIC's aggressive growth function excels in high-bandwidth networks, quickly reclaiming capacity after losses.",
    adaptive: "Adaptive TCP dynamically adjusts its behavior based on network conditions, optimizing for the current environment."
  };

  return { winner, scores, explanation: explanations[winner] };
}

export const TCP_VARIANTS: { id: TCPVariant; name: string; color: string; description: string }[] = [
  { 
    id: 'tahoe', 
    name: 'TCP Tahoe', 
    color: 'hsl(187, 85%, 53%)',
    description: 'Original congestion control with slow start and congestion avoidance. Resets cwnd to 1 on any loss.'
  },
  { 
    id: 'reno', 
    name: 'TCP Reno', 
    color: 'hsl(38, 95%, 55%)',
    description: 'Adds fast retransmit and fast recovery to Tahoe. Halves cwnd on triple duplicate ACKs.'
  },
  { 
    id: 'cubic', 
    name: 'TCP CUBIC', 
    color: 'hsl(326, 85%, 60%)',
    description: 'Uses cubic function for window growth. Dominant algorithm in Linux. Aggressive in high-BDP networks.'
  },
  { 
    id: 'adaptive', 
    name: 'Adaptive TCP', 
    color: 'hsl(142, 70%, 50%)',
    description: 'Novel mechanism that adjusts aggressiveness based on observed network conditions and loss patterns.'
  }
];
