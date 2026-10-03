/**
 * QUANTUM BUNNY - Quantum Physics Engine
 * Dedicated module for basis switching, state collapse, and measurement probabilities.
 *
 * Strict physical formula:
 * P(first outcome) = cos²(φ - β)
 * P(second outcome) = 1 - P(first outcome)
 */

export type QuantumBasis = 'HT' | 'RB';

export type QuantumStateName = 'HEADS' | 'RED' | 'TAILS' | 'BLUE';

export interface QuantumStateDef {
  name: QuantumStateName;
  angle: number; // degrees
  basis: QuantumBasis;
  isOpen: boolean;
  color: string;
  glowColor: string;
  symbol: string;
  description: string;
}

export const QUANTUM_STATES: Record<QuantumStateName, QuantumStateDef> = {
  HEADS: {
    name: 'HEADS',
    angle: 0,
    basis: 'HT',
    isOpen: false,
    color: '#eab308', // Yellow gold
    glowColor: 'rgba(234, 179, 8, 0.4)',
    symbol: 'H',
    description: '0° | Closed Barrier (H/T Basis)',
  },
  RED: {
    name: 'RED',
    angle: 45,
    basis: 'RB',
    isOpen: false,
    color: '#ef4444', // Red
    glowColor: 'rgba(239, 68, 68, 0.4)',
    symbol: 'R',
    description: '45° | Closed Barrier (R/B Basis)',
  },
  TAILS: {
    name: 'TAILS',
    angle: 90,
    basis: 'HT',
    isOpen: true,
    color: '#10b981', // Emerald green
    glowColor: 'rgba(16, 185, 129, 0.4)',
    symbol: 'T',
    description: '90° | Open Passage (H/T Basis)',
  },
  BLUE: {
    name: 'BLUE',
    angle: 135,
    basis: 'RB',
    isOpen: true,
    color: '#06b6d4', // Cyan blue
    glowColor: 'rgba(6, 182, 212, 0.4)',
    symbol: 'B',
    description: '135° | Open Passage (R/B Basis)',
  },
};

export interface ScannerDef {
  type: QuantumBasis;
  name: string;
  basisAngle: number; // degrees
  firstOutcome: QuantumStateName;
  secondOutcome: QuantumStateName;
  primaryColor: string;
  accentColor: string;
  badgeBg: string;
  keyLabel: string;
}

export const SCANNERS: Record<QuantumBasis, ScannerDef> = {
  HT: {
    type: 'HT',
    name: 'H/T Scanner',
    basisAngle: 0,
    firstOutcome: 'HEADS',
    secondOutcome: 'TAILS',
    primaryColor: '#facc15', // Bright yellow
    accentColor: '#ca8a04',
    badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    keyLabel: 'E',
  },
  RB: {
    type: 'RB',
    name: 'R/B Scanner',
    basisAngle: 45,
    firstOutcome: 'RED',
    secondOutcome: 'BLUE',
    primaryColor: '#f43f5e', // Bright crimson/red
    accentColor: '#e11d48',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    keyLabel: 'Q',
  },
};

/** Convert degrees to radians */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Normalize angle to [0, 180) */
export function normalizeAngle(deg: number): number {
  let normalized = deg % 180;
  if (normalized < 0) normalized += 180;
  return normalized;
}

/** Get state definition by angle */
export function getStateFromAngle(angleDeg: number): QuantumStateDef {
  const norm = normalizeAngle(angleDeg);
  // Match closest known state
  if (Math.abs(norm - 0) < 1 || Math.abs(norm - 180) < 1) return QUANTUM_STATES.HEADS;
  if (Math.abs(norm - 45) < 1) return QUANTUM_STATES.RED;
  if (Math.abs(norm - 90) < 1) return QUANTUM_STATES.TAILS;
  if (Math.abs(norm - 135) < 1) return QUANTUM_STATES.BLUE;
  
  // Default fallback closest
  const diffs = [
    { state: QUANTUM_STATES.HEADS, diff: Math.min(Math.abs(norm - 0), Math.abs(norm - 180)) },
    { state: QUANTUM_STATES.RED, diff: Math.abs(norm - 45) },
    { state: QUANTUM_STATES.TAILS, diff: Math.abs(norm - 90) },
    { state: QUANTUM_STATES.BLUE, diff: Math.abs(norm - 135) },
  ];
  diffs.sort((a, b) => a.diff - b.diff);
  return diffs[0].state;
}

