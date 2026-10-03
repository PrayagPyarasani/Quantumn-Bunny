/**
 * QUANTUM BUNNY - Complete 5-Level Architecture
 * Data-driven, handcrafted levels with progressive quantum challenges,
 * multiple gates, customizable passability rules, and Quantum Flux hazards.
 */

import { QuantumBasis, QuantumStateName } from './quantumPhysics';

export const TILE_SIZE = 32;

export enum TileType {
  EMPTY = 0,
  SOLID = 1,
  PLATFORM = 2,
  HAZARD = 3,
  DECOR_PILLAR = 4,
}

export interface ScannerPickupData {
  id: string;
  x: number; // pixel center x
  y: number; // pixel center y
  type: QuantumBasis;
  collected?: boolean;
  respawnSeconds?: number;
  respawnTimer?: number;
}

export interface QuantumGateData {
  id: string;
  x: number;      // pixel x
  y: number;      // pixel y
  width: number;  // pixel width
  height: number; // pixel height
  stateAngle: number; // current angle in degrees
  initialState: QuantumStateName;
  allowedStates?: QuantumStateName[]; // Level-specific passability, e.g. ['TAILS', 'BLUE'], ['BLUE'], etc.
  label?: string; // e.g. 'GATE A' or 'FLUX GATE'
  isFluxAffected?: boolean;
  isFluxDisabled?: boolean;
  initialLocked?: boolean; // Gate requires a measurement to unlock
  isMeasured?: boolean;    // Has the gate been measured this session
}

export interface CarrotGoalData {
  x: number; // pixel center x
  y: number; // pixel center y
  width: number;
  height: number;
}

export interface QuantumFluxHazard {
  id: string;
  name: string;
  targetGateIds: string[];
  periodSeconds: number; // e.g. 11s cycle
  warningSeconds: number; // e.g. 2.5s warning before pulse
  durationSeconds: number; // e.g. 3.5s unstable/closed duration
  zoneX?: number;
  zoneY?: number;
  zoneWidth?: number;
  zoneHeight?: number;
}

export interface LevelDefinition {
  id: string;
  levelNumber: number;
  name: string;
  subtitle: string;
  cols: number;
  rows: number;
  timeLimit: number; // seconds
  playerStart: { x: number; y: number };
  initialInventory?: Record<QuantumBasis, number>;
  scanners: ScannerPickupData[];
  gate?: QuantumGateData; // Level 1 backwards-compatibility
  gates: QuantumGateData[]; // Array of gates in level
  goal: CarrotGoalData;
  tiles: number[][]; // [row][col]
  clues: { x: number; y: number; text: string }[];
  fluxHazard?: QuantumFluxHazard;
  completionDebrief?: {
    title: string;
    lines: string[];
  };
}

// =========================================================================
// LEVEL 1: FIRST HOP (UNTOUCHED AND UNCHANGED)
// =========================================================================
const L1_COLS = 54;
const L1_ROWS = 20;

