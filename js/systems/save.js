import { runHook } from "../hookBus.js";
import { state } from "../state.js";

const SAVE_KEY = "cocada-save-v1";
const SAVE_FORMAT_VERSION = 2;
const AUTOSAVE_INTERVAL_MS = 30000;

let autosaveIntervalId = null;
let hasUnsavedChanges = false;

// ===============================
// SERIALIZAR
// ===============================
function getSaveData() {
  return JSON.stringify({
    version: SAVE_FORMAT_VERSION,
    savedAt: Date.now(),
    state,
  });
}

function emitSaveStatus(detail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("cocada:save-status", { detail }));
}

// ===============================
// APLICAR SAVE NO STATE
// ===============================
function applySaveData(data) {
  if (!data) return;

  const payload = parseStoredSave(data);
  if (!payload) return;

  const migrated = migrateSavePayload(payload);
  if (!migrated?.state || typeof migrated.state !== "object") {
    return;
  }

  // merge profundo simples para preservar defaults
  mergeState(state, migrated.state);
}

function parseStoredSave(data) {
  let parsed = null;

  try {
    parsed = JSON.parse(data);
  } catch (e) {
    console.warn("Save corrompido, ignorando.", e);
    return;
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  // Formato atual versionado
  if (parsed.state && typeof parsed.state === "object") {
    return {
      version: Number(parsed.version) || 1,
      savedAt: Number(parsed.savedAt) || null,
      state: parsed.state,
    };
  }

  // Formato legado (v1): JSON direto do state
  return {
    version: 1,
    savedAt: null,
    state: parsed,
  };
}

function migrateSavePayload(payload) {
  let migratedState = payload.state;

  // Ponto de extensão para migrações futuras de schema
  if (payload.version < 2) {
    migratedState = {
      ...migratedState,
    };
  }

  return {
    version: SAVE_FORMAT_VERSION,
    savedAt: payload.savedAt,
    state: migratedState,
  };
}

function mergeState(target, source) {
  for (const key in source) {
    const value = source[key];

    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (!target[key] || typeof target[key] !== "object") {
        target[key] = {};
      }
      mergeState(target[key], value);
    } else {
      target[key] = value;
    }
  }
}

// ===============================
// SALVAR
// ===============================
export function saveGame(source = "manual") {
  if (source === "auto" && !hasUnsavedChanges) {
    return false;
  }

  state.lastSaveAt = Date.now();

  const data = getSaveData();

  try {
    localStorage.setItem(SAVE_KEY, data);
  } catch (e) {
    console.error("Erro ao salvar jogo:", e);
    updateSaveStatus("Erro ao salvar");
    return false;
  }

  hasUnsavedChanges = false;

  const statusText = source === "auto" ? "Autosave" : "Salvo agora";
  console.log(`Jogo salvo (${source})`);
  updateSaveStatus(statusText);

  runHook("saveWritten", {
    source,
    savedAt: state.lastSaveAt,
  });

  return true;
}

// ===============================
// CARREGAR
// ===============================
export function loadGame() {
  const data = localStorage.getItem(SAVE_KEY);

  if (!data) {
    console.log("Nenhum save encontrado");
    state.sessionStartedAt = Date.now();
    state.minuteProductionStartedAt = state.minuteProductionStartedAt || Date.now();
    state.lastInteractionAt = state.lastInteractionAt || Date.now();
    hasUnsavedChanges = false;
    updateSaveStatus("Sem save anterior");

    runHook("saveLoaded", {
      hasSave: false,
      loadedAt: Date.now(),
    });

    return;
  }

  applySaveData(data);
  state.sessionStartedAt = Date.now();
  state.minuteProductionStartedAt = state.minuteProductionStartedAt || Date.now();
  state.lastInteractionAt = state.lastInteractionAt || Date.now();
  state.maxCocadasSeen = Math.max(state.maxCocadasSeen || 0, Math.floor(state.cocadas || 0));
  hasUnsavedChanges = false;

  console.log("Save carregado!");
  updateSaveStatus("Save carregado");

  runHook("saveLoaded", {
    hasSave: true,
    loadedAt: Date.now(),
  });
}

export function startAutoSave(intervalMs = AUTOSAVE_INTERVAL_MS) {
  if (autosaveIntervalId) return;

  autosaveIntervalId = setInterval(() => {
    saveGame("auto");
  }, intervalMs);

  updateSaveStatus("Autosave ativo");
}

export function stopAutoSave() {
  if (!autosaveIntervalId) return;

  clearInterval(autosaveIntervalId);
  autosaveIntervalId = null;
}

// ===============================
// RESET
// ===============================
export function resetGame() {
  if (!confirm("Tem certeza que deseja resetar?")) return;

  runHook("saveReset", {
    requestedAt: Date.now(),
  });

  stopAutoSave();
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}

// ===============================
// STATUS VISUAL
// ===============================
function updateSaveStatus(text) {
  const now = new Date().toLocaleTimeString();
  emitSaveStatus(`${text} • ${now}`);
}

export function markSaveDirty() {
  hasUnsavedChanges = true;
}