/**
 * Gate passability rule:
 * Defaults to:
 * HEADS = CLOSED
 * RED = CLOSED
 * TAILS = OPEN
 * BLUE = OPEN
 * Or checks against level-specific allowedStates if provided.
 */
export function isGateOpen(
  stateAngle: number,
  allowedStates?: QuantumStateName[],
  isInitialLocked?: boolean
): boolean {
  if (isInitialLocked) return false;
  const state = getStateFromAngle(stateAngle);
  if (allowedStates && allowedStates.length > 0) {
    return allowedStates.includes(state.name);
  }
  return state.isOpen;
}

export interface ProbabilityResult {
  firstOutcome: QuantumStateName;
  secondOutcome: QuantumStateName;
  pFirst: number;
  pSecond: number;
  basisAngle: number;
  gateAngle: number;
}

/**
 * Calculates exact quantum probabilities for a gate measured with a scanner:
 * P(first outcome) = cos²(φ - β)
 * P(second outcome) = 1 - P(first outcome)
 */
export function calculateProbabilities(
  gateAngleDeg: number,
  scannerType: QuantumBasis
): ProbabilityResult {
  const scanner = SCANNERS[scannerType];
  const betaDeg = scanner.basisAngle;
  const phiDeg = gateAngleDeg;

  const deltaRad = degToRad(phiDeg - betaDeg);
  const cosVal = Math.cos(deltaRad);
  const pFirst = Math.min(1, Math.max(0, cosVal * cosVal));
  // Round tiny floating inaccuracies like 0.4999999999999999 to 0.5 or 0.9999999 to 1.0 for display
  const pFirstRounded = Math.round(pFirst * 10000) / 10000;
  const pSecondRounded = Math.round((1 - pFirstRounded) * 10000) / 10000;

  return {
    firstOutcome: scanner.firstOutcome,
    secondOutcome: scanner.secondOutcome,
    pFirst: pFirstRounded,
    pSecond: pSecondRounded,
    basisAngle: betaDeg,
    gateAngle: phiDeg,
  };
}

export interface MeasurementResult {
  scannerType: QuantumBasis;
  previousAngle: number;
  previousState: QuantumStateDef;
  outcomeAngle: number;
  outcomeState: QuantumStateDef;
  pFirst: number;
  pSecond: number;
  rolledValue: number;
  isOpen: boolean;
  educationalInsight: string;
}

/**
 * Perform a real quantum measurement using Math.random().
 * Never hardcoded. Updates state to beta (first) or beta + 90 (second).
 */
export function performMeasurement(
  gateAngleDeg: number,
  scannerType: QuantumBasis
): MeasurementResult {
  const scanner = SCANNERS[scannerType];
  const probs = calculateProbabilities(gateAngleDeg, scannerType);
  const roll = Math.random();

  let outcomeAngle: number;
  let outcomeStateName: QuantumStateName;

  if (roll < probs.pFirst) {
    outcomeAngle = scanner.basisAngle; // First outcome
    outcomeStateName = scanner.firstOutcome;
  } else {
    outcomeAngle = normalizeAngle(scanner.basisAngle + 90); // Second outcome
    outcomeStateName = scanner.secondOutcome;
  }

  const prevState = getStateFromAngle(gateAngleDeg);
  const outcomeState = QUANTUM_STATES[outcomeStateName];
  const open = isGateOpen(outcomeAngle);

  // Generate educational insight based on physics
  let educationalInsight = '';
  if (prevState.basis === scannerType) {
    if (probs.pFirst === 1 || probs.pSecond === 1) {
      educationalInsight = 'Same basis measurement! Deterministic outcome (100% certainty). State unchanged.';
    } else {
      educationalInsight = 'Measured in native basis. The state resolved predictably.';
    }
  } else {
    educationalInsight = 'Basis switch! Measurement scrambled the state into a 50/50 quantum superposition, breaking the previous lock.';
  }

  return {
    scannerType,
    previousAngle: gateAngleDeg,
    previousState: prevState,
    outcomeAngle,
    outcomeState,
    pFirst: probs.pFirst,
    pSecond: probs.pSecond,
    rolledValue: roll,
    isOpen: open,
    educationalInsight,
  };
}

/**
 * Automated Verification Test Suite
 * Validates quantum probabilities mandated in the prompt:
 * P(HEADS | HEADS) = 1
 * P(TAILS | HEADS) = 0
 * P(RED | HEADS) = 0.5
 * P(BLUE | HEADS) = 0.5
 * P(HEADS | RED) = 0.5
 * P(TAILS | RED) = 0.5
 * P(TAILS | TAILS) = 1
 */
