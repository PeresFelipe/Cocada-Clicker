import { defs, lootboxRarities, lootboxRewardTemplates } from "../defs.js";

/**
 * Seleciona uma estrutura lootbox-only ainda nao desbloqueada
 */
function getRandomLootboxBuilding(state) {
  const lootboxBuildings = Object.entries(defs.buildings)
    .filter(([, def]) => def?.lootboxOnly)
    .map(([key]) => key);

  const available = lootboxBuildings.filter((key) => !state.buildings[key]?.lootboxUnlocked);
  if (available.length === 0) return null;

  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Seleciona um upgrade lootbox-only ainda nao comprado
 */
function getRandomLootboxUpgrade(state) {
  const lootboxUpgrades = Object.entries(defs.upgrades)
    .filter(([, def]) => def?.lootboxOnly)
    .map(([key]) => key);

  const available = lootboxUpgrades.filter((key) => !state.upgrades[key]?.bought);
  if (available.length === 0) return null;

  return available[Math.floor(Math.random() * available.length)];
}

// ============= RARITY SYSTEM =============

/**
 * Seleciona uma raridade baseada em weights e pity counter crescente
 * Quanto mais lootboxes sem raro, maior a chance de conseguir raridade alta
 */
export function selectRarity(pityCounter = 0) {
  // Aumenta chances de raridade alta conforme pity cresce
  const pityBoost = Math.min(pityCounter * 0.01, 0.5); // Máximo 50% boost após 50 aberturas

  const rarityEntries = Object.values(lootboxRarities);
  const adjustedWeights = rarityEntries.map((rarity) => {
    if (rarity.tier <= 2) {
      // Common/Uncommon: diminui com pity
      return Math.max(rarity.weight - pityBoost * 0.3, 0.01);
    } else {
      // Rare+: aumenta com pity
      return rarity.weight + pityBoost;
    }
  });

  // Normaliza pesos para somar 1
  const totalWeight = adjustedWeights.reduce((a, b) => a + b, 0);
  const normalizedWeights = adjustedWeights.map((w) => w / totalWeight);

  // Sorteia baseado em weights
  const random = Math.random();
  let accumulated = 0;

  for (let i = 0; i < rarityEntries.length; i++) {
    accumulated += normalizedWeights[i];
    if (random <= accumulated) {
      return rarityEntries[i];
    }
  }

  // Fallback (nunca deveria acontecer)
  return rarityEntries[0];
}

// ============= REWARD GENERATION =============

/**
 * Mapeia nível do jogador para tier de recompensa (1-3)
 * Tier 1: Níveis 1-20
 * Tier 2: Níveis 21-40
 * Tier 3: Níveis 41-50
 */
function getLevelTier(playerLevel) {
  if (playerLevel <= 20) return "tier1";
  if (playerLevel <= 40) return "tier2";
  return "tier3";
}

/**
 * Gera uma recompensa baseada em raridade e nível do jogador
 * Retorna objeto: { type, ...reward_specific_fields }
 */
export function generateReward(rarityId, playerLevel) {
  const templates = lootboxRewardTemplates[rarityId];
  if (!templates) return { type: "cocadas", amount: 10 }; // Fallback

  const tier = getLevelTier(playerLevel);
  const tierTemplates = templates[tier] || templates.tier1;

  // Seleciona um template aleatório com pesos
  const totalWeight = tierTemplates.reduce((acc, template) => acc + (template.weight || 0.1), 0);
  const random = Math.random() * totalWeight;
  let accumulated = 0;

  for (const template of tierTemplates) {
    accumulated += template.weight || 0.1;
    if (random <= accumulated) {
      return generateRewardFromTemplate(template);
    }
  }

  return generateRewardFromTemplate(tierTemplates[0]);
}

/**
 * Converte template em recompensa final com valores aleatórios
 */
function generateRewardFromTemplate(template) {
  const reward = { ...template };
  delete reward.weight; // Remove weight do template

  if (template.type === "cocadas" && template.min && template.max) {
    reward.amount = Math.floor(Math.random() * (template.max - template.min + 1) + template.min);
  }

  if (template.type === "xp" && template.min && template.max) {
    reward.amount = Math.floor(Math.random() * (template.max - template.min + 1) + template.min);
  }

  return reward;
}

// ============= LOOTBOX STATE MANAGEMENT =============

/**
 * Incrementa pity counter quando não consegue raro
 * Reseta quando consegue raro+ (tier 3+)
 */
export function updatePityCounter(rarityTier, currentPity) {
  if (rarityTier >= 3) {
    return 0; // Reseta ao conseguir raro+
  }
  return currentPity + 1; // Incrementa para comum/incomum
}

/**
 * Calcula tempo até próximo lootbox gratuito
 */
export function getFreeLootboxCooldown() {
  return 6 * 60 * 60 * 1000; // 6 horas em ms
}

/**
 * Verifica se jogador pode abrir lootbox grátis no momento
 */
export function canOpenFreeLootbox(lastFreeTime) {
  if (!lastFreeTime) return true; // Primeira abertura sempre grátis
  const now = Date.now();
  const cooldown = getFreeLootboxCooldown();
  return now - lastFreeTime >= cooldown;
}

/**
 * Formata tempo restante para próximo lootbox grátis
 */
export function formatLootboxCooldown(lastFreeTime) {
  if (!lastFreeTime) return "Disponível agora!";

  const now = Date.now();
  const cooldown = getFreeLootboxCooldown();
  const timeLeft = lastFreeTime + cooldown - now;

  if (timeLeft <= 0) return "Disponível agora!";

  const hours = Math.floor(timeLeft / (60 * 60 * 1000));
  const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// ============= REWARD APPLICATION =============

/**
 * Aplica uma recompensa ao state do jogador
 * Retorna summary da recompensa para feedback visual
 */
export function applyReward(state, reward) {
  const summary = {
    type: reward.type,
    display: "",
  };

  switch (reward.type) {
    case "cocadas":
      state.cocadas += reward.amount;
      state.maxCocadasSeen = Math.max(state.maxCocadasSeen, state.cocadas);
      summary.display = `+${Math.floor(reward.amount)} Cocadas`;
      break;

    case "xp":
      // addXp será chamado externamente
      summary.display = `+${Math.floor(reward.amount)} XP`;
      summary.xpAmount = reward.amount;
      break;

    case "cps_boost":
      state.temporaryBoosts = state.temporaryBoosts || {};
      state.temporaryBoosts.cpsMult = reward.multiplier;
      state.temporaryBoosts.cpsDuration = reward.durationSeconds * 1000;
      state.temporaryBoosts.cpsStartTime = Date.now();
      summary.display = `${Math.round((reward.multiplier - 1) * 100)}% CPS por ${reward.durationSeconds}s`;
      break;

    case "click_boost":
      state.temporaryBoosts = state.temporaryBoosts || {};
      state.temporaryBoosts.clickMult = reward.multiplier;
      state.temporaryBoosts.clickDuration = reward.durationSeconds * 1000;
      state.temporaryBoosts.clickStartTime = Date.now();
      summary.display = `${Math.round((reward.multiplier - 1) * 100)}% Clique por ${reward.durationSeconds}s`;
      break;

    case "tropical_sun":
      state.temporaryBoosts = state.temporaryBoosts || {};
      state.temporaryBoosts.tropicalSun = reward.multiplier;
      state.temporaryBoosts.tropicalDuration = reward.durationSeconds * 1000;
      state.temporaryBoosts.tropicalStartTime = Date.now();
      summary.display = `☀️ Produção ${Math.round(reward.multiplier)}x por ${Math.round(reward.durationSeconds / 60)}m`;
      break;

    case "rain_of_coco":
      state.temporaryBoosts = state.temporaryBoosts || {};
      state.temporaryBoosts.rainOfCoco = reward.cocadaPerSecond;
      state.temporaryBoosts.rainDuration = reward.durationSeconds * 1000;
      state.temporaryBoosts.rainStartTime = Date.now();
      summary.display = `🌧️ ${reward.cocadaPerSecond} cocadas/s por ${reward.durationSeconds}s`;
      break;

    case "coastal_breeze":
      state.temporaryBoosts = state.temporaryBoosts || {};
      state.temporaryBoosts.coastalBreeze = true;
      state.temporaryBoosts.breezeDuration = reward.durationSeconds * 1000;
      state.temporaryBoosts.breezeStartTime = Date.now();
      summary.display = `🌬️ Cooldowns reduzidos por ${Math.round(reward.durationSeconds / 60)}m`;
      break;

    case "premium_sugar":
      state.temporaryBoosts = state.temporaryBoosts || {};
      state.temporaryBoosts.premiumSugar = reward.globalMultiplier;
      state.temporaryBoosts.sugarDuration = reward.durationSeconds * 1000;
      state.temporaryBoosts.sugarStartTime = Date.now();
      summary.display = `🍬 Global +${Math.round((reward.globalMultiplier - 1) * 100)}% por ${Math.round(reward.durationSeconds / 60)}m`;
      break;

    case "cps_permanent":
      state.permanentBoosts = state.permanentBoosts || {};
      state.permanentBoosts.cpsMult = (state.permanentBoosts.cpsMult || 1) * reward.multiplier;
      summary.display = `⭐ CPS permanentemente +${Math.round((reward.multiplier - 1) * 100)}%`;
      break;

    case "building_discount":
      summary.display = `🏪 Construções -${reward.discountPercent * 100}% por ${reward.durationSeconds}s`;
      break;

    case "upgrade_discount":
      summary.display = `📜 Upgrades -${reward.discountPercent * 100}% por ${reward.durationSeconds}s`;
      break;

    case "skin":
      state.unlockedSkins = state.unlockedSkins || [];
      state.unlockedSkins.push(`${reward.theme}_${Date.now()}`);
      summary.display = `🎨 Nova Skin: ${reward.theme}`;
      break;

    case "decoration":
      state.decorations = state.decorations || [];
      state.decorations.push(`${reward.theme}_${Date.now()}`);
      summary.display = `🏝️ Nova Decoração: ${reward.theme}`;
      break;

    case "mascot":
      state.mascots = state.mascots || [];
      state.mascots.push(`${reward.theme}_${Date.now()}`);
      summary.display = `🐔 Novo Mascote: ${reward.theme}`;
      break;

    case "random_building": {
      const buildingKey = getRandomLootboxBuilding(state);

      if (!buildingKey) {
        const fallbackAmount = 12000;
        state.cocadas += fallbackAmount;
        state.maxCocadasSeen = Math.max(state.maxCocadasSeen, state.cocadas);
        summary.display = `💰 Lootbox Premium: +${fallbackAmount} Cocadas`;
        break;
      }

      const buildingDef = defs.buildings[buildingKey];
      state.buildings[buildingKey].owned = Math.max(state.buildings[buildingKey].owned || 0, 1);
      state.buildings[buildingKey].lootboxUnlocked = true;
      summary.display = `🏗️ Estrutura Lootbox: ${buildingDef.name}`;
      summary.buildingKey = buildingKey;
      break;
    }

    case "random_upgrade": {
      const upgradeKey = getRandomLootboxUpgrade(state);

      if (!upgradeKey) {
        const fallbackAmount = 6000;
        state.cocadas += fallbackAmount;
        state.maxCocadasSeen = Math.max(state.maxCocadasSeen, state.cocadas);
        summary.display = `💰 Lootbox Premium: +${fallbackAmount} Cocadas`;
        break;
      }

      const upgradeDef = defs.upgrades[upgradeKey];
      state.upgrades[upgradeKey].bought = true;
      state.upgrades[upgradeKey].lootboxUnlocked = true;
      summary.display = `⭐ Upgrade Lootbox: ${upgradeDef.name}`;
      summary.upgradeKey = upgradeKey;
      break;
    }

    default:
      summary.display = "Recompensa desconhecida";
  }

  return summary;
}

/**
 * Calcula boosts temporários ativos
 */
export function getActiveBoosts(state) {
  const boosts = {
    cpsMult: 1,
    clickMult: 1,
    globalMult: 1,
  };

  if (!state.temporaryBoosts) return boosts;

  const now = Date.now();

  // CPS Boost
  if (state.temporaryBoosts.cpsMult && state.temporaryBoosts.cpsStartTime) {
    if (now - state.temporaryBoosts.cpsStartTime < state.temporaryBoosts.cpsDuration) {
      boosts.cpsMult *= state.temporaryBoosts.cpsMult;
    }
  }

  // Click Boost
  if (state.temporaryBoosts.clickMult && state.temporaryBoosts.clickStartTime) {
    if (now - state.temporaryBoosts.clickStartTime < state.temporaryBoosts.clickDuration) {
      boosts.clickMult *= state.temporaryBoosts.clickMult;
    }
  }

  // Tropical Sun (aplica em ambos)
  if (state.temporaryBoosts.tropicalSun && state.temporaryBoosts.tropicalStartTime) {
    if (now - state.temporaryBoosts.tropicalStartTime < state.temporaryBoosts.tropicalDuration) {
      boosts.cpsMult *= state.temporaryBoosts.tropicalSun;
      boosts.globalMult *= state.temporaryBoosts.tropicalSun;
    }
  }

  // Premium Sugar (global)
  if (state.temporaryBoosts.premiumSugar && state.temporaryBoosts.sugarStartTime) {
    if (now - state.temporaryBoosts.sugarStartTime < state.temporaryBoosts.sugarDuration) {
      boosts.globalMult *= state.temporaryBoosts.premiumSugar;
    }
  }

  return boosts;
}
