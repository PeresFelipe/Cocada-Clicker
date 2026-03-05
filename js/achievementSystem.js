import { achievementList } from "./achievementList.js";
import { state } from "./state.js";
import { getCPS } from "./systems/economy.js";

const runtimeAchievements = [...achievementList];
const runtimeAchievementsById = Object.fromEntries(runtimeAchievements.map((a) => [a.id, a]));
const pendingAchievementIds = new Set(runtimeAchievements.map((a) => a.id));

const achievementHooks = {
  unlocked: [],
  checked: [],
};

let achievementUnlockedListener = null;

function runAchievementHook(name, payload) {
  const hooks = achievementHooks[name] || [];
  for (const hook of hooks) {
    try {
      hook(payload);
    } catch (error) {
      console.error(`Erro no hook de conquista (${name}):`, error);
    }
  }
}

export function registerAchievementHook(name, callback) {
  if (!achievementHooks[name] || typeof callback !== "function") {
    return false;
  }

  achievementHooks[name].push(callback);
  return true;
}

export function removeAchievementHook(name, callback) {
  if (!achievementHooks[name]) {
    return false;
  }

  achievementHooks[name] = achievementHooks[name].filter((hook) => hook !== callback);
  return true;
}

function ensureAchievementState() {
  if (!state.achievements || typeof state.achievements !== "object") {
    state.achievements = {};
  }

  if (!state.achievements.unlockedById || typeof state.achievements.unlockedById !== "object") {
    state.achievements.unlockedById = {};
  }

  if (!Array.isArray(state.achievements.unlockedOrder)) {
    state.achievements.unlockedOrder = [];
  }

  if (!Number.isFinite(state.achievements.totalUnlocked)) {
    state.achievements.totalUnlocked = state.achievements.unlockedOrder.length;
  }

  if (typeof state.achievements.lastUnlockedId === "undefined") {
    state.achievements.lastUnlockedId = null;
  }

  for (const unlockedId of state.achievements.unlockedOrder) {
    pendingAchievementIds.delete(unlockedId);
  }
}

function getTotalStructures(currentState) {
  return Object.values(currentState.buildings || {}).reduce(
    (sum, entry) => sum + (entry?.owned || 0),
    0,
  );
}

function getTotalUpgrades(currentState) {
  return Object.values(currentState.upgrades || {}).reduce(
    (sum, entry) => sum + (entry?.bought ? 1 : 0),
    0,
  );
}

function getAchievementSnapshot(currentState = state) {
  return {
    totalClicks: currentState.clicksCount || 0,
    totalCocadas: Math.floor(currentState.totalCocadasProduced || 0),
    totalStructures: getTotalStructures(currentState),
    totalUpgrades: getTotalUpgrades(currentState),
    playTime: Math.floor((currentState.totalPlayTimeMs || 0) / 1000),
    cps: getCPS(),
    currentCocadas: Math.floor(currentState.cocadas || 0),
    unlockedAchievements: currentState.achievements?.totalUnlocked || 0,
  };
}

export function addAchievement(achievementDefinition) {
  if (!achievementDefinition?.id || typeof achievementDefinition.condition !== "function") {
    throw new Error("Achievement inválida. Defina id e condition(stateSnapshot)");
  }

  const alreadyExists = runtimeAchievements.some((a) => a.id === achievementDefinition.id);
  if (alreadyExists) {
    return false;
  }

  const newAchievement = {
    unlocked: false,
    hidden: false,
    icon: "achievement.png",
    ...achievementDefinition,
  };

  runtimeAchievements.push(newAchievement);
  runtimeAchievementsById[newAchievement.id] = newAchievement;

  ensureAchievementState();
  if (typeof state.achievements.unlockedById[achievementDefinition.id] !== "boolean") {
    state.achievements.unlockedById[achievementDefinition.id] = false;
  }

  pendingAchievementIds.add(achievementDefinition.id);

  return true;
}

export function setAchievementUnlockedListener(listener) {
  achievementUnlockedListener = listener;
}

export function isAchievementUnlocked(id) {
  ensureAchievementState();
  return Boolean(state.achievements.unlockedById[id]);
}

export function unlockAchievement(id) {
  ensureAchievementState();

  if (isAchievementUnlocked(id)) {
    return null;
  }

  const achievement = runtimeAchievementsById[id];
  if (!achievement) {
    return null;
  }

  state.achievements.unlockedById[id] = true;
  pendingAchievementIds.delete(id);
  if (!state.achievements.unlockedOrder.includes(id)) {
    state.achievements.unlockedOrder.push(id);
  }
  state.achievements.lastUnlockedId = id;
  state.achievements.totalUnlocked = state.achievements.unlockedOrder.length;

  const unlockedAchievement = {
    ...achievement,
    unlocked: true,
  };

  if (typeof achievementUnlockedListener === "function") {
    try {
      achievementUnlockedListener(unlockedAchievement);
    } catch (error) {
      console.error("Erro ao emitir evento de conquista:", error);
    }
  }

  runAchievementHook("unlocked", unlockedAchievement);

  return unlockedAchievement;
}

export function checkAchievements(currentState = state) {
  ensureAchievementState();
  const snapshot = getAchievementSnapshot(currentState);

  let unlockedAny = false;
  const pendingIds = [...pendingAchievementIds];

  for (const achievementId of pendingIds) {
    const achievement = runtimeAchievementsById[achievementId];
    if (!achievement || isAchievementUnlocked(achievement.id)) {
      pendingAchievementIds.delete(achievementId);
      continue;
    }

    try {
      if (achievement.condition(snapshot)) {
        const unlocked = unlockAchievement(achievement.id);
        if (unlocked) {
          unlockedAny = true;
        }
      }
    } catch (error) {
      console.error(`Erro ao verificar conquista ${achievement.id}:`, error);
    }
  }

  runAchievementHook("checked", {
    checkedCount: pendingIds.length,
    unlockedAny,
    totalUnlocked: state.achievements.totalUnlocked,
  });

  return unlockedAny;
}

export function getAchievementsForUI(currentState = state) {
  ensureAchievementState();

  return runtimeAchievements.map((achievement) => {
    const unlocked = isAchievementUnlocked(achievement.id);

    return {
      id: achievement.id,
      category: achievement.category || "geral",
      name: unlocked || !achievement.hidden ? achievement.name : "???",
      description: unlocked || !achievement.hidden ? achievement.description : "Conquista secreta",
      icon: achievement.icon,
      hidden: Boolean(achievement.hidden),
      unlocked,
    };
  });
}
