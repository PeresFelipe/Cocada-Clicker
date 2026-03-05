import { registerProduction } from "../actions.js";
import { notifyStateChange } from "../notifyStateChange.js";
import { state } from "../state.js";
import { getBuildingCPS } from "./economy.js";

let intervalId = null;
let lastPassiveNotifyAt = 0;

export function startGameLoop() {
  if (intervalId) return; // evita loop duplicado

  state.lastTick = Date.now();
  lastPassiveNotifyAt = state.lastTick;

  intervalId = setInterval(() => {
    const now = Date.now();
    const dt = (now - state.lastTick) / 1000;
    state.lastTick = now;
    state.totalPlayTimeMs = (state.totalPlayTimeMs || 0) + dt * 1000;

    for (const key in state.buildings) {
      const owned = state.buildings[key].owned;
      if (owned <= 0) continue;

      const produced = getBuildingCPS(key) * dt;

      // buffer global
      state.cocadaBuffer += produced;

      // histórico individual
      state.buildings[key].produced += produced;
    }

    // 🔢 converte apenas inteiros
    const whole = Math.floor(state.cocadaBuffer);
    let shouldNotify = false;

    if (whole > 0) {
      state.cocadas += whole;
      registerProduction(whole, "auto");
      state.cocadaBuffer -= whole;
      state.maxCocadasSeen = Math.max(state.maxCocadasSeen || 0, Math.floor(state.cocadas));
      shouldNotify = true;
    }

    if (!shouldNotify && now - lastPassiveNotifyAt >= 1000) {
      shouldNotify = true;
    }

    if (shouldNotify) {
      lastPassiveNotifyAt = now;
      notifyStateChange();
    }
  }, 50);
}
