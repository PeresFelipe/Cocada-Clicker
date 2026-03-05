/**
 * State Adapter - Funções seletoras (selectors) do state do core
 * Estas funções extraem partes específicas do state.js
 */

import { getXpProgress } from "@core/actions.js";
import { defs } from "@core/defs.js";
import {
  getBuildingCPS,
  getBuildingCost,
  getCPS,
  getPerClick,
  getUpgradeCost,
} from "@core/systems/economy.js";
import { canOpenFreeLootbox, formatLootboxCooldown } from "@core/systems/lootbox.js";
import { getVisibleBuildingKeys } from "@core/systems/seededContent.js";
import { getAchievementsForUI } from "../../../js/achievementSystem.js";

function toSafeInteger(value) {
  return Number.isFinite(value) ? Math.floor(value) : 0;
}

function sumOwnedBuildings(buildings = {}) {
  return Object.values(buildings).reduce((sum, buildingState) => {
    return sum + toSafeInteger(buildingState?.owned || 0);
  }, 0);
}

function sumBoughtUpgrades(upgrades = {}) {
  return Object.values(upgrades).reduce((sum, upgradeState) => {
    return sum + (upgradeState?.bought ? 1 : 0);
  }, 0);
}

function mapBuildingBreakdown(buildings = {}) {
  return Object.keys(defs.buildings).map((key) => ({
    key,
    name: defs.buildings[key]?.name || key,
    owned: toSafeInteger(buildings[key]?.owned || 0),
  }));
}

