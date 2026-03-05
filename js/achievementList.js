const AchievementCategory = {
  CLICK: "clique",
  PRODUCTION: "producao",
  STRUCTURES: "estruturas",
  UPGRADES: "upgrades",
  TIME: "tempo",
  SECRET: "secretas",
  ENDGAME: "absurdas",
};

const achievementIcon = (fileName) =>
  new URL(`../assets/achievements/free_pixel_food/${fileName}`, import.meta.url).href;

/**
 * A condition always receives a normalized snapshot (not raw state).
 * This keeps definitions stable even if internal state keys evolve.
 */
export const achievementList = [
  {
    id: "first_click",
    category: AchievementCategory.CLICK,
    name: "Primeira Cocada",
    description: "Clique na cocada pela primeira vez",
    icon: achievementIcon("fruit_apple.png"),
    hidden: false,
    condition: (s) => s.totalClicks >= 1,
  },
  {
    id: "click_100",
    category: AchievementCategory.CLICK,
    name: "Dedos de Açúcar",
    description: "Clique 100 vezes",
    icon: achievementIcon("fruit_orange_slice.png"),
    hidden: false,
    condition: (s) => s.totalClicks >= 100,
  },
  {
    id: "click_10000",
    category: AchievementCategory.SECRET,
    name: "Maníaco da Cocada",
    description: "Clique 10.000 vezes",
    icon: achievementIcon("fruit_watermelon_slice.png"),
    hidden: true,
    condition: (s) => s.totalClicks >= 10000,
  },

  {
    id: "bake_1000",
    category: AchievementCategory.PRODUCTION,
    name: "Primeira Produção",
    description: "Produza 1.000 cocadas",
    icon: achievementIcon("pastry_bread.png"),
    hidden: false,
    condition: (s) => s.totalCocadas >= 1000,
  },
  {
    id: "bake_100000",
    category: AchievementCategory.PRODUCTION,
    name: "Caldeirão Infinito",
    description: "Produza 100.000 cocadas",
    icon: achievementIcon("pastry_croissant.png"),
    hidden: false,
    condition: (s) => s.totalCocadas >= 100000,
  },
  {
    id: "reach_100_cps",
    category: AchievementCategory.PRODUCTION,
    name: "Linha de Montagem",
    description: "Alcance 100 CPS",
    icon: achievementIcon("coffee_espresso.png"),
    hidden: false,
    condition: (s) => s.cps >= 100,
  },

  {
    id: "buy_10_structures",
    category: AchievementCategory.STRUCTURES,
    name: "Pequena Fábrica",
    description: "Tenha 10 estruturas",
    icon: achievementIcon("vegetable_carrot.png"),
    hidden: false,
    condition: (s) => s.totalStructures >= 10,
  },
  {
    id: "buy_100_structures",
    category: AchievementCategory.STRUCTURES,
    name: "Cidade da Cocada",
    description: "Tenha 100 estruturas",
    icon: achievementIcon("vegetable_pumpkin.png"),
    hidden: false,
    condition: (s) => s.totalStructures >= 100,
  },

  {
    id: "buy_10_upgrades",
    category: AchievementCategory.UPGRADES,
    name: "Livro de Receitas",
    description: "Compre 10 upgrades",
    icon: achievementIcon("cheese_mozzarella.png"),
    hidden: false,
    condition: (s) => s.totalUpgrades >= 10,
  },

  {
    id: "play_1_hour",
    category: AchievementCategory.TIME,
    name: "Viciado em Cocada",
    description: "Jogue por 1 hora",
    icon: achievementIcon("coffee_mocha.png"),
    hidden: false,
    condition: (s) => s.playTime >= 3600,
  },

  {
    id: "millionaire",
    category: AchievementCategory.ENDGAME,
    name: "Império Açucarado",
    description: "Acumule 1.000.000 cocadas no bolso",
    icon: achievementIcon("cake_chocolate.png"),
    hidden: false,
    condition: (s) => s.currentCocadas >= 1000000,
  },
  {
    id: "bake_10m",
    category: AchievementCategory.ENDGAME,
    name: "Era da Cocada",
    description: "Produza 10.000.000 cocadas no total",
    icon: achievementIcon("cake_redvelvet.png"),
    hidden: false,
    condition: (s) => s.totalCocadas >= 10000000,
  },
];

export { AchievementCategory };
