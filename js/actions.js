import { defs } from "./defs.js";
import { runHook } from "./hookBus.js";
import { notifyStateChange } from "./notifyStateChange.js";
import { state } from "./state.js";
import { getBuildingCost, getCPS, getPerClick, getUpgradeCost } from "./systems/economy.js";
import {
  generateRuntimeSeed,
  isBuildingUnlocked,
  isUpgradeUnlocked,
} from "./systems/seededContent.js";

export function clickCocada(x, y) {
  const value = getPerClick();
  const gain = Math.floor(value);

  state.cocadas += gain;
  registerProduction(gain, "click");
  state.maxCocadasSeen = Math.max(state.maxCocadasSeen || 0, Math.floor(state.cocadas));
  state.clicksCount++; // Incrementa contador de cliques
  state.lastInteractionAt = Date.now();

  addXp(0.1); // Clicar dá 0.1 XP

  // Verifica se atingiu threshold de cliques para ganhar lootbox
  if (state.clicksCount % 100 === 0) {
    addLootbox(1);
    console.log(`🎁 Lootbox ganha por cliques! (${state.clicksCount} cliques)`);
  }

  notifyStateChange(); // Notifica React
  triggerPop();
}

function triggerPop() {
  const cocadaBtn = document.getElementById("cocadaBtn");
  if (!cocadaBtn) return;
  cocadaBtn.classList.add("cocada-pop");
  setTimeout(() => cocadaBtn.classList.remove("cocada-pop"), 280);
}

export function buyBuilding(key) {
  const buildingDef = defs.buildings[key];
  if (!buildingDef || !isBuildingUnlocked(key, state)) {
    return;
  }

  if (buildingDef.lootboxOnly) return;

  const cost = getBuildingCost(key);

  console.log("Tentando comprar:", key);
  console.log("Cocadas:", state.cocadas);
  console.log("Custo:", cost);

  if (state.cocadas < cost) {
    console.warn("Saldo insuficiente");
    return;
  }

  state.cocadas -= cost;
  state.cocadasSpent = (state.cocadasSpent || 0) + cost;
  state.buildings[key].owned++;
  state.buildsCount++; // Incrementa contador de compras
  state.lastInteractionAt = Date.now();

  updatePeakCps();
  addXp(5); // Comprar construção dá 5 XP

  // Verifica se atingiu threshold de compras de estruturas
  if (state.buildsCount % 25 === 0) {
    addLootbox(1);
    console.log(`🎁 Lootbox ganha por compra de estruturas! (${state.buildsCount} compras)`);
  }

  notifyStateChange(); // Notifica React
}

export function buyUpgrade(key) {
  const u = defs.upgrades[key];
  if (!u || !isUpgradeUnlocked(key, state)) return;

  if (u.lootboxOnly) return;

  const cost = getUpgradeCost(key);

  if (!state.upgrades[key]) {
    state.upgrades[key] = { bought: false };
  }

  if (state.upgrades[key].bought) return;
  if (state.cocadas < cost) return;

  state.cocadas -= cost;
  state.cocadasSpent = (state.cocadasSpent || 0) + cost;
  state.upgrades[key].bought = true;
  state.upgrades[key].boughtAt = Date.now();
  state.upgradesCount++; // Incrementa contador de compras
  state.lastInteractionAt = Date.now();

  if (typeof u.effect === "function") {
    u.effect(state);
  }

  updatePeakCps();

  addXp(5); // Comprar upgrade dá 5 XP

  // Verifica se atingiu threshold de compras de upgrades
  if (state.upgradesCount % 15 === 0) {
    addLootbox(1);
    console.log(`🎁 Lootbox ganha por compra de upgrades! (${state.upgradesCount} compras)`);
  }

  notifyStateChange(); // Notifica React
}

// ========== SISTEMA DE NÍVEL ==========

/**
 * Calcula XP necessário para atingir um nível específico.
 * Nível 1: 100 XP, Nível 2: 200 XP, Nível 3: 300 XP, etc.
 */
export function getXpForLevel(level) {
  return level * 100;
}

/**
 * Calcula XP total acumulado até um nível (soma de todos os XPs anteriores).
 * Nível 1: 100, Nível 2: 300, Nível 3: 600, etc.
 */
