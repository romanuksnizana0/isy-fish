/**
 * IsyFish — tuning constants.
 * Pure data only: nothing here runs heavy synchronous work at module load.
 */
import {Dimensions} from 'react-native';

/**
 * Splash hold, in milliseconds. Fixed at 8000 by the factory rule book
 * (CLAUDE-game-common 2.1): the UI harness needs 4-6 s to reach its first
 * capture, so anything shorter races the Loader screenshot. Timer-driven only,
 * never an animation callback and never a tap.
 */
export const LOADER_DURATION_MS = 8000;

/** Cross-fade used for every screen change (ms). */
export const SCREEN_FADE_MS = 240;
/** Loader -> Home cross-fade (ms). */
export const LOADER_FADE_MS = 260;
/** Reduced-motion replacement duration for every animation (ms). */
export const REDUCED_MOTION_MS = 120;

const {width: SCREEN_W} = Dimensions.get('window');

/* ---- Board geometry (frame formula, overflow 0) ------------------------- */
export const BOARD_MAX_W = Math.min(SCREEN_W - 32, 380);
export const BOARD_PAD = 10;
export const BOARD_BORDER = 2;
export const BOARD_FRAME = BOARD_PAD + BOARD_BORDER; // 12
export const BOARD_COLS = 3;
export const TILE = Math.floor((BOARD_MAX_W - 2 * BOARD_FRAME) / BOARD_COLS);
export const BOARD_W = TILE * BOARD_COLS + 2 * BOARD_FRAME;
export const PIN_COLS = 4;
export const PIN_TILE = Math.floor((BOARD_MAX_W - 2 * BOARD_FRAME) / PIN_COLS);
export const PIN_BOARD_W = PIN_TILE * PIN_COLS + 2 * BOARD_FRAME;

/* ---- Ledger model limits ------------------------------------------------ */
export const ICE_MAX_CM = 40;
export const ICE_STEP_CM = 2;
export const TEMP_MIN_C = -30;
export const TEMP_MAX_C = 5;
export const TEMP_STEP_C = 1;
export const SPECIES_COUNT = 5;
export const PIN_COUNT = 12;
export const CHECKLIST_ROWS = 7;
export const STREAK_WINDOW = 7;
export const ENTRY_STEPS = 4;
export const SPARKLINE_WINDOW = 7;

/* ---- Settings bounds ---------------------------------------------------- */
export const SAFE_THRESHOLD_MIN_CM = 8;
export const SAFE_THRESHOLD_MAX_CM = 20;
export const SAFE_THRESHOLD_DEFAULT_CM = 12;

/* ---- Layout ------------------------------------------------------------- */
export const HEADER_TOP_PAD = 44;
export const HEADER_HEIGHT = 68;
export const CTA_HEIGHT = 60;
export const SECONDARY_HEIGHT = 48;
export const PANEL_BOTTOM_PAD = 48;
/**
 * Extra touch tolerance above the primary CTA. The bottom action panel is the
 * one place where a slightly off-target tap must still land on the button, so
 * the CTA owns the empty strip above it instead of leaving it dead.
 */
export const CTA_HIT_SLOP = {top: 56, bottom: 8, left: 8, right: 8};
export const HIT_SLOP = {top: 8, bottom: 8, left: 8, right: 8};
export const HEADER_HIT_SLOP = {top: 40, bottom: 12, left: 14, right: 14};