export const stateSelectors = {
  // ===== COCADAS =====
  cocadas: (s) => Math.floor(s.cocadas),
  maxCocadasSeen: (s) => Math.floor(s.maxCocadasSeen || 0),

  // ===== STATS =====
  perClick: (s) => getPerClick(),
  cps: (s) => getCPS(),
  multiplier: (s) => s.multiplier,

  // ===== FLAVOR =====
  flavor: (s) => s.flavor,
  flavorLocked: (s) => s.flavorLocked,
  contentSeed: (s) => s.contentSeed || "",

  // ===== CONSTRUÇÕES =====
  buildingOwned: (key) => (s) => s.buildings[key]?.owned || 0,
  buildingCost: (key) => (s) => getBuildingCost(key),
  buildingCps: (key) => (s) => getBuildingCPS(key),

  // ===== UPGRADES =====
  upgradesState: (s) => {
    const result = {};
    for (const key in s.upgrades) {
      result[key] = {
        ...s.upgrades[key],
      };
    }
    return result;
  },
  upgradeBought: (key) => (s) => s.upgrades[key]?.bought || false,
  upgradeCost: (key) => (s) => getUpgradeCost(key),

  // ===== NÍVEL =====
  level: (s) => s.level || 1,
  maxLevel: (s) => s.maxLevel || 50,
  xp: (s) => s.xp || 0,
  xpProgress: (s) => getXpProgress(),
  lastLevelUp: (s) => s.lastLevelUp || null,

  // ===== LOOTBOX =====
  lootboxCount: (s) => s.lootboxCount || 0,
  lootboxFreeAvailable: (s) => canOpenFreeLootbox(s.lastFreeLootboxTime),
  lootboxCanOpen: (s) => (s.lootboxCount || 0) > 0 || canOpenFreeLootbox(s.lastFreeLootboxTime),
  lootboxCooldownText: (s) => formatLootboxCooldown(s.lastFreeLootboxTime),
  lootboxOpened: (s) => s.lootboxOpened || 0,
  lastFreeLootboxTime: (s) => s.lastFreeLootboxTime || null,
  lootboxPityCounter: (s) => s.lootboxPityCounter || 0,
  lastLootboxReward: (s) => s.lastLootboxReward || null,
  clicksCount: (s) => s.clicksCount || 0,
  buildsCount: (s) => s.buildsCount || 0,
  upgradesCount: (s) => s.upgradesCount || 0,

  // ===== PLAYER STATS PANEL =====
  playerStatsSnapshot: (s) => {
    const cocadasCurrent = toSafeInteger(s.cocadas || 0);
    const cocadasTotalProduced = toSafeInteger(s.totalCocadasProduced || 0);
    const cocadasSpent = toSafeInteger(s.cocadasSpent || 0);
    const cocadasFromClicks = toSafeInteger(s.cocadasFromClicks || 0);
    const cocadasFromAuto = toSafeInteger(s.cocadasFromAuto || 0);
    const totalClicks = toSafeInteger(s.clicksCount || 0);

    const totalBuildingsBought = Math.max(
      toSafeInteger(s.buildsCount || 0),
      sumOwnedBuildings(s.buildings),
    );
    const totalUpgradesBought = Math.max(
      toSafeInteger(s.upgradesCount || 0),
      sumBoughtUpgrades(s.upgrades),
    );

    const totalPlayTimeMs = Math.max(0, s.totalPlayTimeMs || 0);
    const timeSinceLastSaveMs = s.lastSaveAt ? Math.max(0, Date.now() - s.lastSaveAt) : null;

    const cps = getCPS();
    const perClick = getPerClick();
    const totalProducedSafe = Math.max(1, cocadasTotalProduced);
    const autoProductionPercent = (cocadasFromAuto / totalProducedSafe) * 100;
    const clickProductionPercent = (cocadasFromClicks / totalProducedSafe) * 100;
    const playMinutes = Math.max(1, totalPlayTimeMs / 60000);

    return {
      economy: {
        cocadasTotalProduced,
        cocadasCurrent,
        cps,
      },
      interaction: {
        totalClicks,
        cocadasPerClick: perClick,
      },
      progression: {
        totalBuildingsBought,
        buildingBreakdown: mapBuildingBreakdown(s.buildings),
        totalUpgradesBought,
      },
      time: {
        totalPlayTimeMs,
        timeSinceLastSaveMs,
      },
      extra: {
        highestCps: s.highestCps || null,
        cocadasSpent,
        cocadasFromClicks,
        cocadasFromAuto,
      },
      efficiency: {
        cocadasPerMinute: cps * 60,
        averageCocadasPerClick: cocadasFromClicks / Math.max(1, totalClicks),
        autoProductionPercent,
        clickProductionPercent,
      },
      history: {
        peakCps: Math.max(s.highestCps || 0, cps),
        biggestClick: toSafeInteger(s.biggestClickGain || 0),
        bestMinuteProduction: toSafeInteger(s.bestMinuteProduction || 0),
      },
      behavior: {
        clicksPerMinute: totalClicks / playMinutes,
        idleTimeMs: Math.max(0, Date.now() - (s.lastInteractionAt || Date.now())),
        favoriteBuilding:
          mapBuildingBreakdown(s.buildings).sort((a, b) => b.owned - a.owned)[0]?.name || "Nenhuma",
      },
      advanced: {
        rngSeed: s.contentSeed || "(aleatória)",
        economyGrowthRate: cps / Math.max(1, cocadasCurrent),
        multipliers: {
          global: s.multiplier || 1,
          click: s.clickMult || 1,
          cps: s.cpsMult || 1,
          buildCost: s.buildCostMult || 1,
          upgradeCost: s.upgradeCostMult || 1,
        },
      },
    };
  },

  // ===== ACHIEVEMENTS =====
  achievements: (s) => getAchievementsForUI(s),
  achievementsTotalUnlocked: (s) => s.achievements?.totalUnlocked || 0,

  // ===== SHOP VIEW MODELS =====
  shopBuildingCards: (s) => {
    const cocadas = Math.floor(s.cocadas || 0);

    return getVisibleBuildingKeys({
      flavor: s.flavor,
      maxCocadasSeen: s.maxCocadasSeen || 0,
      contentSeed: s.contentSeed || "",
    }).map((key) => {
      const def = defs.buildings[key];
      const owned = s.buildings[key]?.owned || 0;
      const cost = getBuildingCost(key);
      const cps = getBuildingCPS(key);
      const produced = Math.floor(s.buildings[key]?.produced || 0);
      const isLootbox = Boolean(def?.lootboxOnly);
      const canAfford = !isLootbox && cocadas >= cost;
      const isActive = owned > 0;

      return {
        key,
        def,
        owned,
        cost,
        cps,
        produced,
        isLootbox,
        canAfford,
        isActive,
        isBlocked: !canAfford && !isActive,
      };
    });
  },
};