function createLevel1Tiles(): number[][] {
  const grid: number[][] = Array.from({ length: L1_ROWS }, () =>
    Array(L1_COLS).fill(TileType.EMPTY)
  );

  for (let r = 0; r < L1_ROWS; r++) {
    grid[r][0] = TileType.SOLID;
    grid[r][L1_COLS - 1] = TileType.SOLID;
  }
  for (let c = 0; c < L1_COLS; c++) {
    grid[0][c] = TileType.SOLID;
    grid[L1_ROWS - 1][c] = TileType.SOLID;
  }

  for (let c = 1; c <= 15; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  grid[15][5] = TileType.SOLID;
  grid[15][6] = TileType.SOLID;
  grid[15][7] = TileType.SOLID;

  grid[13][9] = TileType.SOLID;
  grid[13][10] = TileType.SOLID;
  grid[13][11] = TileType.SOLID;
  grid[13][12] = TileType.SOLID;

  grid[14][14] = TileType.SOLID;
  grid[14][15] = TileType.SOLID;

  for (let c = 16; c <= 35; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  for (let c = 20; c <= 25; c++) {
    grid[13][c] = TileType.SOLID;
  }

  grid[15][17] = TileType.SOLID;
  grid[15][18] = TileType.SOLID;

  grid[13][20] = TileType.SOLID;
  grid[13][21] = TileType.SOLID;
  grid[13][22] = TileType.SOLID;

  grid[11][24] = TileType.SOLID;
  grid[11][25] = TileType.SOLID;
  grid[11][26] = TileType.SOLID;

  grid[9][27] = TileType.SOLID;
  grid[9][28] = TileType.SOLID;

  for (let c = 29; c <= 33; c++) {
    grid[7][c] = TileType.SOLID;
  }

  grid[9][35] = TileType.SOLID;
  grid[9][36] = TileType.SOLID;

  grid[11][37] = TileType.SOLID;
  grid[11][38] = TileType.SOLID;

  grid[13][39] = TileType.SOLID;
  grid[13][40] = TileType.SOLID;

  grid[15][40] = TileType.SOLID;
  grid[15][41] = TileType.SOLID;

  for (let c = 36; c <= 41; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  for (let r = 1; r <= 12; r++) {
    grid[r][42] = TileType.SOLID;
  }
  grid[17][42] = TileType.SOLID;
  grid[18][42] = TileType.SOLID;

  for (let c = 43; c < L1_COLS - 1; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  grid[16][46] = TileType.SOLID;
  grid[16][47] = TileType.SOLID;

  grid[15][48] = TileType.SOLID;
  grid[15][49] = TileType.SOLID;
  grid[15][50] = TileType.SOLID;

  return grid;
}

const level1Gate: QuantumGateData = {
  id: 'gate-1',
  x: 42 * TILE_SIZE,
  y: 13 * TILE_SIZE,
  width: TILE_SIZE,
  height: 4 * TILE_SIZE,
  stateAngle: 90, // Starts in TAILS (90°)
  initialState: 'TAILS',
  allowedStates: ['TAILS'],
  label: 'GATE 1 [TAILS 90°]',
  initialLocked: true,
  isMeasured: false,
};

export const LEVEL_1: LevelDefinition = {
  id: 'level-1',
  levelNumber: 1,
  name: 'LEVEL 1',
  subtitle: 'The First Hop',
  cols: L1_COLS,
  rows: L1_ROWS,
  timeLimit: 90,
  playerStart: {
    x: 3 * TILE_SIZE,
    y: 15 * TILE_SIZE,
  },
  scanners: [
    // 1 x H/T scanner placed clearly before the gate (sits cleanly floating above row 13 platform)
    { id: 'sc-1-1', x: 10.5 * TILE_SIZE, y: 12.25 * TILE_SIZE, type: 'HT' },
    // Backup H/T scanner on the lower path (sits cleanly floating above row 17 floor)
    { id: 'sc-1-2', x: 22.5 * TILE_SIZE, y: 16.25 * TILE_SIZE, type: 'HT' },
  ],
  gate: level1Gate,
  gates: [level1Gate],
  goal: {
    x: 49 * TILE_SIZE,
    y: 14.25 * TILE_SIZE,
    width: 32,
    height: 32,
  },
  tiles: createLevel1Tiles(),
  clues: [
    { x: 3 * TILE_SIZE, y: 14.5 * TILE_SIZE, text: 'Move: [A]/[D] · Jump: [SPACE]' },
    { x: 9 * TILE_SIZE, y: 11.5 * TILE_SIZE, text: 'YELLOW H/T SCANNER (0° Basis) — Collect it!' },
    { x: 22 * TILE_SIZE, y: 15.5 * TILE_SIZE, text: 'Backup H/T Scanner' },
    { x: 37 * TILE_SIZE, y: 15.5 * TILE_SIZE, text: 'QUANTUM GATE (TAILS 90° LOCKED). Press [E] to measure with H/T!' },
    { x: 44 * TILE_SIZE, y: 15.5 * TILE_SIZE, text: 'TAILS measured in H/T basis is 100% TAILS (deterministic collapse)!' },
  ],
  completionDebrief: {
    title: 'THE BASIC MEASUREMENT',
    lines: [
      'TAILS measured in the H/T basis produces TAILS with 100% probability.',
      'Same basis measurement never alters a definite eigenstate!',
    ],
  },
};

// =========================================================================
// LEVEL 2: SPLIT PATH (75s)
// Two distinct routes: Upper Ridge (H/T to Gate A) vs Lower Conduit (R/B to Gate B)
// =========================================================================
const L2_COLS = 72;
const L2_ROWS = 20;

function createLevel2Tiles(): number[][] {
  const grid: number[][] = Array.from({ length: L2_ROWS }, () =>
    Array(L2_COLS).fill(TileType.EMPTY)
  );

  for (let r = 0; r < L2_ROWS; r++) {
    grid[r][0] = TileType.SOLID;
    grid[r][L2_COLS - 1] = TileType.SOLID;
  }
  for (let c = 0; c < L2_COLS; c++) {
    grid[0][c] = TileType.SOLID;
    grid[L2_ROWS - 1][c] = TileType.SOLID;
  }

  // Section 1: Starting ground (cols 1 to 14)
  for (let c = 1; c <= 14; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  // Stepping stones up to the Junction Hub
  grid[15][7] = TileType.SOLID;
  grid[15][8] = TileType.SOLID;

  grid[13][10] = TileType.SOLID;
  grid[13][11] = TileType.SOLID;
  grid[13][12] = TileType.SOLID;

  // --- ROUTE A: UPPER RIDGE (Safe Route: longer, gentle jumps, scenic, H/T focus) ---
  // Catwalk 1 (cols 14-20 at row 11) - Holds Route A Pickup 1
  for (let c = 14; c <= 20; c++) {
    grid[11][c] = TileType.SOLID;
  }

  // Stepping stones over chasms
  grid[9][22] = TileType.SOLID;
  grid[9][23] = TileType.SOLID;
  grid[9][24] = TileType.SOLID;

  // Lookout ledge (cols 26-29 at row 8) - Holds Route A Backup H/T
  for (let c = 26; c <= 29; c++) {
    grid[8][c] = TileType.SOLID;
  }

  grid[9][31] = TileType.SOLID;
  grid[9][32] = TileType.SOLID;
  grid[9][33] = TileType.SOLID;

  grid[11][35] = TileType.SOLID;
  grid[11][36] = TileType.SOLID;

  // Gate 2A floor platform (cols 38-44 at row 12)
  for (let c = 38; c <= 44; c++) {
    grid[12][c] = TileType.SOLID;
  }

  // Bulkhead for Gate 2A at col 41:
  for (let r = 1; r <= 8; r++) {
    grid[r][41] = TileType.SOLID;
  }
  // Gate 2A sits at col 41, rows 9-11 (height 3 tiles = 96px)

  // Descent from Gate 2A into Shared Victory Atrium
  grid[14][46] = TileType.SOLID;
  grid[14][47] = TileType.SOLID;
  grid[15][48] = TileType.SOLID;
  grid[15][49] = TileType.SOLID;

  // --- ROUTE B: LOWER CONDUIT (Short Route: tighter platforming, R/B focus) ---
  // Ground floor along row 17 (cols 14 to 48)
  for (let c = 14; c <= 48; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  // Overhead ceiling at row 12 separating lower conduit from upper ridge
  // (leaving rows 13, 14, 15, 16 open air for generous headroom)
  for (let c = 14; c <= 37; c++) {
    grid[12][c] = TileType.SOLID;
  }

  // Low pipe hurdle in conduit
  grid[16][20] = TileType.SOLID;
  grid[16][21] = TileType.SOLID;

  // Conduit platform (cols 25-28 at row 15) - Holds Route B R/B Scanner (generous headroom under row 12)
  for (let c = 25; c <= 28; c++) {
    grid[15][c] = TileType.SOLID;
  }

  // Intermediate stepping platform in conduit
  grid[15][31] = TileType.SOLID;
  grid[15][32] = TileType.SOLID;

  // Low pedestal holding Backup R/B Scanner
  grid[15][34] = TileType.SOLID;
  grid[15][35] = TileType.SOLID;

  // Bulkhead for Gate 2B at col 37:
  for (let r = 1; r <= 12; r++) {
    grid[r][37] = TileType.SOLID;
  }
  // Gate 2B sits at col 37, rows 13-16 (height 4 tiles = 128px)
  grid[17][37] = TileType.SOLID;
  grid[18][37] = TileType.SOLID;

  // --- SHARED VICTORY ATRIUM (cols 49 to 71) ---
  for (let c = 49; c < L2_COLS - 1; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  // Victory terraces
  grid[16][58] = TileType.SOLID;
  grid[16][59] = TileType.SOLID;

  grid[15][61] = TileType.SOLID;
  grid[15][62] = TileType.SOLID;
  grid[15][63] = TileType.SOLID;

  grid[13][65] = TileType.SOLID;
  grid[13][66] = TileType.SOLID;
  grid[13][67] = TileType.SOLID;
  grid[13][68] = TileType.SOLID;

  return grid;
}

const level2Gates: QuantumGateData[] = [
  {
    id: 'gate-2a',
    x: 41 * TILE_SIZE,
    y: 9 * TILE_SIZE,
    width: TILE_SIZE,
    height: 3 * TILE_SIZE, // rows 9, 10, 11
    stateAngle: 45, // Starts as RED (45°)
    initialState: 'RED',
    allowedStates: ['TAILS', 'BLUE'], // H/T can open with TAILS (50%); R/B re-scrambler can open with BLUE (50%)
    label: 'GATE A [TAILS / BLUE]',
  },
  {
    id: 'gate-2b',
    x: 37 * TILE_SIZE,
    y: 13 * TILE_SIZE,
    width: TILE_SIZE,
    height: 4 * TILE_SIZE, // rows 13, 14, 15, 16
    stateAngle: 0, // Starts as HEADS (0°)
    initialState: 'HEADS',
    allowedStates: ['BLUE', 'TAILS'], // R/B can open with BLUE (50%); H/T re-scrambler can open with TAILS (50%)
    label: 'GATE B [BLUE / TAILS]',
  },
];

export const LEVEL_2: LevelDefinition = {
  id: 'level-2',
  levelNumber: 2,
  name: 'LEVEL 2',
  subtitle: 'Split Path',
  cols: L2_COLS,
  rows: L2_ROWS,
  timeLimit: 75,
  playerStart: {
    x: 3 * TILE_SIZE,
    y: 15 * TILE_SIZE,
  },
  scanners: [
    // Route A Pickups (Upper Ridge) - Floating cleanly 10px above platforms!
    { id: 'sc-2-1', x: 17 * TILE_SIZE, y: 10.25 * TILE_SIZE, type: 'HT' },
    { id: 'sc-2-2', x: 27.5 * TILE_SIZE, y: 7.25 * TILE_SIZE, type: 'HT' },
    // Route A Basis Scrambler Synthesizer (recharges every 3s so player never locks if HEADS is rolled)
    { id: 'sc-2-synth-rb', x: 39 * TILE_SIZE, y: 11.25 * TILE_SIZE, type: 'RB', respawnSeconds: 3 },

    // Route B Pickups (Lower Conduit) - Floating cleanly 10px above platforms!
    { id: 'sc-2-3', x: 26.5 * TILE_SIZE, y: 14.25 * TILE_SIZE, type: 'RB' },
    { id: 'sc-2-4', x: 34.5 * TILE_SIZE, y: 14.25 * TILE_SIZE, type: 'RB' },
    // Route B Basis Scrambler Synthesizer (recharges every 3s so player never locks if RED is rolled)
    { id: 'sc-2-synth-ht', x: 30 * TILE_SIZE, y: 16.25 * TILE_SIZE, type: 'HT', respawnSeconds: 3 },
  ],
  gates: level2Gates,
  gate: level2Gates[0],
  goal: {
    x: 66.5 * TILE_SIZE,
    y: 12.25 * TILE_SIZE,
    width: 32,
    height: 32,
  },
  tiles: createLevel2Tiles(),
  clues: [
    { x: 3 * TILE_SIZE, y: 14.5 * TILE_SIZE, text: 'SPLIT PATH: Choose Route A (Upper Ridge) or Route B (Lower Conduit)' },
    { x: 14 * TILE_SIZE, y: 9.5 * TILE_SIZE, text: 'ROUTE A: H/T Scanners → Gate A (Measure with H/T for TAILS)' },
    { x: 15 * TILE_SIZE, y: 16.5 * TILE_SIZE, text: 'ROUTE B: R/B Scanners → Gate B (Measure with R/B for BLUE)' },
    { x: 38 * TILE_SIZE, y: 10.5 * TILE_SIZE, text: 'GATE A [TAILS / BLUE] · Basis Synthesizer recharges R/B nearby!' },
    { x: 34 * TILE_SIZE, y: 15.5 * TILE_SIZE, text: 'GATE B [BLUE / TAILS] · Basis Synthesizer recharges H/T nearby!' },
  ],
  completionDebrief: {
    title: 'RESOURCE ALLOCATION & RECOVERY',
    lines: [
      'Different gates accept different quantum states.',
      'If an unfavorable measurement occurs, switching bases enables re-scrambling and recovery!',
    ],
  },
};

// =========================================================================
// LEVEL 3: THE FORGETFUL GATE (75s)
// The most important educational level: H/T -> R/B -> H/T basis scrambling!
// Initial state: HEADS (0°).
// Demonstration: H/T on HEADS yields HEADS (100%).
// Basis switch: R/B on HEADS yields RED (50%) or BLUE (50%).
// Scrambling: RED/BLUE measured with H/T yields TAILS (50%) or HEADS (50%).
// =========================================================================
const L3_COLS = 86;
const L3_ROWS = 20;

function createLevel3Tiles(): number[][] {
  const grid: number[][] = Array.from({ length: L3_ROWS }, () =>
    Array(L3_COLS).fill(TileType.EMPTY)
  );

  // Outer boundaries
  for (let r = 0; r < L3_ROWS; r++) {
    grid[r][0] = TileType.SOLID;
    grid[r][L3_COLS - 1] = TileType.SOLID;
  }
  for (let c = 0; c < L3_COLS; c++) {
    grid[0][c] = TileType.SOLID;
    grid[L3_ROWS - 1][c] = TileType.SOLID;
  }

  // --- SECTION 1: THE SAFE PROVING GROUND (cols 1 to 20) ---
  for (let c = 1; c <= 20; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  // Stepping stone platform holding Pickup 1 (H/T Scanner)
  grid[15][6] = TileType.SOLID;
  grid[15][7] = TileType.SOLID;
  grid[15][8] = TileType.SOLID;

  // Stepping stone up to bypass platform
  grid[14][11] = TileType.SOLID;

  // Upper bypass walkway over Demo Gate 3A (cols 12-16 at row 12)
  for (let c = 12; c <= 16; c++) {
    grid[12][c] = TileType.SOLID;
  }

  // Bulkhead above Gate 3A at col 14 (solid ceiling rows 1-8; rows 9-11 open air = 96px headroom)
  for (let r = 1; r <= 8; r++) {
    grid[r][14] = TileType.SOLID;
  }
  // Platform block directly over Gate 3A
  grid[13][14] = TileType.SOLID;
  // Gate 3A sits at col 14, rows 14-16

  // Stepping stones down into Section 2
  grid[14][17] = TileType.SOLID;
  grid[15][18] = TileType.SOLID;

  // --- SECTION 2: 45° BASIS SWITCH BIFURCATION (cols 21 to 48) ---
  for (let c = 21; c <= 48; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  // Platform holding Pickup 2 (R/B Scanner) before junction
  grid[15][22] = TileType.SOLID;
  grid[15][23] = TileType.SOLID;
  grid[15][24] = TileType.SOLID;

  // Stepping stone to Upper Door (Gate 3B)
  grid[13][27] = TileType.SOLID;

  // Junction Bulkhead wall at col 28:
  for (let r = 1; r <= 7; r++) {
    grid[r][28] = TileType.SOLID;
  }
  // Divider between Upper Door (rows 8-11) and Lower Door (rows 14-16)
  grid[12][28] = TileType.SOLID;
  grid[13][28] = TileType.SOLID;
  grid[17][28] = TileType.SOLID;
  grid[18][28] = TileType.SOLID;

  // Upper Route (Route Blue beyond Gate 3B, rows 8-11):
  // Catwalk floor at row 12 (cols 29 to 40)
  for (let c = 29; c <= 40; c++) {
    grid[12][c] = TileType.SOLID;
  }

  // Route Blue stepped descent into Section 3 (rows 13 -> 15 -> ground 17)
  grid[13][41] = TileType.SOLID;
  grid[13][42] = TileType.SOLID;
  grid[15][43] = TileType.SOLID;
  grid[15][44] = TileType.SOLID;

  // Lower Route (Route Red beyond Gate 3C, rows 14-17):
  // Ground floor along row 17 with overhead ceiling at row 12 (catwalk floor)
  // Low stepping platform in Route Red
  grid[15][33] = TileType.SOLID;
  grid[15][34] = TileType.SOLID;
  grid[15][35] = TileType.SOLID;

  // --- SECTION 3: THE FORGETFUL GATE (cols 49 to 72) ---
  for (let c = 49; c <= 72; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  // Pre-gate Platform 1 (holds Section 3 H/T Scanner)
  grid[15][52] = TileType.SOLID;
  grid[15][53] = TileType.SOLID;
  grid[15][54] = TileType.SOLID;

  // Pre-gate Platform 2 (holds Section 3 R/B Scanner & Replenisher)
  grid[13][56] = TileType.SOLID;
  grid[13][57] = TileType.SOLID;
  grid[13][58] = TileType.SOLID;
  grid[13][59] = TileType.SOLID;

  // Replenisher support platform
  grid[13][63] = TileType.SOLID;
  grid[13][64] = TileType.SOLID;
  grid[13][65] = TileType.SOLID;

  // Stepping stone to Upper Catwalk
  grid[11][55] = TileType.SOLID;

  // Upper Catwalk (holds Backup R/B and H/T Scanners)
  for (let c = 56; c <= 63; c++) {
    grid[10][c] = TileType.SOLID;
  }

  // Bulkhead wall above The Forgetful Gate at col 66:
  for (let r = 1; r <= 13; r++) {
    grid[r][66] = TileType.SOLID;
  }
  grid[17][66] = TileType.SOLID;
  grid[18][66] = TileType.SOLID;
  // Gate 3D sits at col 66, rows 14-16 (height 3 tiles = 96px)

  // --- SECTION 4: GOLDEN CARROT SANCTUARY (cols 73 to 85) ---
  for (let c = 73; c < L3_COLS - 1; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  grid[16][76] = TileType.SOLID;
  grid[16][77] = TileType.SOLID;
  grid[15][79] = TileType.SOLID;
  grid[15][80] = TileType.SOLID;
  grid[15][81] = TileType.SOLID;
  grid[15][82] = TileType.SOLID;

  return grid;
}

const level3Gates: QuantumGateData[] = [
  {
    id: 'gate-3a',
    x: 14 * TILE_SIZE,
    y: 14 * TILE_SIZE,
    width: TILE_SIZE,
    height: 3 * TILE_SIZE,
    stateAngle: 0, // Starts as HEADS (0°)
    initialState: 'HEADS',
    allowedStates: ['HEADS'],
    label: 'DEMO GATE [HEADS 0°]',
    initialLocked: true,
  },
  {
    id: 'gate-3b',
    x: 28 * TILE_SIZE,
    y: 8 * TILE_SIZE,
    width: TILE_SIZE,
    height: 4 * TILE_SIZE,
    stateAngle: 0, // Starts as HEADS (0°)
    initialState: 'HEADS',
    allowedStates: ['BLUE'],
    label: 'BLUE DOOR [135°]',
  },
  {
    id: 'gate-3c',
    x: 28 * TILE_SIZE,
    y: 14 * TILE_SIZE,
    width: TILE_SIZE,
    height: 3 * TILE_SIZE,
    stateAngle: 0, // Starts as HEADS (0°)
    initialState: 'HEADS',
    allowedStates: ['RED'],
    label: 'RED DOOR [45°]',
  },
  {
    id: 'gate-3d',
    x: 66 * TILE_SIZE,
    y: 14 * TILE_SIZE,
    width: TILE_SIZE,
    height: 3 * TILE_SIZE,
    stateAngle: 0, // Starts as HEADS (0°)
    initialState: 'HEADS',
    allowedStates: ['TAILS'],
    label: 'THE FORGETFUL GATE [TAILS 90°]',
  },
];

export const LEVEL_3: LevelDefinition = {
  id: 'level-3',
  levelNumber: 3,
  name: 'LEVEL 3',
  subtitle: 'The Forgetful Gate',
  cols: L3_COLS,
  rows: L3_ROWS,
  timeLimit: 75,
  playerStart: {
    x: 3 * TILE_SIZE,
    y: 15 * TILE_SIZE,
  },
  // Player begins with 1 H/T scanner!
  initialInventory: {
    HT: 1,
    RB: 0,
  },
  scanners: [
    // Pickup 1: H/T in Section 1 (on row 15)
    { id: 'sc-3-1', x: 7 * TILE_SIZE, y: 14.25 * TILE_SIZE, type: 'HT' },
    // Pickup 2: R/B in Section 2 before junction (on row 15)
    { id: 'sc-3-2', x: 23 * TILE_SIZE, y: 14.25 * TILE_SIZE, type: 'RB' },
    // Route Blue Pickups (Upper Route): Both R/B and H/T on row 12!
    { id: 'sc-3-3a', x: 32 * TILE_SIZE, y: 11.25 * TILE_SIZE, type: 'RB' },
    { id: 'sc-3-3b', x: 37 * TILE_SIZE, y: 11.25 * TILE_SIZE, type: 'HT' },
    // Route Red Pickups (Lower Route): Both R/B and H/T!
    { id: 'sc-3-4a', x: 34 * TILE_SIZE, y: 14.25 * TILE_SIZE, type: 'RB' },
    { id: 'sc-3-4b', x: 38 * TILE_SIZE, y: 16.25 * TILE_SIZE, type: 'HT' },
    // Section 3 Handcrafted Pickups
    { id: 'sc-3-5', x: 53 * TILE_SIZE, y: 14.25 * TILE_SIZE, type: 'HT' },
    { id: 'sc-3-6', x: 57.5 * TILE_SIZE, y: 12.25 * TILE_SIZE, type: 'RB' },
    { id: 'sc-3-7', x: 58.5 * TILE_SIZE, y: 9.25 * TILE_SIZE, type: 'RB' },
    { id: 'sc-3-8', x: 61.5 * TILE_SIZE, y: 9.25 * TILE_SIZE, type: 'HT' },
    // Section 3 Quantum Replenishers (recharge automatically every 4s so player is NEVER stuck)
    { id: 'sc-3-rep-rb', x: 50.5 * TILE_SIZE, y: 16.25 * TILE_SIZE, type: 'RB', respawnSeconds: 4 },
    { id: 'sc-3-rep-ht', x: 64 * TILE_SIZE, y: 12.25 * TILE_SIZE, type: 'HT', respawnSeconds: 4 },
  ],
  gates: level3Gates,
  gate: level3Gates[3],
  goal: {
    x: 80.5 * TILE_SIZE,
    y: 14.25 * TILE_SIZE,
    width: 32,
    height: 32,
  },
  tiles: createLevel3Tiles(),
  clues: [
    { x: 3 * TILE_SIZE, y: 14.5 * TILE_SIZE, text: 'SEC 1: Proving Ground · Measure 0° HEADS with H/T (100% HEADS opens gate!) · Or hop ledge ▶' },
    { x: 22 * TILE_SIZE, y: 14.5 * TILE_SIZE, text: 'SEC 2: 45° BASIS SWITCH · BLUE (135°) opens Top Door · RED (45°) opens Bottom Door' },
    { x: 50 * TILE_SIZE, y: 14.5 * TILE_SIZE, text: 'SEC 3: THE FORGETFUL GATE [0° HEADS] · Requires TAILS (90°)' },
    { x: 56 * TILE_SIZE, y: 11.5 * TILE_SIZE, text: 'H/T on 0° is 100% HEADS (never TAILS!). First scramble with R/B (45°/135°), then measure with H/T!' },
    { x: 58 * TILE_SIZE, y: 8.5 * TILE_SIZE, text: 'UPPER DECK: Quantum Replenishers recharge scanners if needed!' },
  ],
  completionDebrief: {
    title: 'THE FORGETFUL GATE',
    lines: [
      'P(TAILS | HEADS) = 0%: You cannot reach TAILS directly from 0° HEADS using H/T.',
      'Measuring with R/B (45°) scrambled the state to RED or BLUE, erasing memory of 0°.',
      'Measuring again in H/T then yielded TAILS with 50% probability, opening the gate!',
    ],
  },
};

// =========================================================================
// LEVEL 4: QUANTUM FLUX (60s)
// Environmental hazard: Quantum Flux periodically destabilizes designated gate!
// 5 distinct gameplay sections, 3 gates, and exactly 5 purposeful scanners.
// =========================================================================
const L4_COLS = 100;
const L4_ROWS = 20;

function createLevel4Tiles(): number[][] {
  const grid: number[][] = Array.from({ length: L4_ROWS }, () =>
    Array(L4_COLS).fill(TileType.EMPTY)
  );

  for (let r = 0; r < L4_ROWS; r++) {
    grid[r][0] = TileType.SOLID;
    grid[r][L4_COLS - 1] = TileType.SOLID;
  }
  for (let c = 0; c < L4_COLS; c++) {
    grid[0][c] = TileType.SOLID;
    grid[L4_ROWS - 1][c] = TileType.SOLID;
  }

  // --- SECTION 1: SEISMIC APPROACH (cols 1 to 22) ---
  for (let c = 1; c <= 22; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  // Stepping stones in Section 1
  grid[15][6] = TileType.SOLID;
  grid[15][7] = TileType.SOLID;

  grid[13][9] = TileType.SOLID;
  grid[13][10] = TileType.SOLID;

  // Ledge holding R/B scanner (row 11)
  grid[11][12] = TileType.SOLID;
  grid[11][13] = TileType.SOLID;
  grid[11][14] = TileType.SOLID;
  grid[11][15] = TileType.SOLID;

  // Bulkhead for Gate 4A at col 21:
  for (let r = 1; r <= 13; r++) {
    grid[r][21] = TileType.SOLID;
  }
  grid[17][21] = TileType.SOLID;
  grid[18][21] = TileType.SOLID;
  // Gate 4A sits at col 21, rows 14-16 (height 3 tiles = 96px)

  // --- SECTION 2: SPLIT TRAVERSAL (cols 23 to 48) ---
  for (let c = 23; c <= 48; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  // Lower conduit platforms
  grid[15][26] = TileType.SOLID;
  grid[15][27] = TileType.SOLID;
  grid[15][28] = TileType.SOLID;

  grid[14][30] = TileType.SOLID;
  grid[14][31] = TileType.SOLID;
  grid[14][32] = TileType.SOLID;

  // Upper High Skyway bypass stepping stones
  grid[12][25] = TileType.SOLID;
  grid[12][26] = TileType.SOLID;

  grid[10][28] = TileType.SOLID;
  grid[10][29] = TileType.SOLID;

  // High skyway bridge platform (row 8)
  for (let c = 32; c <= 36; c++) {
    grid[8][c] = TileType.SOLID;
  }
  for (let c = 38; c <= 44; c++) {
    grid[7][c] = TileType.SOLID;
  }
  // Stepping stones bridging the chasm gap between col 44 and col 50
  grid[8][46] = TileType.SOLID;
  grid[8][47] = TileType.SOLID;
  grid[8][48] = TileType.SOLID;

  // --- SECTION 3: THE FLUX CHAMBER (cols 49 to 68) ---
  for (let c = 49; c <= 68; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  // Lower recovery platform before Flux Gate
  grid[15][51] = TileType.SOLID;
  grid[15][52] = TileType.SOLID;
  grid[15][53] = TileType.SOLID;

  // Upper skyway platform holding Bypass Gate 4C (cols 50 to 60 at row 8)
  for (let c = 50; c <= 60; c++) {
    grid[8][c] = TileType.SOLID;
  }

  // Bulkhead at col 56:
  // Upper ceiling above Gate 4C (rows 1-4)
  for (let r = 1; r <= 4; r++) {
    grid[r][56] = TileType.SOLID;
  }
  // Divider above Gate 4B (rows 9-12)
  for (let r = 9; r <= 12; r++) {
    grid[r][56] = TileType.SOLID;
  }
  grid[17][56] = TileType.SOLID;
  grid[18][56] = TileType.SOLID;
  // Gate 4C sits at col 56, rows 5-7 (height 3 tiles = 96px)
  // Gate 4B sits at col 56, rows 13-16 (height 4 tiles = 128px)

  // --- SECTION 4: POST-FLUX CONVERGENCE (cols 69 to 84) ---
  for (let c = 69; c <= 84; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  // Chasm descent from upper skyway to ground (all gaps <= 2 tiles, drops <= 2 tiles)
  grid[12][61] = TileType.SOLID;
  grid[12][62] = TileType.SOLID;

  grid[14][65] = TileType.SOLID;
  grid[14][66] = TileType.SOLID;

  grid[15][68] = TileType.SOLID;
  grid[15][69] = TileType.SOLID;

  grid[15][72] = TileType.SOLID;
  grid[15][73] = TileType.SOLID;

  grid[13][76] = TileType.SOLID;
  grid[13][77] = TileType.SOLID;

  grid[15][80] = TileType.SOLID;
  grid[15][81] = TileType.SOLID;

  // --- SECTION 5: THE GOLDEN TERRACE (cols 85 to 99) ---
  for (let c = 85; c < L4_COLS - 1; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  grid[16][86] = TileType.SOLID;
  grid[16][87] = TileType.SOLID;
  grid[16][88] = TileType.SOLID;

  grid[15][90] = TileType.SOLID;
  grid[15][91] = TileType.SOLID;
  grid[15][92] = TileType.SOLID;
  grid[15][93] = TileType.SOLID;

  grid[13][94] = TileType.SOLID;
  grid[13][95] = TileType.SOLID;
  grid[13][96] = TileType.SOLID;
  grid[13][97] = TileType.SOLID;

  return grid;
}

const level4Gates: QuantumGateData[] = [
  {
    id: 'gate-4a',
    x: 21 * TILE_SIZE,
    y: 14 * TILE_SIZE,
    width: TILE_SIZE,
    height: 3 * TILE_SIZE,
    stateAngle: 45, // Starts RED (45°)
    initialState: 'RED',
    allowedStates: ['BLUE', 'TAILS'],
    label: 'GATE 1 [BLUE / TAILS]',
  },
  {
    id: 'gate-4b',
    x: 56 * TILE_SIZE,
    y: 13 * TILE_SIZE,
    width: TILE_SIZE,
    height: 4 * TILE_SIZE,
    stateAngle: 0, // Starts HEADS (0°)
    initialState: 'HEADS',
    allowedStates: ['BLUE', 'TAILS'],
    label: 'FLUX GATE [BLUE / TAILS]',
    isFluxAffected: true,
  },
  {
    id: 'gate-4c',
    x: 56 * TILE_SIZE,
    y: 5 * TILE_SIZE,
    width: TILE_SIZE,
    height: 3 * TILE_SIZE,
    stateAngle: 45, // Starts RED (45°)
    initialState: 'RED',
    allowedStates: ['TAILS', 'BLUE'],
    label: 'BYPASS GATE [TAILS / BLUE]',
  },
];

export const LEVEL_4: LevelDefinition = {
  id: 'level-4',
  levelNumber: 4,
  name: 'LEVEL 4',
  subtitle: 'Quantum Flux',
  cols: L4_COLS,
  rows: L4_ROWS,
  timeLimit: 60,
  playerStart: {
    x: 3 * TILE_SIZE,
    y: 15 * TILE_SIZE,
  },
  scanners: [
    // Purposeful scanners aligned cleanly 10px above platforms:
    { id: 'sc-4-1', x: 4 * TILE_SIZE, y: 16.25 * TILE_SIZE, type: 'HT' },
    { id: 'sc-4-2', x: 13.5 * TILE_SIZE, y: 10.25 * TILE_SIZE, type: 'RB' },
    { id: 'sc-4-3', x: 31 * TILE_SIZE, y: 13.25 * TILE_SIZE, type: 'RB' },
    { id: 'sc-4-4', x: 34 * TILE_SIZE, y: 7.25 * TILE_SIZE, type: 'HT' },
    { id: 'sc-4-5', x: 52 * TILE_SIZE, y: 14.25 * TILE_SIZE, type: 'RB' },
    // Recovery Synthesizers so bad rolls never soft-lock:
    { id: 'sc-4-rep-ht', x: 50 * TILE_SIZE, y: 16.25 * TILE_SIZE, type: 'HT', respawnSeconds: 3 },
    { id: 'sc-4-rep-rb', x: 53 * TILE_SIZE, y: 7.25 * TILE_SIZE, type: 'RB', respawnSeconds: 3 },
  ],
  gates: level4Gates,
  gate: level4Gates[1],
  goal: {
    x: 95.5 * TILE_SIZE,
    y: 12.25 * TILE_SIZE,
    width: 32,
    height: 32,
  },
  tiles: createLevel4Tiles(),
  fluxHazard: {
    id: 'flux-4',
    name: 'Sector Flux Discharge',
    targetGateIds: ['gate-4b'],
    periodSeconds: 11,
    warningSeconds: 2.5,
    durationSeconds: 3.5,
    zoneX: 54 * TILE_SIZE,
    zoneY: 10 * TILE_SIZE,
    zoneWidth: 5 * TILE_SIZE,
    zoneHeight: 7 * TILE_SIZE,
  },
  clues: [
    { x: 3 * TILE_SIZE, y: 14.5 * TILE_SIZE, text: 'SEC 1: Seismic Approach · Gate 1 requires BLUE or TAILS' },
    { x: 24 * TILE_SIZE, y: 16.5 * TILE_SIZE, text: 'SEC 2: SPLIT TRAVERSAL ▶ Lower Flux Chamber · ▲ High Skyway Bypass' },
    { x: 50 * TILE_SIZE, y: 16.5 * TILE_SIZE, text: 'FLUX ZONE: Gate destabilizes during purple pulse! Time your scan and crossing!' },
    { x: 69 * TILE_SIZE, y: 16.5 * TILE_SIZE, text: 'SEC 4: Convergence · Safe passage beyond Flux Sector' },
  ],
  completionDebrief: {
    title: 'ENVIRONMENTAL INTERFERENCE',
    lines: [
      'Quantum coherence can be disturbed by environmental flux.',
      'Timing and situational awareness allow safe transit.',
    ],
  },
};

// =========================================================================
// LEVEL 5: QUANTUM RUN (60s)
// The ultimate test: Combine route planning, measurement scrambling, and flux timing!
// 6 distinct gameplay sections, 4 gates, speedrunner shortcut, and 7 purposeful scanners.
// =========================================================================
const L5_COLS = 120;
const L5_ROWS = 20;

function createLevel5Tiles(): number[][] {
  const grid: number[][] = Array.from({ length: L5_ROWS }, () =>
    Array(L5_COLS).fill(TileType.EMPTY)
  );

  for (let r = 0; r < L5_ROWS; r++) {
    grid[r][0] = TileType.SOLID;
    grid[r][L5_COLS - 1] = TileType.SOLID;
  }
  for (let c = 0; c < L5_COLS; c++) {
    grid[0][c] = TileType.SOLID;
    grid[L5_ROWS - 1][c] = TileType.SOLID;
  }

  // --- SECTION 1: LAUNCH FACILITY (cols 1 to 24) ---
  for (let c = 1; c <= 24; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  // Stepping platforms in Section 1
  grid[15][6] = TileType.SOLID;
  grid[15][7] = TileType.SOLID;

  grid[13][9] = TileType.SOLID;
  grid[13][10] = TileType.SOLID;

  grid[11][12] = TileType.SOLID;
  grid[11][13] = TileType.SOLID;
  grid[11][14] = TileType.SOLID;
  grid[11][15] = TileType.SOLID;

  // Bulkhead for Gate 5A at col 22:
  for (let r = 1; r <= 13; r++) {
    grid[r][22] = TileType.SOLID;
  }
  grid[17][22] = TileType.SOLID;
  grid[18][22] = TileType.SOLID;
  // Gate 5A sits at col 22, rows 14-16 (height 3 tiles = 96px)

  // --- SECTION 2: BIFURCATED GANTRY (cols 25 to 50) ---
  for (let c = 25; c <= 50; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  // Lower Path stepping
  grid[15][28] = TileType.SOLID;
  grid[15][29] = TileType.SOLID;

  grid[14][31] = TileType.SOLID;
  grid[14][32] = TileType.SOLID;
  grid[14][33] = TileType.SOLID;
  grid[14][34] = TileType.SOLID;

  // Upper Shortcut stepping
  grid[12][26] = TileType.SOLID;
  grid[12][27] = TileType.SOLID;

  grid[10][29] = TileType.SOLID;
  grid[10][30] = TileType.SOLID;

  // High girder platform (row 8)
  for (let c = 33; c <= 37; c++) {
    grid[8][c] = TileType.SOLID;
  }
  for (let c = 40; c <= 48; c++) {
    grid[8][c] = TileType.SOLID;
  }

  // Bulkhead at col 44:
  // Upper ceiling above Gate 5C (rows 1-4)
  for (let r = 1; r <= 4; r++) {
    grid[r][44] = TileType.SOLID;
  }
  // Divider above Gate 5B (rows 9-13)
  for (let r = 9; r <= 13; r++) {
    grid[r][44] = TileType.SOLID;
  }
  grid[17][44] = TileType.SOLID;
  grid[18][44] = TileType.SOLID;
  // Gate 5C sits at col 44, rows 5-7 (height 3 tiles = 96px)
  // Gate 5B sits at col 44, rows 14-16 (height 3 tiles = 96px)

  // --- SECTION 3: INTERMEDIATE LABORATORY & CRANE CACHE (cols 51 to 70) ---
  for (let c = 51; c <= 70; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  // Stepping stones up to the Crane
  grid[15][54] = TileType.SOLID;
  grid[15][55] = TileType.SOLID;

  grid[13][57] = TileType.SOLID;
  grid[13][58] = TileType.SOLID;

  grid[11][60] = TileType.SOLID;
  grid[11][61] = TileType.SOLID;

  // Laboratory Crane platform at row 9 (holds Pickup 5 R/B Scanner)
  for (let c = 62; c <= 66; c++) {
    grid[9][c] = TileType.SOLID;
  }

  // Lower recovery alcove platform at row 15 (holds Pickup 6 H/T Scanner)
  grid[15][66] = TileType.SOLID;
  grid[15][67] = TileType.SOLID;
  grid[15][68] = TileType.SOLID;

  // --- SECTION 4: CORE RESONANCE FLUX ZONE (cols 71 to 90) ---
  for (let c = 71; c <= 90; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  // Stepping platforms before Core Gate
  grid[15][74] = TileType.SOLID;
  grid[15][75] = TileType.SOLID;

  grid[13][77] = TileType.SOLID;
  grid[13][78] = TileType.SOLID;

  // Platform holding Backup Pickup 7 (row 15)
  grid[15][79] = TileType.SOLID;
  grid[15][80] = TileType.SOLID;
  grid[15][81] = TileType.SOLID;

  // Bulkhead for Final Gate 5D at col 86:
  for (let r = 1; r <= 12; r++) {
    grid[r][86] = TileType.SOLID;
  }
  grid[17][86] = TileType.SOLID;
  grid[18][86] = TileType.SOLID;
  // Gate 5D sits at col 86, rows 13-16 (height 4 tiles = 128px)

  // --- SECTION 5: POST-CORE ESCAPE TRAVERSE (cols 91 to 108) ---
  for (let c = 91; c <= 108; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  grid[15][92] = TileType.SOLID;
  grid[15][93] = TileType.SOLID;
  grid[15][94] = TileType.SOLID;

  grid[13][96] = TileType.SOLID;
  grid[13][97] = TileType.SOLID;
  grid[13][98] = TileType.SOLID;

  grid[11][100] = TileType.SOLID;
  grid[11][101] = TileType.SOLID;
  grid[11][102] = TileType.SOLID;
  grid[11][103] = TileType.SOLID;

  grid[13][105] = TileType.SOLID;
  grid[13][106] = TileType.SOLID;
  grid[13][107] = TileType.SOLID;

  // --- SECTION 6: QUANTUM ZENITH SANCTUARY (cols 109 to 120) ---
  for (let c = 109; c < L5_COLS - 1; c++) {
    grid[17][c] = TileType.SOLID;
    grid[18][c] = TileType.SOLID;
  }

  // Tiered victory pyramid
  grid[16][110] = TileType.SOLID;
  grid[16][111] = TileType.SOLID;

  grid[15][112] = TileType.SOLID;
  grid[15][113] = TileType.SOLID;
  grid[15][114] = TileType.SOLID;

  grid[13][115] = TileType.SOLID;
  grid[13][116] = TileType.SOLID;
  grid[13][117] = TileType.SOLID;
  grid[13][118] = TileType.SOLID;

  return grid;
}

const level5Gates: QuantumGateData[] = [
  {
    id: 'gate-5a',
    x: 22 * TILE_SIZE,
    y: 14 * TILE_SIZE,
    width: TILE_SIZE,
    height: 3 * TILE_SIZE,
    stateAngle: 0, // Starts HEADS (0°)
    initialState: 'HEADS',
    allowedStates: ['BLUE', 'TAILS'],
    label: 'GATE 1 [BLUE / TAILS]',
  },
  {
    id: 'gate-5b',
    x: 44 * TILE_SIZE,
    y: 14 * TILE_SIZE,
    width: TILE_SIZE,
    height: 3 * TILE_SIZE,
    stateAngle: 45, // Starts RED (45°)
    initialState: 'RED',
    allowedStates: ['TAILS', 'BLUE'],
    label: 'GATE 2 [TAILS / BLUE]',
  },
  {
    id: 'gate-5c',
    x: 44 * TILE_SIZE,
    y: 5 * TILE_SIZE,
    width: TILE_SIZE,
    height: 3 * TILE_SIZE,
    stateAngle: 0, // Starts HEADS (0°)
    initialState: 'HEADS',
    allowedStates: ['BLUE', 'TAILS'],
    label: 'SHORTCUT [BLUE / TAILS]',
  },
  {
    id: 'gate-5d',
    x: 86 * TILE_SIZE,
    y: 13 * TILE_SIZE,
    width: TILE_SIZE,
    height: 4 * TILE_SIZE,
    stateAngle: 0, // Starts HEADS (0°)
    initialState: 'HEADS',
    allowedStates: ['BLUE', 'TAILS'],
    label: 'CORE GATE [BLUE / TAILS]',
    isFluxAffected: true,
  },
];

export const LEVEL_5: LevelDefinition = {
  id: 'level-5',
  levelNumber: 5,
  name: 'LEVEL 5',
  subtitle: 'Quantum Run',
  cols: L5_COLS,
  rows: L5_ROWS,
  timeLimit: 60,
  playerStart: {
    x: 3 * TILE_SIZE,
    y: 15 * TILE_SIZE,
  },
  scanners: [
    // 7 purposeful scanners sitting cleanly 10px above platforms:
    { id: 'sc-5-1', x: 4 * TILE_SIZE, y: 16.25 * TILE_SIZE, type: 'HT' },
    { id: 'sc-5-2', x: 13.5 * TILE_SIZE, y: 10.25 * TILE_SIZE, type: 'RB' },
    { id: 'sc-5-3', x: 32.5 * TILE_SIZE, y: 13.25 * TILE_SIZE, type: 'HT' },
    { id: 'sc-5-4', x: 35 * TILE_SIZE, y: 7.25 * TILE_SIZE, type: 'RB' },
    { id: 'sc-5-5', x: 64 * TILE_SIZE, y: 8.25 * TILE_SIZE, type: 'RB' },
    { id: 'sc-5-6', x: 67 * TILE_SIZE, y: 14.25 * TILE_SIZE, type: 'HT' },
    { id: 'sc-5-7', x: 80 * TILE_SIZE, y: 14.25 * TILE_SIZE, type: 'RB' },
    // Core Gate recovery synthesizer:
    { id: 'sc-5-rep-ht', x: 74.5 * TILE_SIZE, y: 14.25 * TILE_SIZE, type: 'HT', respawnSeconds: 3 },
  ],
  gates: level5Gates,
  gate: level5Gates[3],
  goal: {
    x: 116.5 * TILE_SIZE,
    y: 12.25 * TILE_SIZE,
    width: 32,
    height: 32,
  },
  tiles: createLevel5Tiles(),
  fluxHazard: {
    id: 'flux-5',
    name: 'Core Resonance Pulse',
    targetGateIds: ['gate-5d'],
    periodSeconds: 10,
    warningSeconds: 2.5,
    durationSeconds: 3.0,
    zoneX: 84 * TILE_SIZE,
    zoneY: 10 * TILE_SIZE,
    zoneWidth: 5 * TILE_SIZE,
    zoneHeight: 7 * TILE_SIZE,
  },
  clues: [
    { x: 3 * TILE_SIZE, y: 14.5 * TILE_SIZE, text: 'QUANTUM RUN: 60s Final Challenge · Scope out gates and plan your scans!' },
    { x: 26 * TILE_SIZE, y: 11.5 * TILE_SIZE, text: '▲ SPEEDRUN SHORTCUT: High Girder Gate 5C' },
    { x: 52 * TILE_SIZE, y: 16.5 * TILE_SIZE, text: 'SEC 3: Lab Crane Cache · Search upper structures for R/B scanner!' },
    { x: 76 * TILE_SIZE, y: 16.5 * TILE_SIZE, text: 'CORE RESONANCE PULSE: Measure with R/B for BLUE (135°) · Time your transit!' },
    { x: 92 * TILE_SIZE, y: 16.5 * TILE_SIZE, text: 'SEC 5: Post-Core Escape · Sprint to the Zenith Sanctuary!' },
  ],
  completionDebrief: {
    title: 'QUANTUM MASTERY ACHIEVED',
    lines: [
      'You mastered basis switching, measurement scrambling, and flux interference under pressure.',
      'Congratulations, Quantum Navigator!',
    ],
  },
};

export const ALL_LEVELS: LevelDefinition[] = [
  LEVEL_1,
  LEVEL_2,
  LEVEL_3,
  LEVEL_4,
  LEVEL_5,
];
