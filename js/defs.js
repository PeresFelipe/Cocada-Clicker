const BUILDING_ICON_PATH = "assets/buildings/ghostpixxells/01_dish.png";
const UPGRADE_ICON_PATH = "pixel_mart/sugar.png";

const CURATED_BUILDING_ICONS = {
  barraca_inicial: "01_dish.png",
  ambulante: "07_bread.png",
  cozinha: "04_bowl.png",
  fabrica: "65_loafbread.png",
  quiosque_orla: "08_bread_dish.png",
  cozinha_industrial: "61_jam.png",
  usina_de_coco: "62_jam_dish.png",
  doceria_artesanal: "28_cookies.png",
  galpao_logistico: "29_cookies_dish.png",
  franquia_litoranea: "79_pancakes.png",
  centro_de_distribuicao: "80_pancakes_dish.png",
  complexo_cocadeiro: "83_popcorn.png",
  exportadora_tropical: "101_waffle.png",
  imperio_da_cocada: "102_waffle_dish.png",
  trufa_ambulante: "26_chocolate.png",
  tacho_cacau: "27_chocolate_dish.png",
  atelier_trufas: "22_cheesecake.png",
  quiosque_cacau: "23_cheesecake_dish.png",
  cozinha_temperada: "30_chocolatecake.png",
  torre_chocolate: "31_chocolatecake_dish.png",
  doceria_fondant: "34_donut.png",
  entreposto_cacau: "35_donut_dish.png",
  franquia_trufada: "90_strawberrycake.png",
  centro_fondue: "91_strawberrycake_dish.png",
  polo_chocolatier: "50_giantgummybear.png",
  exportadora_cacau: "51_giantgummybear_dish.png",
  imperio_chocolate: "30_chocolatecake.png",
  leiteiro_ambulante: "75_pudding.png",
  panelao_leite: "76_pudding_dish.png",
  fabrica_compota: "63_lemonpie.png",
  quiosque_sertao: "64_lemonpie_dish.png",
  cozinha_caldada: "42_eggtart.png",
  usina_lactea: "43_eggtart_dish.png",
  doceria_caseira: "46_fruitcake.png",
  galpao_compotas: "47_fruitcake_dish.png",
  franquia_mineira: "57_icecream.png",
  centro_laticinio: "58_icecream_bowl.png",
  complexo_serrano: "60_jelly_dish.png",
  exportadora_lactea: "53_gingerbreadman_dish.png",
  imperio_doce_leite: "05_apple_pie.png",
  templo_da_cocada_dourada: "97_sushi.png",
  usina_astral_do_coco: "85_roastedchicken.png",
};

const CURATED_UPGRADE_ICONS = {
  vantagem_da_casa: "receipt.png",
  leite_de_coco_cremoso: "milk_pack.png",
  brisa_do_litoral: "water.png",
  colher_de_pau_bem_temperada: "spatula_p.png",
  segredo_da_baiana: "banana.png",
  forno_de_areia_quente: "cooking_oil.png",
  coco_ralado_na_hora: "sugar.png",
  panelao_do_sao_joao: "teakettle.png",
  sombra_do_coqueiral: "green_grape.png",
  puxada_de_rede_coletiva: "basket_metal.png",
  sol_de_meio_dia: "orange_juice.png",
  cacau_premium: "milk_chocolate.png",
  aroma_intenso: "coffee_bag.png",
  espatula_temperada: "spatula.png",
  segredo_chocolatier: "candy_bar.png",
  banho_maria_continuo: "hot_cocoa_mix.png",
  recheio_cremoso: "peanut_butter.png",
  derretedeira_profissional: "cookies.png",
  noite_do_fondue: "strawberry_ice_cream.png",
  cooperativa_cacau: "credit_card_2.png",
  fogo_de_confeitaria: "energy_bar.png",
  nata_fresca: "plain_yogurt.png",
  aroma_de_fazenda: "milk_bottle.png",
  colher_de_cobre: "whisk.png",
  segredo_da_vovo: "butter.png",
  fogao_a_lenha: "kitchen_knife_set.png",
  leite_reduzido: "milk_gallon.png",
  caldeirao_ferro: "white_cheese_piece.png",
  festa_da_colheita: "strawberry_jam.png",
  rota_lactea_local: "milk_plastic.png",
  ponto_de_caramelo: "vanilla_or_lemon_ice_cream.png",
  legado_do_coco_primordial: "credit_card_3.png",
  tempestade_dourada: "light_bulb_box.png",
};

