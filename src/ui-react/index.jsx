import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Inicializar core do jogo ANTES de renderizar React
import { setStateChangeListener } from "@core/notifyStateChange.js";
import { loadGame, startAutoSave } from "@core/systems/save.js";
import { startGameLoop } from "@core/systems/time.js";
import { setAchievementUnlockedListener } from "../../js/achievementSystem.js";
import { registerHook } from "../../js/hookBus.js";
import { eventEmitter } from "./adapters/eventEmitter.js";

// Registra listener para notifyStateChange emitir em eventEmitter
// Isso conecta o core (vanilla JS) com React (hooks)
setStateChangeListener(() => {
  eventEmitter.emit("stateChange");
});

setAchievementUnlockedListener((achievement) => {
  eventEmitter.emit("achievementUnlocked", achievement);
});

registerHook("levelUp", (payload) => {
  eventEmitter.emit("levelUp", payload);
});

registerHook("lootboxOpened", (payload) => {
  eventEmitter.emit("lootboxOpened", payload);
});

registerHook("lootboxAdded", (payload) => {
  eventEmitter.emit("lootboxAdded", payload);
});

registerHook("saveWritten", (payload) => {
  eventEmitter.emit("saveWritten", payload);
});

registerHook("saveLoaded", (payload) => {
  eventEmitter.emit("saveLoaded", payload);
});

registerHook("saveReset", (payload) => {
  eventEmitter.emit("saveReset", payload);
});

// Carregar jogo
console.log("🎮 Iniciando core do jogo...");
loadGame();
startGameLoop();
startAutoSave();

// Renderizar React
console.log("⚛️  Montando React...");
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

console.log("✅ Game core running + React mounted + bridge connected");
