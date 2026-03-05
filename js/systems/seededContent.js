import { defs } from "../defs.js";

const DEFAULT_SEED = "cocada-seed";

function normalizeSeed(seed) {
  const value = String(seed || "").trim();
  return value.length > 0 ? value : DEFAULT_SEED;
}

function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createRng(seedText) {
  let seed = hashString(seedText);

  return function rng() {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleKeys(keys, seedText) {
  const shuffled = [...keys];
  const rng = createRng(seedText);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(rng() * (index + 1));
    const temp = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = temp;
  }

  return shuffled;
}

function isFlavorMatching(defFlavor, activeFlavor) {
  if (defFlavor === "base") return true;
  if (!activeFlavor) return false;
  return defFlavor === activeFlavor;
}

function getContentMap(type) {
  return type === "building" ? defs.buildings : defs.upgrades;
}

function getSeededOrder(type, flavor, state) {
  const map = getContentMap(type);
  const seed = normalizeSeed(state?.contentSeed);

  const keys = Object.keys(map).filter((key) => map[key].flavor === flavor);
  return shuffleKeys(keys, `${seed}|${type}|${flavor}`);
}

function getContentRank(type, key, state) {
  const map = getContentMap(type);
  const def = map[key];
  if (!def) return -1;
  if (def.flavor === "base") return 0;

  const order = getSeededOrder(type, def.flavor, state);
  return order.indexOf(key);
}

function getUnlockRequirement(type, key, state) {
  const map = getContentMap(type);
  const def = map[key];
  if (!def) return Number.MAX_SAFE_INTEGER;
  if (def.flavor === "base") return 0;

  const rank = Math.max(0, getContentRank(type, key, state));
  const seed = normalizeSeed(state?.contentSeed);
  const rng = createRng(`${seed}|unlock|${type}|${key}`);

  const jitter = 0.9 + rng() * 0.25;
  const baseThreshold = Math.max(10, Math.floor((def.baseCost || 10) * 0.45));
  const rankMultiplier = 1 + rank * 0.6;

  return Math.floor(baseThreshold * rankMultiplier * jitter);
}

function sortBySeededOrder(type, keys, state) {
  return [...keys].sort((keyA, keyB) => {
    const map = getContentMap(type);
    const flavorA = map[keyA]?.flavor;
    const flavorB = map[keyB]?.flavor;

    if (flavorA === "base" && flavorB !== "base") return -1;
    if (flavorB === "base" && flavorA !== "base") return 1;

    const rankA = getContentRank(type, keyA, state);
    const rankB = getContentRank(type, keyB, state);

    return rankA - rankB;
  });
}

export function getNormalizedSeed(seed) {
  return normalizeSeed(seed);
}

export function isUpgradeApplicable(upgradeDef, activeFlavor) {
  if (!upgradeDef) return false;
  return upgradeDef.flavor === "base" || upgradeDef.flavor === activeFlavor;
}

export function isBuildingUnlocked(key, state) {
  const def = defs.buildings[key];
  if (!def || !isFlavorMatching(def.flavor, state.flavor)) return false;

  if (def.lootboxOnly) {
    return Boolean(state?.buildings?.[key]?.lootboxUnlocked);
  }

  return (state.maxCocadasSeen || 0) >= getUnlockRequirement("building", key, state);
}

export function isUpgradeUnlocked(key, state) {
  const def = defs.upgrades[key];
  if (!def || !isFlavorMatching(def.flavor, state.flavor)) return false;

  if (def.lootboxOnly) {
    return Boolean(state?.upgrades?.[key]?.lootboxUnlocked);
  }

  return (state.maxCocadasSeen || 0) >= getUnlockRequirement("upgrade", key, state);
}

export function getVisibleBuildingKeys(state) {
  const keys = Object.keys(defs.buildings).filter((key) => isBuildingUnlocked(key, state));
  return sortBySeededOrder("building", keys, state);
}

export function getVisibleUpgradeKeys(state) {
  const keys = Object.keys(defs.upgrades).filter((key) => isUpgradeUnlocked(key, state));
  return sortBySeededOrder("upgrade", keys, state);
}

export function generateRuntimeSeed() {
  return `seed-${Date.now().toString(36)}`;
}