function buildingDef(flavor, name, desc, baseCost, cps, costGrowth) {
  return {
    flavor,
    name,
    desc,
    baseCost,
    cps,
    costGrowth,
    icon: BUILDING_ICON_PATH,
    img: BUILDING_ICON_PATH,
    tooltipIcon: BUILDING_ICON_PATH,
  };
}

function upgradeDef(flavor, config) {
  return {
    flavor,
    icon: UPGRADE_ICON_PATH,
    ...config,
  };
}

export const defs = {
  buildings: {
    barraca_inicial: buildingDef(
      "base",
      "Barraca Inicial",
      "Estrutura simples para começar a vender cocadas sem sabor.",
      8,
      0.16,
      1.14,
    ),

    ambulante: buildingDef(
      "coco",
      "Vendedor Ambulante",
      "Um vendedor na praia vendendo cocadas.",
      5,
      0.12,
      1.15,
    ),
    cozinha: buildingDef(
      "coco",
      "Cozinha Caseira",
      "Produz cocadas automaticamente.",
      18,
      0.35,
      1.16,
    ),
    fabrica: buildingDef("coco", "Fábrica de Cocada", "Produção em massa!", 130, 2.6, 1.17),
    quiosque_orla: buildingDef(
      "coco",
      "Quiosque da Orla",
      "Estrutura fixa com produção estável e constante.",
      560,
      9.5,
      1.18,
    ),
    cozinha_industrial: buildingDef(
      "coco",
      "Cozinha Industrial",
      "Panelaço profissional para lotes maiores de cocada.",
      1200,
      18,
      1.19,
    ),
    usina_de_coco: buildingDef(
      "coco",
      "Usina de Coco",
      "Refina coco em escala para aumentar o rendimento.",
      2400,
      33,
      1.2,
    ),
    doceria_artesanal: buildingDef(
      "coco",
      "Doceria Artesanal",
      "Equipe especializada em receita premium.",
      4600,
      58,
      1.21,
    ),
    galpao_logistico: buildingDef(
      "coco",
      "Galpão Logístico",
      "Distribuição otimizada para vender sem pausa.",
      8600,
      100,
      1.22,
    ),
    franquia_litoranea: buildingDef(
      "coco",
      "Franquia Litorânea",
      "Expansão por toda a costa para produção acelerada.",
      15500,
      168,
      1.23,
    ),
    centro_de_distribuicao: buildingDef(
      "coco",
      "Centro de Distribuição",
      "Coordena lotes gigantes para abastecer o mercado.",
      28000,
      280,
      1.24,
    ),
    complexo_cocadeiro: buildingDef(
      "coco",
      "Complexo Cocadeiro",
      "Múltiplas linhas de produção operando em paralelo.",
      50000,
      460,
      1.245,
    ),
    exportadora_tropical: buildingDef(
      "coco",
      "Exportadora Tropical",
      "Leva cocadas para fora do litoral em grande volume.",
      90000,
      760,
      1.25,
    ),
    imperio_da_cocada: buildingDef(
      "coco",
      "Império da Cocada",
      "Domina a produção nacional com escala colossal.",
      160000,
      1240,
      1.255,
    ),

    trufa_ambulante: buildingDef(
      "chocolate",
      "Trufeiro Ambulante",
      "Vende trufas de chocolate no calçadão.",
      6,
      0.13,
      1.15,
    ),
    tacho_cacau: buildingDef(
      "chocolate",
      "Tacho de Cacau",
      "Preparo artesanal com cacau intenso.",
      20,
      0.38,
      1.16,
    ),
    atelier_trufas: buildingDef(
      "chocolate",
      "Ateliê de Trufas",
      "Linha fina de doces para alto giro.",
      145,
      2.8,
      1.17,
    ),
    quiosque_cacau: buildingDef(
      "chocolate",
      "Quiosque Cacau Nobre",
      "Ponto premium para venda constante.",
      600,
      10.1,
      1.18,
    ),
    cozinha_temperada: buildingDef(
      "chocolate",
      "Cozinha Temperada",
      "Controle de temperatura para lotes perfeitos.",
      1280,
      19.4,
      1.19,
    ),
    torre_chocolate: buildingDef(
      "chocolate",
      "Torre de Chocolate",
      "Derretimento contínuo para mais produção.",
      2550,
      35.5,
      1.2,
    ),
    doceria_fondant: buildingDef(
      "chocolate",
      "Doceria Fondant",
      "Especialista em sobremesas de chocolate.",
      4900,
      62,
      1.21,
    ),
    entreposto_cacau: buildingDef(
      "chocolate",
      "Entreposto de Cacau",
      "Centraliza insumos e distribuição local.",
      9100,
      106,
      1.22,
    ),
    franquia_trufada: buildingDef(
      "chocolate",
      "Franquia Trufada",
      "Multiplica pontos de venda da marca.",
      16400,
      177,
      1.23,
    ),
    centro_fondue: buildingDef(
      "chocolate",
      "Centro de Fondue",
      "Operação ampla com alto rendimento.",
      29600,
      295,
      1.24,
    ),
    polo_chocolatier: buildingDef(
      "chocolate",
      "Polo Chocolatier",
      "Complexo produtivo especializado em cacau.",
      52800,
      484,
      1.245,
    ),
    exportadora_cacau: buildingDef(
      "chocolate",
      "Exportadora de Cacau",
      "Escala internacional de doces premium.",
      94800,
      800,
      1.25,
    ),
    imperio_chocolate: buildingDef(
      "chocolate",
      "Império do Chocolate",
      "Rede nacional de produção e venda.",
      168000,
      1300,
      1.255,
    ),

    leiteiro_ambulante: buildingDef(
      "doce",
      "Leiteiro Ambulante",
      "Vende doces de leite frescos na praia.",
      6,
      0.125,
      1.15,
    ),
    panelao_leite: buildingDef(
      "doce",
      "Panelão de Leite",
      "Cozimento lento para sabor encorpado.",
      19,
      0.36,
      1.16,
    ),
    fabrica_compota: buildingDef(
      "doce",
      "Fábrica de Compota",
      "Produção contínua de doce cremoso.",
      140,
      2.7,
      1.17,
    ),
    quiosque_sertao: buildingDef(
      "doce",
      "Quiosque do Sertão",
      "Receitas tradicionais com alta procura.",
      590,
      9.8,
      1.18,
    ),
    cozinha_caldada: buildingDef(
      "doce",
      "Cozinha Caldeada",
      "Lotes maiores com ponto uniforme.",
      1240,
      18.7,
      1.19,
    ),
    usina_lactea: buildingDef(
      "doce",
      "Usina Láctea",
      "Refino do leite para produção acelerada.",
      2480,
      34.2,
      1.2,
    ),
    doceria_caseira: buildingDef(
      "doce",
      "Doceria Caseira",
      "Receitas familiares em escala comercial.",
      4760,
      60,
      1.21,
    ),
    galpao_compotas: buildingDef(
      "doce",
      "Galpão de Compotas",
      "Distribuição robusta para varejo.",
      8840,
      103,
      1.22,
    ),
    franquia_mineira: buildingDef(
      "doce",
      "Franquia Mineira",
      "Rede de lojas dedicada ao doce de leite.",
      15900,
      172,
      1.23,
    ),
    centro_laticinio: buildingDef(
      "doce",
      "Centro Laticínio",
      "Operação integrada de produção e despacho.",
      28700,
      288,
      1.24,
    ),
    complexo_serrano: buildingDef(
      "doce",
      "Complexo Serrano",
      "Múltiplas linhas de doce premium.",
      51400,
      472,
      1.245,
    ),
    exportadora_lactea: buildingDef(
      "doce",
      "Exportadora Láctea",
      "Envio em massa para novos mercados.",
      92400,
      780,
      1.25,
    ),
    imperio_doce_leite: buildingDef(
      "doce",
      "Império do Doce de Leite",
      "Domina a produção nacional de doces lácteos.",
      164000,
      1270,
      1.255,
    ),

    templo_da_cocada_dourada: {
      ...buildingDef(
        "base",
        "Templo da Cocada Dourada",
        "Recompensa lendária do Coco Surpresa. Produz um fluxo absurdo de cocadas.",
        0,
        5200,
        1,
      ),
      lootboxOnly: true,
      lootboxTag: "Coco Surpresa",
    },
    usina_astral_do_coco: {
      ...buildingDef(
        "base",
        "Usina Astral do Coco",
        "Estrutura mística que converte energia solar direto em cocadas.",
        0,
        12000,
        1,
      ),
      lootboxOnly: true,
      lootboxTag: "Coco Surpresa",
    },
  },

  upgrades: {
    vantagem_da_casa: upgradeDef("base", {
      name: "Vantagem da Casa",
      desc: "Um empurrão inicial do boteco para começar sem sabor.",
      effect: "Aumenta o CPS global em 1.15x.",
      type: "globalCPSMultiplier",
      value: 1.15,
      baseCost: 40,
    }),

    leite_de_coco_cremoso: upgradeDef("coco", {
      name: "Leite de Coco Cremoso",
      desc: "Uma colherada encorpada que deixa cada batida mais doce.",
      effect: "Multiplica o ganho por clique em 1.35x.",
      type: "clickMultiplier",
      value: 1.35,
      baseCost: 60,
    }),
    brisa_do_litoral: upgradeDef("coco", {
      name: "Brisa do Litoral",
      desc: "Vento de praia que espalha aroma de cocada por toda a barraca.",
      effect: "Aumenta o CPS global em 1.18x.",
      type: "globalCPSMultiplier",
      value: 1.18,
      baseCost: 95,
    }),
    colher_de_pau_bem_temperada: upgradeDef("coco", {
      name: "Colher de Pau Bem Temperada",
      desc: "Ferramenta de guerra da cozinha nordestina.",
      effect: "Adiciona +1 cocada fixa por clique.",
      type: "perClickBonus",
      value: 1,
      baseCost: 140,
    }),
    segredo_da_baiana: upgradeDef("coco", {
      name: "Segredo da Baiana",
      desc: "Receita passada no ouvido, com sorriso e segredo de feira.",
      effect: "Multiplica o CPS de Vendedor Ambulante em 1.75x.",
      type: "buildingMultiplier",
      target: "ambulante",
      value: 1.75,
      baseCost: 220,
    }),
    forno_de_areia_quente: upgradeDef("coco", {
      name: "Forno de Areia Quente",
      desc: "Calor de meio-dia que acelera o ponto do doce.",
      effect: "Reduz em 8% o custo de compra de Cozinha Caseira.",
      type: "buildingCostReduction",
      target: "cozinha",
      value: 0.08,
      baseCost: 320,
    }),
    coco_ralado_na_hora: upgradeDef("coco", {
      name: "Coco Ralado na Hora",
      desc: "Fresco, úmido e irresistível, direto da praia para a panela.",
      effect: "Adiciona +2 cocadas fixas por clique.",
      type: "perClickBonus",
      value: 2,
      baseCost: 460,
    }),
    panelao_do_sao_joao: upgradeDef("coco", {
      name: "Panelão do São João",
      desc: "Festa grande, fogo alto e produção sem parar.",
      effect: "Multiplica o CPS de Fábrica de Cocada em 1.6x.",
      type: "buildingMultiplier",
      target: "fabrica",
      value: 1.6,
      baseCost: 700,
    }),
    sombra_do_coqueiral: upgradeDef("coco", {
      name: "Sombra do Coqueiral",
      desc: "Quando a brisa bate, a equipe rende dobrado.",
      effect: "Se tiver 12 Ambulantes e 8 Cozinhas, aumenta o CPS global em +22%.",
      type: "synergyBonus",
      synergyType: "globalCPSMultiplier",
      value: 1.22,
      condition: {
        buildings: {
          ambulante: 12,
          cozinha: 8,
        },
      },
      baseCost: 1050,
    }),
    puxada_de_rede_coletiva: upgradeDef("coco", {
      name: "Puxada de Rede Coletiva",
      desc: "Todo mundo ajuda, todo mundo vende mais.",
      effect: "Reduz em 9% o custo de compra de todas as construções.",
      type: "buildingCostReduction",
      target: "all",
      value: 0.09,
      baseCost: 1550,
    }),
    sol_de_meio_dia: upgradeDef("coco", {
      name: "Sol de Meio-Dia",
      desc: "No auge do calor, cada mexida vale por duas.",
      effect: "Multiplica o ganho por clique em 1.8x.",
      type: "clickMultiplier",
      value: 1.8,
      baseCost: 2300,
    }),

    cacau_premium: upgradeDef("chocolate", {
      name: "Cacau Premium",
      desc: "Grãos selecionados elevam o rendimento de cada batida.",
      effect: "Multiplica o ganho por clique em 1.32x.",
      type: "clickMultiplier",
      value: 1.32,
      baseCost: 65,
    }),
    aroma_intenso: upgradeDef("chocolate", {
      name: "Aroma Intenso",
      desc: "O cheiro de chocolate atrai mais clientes para a produção.",
      effect: "Aumenta o CPS global em 1.17x.",
      type: "globalCPSMultiplier",
      value: 1.17,
      baseCost: 105,
    }),
    espatula_temperada: upgradeDef("chocolate", {
      name: "Espátula Temperada",
      desc: "Mistura mais rápida para ganhar produção manual.",
      effect: "Adiciona +1 cocada fixa por clique.",
      type: "perClickBonus",
      value: 1,
      baseCost: 150,
    }),
    segredo_chocolatier: upgradeDef("chocolate", {
      name: "Segredo Chocolatier",
      desc: "Técnica clássica das trufarias de elite.",
      effect: "Multiplica o CPS de Trufeiro Ambulante em 1.75x.",
      type: "buildingMultiplier",
      target: "trufa_ambulante",
      value: 1.75,
      baseCost: 235,
    }),
    banho_maria_continuo: upgradeDef("chocolate", {
      name: "Banho-Maria Contínuo",
      desc: "Temperatura estável para reduzir perdas no preparo.",
      effect: "Reduz em 8% o custo de compra de Tacho de Cacau.",
      type: "buildingCostReduction",
      target: "tacho_cacau",
      value: 0.08,
      baseCost: 340,
    }),
    recheio_cremoso: upgradeDef("chocolate", {
      name: "Recheio Cremoso",
      desc: "Mais consistência, mais valor por clique.",
      effect: "Adiciona +2 cocadas fixas por clique.",
      type: "perClickBonus",
      value: 2,
      baseCost: 490,
    }),
    derretedeira_profissional: upgradeDef("chocolate", {
      name: "Derretedeira Profissional",
      desc: "Fluxo contínuo de chocolate sem gargalo.",
      effect: "Multiplica o CPS de Ateliê de Trufas em 1.6x.",
      type: "buildingMultiplier",
      target: "atelier_trufas",
      value: 1.6,
      baseCost: 740,
    }),
    noite_do_fondue: upgradeDef("chocolate", {
      name: "Noite do Fondue",
      desc: "Evento sazonal que dispara a procura por chocolate.",
      effect: "Se tiver 12 Trufeiros e 8 Tachos, aumenta o CPS global em +22%.",
      type: "synergyBonus",
      synergyType: "globalCPSMultiplier",
      value: 1.22,
      condition: {
        buildings: {
          trufa_ambulante: 12,
          tacho_cacau: 8,
        },
      },
      baseCost: 1100,
    }),
    cooperativa_cacau: upgradeDef("chocolate", {
      name: "Cooperativa do Cacau",
      desc: "Compra coletiva reduz custo de insumos.",
      effect: "Reduz em 9% o custo de compra de todas as construções.",
      type: "buildingCostReduction",
      target: "all",
      value: 0.09,
      baseCost: 1620,
    }),
    fogo_de_confeitaria: upgradeDef("chocolate", {
      name: "Fogo de Confeitaria",
      desc: "Cada mistura rende muito mais no ponto certo.",
      effect: "Multiplica o ganho por clique em 1.8x.",
      type: "clickMultiplier",
      value: 1.8,
      baseCost: 2400,
    }),

    nata_fresca: upgradeDef("doce", {
      name: "Nata Fresca",
      desc: "Textura rica que aumenta o valor de cada mexida.",
      effect: "Multiplica o ganho por clique em 1.33x.",
      type: "clickMultiplier",
      value: 1.33,
      baseCost: 62,
    }),
    aroma_de_fazenda: upgradeDef("doce", {
      name: "Aroma de Fazenda",
      desc: "O cheiro do doce caseiro acelera as vendas.",
      effect: "Aumenta o CPS global em 1.17x.",
      type: "globalCPSMultiplier",
      value: 1.17,
      baseCost: 100,
    }),
    colher_de_cobre: upgradeDef("doce", {
      name: "Colher de Cobre",
      desc: "Ferramenta tradicional para mexida eficiente.",
      effect: "Adiciona +1 cocada fixa por clique.",
      type: "perClickBonus",
      value: 1,
      baseCost: 145,
    }),
    segredo_da_vovo: upgradeDef("doce", {
      name: "Segredo da Vovó",
      desc: "Receita ancestral passada de geração em geração.",
      effect: "Multiplica o CPS de Leiteiro Ambulante em 1.75x.",
      type: "buildingMultiplier",
      target: "leiteiro_ambulante",
      value: 1.75,
      baseCost: 228,
    }),
    fogao_a_lenha: upgradeDef("doce", {
      name: "Fogão a Lenha",
      desc: "Calor constante para reduzir custos de produção.",
      effect: "Reduz em 8% o custo de compra de Panelão de Leite.",
      type: "buildingCostReduction",
      target: "panelao_leite",
      value: 0.08,
      baseCost: 335,
    }),
    leite_reduzido: upgradeDef("doce", {
      name: "Leite Reduzido",
      desc: "Concentração ideal para elevar o ganho por clique.",
      effect: "Adiciona +2 cocadas fixas por clique.",
      type: "perClickBonus",
      value: 2,
      baseCost: 478,
    }),
    caldeirao_ferro: upgradeDef("doce", {
      name: "Caldeirão de Ferro",
      desc: "Maior volume com melhor retenção de calor.",
      effect: "Multiplica o CPS de Fábrica de Compota em 1.6x.",
      type: "buildingMultiplier",
      target: "fabrica_compota",
      value: 1.6,
      baseCost: 720,
    }),
    festa_da_colheita: upgradeDef("doce", {
      name: "Festa da Colheita",
      desc: "Demanda regional explode em época de festas.",
      effect: "Se tiver 12 Leiteiros e 8 Panelões, aumenta o CPS global em +22%.",
      type: "synergyBonus",
      synergyType: "globalCPSMultiplier",
      value: 1.22,
      condition: {
        buildings: {
          leiteiro_ambulante: 12,
          panelao_leite: 8,
        },
      },
      baseCost: 1080,
    }),
    rota_lactea_local: upgradeDef("doce", {
      name: "Rota Láctea Local",
      desc: "Parcerias regionais reduzem custo de toda a cadeia.",
      effect: "Reduz em 9% o custo de compra de todas as construções.",
      type: "buildingCostReduction",
      target: "all",
      value: 0.09,
      baseCost: 1580,
    }),
    ponto_de_caramelo: upgradeDef("doce", {
      name: "Ponto de Caramelo",
      desc: "Acerto perfeito que dobra quase todo o rendimento manual.",
      effect: "Multiplica o ganho por clique em 1.8x.",
      type: "clickMultiplier",
      value: 1.8,
      baseCost: 2350,
    }),

    legado_do_coco_primordial: upgradeDef("base", {
      name: "Legado do Coco Primordial",
      desc: "Recompensa lendária do Coco Surpresa. Poder bruto sem limites.",
      effect: "Multiplica o CPS global em 2.6x.",
      type: "globalCPSMultiplier",
      value: 2.6,
      baseCost: 0,
      lootboxOnly: true,
      lootboxTag: "Coco Surpresa",
    }),
    tempestade_dourada: upgradeDef("base", {
      name: "Tempestade Dourada",
      desc: "Um sopro raro que transforma cada clique em explosao de cocadas.",
      effect: "Multiplica o ganho por clique em 3.2x.",
      type: "clickMultiplier",
      value: 3.2,
      baseCost: 0,
      lootboxOnly: true,
      lootboxTag: "Coco Surpresa",
    }),
  },
};