export function getTotalXpForLevel(level) {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXpForLevel(i);
  }
  return total;
}

/**
 * Retorna { xpNeeded, xpProgress } para o nível atual.
 * xpNeeded = XP total necessário para atingir level+1
 * xpProgress = XP que o jogador já tem acumulado
 */
export function getXpProgress() {
  const nextLevel = state.level + 1;
  const xpNeeded = getTotalXpForLevel(nextLevel);
  return {
    xpNeeded,
    xpProgress: state.xp,
    percentProgress: (state.xp / xpNeeded) * 100,
  };
}

/**
 * Adiciona XP ao jogador e verifica se subiu de nível.
 * Emite evento 'levelUp' quando o jogador passa de nível.
 */
export function addXp(amount) {
  if (state.level >= state.maxLevel) return; // Já está no nível máximo

  state.xp += amount;

  // Verificar se subiu de nível
  const levelUps = [];
  while (state.level < state.maxLevel) {
    const nextLevel = state.level + 1;
    const totalXpNeeded = getTotalXpForLevel(nextLevel);

    if (state.xp >= totalXpNeeded) {
      state.level++;
      levelUps.push(state.level);
    } else {
      break;
    }
  }

  // Se subiu de nível, armazenar info para notificar UI + recompensar com lootbox
  if (levelUps.length > 0) {
    const previousLevel = state.level - levelUps.length;

    state.lastLevelUp = {
      newLevel: state.level,
      timestamp: Date.now(),
    };

    runHook("levelUp", {
      previousLevel,
      newLevel: state.level,
      levelsGained: levelUps.length,
      totalXp: state.xp,
    });

    // Ganha 1 lootbox por nível alcançado
    addLootbox(levelUps.length);
  }
}

import { flavorDefs } from "./defs.js";

export function setContentSeed(seedInput) {
  if (state.flavorLocked) return;

  state.contentSeed = String(seedInput || "").trim();
  notifyStateChange();
}

export function applyFlavor(key) {
  if (state.flavorLocked) return;

  const def = flavorDefs[key];
  if (!def) return;

  if (!state.contentSeed) {
    state.contentSeed = generateRuntimeSeed();
  }

  state.flavor = key;
  state.flavorLocked = true;

  // reset defensivo
  state.perClickBase = 1;
  state.multiplier = 1;
  state.clickMult = 1;
  state.cpsMult = 1;
  state.buildCostMult = 1;
  state.upgradeCostMult = 1;

  const buffs = def.buffs;

  if (buffs.clickMult) state.clickMult *= buffs.clickMult;
  if (buffs.cpsMult) state.cpsMult *= buffs.cpsMult;
  if (buffs.globalMult) state.multiplier *= buffs.globalMult;
  if (buffs.buildCostMult) state.buildCostMult *= buffs.buildCostMult;
  if (buffs.upgradeCostMult) state.upgradeCostMult *= buffs.upgradeCostMult;

  if (buffs.clickAdd) state.perClickBase += buffs.clickAdd;

  updatePeakCps();

  addXp(50); // Escolher sabor dá 50 XP

  // Ganha lootbox ao escolher sabor
  addLootbox(1);
  console.log(`🎁 Lootbox ganha ao escolher sabor! Sabor: ${key}`);

  notifyStateChange(); // Notifica React
}
// ========== SISTEM A DE LOOTBOX ==========

import {
  applyReward,
  canOpenFreeLootbox,
  formatLootboxCooldown,
  generateReward,
  selectRarity,
  updatePityCounter,
} from "./systems/lootbox.js";

/**
 * Abre um lootbox e retorna a recompensa
 * Verifica se há lootboxes disponíveis
 * Retorna: { rarityId, rarity, reward, summary } ou null se não houver lootboxes
 */
