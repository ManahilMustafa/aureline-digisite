/**
 * Aurelian Digsite — localStorage persistence
 */

const STORAGE_KEY = 'aurelian-digsite-progress';

export function getDefaultState() {
  return {
    discoveredArtifacts: [],
    completedPuzzles: [],
    unlockedAchievements: [],
    visitedStages: [1],
    hasStarted: false,
    lastUpdated: null
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    return { ...getDefaultState(), ...parsed };
  } catch {
    return getDefaultState();
  }
}

export function saveState(state) {
  const toSave = {
    ...state,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  return toSave;
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return getDefaultState();
}

export function getProgressPercentage(discoveredCount, total = 12) {
  return Math.round((discoveredCount / total) * 100);
}

export function getReconstructionState(discoveredCount) {
  if (discoveredCount >= 9) return 'restored';
  if (discoveredCount >= 4) return 'partial';
  return 'ruins';
}

export function isStageUnlocked(stageId, state) {
  if (stageId === 1) return true;
  if (stageId === 2) return state.completedPuzzles.includes('symbol-matching');
  if (stageId === 3) return state.completedPuzzles.includes('glyph-sequence');
  return false;
}
