import { defs } from "./defs.js";

function createInitialBuildingsState() {
  const buildingsState = {};

  for (const key in defs.buildings) {
    const def = defs.buildings[key];
    const entry = {
      owned: 0,
      produced: 0,
    };

    if (def?.lootboxOnly) {
      entry.lootboxUnlocked = false;
    }

    buildingsState[key] = entry;
  }

  return buildingsState;
}

function createInitialUpgradesState() {
  const upgradesState = {};

  for (const key in defs.upgrades) {
    const def = defs.upgrades[key];
    const entry = {
      bought: false,
    };

    if (def?.lootboxOnly) {
      entry.lootboxUnlocked = false;
    }

    upgradesState[key] = entry;
  }

  return upgradesState;
}

export const state = {
  sessionStartedAt: Date.now(),
  totalPlayTimeMs: 0,
  lastSaveAt: null,

  flavor: null,
  flavorLocked: false,
  contentSeed: "",
  cocadas: 0,
  maxCocadasSeen: 0,
  totalCocadasProduced: 0,
  cocadasSpent: 0,
  cocadasFromClicks: 0,
  cocadasFromAuto: 0,
  highestCps: 0,
  biggestClickGain: 0,

  minuteProductionStartedAt: Date.now(),
  minuteProductionBuffer: 0,
  bestMinuteProduction: 0,

  lastInteractionAt: Date.now(),

  cocadaBuffer: 0,
  perClickBase: 1,
  multiplier: 1,

  clickMult: 1,
  cpsMult: 1,
  buildCostMult: 1,
  upgradeCostMult: 1,

  buildings: createInitialBuildingsState(),
  upgrades: createInitialUpgradesState(),

  // Sistema de Nível
  level: 1,
  xp: 0,
  maxLevel: 50,

  // Sistema de Lootbox
  lootboxCount: 1, // Quantidade de lootboxes disponíveis
  lootboxOpened: 0, // Total de lootboxes abertos (histórico)
  lastFreeLootboxTime: null, // Timestamp do último lootbox grátis
  lootboxPityCounter: 0, // Contador para pity system
  temporaryBoosts: {}, // Boosts temporários ativos
  permanentBoosts: {}, // Boosts permanentes
  unlockedSkins: [], // Skins desbloqueadas
  decorations: [], // Decorações desbloqueadas
  mascots: [], // Mascotes desbloqueados

  // Contadores para ganho de lootbox
  clicksCount: 0, // Total de cliques manuais
  buildsCount: 0, // Total de compras de estruturas
  upgradesCount: 0, // Total de compras de upgrades
  randomLootboxVisible: false, // Há um coco aleatório visível?

  // Sistema de conquistas
  achievements: {
    unlockedById: {},
    unlockedOrder: [],
    lastUnlockedId: null,
    totalUnlocked: 0,
  },

  lastTick: Date.now(),
};