export function openLootbox() {
  // Se não houver lootboxes, tenta conceder 1 grátis por cooldown
  if (state.lootboxCount <= 0) {
    if (canOpenFreeLootbox(state.lastFreeLootboxTime)) {
      state.lootboxCount = 1;
      state.lastFreeLootboxTime = Date.now();
      console.log("🎁 Lootbox grátis concedida por cooldown!");
    } else {
      console.warn("❌ Nenhuma lootbox disponível!");
      return null;
    }
  }

  // Seleciona raridade com pity system
  const rarity = selectRarity(state.lootboxPityCounter);

  // Gera recompensa baseada em raridade e nível do jogador
  const reward = generateReward(rarity.id, state.level);

  // Aplica recompensa ao state
  const summary = applyReward(state, reward);

  // Atualiza contadores
  state.lootboxCount--; // Decrementa quantidade disponível
  state.lootboxOpened++;
  state.lootboxPityCounter = updatePityCounter(rarity.tier, state.lootboxPityCounter);

  // Se foi XP, aplica agora
  if (reward.type === "xp" && summary.xpAmount) {
    addXp(summary.xpAmount);
  }

  // Emite notificação para React
  state.lastLootboxReward = {
    rarity: rarity,
    reward: reward,
    summary: summary,
    timestamp: Date.now(),
  };

  console.log(`🎁 Lootbox aberto! Raridade: ${rarity.name}`, summary);

  runHook("lootboxOpened", {
    rarity,
    reward,
    summary,
    lootboxCount: state.lootboxCount,
    openedTotal: state.lootboxOpened,
  });

  notifyStateChange();

  return {
    rarityId: rarity.id,
    rarity: rarity,
    reward: reward,
    summary: summary,
  };
}

/**
 * Adiciona lootboxes à quantidade disponível do jogador
 */
export function addLootbox(amount = 1) {
  state.lootboxCount = Math.max(0, state.lootboxCount + amount);
  console.log(`+${amount} Lootbox! Total: ${state.lootboxCount}`);

  runHook("lootboxAdded", {
    amount,
    lootboxCount: state.lootboxCount,
  });

  notifyStateChange();
}

/**
 * Obtém informações sobre o próximo lootbox grátis
 */
export function getLootboxStatus() {
  const freeAvailable = canOpenFreeLootbox(state.lastFreeLootboxTime);

  return {
    available: state.lootboxCount,
    canOpen: state.lootboxCount > 0 || freeAvailable,
    freeAvailable,
    cooldownText: formatLootboxCooldown(state.lastFreeLootboxTime),
    opened: state.lootboxOpened,
    pity: state.lootboxPityCounter,
  };
}

/**
 * DEBUG: Maximiza tudo no jogo para testes
 */
export function maxOutGame() {
  state.cocadas = 999999999;
  state.maxCocadasSeen = 999999999;
  state.level = state.maxLevel;
  state.xp = getTotalXpForLevel(state.maxLevel + 1);
  state.lootboxCount = 100;

  for (const key in state.buildings) {
    state.buildings[key].owned = 100;
  }

  for (const key in state.upgrades) {
    state.upgrades[key].bought = true;
  }

  updatePeakCps();

  notifyStateChange();
}

export function registerProduction(amount, source = "auto") {
  const gain = Math.max(0, Math.floor(amount || 0));
  if (gain <= 0) return;

  state.totalCocadasProduced = (state.totalCocadasProduced || 0) + gain;

  if (source === "click") {
    state.cocadasFromClicks = (state.cocadasFromClicks || 0) + gain;
    state.biggestClickGain = Math.max(state.biggestClickGain || 0, gain);
  } else {
    state.cocadasFromAuto = (state.cocadasFromAuto || 0) + gain;
  }

  const now = Date.now();
  if (!state.minuteProductionStartedAt) {
    state.minuteProductionStartedAt = now;
  }

  if (!state.minuteProductionBuffer) {
    state.minuteProductionBuffer = 0;
  }

  if (now - state.minuteProductionStartedAt >= 60000) {
    state.bestMinuteProduction = Math.max(
      state.bestMinuteProduction || 0,
      state.minuteProductionBuffer,
    );
    state.minuteProductionBuffer = 0;
    state.minuteProductionStartedAt = now;
  }

  state.minuteProductionBuffer += gain;
}

export function updatePeakCps() {
  const currentCps = getCPS();
  state.highestCps = Math.max(state.highestCps || 0, currentCps);
}