export interface QuantumTestCase {
  name: string;
  initialState: QuantumStateName;
  scanner: QuantumBasis;
  targetOutcome: QuantumStateName;
  expectedProbability: number;
  actualProbability: number;
  passed: boolean;
}

export function runAutomatedQuantumTests(): {
  allPassed: boolean;
  testCases: QuantumTestCase[];
} {
  const cases: {
    name: string;
    init: QuantumStateName;
    scanner: QuantumBasis;
    target: QuantumStateName;
    expected: number;
  }[] = [
    {
      name: 'P(HEADS | HEADS) = 1.0',
      init: 'HEADS',
      scanner: 'HT',
      target: 'HEADS',
      expected: 1.0,
    },
    {
      name: 'P(TAILS | HEADS) = 0.0',
      init: 'HEADS',
      scanner: 'HT',
      target: 'TAILS',
      expected: 0.0,
    },
    {
      name: 'P(RED | HEADS) = 0.5',
      init: 'HEADS',
      scanner: 'RB',
      target: 'RED',
      expected: 0.5,
    },
    {
      name: 'P(BLUE | HEADS) = 0.5',
      init: 'HEADS',
      scanner: 'RB',
      target: 'BLUE',
      expected: 0.5,
    },
    {
      name: 'P(HEADS | RED) = 0.5',
      init: 'RED',
      scanner: 'HT',
      target: 'HEADS',
      expected: 0.5,
    },
    {
      name: 'P(TAILS | RED) = 0.5',
      init: 'RED',
      scanner: 'HT',
      target: 'TAILS',
      expected: 0.5,
    },
    {
      name: 'P(TAILS | TAILS) = 1.0',
      init: 'TAILS',
      scanner: 'HT',
      target: 'TAILS',
      expected: 1.0,
    },
  ];

  const results: QuantumTestCase[] = cases.map((tc) => {
    const angle = QUANTUM_STATES[tc.init].angle;
    const probs = calculateProbabilities(angle, tc.scanner);
    const actual = tc.target === probs.firstOutcome ? probs.pFirst : probs.pSecond;
    const passed = Math.abs(actual - tc.expected) < 0.001;
    return {
      name: tc.name,
      initialState: tc.init,
      scanner: tc.scanner,
      targetOutcome: tc.target,
      expectedProbability: tc.expected,
      actualProbability: actual,
      passed,
    };
  });

  return {
    allPassed: results.every((r) => r.passed),
    testCases: results,
  };
}

/**
 * Monte Carlo Simulation:
 * Sequential measurement simulation:
 * HEADS (0°) -> measure R/B (scramble) -> measure H/T
 * Verifies that the final H/T result is empirically ~50% HEADS and ~50% TAILS!
 */
export interface SimulationResult {
  trials: number;
  headsCount: number;
  tailsCount: number;
  headsFraction: number;
  tailsFraction: number;
  intermediateRedCount: number;
  intermediateBlueCount: number;
  verified: boolean;
}

export function runSequentialSimulation(trials = 2000): SimulationResult {
  let headsCount = 0;
  let tailsCount = 0;
  let intermediateRedCount = 0;
  let intermediateBlueCount = 0;

  for (let i = 0; i < trials; i++) {
    // 1. Start at HEADS (0°)
    const startAngle = QUANTUM_STATES.HEADS.angle;

    // 2. Measure with R/B scanner (β = 45°)
    const m1 = performMeasurement(startAngle, 'RB');
    if (m1.outcomeState.name === 'RED') intermediateRedCount++;
    else intermediateBlueCount++;

    // 3. Measure resulting state with H/T scanner (β = 0°)
    const m2 = performMeasurement(m1.outcomeAngle, 'HT');
    if (m2.outcomeState.name === 'HEADS') headsCount++;
    else tailsCount++;
  }

  const headsFraction = headsCount / trials;
  const tailsFraction = tailsCount / trials;
  // In a 2000-trial simulation, standard deviation is ~0.011, so 0.5 ± 0.05 is > 99.9% confidence
  const verified = Math.abs(headsFraction - 0.5) < 0.05;

  return {
    trials,
    headsCount,
    tailsCount,
    headsFraction,
    tailsFraction,
    intermediateRedCount,
    intermediateBlueCount,
    verified,
  };
}