function applyCuratedIcons() {
  for (const [buildingKey, buildingDefEntry] of Object.entries(defs.buildings)) {
    const fileName = CURATED_BUILDING_ICONS[buildingKey] || "01_dish.png";
    const iconPath = `assets/buildings/ghostpixxells/${fileName}`;
    buildingDefEntry.icon = iconPath;
    buildingDefEntry.img = iconPath;
    buildingDefEntry.tooltipIcon = iconPath;
  }

  for (const [upgradeKey, upgradeDefEntry] of Object.entries(defs.upgrades)) {
    const fileName = CURATED_UPGRADE_ICONS[upgradeKey] || "sugar.png";
    upgradeDefEntry.icon = `pixel_mart/${fileName}`;
  }
}

applyCuratedIcons();

export const flavorDefs = {
  coco: {
    label: "🥥 Coco",
    buffs: {
      cpsMult: 1.22,
      buildCostMult: 0.9,
      clickAdd: 1,
      globalMult: 1.06,
      clickMult: 0.9,
      upgradeCostMult: 1.18,
    },
    desc: "+22% CPS · -10% clique · -10% construções · +18% upgrades · +1 clique · +6% produção geral",
  },

  chocolate: {
    label: "🍫 Chocolate",
    buffs: {
      clickMult: 1.28,
      clickAdd: 2,
      upgradeCostMult: 0.9,
      globalMult: 1.05,
      cpsMult: 0.84,
      buildCostMult: 1.12,
    },
    desc: "+28% clique · +2 clique fixo · -10% upgrades · +5% produção geral · -16% CPS · +12% construções",
  },

  doce: {
    label: "🍯 Doce de leite",
    buffs: {
      buildCostMult: 0.82,
      upgradeCostMult: 0.88,
      cpsMult: 1.15,
      clickAdd: 1,
      clickMult: 0.88,
      globalMult: 0.96,
    },
    desc: "+18% economia construções · +12% economia upgrades · +15% CPS · +1 clique fixo · -12% clique · -4% produção geral",
  },
};

