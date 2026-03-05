import { defs } from "../defs.js";
import { state } from "../state.js";
import { isUpgradeApplicable } from "./seededContent.js";

function getPreFlavorAdvantageMultiplier() {
  return state.flavor ? 1 : 1.1;
}

function getBoughtUpgradeDefs() {
  const bought = [];

  for (const key in defs.upgrades) {
    const upgradeDef = defs.upgrades[key];
    if (!isUpgradeApplicable(upgradeDef, state.flavor)) continue;

    if (state.upgrades[key]?.bought) {
      bought.push(defs.upgrades[key]);
    }
  }

  return bought;
}

function matchesCondition(upgradeDef) {
  const condition = upgradeDef.condition;
  if (!condition?.buildings) return true;

  for (const buildingKey in condition.buildings) {
    const requiredOwned = condition.buildings[buildingKey];
    const owned = state.buildings[buildingKey]?.owned || 0;
    if (owned < requiredOwned) return false;
  }

  return true;
}

function getClickUpgradeModifiers() {
  let clickMultiplier = 1;
  let perClickBonus = 0;

  const upgrades = getBoughtUpgradeDefs();
  for (const upgradeDef of upgrades) {
    if (!matchesCondition(upgradeDef)) continue;

    if (upgradeDef.type === "clickMultiplier") {
      clickMultiplier *= upgradeDef.value;
    }

    if (upgradeDef.type === "perClickBonus") {
      perClickBonus += upgradeDef.value;
    }
  }

  return { clickMultiplier, perClickBonus };
}

function getGlobalCPSUpgradeMultiplier() {
  let cpsMultiplier = 1;

  const upgrades = getBoughtUpgradeDefs();
  for (const upgradeDef of upgrades) {
    if (!matchesCondition(upgradeDef)) continue;

    if (upgradeDef.type === "globalCPSMultiplier") {
      cpsMultiplier *= upgradeDef.value;
    }

    if (upgradeDef.type === "synergyBonus" && upgradeDef.synergyType === "globalCPSMultiplier") {
      cpsMultiplier *= upgradeDef.value;
    }
  }

  return cpsMultiplier;
}

function getBuildingUpgradeMultiplier(buildingKey) {
  let buildingMultiplier = 1;

  const upgrades = getBoughtUpgradeDefs();
  for (const upgradeDef of upgrades) {
    if (!matchesCondition(upgradeDef)) continue;

    if (upgradeDef.type === "buildingMultiplier" && upgradeDef.target === buildingKey) {
      buildingMultiplier *= upgradeDef.value;
    }
  }

  return buildingMultiplier;
}

function getBuildingCostReductionMultiplier(buildingKey) {
  let costMultiplier = 1;

  const upgrades = getBoughtUpgradeDefs();
  for (const upgradeDef of upgrades) {
    if (!matchesCondition(upgradeDef)) continue;

    if (upgradeDef.type !== "buildingCostReduction") continue;

    if (upgradeDef.target === "all" || upgradeDef.target === buildingKey) {
      costMultiplier *= 1 - upgradeDef.value;
    }
  }

  return costMultiplier;
}

export function getPerClick() {
  const { clickMultiplier, perClickBonus } = getClickUpgradeModifiers();
  const basePerClick =
    state.perClickBase * state.multiplier * state.clickMult * getPreFlavorAdvantageMultiplier();
  return basePerClick * clickMultiplier + perClickBonus;
}

export function getCPS() {
  let cps = 0;
  for (const key in state.buildings) {
    cps += getBuildingCPS(key);
  }

  return cps;
}

export function getBuildingCPS(key) {
  const owned = state.buildings[key]?.owned || 0;
  if (owned <= 0) return 0;

  const baseCps = defs.buildings[key]?.cps || 0;
  const unitCps = baseCps * getBuildingUpgradeMultiplier(key);
  const globalUpgradeMult = getGlobalCPSUpgradeMultiplier();

  return (
    owned *
    unitCps *
    state.multiplier *
    state.cpsMult *
    globalUpgradeMult *
    getPreFlavorAdvantageMultiplier()
  );
}

export function getBuildingCost(key) {
  const def = defs.buildings[key];
  const owned = state.buildings[key].owned;

  if (def?.lootboxOnly) return 0;

  const growth = def.costGrowth || 1.15;

  const costReductionMult = getBuildingCostReductionMultiplier(key);
  const base = def.baseCost * state.buildCostMult * costReductionMult;
  return Math.floor(base * Math.pow(growth, owned));
}

export function getUpgradeCost(key) {
  const def = defs.upgrades[key];
  if (def?.lootboxOnly) return 0;
  const baseValue = def.baseCost ?? def.cost ?? 0;
  const base = baseValue * state.upgradeCostMult;
  return Math.floor(base);
}
