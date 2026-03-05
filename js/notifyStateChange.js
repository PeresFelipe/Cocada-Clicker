/**
 * notifyStateChange.js - Bridge entre Core e React
 *
 * Actions.js chama isso para notificar React que o estado mudou.
 * Este arquivo não tem dependências de React, apenas notifica.
 */

import { checkAchievements } from "./achievementSystem.js";
import { markSaveDirty } from "./systems/save.js";

let stateChangeListener = null;

/**
 * Registra um listener que será chamado quando estado mudar
 * Chamado por React ao inicializar
 */
export function setStateChangeListener(callback) {
  stateChangeListener = callback;
}

/**
 * Notifica que o estado mudou
 * Chamado por actions.js após mutar state.js
 */
export function notifyStateChange() {
  markSaveDirty();
  checkAchievements();

  if (stateChangeListener) {
    try {
      stateChangeListener();
    } catch (e) {
      console.error("Erro ao notificar estado:", e);
    }
  }
}