// ========= SISTEMA DE LOOTBOX =========
// Raridades com tema de coco
export const lootboxRarities = {
  common: {
    id: "common",
    name: "Coco Verde",
    emoji: "🥥",
    color: "#00dd00",
    weight: 0.45, // 45%
    tier: 1,
  },
  uncommon: {
    id: "uncommon",
    name: "Coco Queimado",
    emoji: "🤎",
    color: "#8B4513",
    weight: 0.3, // 30%
    tier: 2,
  },
  rare: {
    id: "rare",
    name: "Coco Caramelizado",
    emoji: "🟤",
    color: "#FFB347",
    weight: 0.15, // 15%
    tier: 3,
  },
  epic: {
    id: "epic",
    name: "Coco Gourmet",
    emoji: "✨",
    color: "#FF00FF",
    weight: 0.08, // 8%
    tier: 4,
  },
  legendary: {
    id: "legendary",
    name: "Coco Imperial",
    emoji: "👑",
    color: "#FFD700",
    weight: 0.02, // 2%
    tier: 5,
  },
};

// Tipos de recompensas disponíveis
export const lootboxRewardTypes = {
  // Recursos
  COCADAS: "cocadas",
  XP: "xp",

  // Multiplicadores temporários
  CPS_BOOST: "cps_boost", // Multiplicador temporário de produção
  CLICK_BOOST: "click_boost", // Multiplicador temporário de clique

  // Bônus únicos
  RAIN_OF_COCO: "rain_of_coco", // Bônus de cocadas por tempo
  TROPICAL_SUN: "tropical_sun", // Produção dobrada por tempo
  COASTAL_BREEZE: "coastal_breeze", // Redução de cooldowns
  PREMIUM_SUGAR: "premium_sugar", // Bônus global permanente

  // Upgrades permanentes
  BUILDING_DISCOUNT: "building_discount",
  UPGRADE_DISCOUNT: "upgrade_discount",
  CPS_PERMANENT: "cps_permanent",

  // Estruturas e Upgrades
  RANDOM_BUILDING: "random_building", // Uma estrutura aleatória desbloqueada
  RANDOM_UPGRADE: "random_upgrade", // Um upgrade aleatório desbloqueado

  // Especiais
  SKIN: "skin",
  DECORATION: "decoration",
  MASCOT: "mascot",
};

// Template de recompensas por raridade e nível do jogador
export const lootboxRewardTemplates = {
  common: {
    tier1: [
      { type: "cocadas", min: 10, max: 25, weight: 0.5 },
      { type: "xp", min: 5, max: 15, weight: 0.4 },
      { type: "click_boost", durationSeconds: 30, multiplier: 1.2, weight: 0.1 },
    ],
    tier2: [
      { type: "cocadas", min: 50, max: 100, weight: 0.5 },
      { type: "xp", min: 20, max: 40, weight: 0.35 },
      { type: "cps_boost", durationSeconds: 60, multiplier: 1.15, weight: 0.15 },
    ],
    tier3: [
      { type: "cocadas", min: 200, max: 400, weight: 0.4 },
      { type: "xp", min: 50, max: 80, weight: 0.3 },
      { type: "cps_boost", durationSeconds: 120, multiplier: 1.25, weight: 0.2 },
      { type: "rain_of_coco", durationSeconds: 60, cocadaPerSecond: 5, weight: 0.1 },
    ],
  },
  uncommon: {
    tier1: [
      { type: "cocadas", min: 50, max: 100, weight: 0.4 },
      { type: "xp", min: 30, max: 50, weight: 0.3 },
      { type: "cps_boost", durationSeconds: 90, multiplier: 1.3, weight: 0.2 },
      { type: "coastal_breeze", durationSeconds: 120, weight: 0.1 },
    ],
    tier2: [
      { type: "cocadas", min: 300, max: 600, weight: 0.35 },
      { type: "xp", min: 75, max: 120, weight: 0.25 },
      { type: "tropical_sun", durationSeconds: 120, multiplier: 2.0, weight: 0.25 },
      { type: "building_discount", discountPercent: 0.1, durationSeconds: 300, weight: 0.15 },
    ],
    tier3: [
      { type: "cocadas", min: 1000, max: 2000, weight: 0.3 },
      { type: "xp", min: 150, max: 250, weight: 0.2 },
      { type: "tropical_sun", durationSeconds: 180, multiplier: 2.5, weight: 0.3 },
      { type: "upgrade_discount", discountPercent: 0.15, durationSeconds: 300, weight: 0.2 },
    ],
  },
  rare: {
    tier1: [
      { type: "cocadas", min: 200, max: 500, weight: 0.25 },
      { type: "xp", min: 100, max: 150, weight: 0.2 },
      { type: "tropical_sun", durationSeconds: 180, multiplier: 2.0, weight: 0.25 },
      { type: "premium_sugar", globalMultiplier: 1.05, durationSeconds: 600, weight: 0.2 },
      { type: "random_building", weight: 0.1 },
    ],
    tier2: [
      { type: "cocadas", min: 1500, max: 3000, weight: 0.2 },
      { type: "xp", min: 200, max: 350, weight: 0.2 },
      { type: "tropical_sun", durationSeconds: 300, multiplier: 3.0, weight: 0.3 },
      { type: "premium_sugar", globalMultiplier: 1.08, durationSeconds: 900, weight: 0.2 },
      { type: "random_building", weight: 0.1 },
      { type: "random_upgrade", weight: 0.1 },
    ],
    tier3: [
      { type: "cocadas", min: 5000, max: 10000, weight: 0.15 },
      { type: "xp", min: 500, max: 750, weight: 0.1 },
      { type: "tropical_sun", durationSeconds: 600, multiplier: 4.0, weight: 0.28 },
      { type: "premium_sugar", globalMultiplier: 1.1, durationSeconds: 1200, weight: 0.17 },
      { type: "cps_permanent", multiplier: 1.1, weight: 0.1 },
      { type: "random_building", weight: 0.1 },
      { type: "random_upgrade", weight: 0.1 },
    ],
  },
  epic: {
    tier1: [
      { type: "cocadas", min: 1000, max: 2500, weight: 0.15 },
      { type: "xp", min: 300, max: 500, weight: 0.15 },
      { type: "tropical_sun", durationSeconds: 300, multiplier: 3.0, weight: 0.2 },
      { type: "premium_sugar", globalMultiplier: 1.1, durationSeconds: 900, weight: 0.2 },
      { type: "skin", theme: "tropical", weight: 0.05 },
      { type: "random_building", weight: 0.15 },
      { type: "random_upgrade", weight: 0.1 },
    ],
    tier2: [
      { type: "cocadas", min: 5000, max: 15000, weight: 0.1 },
      { type: "xp", min: 750, max: 1250, weight: 0.1 },
      { type: "tropical_sun", durationSeconds: 600, multiplier: 5.0, weight: 0.25 },
      { type: "premium_sugar", globalMultiplier: 1.15, durationSeconds: 1200, weight: 0.2 },
      { type: "cps_permanent", multiplier: 1.15, weight: 0.1 },
      { type: "random_building", weight: 0.1 },
      { type: "random_upgrade", weight: 0.05 },
    ],
    tier3: [
      { type: "cocadas", min: 20000, max: 50000, weight: 0.08 },
      { type: "xp", min: 2000, max: 3000, weight: 0.08 },
      { type: "tropical_sun", durationSeconds: 900, multiplier: 6.0, weight: 0.25 },
      { type: "premium_sugar", globalMultiplier: 1.2, durationSeconds: 1800, weight: 0.17 },
      { type: "cps_permanent", multiplier: 1.25, weight: 0.17 },
      { type: "decoration", theme: "beach", weight: 0.05 },
      { type: "random_building", weight: 0.1 },
      { type: "random_upgrade", weight: 0.1 },
    ],
  },
  legendary: {
    tier1: [
      { type: "cocadas", min: 10000, max: 25000, weight: 0.15 },
      { type: "xp", min: 1000, max: 2000, weight: 0.15 },
      { type: "tropical_sun", durationSeconds: 600, multiplier: 5.0, weight: 0.25 },
      { type: "premium_sugar", globalMultiplier: 1.2, durationSeconds: 1200, weight: 0.2 },
      { type: "cps_permanent", multiplier: 1.2, weight: 0.15 },
      { type: "mascot", theme: "tropical", weight: 0.1 },
    ],
    tier2: [
      { type: "cocadas", min: 50000, max: 150000, weight: 0.1 },
      { type: "xp", min: 3000, max: 5000, weight: 0.1 },
      { type: "tropical_sun", durationSeconds: 900, multiplier: 8.0, weight: 0.3 },
      { type: "premium_sugar", globalMultiplier: 1.3, durationSeconds: 1800, weight: 0.2 },
      { type: "cps_permanent", multiplier: 1.3, weight: 0.2 },
      { type: "decoration", theme: "luxury", weight: 0.1 },
    ],
    tier3: [
      { type: "cocadas", min: 200000, max: 500000, weight: 0.1 },
      { type: "xp", min: 5000, max: 10000, weight: 0.1 },
      { type: "tropical_sun", durationSeconds: 1200, multiplier: 10.0, weight: 0.3 },
      { type: "premium_sugar", globalMultiplier: 1.5, durationSeconds: 3600, weight: 0.2 },
      { type: "cps_permanent", multiplier: 1.5, weight: 0.2 },
      { type: "mascot", theme: "imperial", weight: 0.1 },
    ],
  },
};
