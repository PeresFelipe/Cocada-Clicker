# AI_CONTEXT.md

## 1. VISÃO GERAL DA ARQUITETURA

**Tipo de Jogo:** Idle/clicker incremental em navegador com identidade retrô 8-bit.

**Objetivo do Jogador:** Acumular cocadas por clique e por produção automática, comprando construções e upgrades para escalar produção exponencialmente.

**Direção de Experiência:** Jogabilidade rápida, leitura imediata e feedback visual/sonoro simples, inspirados na era NES/SNES inicial.

**Loop Principal de Gameplay:**

1. Clique na cocada para ganhar recurso (per-click).
2. Use cocadas para comprar construções (geram CPS - cocadas por segundo).
3. Use cocadas para comprar upgrades (aplicam buffs: 2x CPS, 1.5x click, etc).
4. O loop de tempo converte CPS em cocadas continuamente (a cada 50ms).
5. Antes do sabor, jogador já tem progressão base (vantagem neutra + 1 upgrade base).
6. Escolha um sabor com seed opcional para gerar sequência determinística de conteúdo.
7. Salvar manualmente e carregar progresso na inicialização.

**Arquitetura em Camadas:**

O projeto agora é composto de **duas camadas independentes**:

- **CORE (JavaScript ES Modules):** Contém toda lógica de gameplay, estado e sistemas. Completamente desacoplado de UI.
- **UI REACT:** Camada de apresentação que renderiza a interface. Apenas lê dados e chama ações do core.

```
┌──────────────────────────────────────┐
│  CAMADA DE INTERFACE (REACT)         │
│  - Componentes visuais (JSX)         │
│  - Hooks para observação do state    │
│  - Chamadas de actions do core       │
│  - SEM lógica de gameplay            │
│  - SEM mutação direta do state       │
└──────────────────────────────────────┘
               ↕️ EventEmitter
         (2 vias de comunicação)
┌──────────────────────────────────────┐
│  CAMADA DE LÓGICA (CORE JS)           │
│  - state.js (estado único)           │
│  - actions.js (operações/mutações)   │
│  - systems/* (economia, tempo, save) │
│  - defs.js (definições de conteúdo)  │
│  - Emite 'stateChange' pós-mutação   │
└──────────────────────────────────────┘
```

**Garantias Arquiteturais:**

- ✅ Core é **100% independente** de React
- ✅ React é apenas uma **nova pele** do core
- ✅ State é único em `js/state.js`, nunca duplicado
- ✅ Lógica permanece em `actions.js` e `systems/`
- ✅ Sem side effects ocultos em componentes
- ✅ EventEmitter é a **única ponte** entre as camadas

---

## 2. TECNOLOGIAS E STACK

- **Linguagens:** HTML, CSS, JavaScript (ES modules)
- **Bibliotecas:**
  - React 18.2+ (camada de UI: renderização, componentes, hooks)
  - ReactDOM 18.2+ (renderização no browser)
  - Vite 4.5+ (bundler e dev server)
- **Modularização:** ES modules em ambas camadas
- **Persistência:** localStorage ("cocada-save-v1")
- **Comunicação:** EventEmitter (ponte Core↔React)

### 2.1. DIRETRIZES OFICIAIS DE ARTE 8-BIT

- Pixel art em baixa resolução, com visual deliberadamente blocado.
- Paleta de cores limitada e consistente entre HUD, botões, ícones e cards.
- Bordas quadradas (sem cantos arredondados modernos) e contraste alto.
- Ícones simples e legíveis em tamanhos pequenos, priorizando função.
- Evitar efeitos modernos: blur, glassmorphism, sombras realistas e gradientes suaves.

### 2.2. REGRAS OFICIAIS DE UI/UX

- Interface minimalista e funcional, com hierarquia visual forte.
- Tipografia pixelada legível e tamanhos seguros para telas pequenas.
- Botões grandes, claros e com estados visuais explícitos (normal/hover/ativo/desabilitado).
- Fluxo de interação com baixo atrito: clique principal, compra clara, feedback imediato.
- Cada elemento de UI deve existir por utilidade de gameplay; remover ruído visual.

### 2.3. PRINCÍPIOS DE FEEDBACK VISUAL E INTERAÇÃO

- Feedback curto e direto: piscar, mudança de cor, deslocamento de 1-2px, pop rápido.
- Animações curtas (rápidas e discretas), sem transições longas cinematográficas.
- Feedback de compra/erro sempre visível (ex.: estado desabilitado, custo, aviso curto).
- Atualizações numéricas com leitura estável (evitar excesso de “flicker” de layout).
- Sons retro devem reforçar ações principais (clique, compra, desbloqueio), sem poluição sonora.

### 2.4. RESTRIÇÕES TÉCNICAS (8-BIT FIRST)

- UI React é camada de apresentação; toda lógica de jogo permanece no Core.
- Não introduzir dependências visuais que incentivem estética moderna fora do estilo retrô.
- Priorizar performance em renderização e animações simples para manter resposta imediata.
- Manter componentes desacoplados e reutilizáveis, respeitando EventEmitter como ponte única.
- Garantir legibilidade e operabilidade em resoluções menores, sem depender de efeitos avançados.

### 2.5. ATUALIZAÇÕES VISUAIS INTEGRADAS (MAR/2026)

- Tipografia oficial da UI: `PublicPixel` (carregada por `@font-face`), com foco em leitura pixel-art consistente.
- Ícones de construções e upgrades passaram por curadoria manual em `js/defs.js` (sem seleção aleatória automática).
- Packs de arte integrados no projeto:
  - Ghostpixxells (pixel food/buildings/upgrades)
  - Pixel_Mart (apoio visual para ícones de shop)
  - Icons_Essential (ícones de interface e ações)
  - Free_pixel_food_16x16 (ícones de conquistas)
- Conquistas agora possuem ícones dedicados definidos no core (`js/achievementList.js`) e renderizados em:
  - `src/ui-react/components/Achievements/AchievementsPanel.jsx`
  - `src/ui-react/components/Achievements/AchievementToast.jsx`
- Botões de UI principais usam `Icons_Essential` (save/reset/opções/conquistas/estatísticas/lootbox/flavor/modais) com ícones inline para reforçar legibilidade funcional.
- Fundo principal migrado de composição estática para tilemap em canvas (`BeachTiledBackground`):
  - água animada
  - areia/costa/detalhes estáticos
  - faixa de areia molhada e microdetalhes raros
- Créditos e licenças de assets são centralizados em `licenses/third_party_assets.md` (inclui referência CC-BY 4.0 de Alex Kovacs para ícones de conquistas).

---

## 3. ESTRUTURA DO PROJETO

### Raiz do Projeto

```
index.html                    # HTML mínimo com <div id="root"> para React
css/
  style.css                   # Design system e estilos (refatorado para React)
js/                           # CORE - JavaScript ES Modules (imutável do React)
  achievementList.js          # Catálogo de conquistas (definições e condições)
  achievementSystem.js        # Registro/check/unlock/evento de conquistas
  state.js                    # Estado único do jogo
  defs.js                     # Definições: buildings, upgrades, flavors
  actions.js                  # Ações de gameplay (click, compra, flavor, notify)
  hookBus.js                  # Mini bus de hooks de domínio (level/lootbox/save/etc)
  notifyStateChange.js        # Bridge: evento notificador para React
  systems/
    economy.js                # Cálculos puros: getPerClick, getCPS, custos
    seededContent.js          # Seed, ordem determinística e desbloqueio por progresso
    time.js                   # Game loop 50ms, acumula CPS
    save.js                   # Persistência: localStorage, reset, load
src/ui-react/                 # INTERFACE - React (depende do core)
  index.jsx                   # Entry point: carrega save/loop e renderiza App
  App.jsx                     # Componente raiz com layout vanilla
  hooks/
    useGameState.js           # Hook: observa e lê state do core
    useGameActions.js         # Hook: wrapper de actions com notificação
    usePlayerStats.js         # Hook: snapshot de estatísticas do jogador (read-only)
  adapters/
    eventEmitter.js           # EventEmitter: on/off/emit para Core↔React
    stateAdapter.js           # Selectors: funções de leitura do state
  components/
    Game/
      BeachTiledBackground.jsx # Fundo em canvas com tileset de praia (water animated only)
      CocadaButton.jsx        # Botão principal, dispara clickCocada
    Stats/
      CocadaCounter.jsx       # Exibe número de cocadas (grande)
      StatsDisplay.jsx        # CPS, per-click, multiplicador
      PlayerStatsButton.jsx   # Botão "ESTATÍSTICAS" (abre painel)
      PlayerStatsModal.jsx    # Painel/modal de estatísticas do jogador (8-bit)
    Shop/
      BuildingsList.jsx       # Lista de construções
      BuildingCard.jsx        # Item do menu de boteco (estrutura individual)
      BuildingTooltip.jsx     # Tooltip modular de estruturas (hover)
      RecipeBookUpgrades.jsx  # Livro de receitas de upgrades (UI principal)
      UpgradeTooltip.jsx      # Componente modular: card ao hover
      Shop.jsx                # Container da loja
    Flavor/
      FlavorBadge.jsx         # Badge de sabor escolhido
      FlavorModal.jsx         # Modal de seleção de sabor
    Achievements/
      AchievementsPanel.jsx   # Painel/modal de conquistas
      AchievementToast.jsx    # Toast 8-bit de conquista desbloqueada
    Save/
      SaveStatus.jsx          # Mostra timestamp do último save
      SaveButtons.jsx         # Botões: Save/Reset + opção de formato numérico
  utils/
    formatters.js             # Formatação (short/long/raw), moeda, duração, percentual
assets/
  backgrounds/               # Spritesheets de cenários (inclui beach tilesheet)
  buildings/                  # Imagens de construções
  achievements/               # Ícones de conquistas (pack Free_pixel_food)
  ui/                         # Ícones utilitários da interface (icons_essential)
  icons/                      # Ícones diversos
  upgrades/                   # Imagens de upgrades
```

### Responsabilidades por Camada

**CORE (js/)** — Lógica de Gameplay

- Gerencia estado único em `state.js`
- Executa ações: clique, compra, apply flavor
- Roda game loop (50ms)
- Persiste dados via localStorage
- Executa checagem automática de conquistas no core (`checkAchievements`)
- Desbloqueia conquistas no core e emite evento de domínio (`achievementUnlocked`)
- Disponibiliza hook bus genérico para eventos de domínio (`js/hookBus.js`)
- Emite hooks de domínio para level/lootbox/save
- **Nunca importa** React ou módulos de ui-react
- **Sempre notifica** React após mutação via `notifyStateChange()`

**REACT (src/ui-react/)** — Apresentação

- Renderiza interface baseada em state.js
- Renderiza background de praia por tiles em `BeachTiledBackground` (canvas fixo)
- Lê dados via `useGameState(selector)`
- Chama ações via `useGameActions()`
- Exibe painel de estatísticas do jogador (read-only)
- Exibe painel/lista de conquistas e toast de desbloqueio
- Exibe e altera modo de formatação numérica no menu de opções (`short/long/raw`)
- Reage a eventos de domínio encaminhados pelo bootstrap (`levelUp`, `lootboxOpened`, `saveWritten` etc.)
- Não contém cálculos econômicos
- Não muta state diretamente
- Observa eventos via EventEmitter

---

## 4. FLUXO DE DADOS ATUALIZADO

### 4.0. Renderização de Fundo (Beach Tilemap)

```
App.jsx monta <BeachTiledBackground /> dentro de .app
  ↓
Componente carrega spritesheet em assets/backgrounds/beach tilesheet/beach tilesheet.png
  ↓
Analisa o sheet completo e classifica tiles em pools:
  - sandTiles
  - wetSandTiles
  - detailTiles
  - shoreTiles
  - waterTiles
  ↓
Loop de render desenha camadas por faixa vertical:
  1) Água (animada por frame)
  2) Linha de costa (misto shore/water/sand)
  3) Faixa de areia molhada (estática)
  4) Areia seca + microdetalhes raros (estática)
```

**Regras visuais vigentes (março/2026):**

- Somente a água é animada (`FRAME_DELAY_MS` + `pickAnimatedVariant`).
- Areia seca, areia molhada, costa e detalhes usam seleção estática (`pickStaticVariant`).
- O componente varre o spritesheet inteiro para ampliar variedade de tiles.
- Microdetalhes na areia são aplicados com baixa probabilidade (`SAND_DETAIL_CHANCE`).
- A faixa de transição perto do mar usa `WET_SAND_BAND_TILES` + `MID_SAND_DETAIL_CHANCE`.
- O canvas respeita DPR e mantém `imageSmoothingEnabled = false` para visual pixel-art.

### Inicialização

```
1. Page load
   ↓
2. index.html carrega React e core
   ↓
3. src/ui-react/index.jsx executa:
   - Importa js/state, js/actions, js/systems
   - Registra listener: setStateChangeListener(...)
  - Registra bridges do hook bus do core (`levelUp`, `lootboxOpened`, `lootboxAdded`, `saveWritten`, `saveLoaded`, `saveReset`)
   - Inicia game loop: startGameLoop()
   - Renderiza App no #root
   ↓
4. React components montados, observam state via hooks
```

### Interação do Usuário → Renderização

```
Usuário clica no botão cocada
   ↓
CocadaButton chama clickCocada(x, y)
   ↓
clickCocada() em actions.js:
   - state.cocadas += getPerClick()
   - spawnParticles(x, y)  [visual]
   - notifyStateChange()   [BRIDGE]
   ↓
notifyStateChange() emite no eventEmitter
   ↓
useGameState hooks capturam evento
   ↓
Componentes que leem cocadas re-renderizam
   ↓
Novo valor exibido na tela
```

### Game Loop → Renderização

```
time.js (intervalId = setInterval every 50ms):
   - Itera buildings: cocadaBuffer += cps * dt
   - Acumula: state.cocadas += Math.floor(cocadaBuffer)
   - notifyStateChange()  [BRIDGE]
   ↓
React throttla (não renderiza a cada 50ms)
   ↓
Apenas componentes que observam CPS re-renderizam
   ↓
Counter mostra valor atualizado suavemente
```

### Compra de Construção

```
BuildingCard: usuário clica "Comprar"
   ↓
buyBuilding(key) chamado
   ↓
actions.js:
   - Valida: if (cocadas < cost) return
   - Muta: state.cocadas -= cost
   - Muta: state.buildings[key].owned++
   - notifyStateChange()  [BRIDGE]
   ↓
React notificado
   ↓
CocadaCounter re-renderiza (cocadas mudou)
   ↓
BuildingCard re-renderiza (owned mudou, canAfford mudou)
```

### Salvamento

```
Usuário clica "Save Manual"
   ↓
SaveButtons chama saveGame() (js/systems/save.js)
   ↓
save.js serializa state, escreve localStorage
   ↓
SaveStatus mostra timestamp atualizado
   ↓
Próxima sessão: src/ui-react/index.jsx carrega save via loadGame()
```

### Estatísticas do Jogador (Botão + Modal)

```
Usuário clica em "ESTATÍSTICAS"
  ↓
App abre PlayerStatsModal (somente UI)
  ↓
usePlayerStats escuta "stateChange" no eventEmitter
  ↓
stateSelectors.playerStatsSnapshot lê state.js e funções do core
  ↓
Modal renderiza economia/interação/progressão/tempo/extra/avançadas
  ↓
Nenhuma mutação de gameplay ocorre na UI
```

### Conquistas (Achievements)

```
Qualquer ação do core chama notifyStateChange()
  ↓
notifyStateChange executa checkAchievements() no core
  ↓
achievementSystem percorre achievementList
  ↓
Se condition(stateSnapshot) for true e ainda não desbloqueada:
  - unlockAchievement(id)
  - marca em state.achievements.unlockedById
  - atualiza ordem/contador de desbloqueio
  - emite evento de domínio achievementUnlocked
  ↓
src/ui-react/index.jsx encaminha para eventEmitter (bridge)
  ↓
AchievementToast mostra popup por 4s
AchievementsPanel re-renderiza estado de desbloqueio
```

Detalhes visuais atuais de conquistas:

- Cada conquista pode informar `icon` no catálogo do core (`js/achievementList.js`).
- `AchievementsPanel` e `AchievementToast` renderizam o ícone quando disponível, mantendo fallback textual quando não houver asset.
- A origem principal dos ícones de conquista é `assets/achievements/free_pixel_food`.

### Hook Bus de Domínio (Genérico)

```
Core dispara eventos de domínio via runHook(...)
  ↓
src/ui-react/index.jsx registra hooks e encaminha para eventEmitter
  ↓
UI pode reagir sem acoplamento direto com actions/systems
```

Hooks atualmente emitidos:

- `levelUp`
- `lootboxOpened`
- `lootboxAdded`
- `saveWritten`
- `saveLoaded`
- `saveReset`

API do hook bus (core):

- `registerHook(name, callback)`
- `removeHook(name, callback)`
- `runHook(name, payload)`
- `runHookOnValue(name, value)`

### Formatação Numérica Configurável

```
Usuário abre Opções
  ↓
SaveButtons altera modo (short/long/raw) via setNumberFormatMode(...)
  ↓
Preferência é persistida em localStorage
  ↓
UI emite uiFormatChange e componentes re-renderizam
  ↓
formatters.js passa a formatar números conforme o modo ativo
```

Modos disponíveis:

- `short` (K/M/B...)
- `long` (mil/milhões/bilhões...)
- `raw` (valor cru)

### Estado de Conquistas no Save

- O estado de conquistas é persistido dentro de `state.achievements`.
- Estrutura base:
  - `unlockedById` (mapa id -> boolean)
  - `unlockedOrder` (ordem de desbloqueio)
  - `lastUnlockedId` (última conquista)
  - `totalUnlocked` (contador)
- Como o save serializa `state`, conquistas desbloqueadas permanecem entre sessões.

---

## 5. REGRAS OFICIAIS PARA REACT (OBRIGATÓRIO)

### Garantias que NUNCA podem ser quebradas

**1. React NÃO pode alterar state diretamente**

```javascript
// ❌ PROIBIDO
state.cocadas = 1000;
state.multiplier *= 2;

// ✅ OBRIGATÓRIO
const { clickCocada, buyBuilding } = useGameActions();
buyBuilding("construção");
```

**2. React NÃO pode conter lógica de gameplay**

```javascript
// ❌ PROIBIDO (cálculo econômico em componente)
const cps =
  Buildings.reduce((acc, b) => {
    const cpsPerUnit = defs[b.key].cps;
    return acc + cpsPerUnit * b.owned;
  }, 0) * state.cpsMult;

// ✅ OBRIGATÓRIO (chamar função do core)
const cps = getCPS();
const cps = useGameState((s) => getCPS());
```

**3. React NÃO pode recalcular economia**

```javascript
// ❌ PROIBIDO
const cost = baseCost * Math.pow(1.16, owned);

// ✅ OBRIGATÓRIO
const cost = getBuildingCost(key);
```

**4. React apenas renderiza dados e chama actions**

```javascript
// ✅ PADRÃO CORRETO
export function BuildingCard({ key }) {
  // 1. Ler dados
  const owned = useGameState((s) => s.buildings[key].owned);
  const cocadas = useGameState((s) => s.cocadas);
  const cost = getBuildingCost(key); // Função core

  // 2. Pegar actions
  const { buyBuilding } = useGameActions();

  // 3. Renderizar
  const canAfford = cocadas >= cost;
  return (
    <button onClick={() => buyBuilding(key)} disabled={!canAfford}>
      Comprar por {cost}
    </button>
  );
}
```

**5. Regras oficiais para Conquistas (Achievements)**

```javascript
// ✅ OBRIGATÓRIO: desbloqueio no CORE
checkAchievements();
unlockAchievement("click_100");

// ❌ PROIBIDO: desbloquear conquista na UI
setUnlocked(true);
achievement.unlocked = true;
```

- Condições de conquista são definidas no core (`js/achievementList.js`).
- A UI apenas consome selectors (`stateSelectors.achievements`).
- Toast/painel de conquista são representação visual do evento do core.

**6. Regras oficiais para Formatação Numérica**

```javascript
// ✅ OBRIGATÓRIO: usar formatters centralizados
formatNumber(value);
formatCurrency(value);

// ❌ PROIBIDO: formatar números manualmente em componentes
value.toLocaleString("pt-BR");
```

- O modo (`short`/`long`/`raw`) deve ser alterado apenas por `setNumberFormatMode`.
- A UI pode escolher o modo, mas não pode implementar lógica alternativa de formatação fora de `formatters.js`.

### Validação Executada pelo Core

**Core (actions.js)** valida **antes** de mutar:

```javascript
export function buyBuilding(key) {
  const cost = getBuildingCost(key);

  // ✅ Validação no core
  if (state.cocadas < cost) {
    console.warn("Saldo insuficiente");
    return; // Falha silenciosa
  }

  state.cocadas -= cost;
  state.buildings[key].owned++;
  notifyStateChange();
}
```

**Componente React** apenas exibe estado:

```javascript
// ✅ Componente não valida, apenas mostra
const canAfford = cocadas >= cost;
<button disabled={!canAfford}>Comprar</button>;

// Se usuário clicar mesmo desabilitado:
// - onClick chamará buyBuilding
// - Core validará novamente
// - Mutação será ignorada se inválida
```

---

## 6. PADRÕES PARA COMPONENTES REACT

### Estrutura Padrão

Todos componentes seguem este padrão:

```jsx
import { useGameState } from "../../hooks/useGameState";
import { useGameActions } from "../../hooks/useGameActions";

export function ComponentName({ prop1, prop2 }) {
  // 1️⃣ Ler estado do core
  const value1 = useGameState((s) => s.path.to.value1);
  const value2 = useGameState((s) => s.path.to.value2);

  // 2️⃣ Pegar actions do core
  const { action1, action2 } = useGameActions();

  // 3️⃣ Cálculos de apresentação (SEM lógica de jogo)
  const displayValue = value1 * 2; // ✅ Formatação
  const isDisabled = value1 < 100; // ✅ Estado de UI

  // 4️⃣ Renderizar
  return (
    <div>
      <span>{displayValue}</span>
      <button onClick={() => action1()} disabled={isDisabled}>
        Ação
      </button>
    </div>
  );
}
```

### Seleção de State

```javascript
// ✅ Forma correta: selector retorna apenas o que é necessário
const cocadas = useGameState((s) => Math.floor(s.cocadas));
const perClick = useGameState((s) => getPerClick()); // Chama função core
const buildings = useGameState((s) => Object.values(s.buildings));

// ❌ Evitar: selector muito grande (completo)
const state = useGameState((s) => s); // Re-renderiza a TUDO
```

### Organização de Componentes

**Por Domínio:**

```
components/
├── Game/              # Lógica de clique
│   └── CocadaButton.jsx
├── Stats/             # Displays de números
│   ├── CocadaCounter.jsx
│   ├── StatsDisplay.jsx
│   ├── PlayerStatsButton.jsx
│   └── PlayerStatsModal.jsx
├── Shop/              # Compra de items
│   ├── Shop.jsx
│   ├── BuildingsList.jsx
│   ├── BuildingCard.jsx
│   ├── RecipeBookUpgrades.jsx
│   └── UpgradeTooltip.jsx
├── Flavor/            # Sistema de sabor
│   ├── FlavorBadge.jsx
│   └── FlavorModal.jsx
├── Achievements/      # Sistema de conquistas (UI)
│   ├── AchievementsPanel.jsx
│   └── AchievementToast.jsx
└── Save/              # Sistema de save
    ├── SaveStatus.jsx
    └── SaveButtons.jsx
```

### Padrão Oficial: Upgrades como Livro de Receitas

- O componente oficial de upgrades é `RecipeBookUpgrades.jsx`.
- Cada upgrade é renderizado como uma “receita” (`recipePage`).
- A UI usa lista já desbloqueada pelo core via `seededContent` (ordem por seed + progresso).
- Regras de compra permanecem no core (`buyUpgrade` em `js/actions.js`) com validação de desbloqueio.
- Upgrades não desbloqueados não entram na lista renderizada.
- Quando uma receita desbloqueia, a UI aplica destaque visual leve (`recipePage--justUnlocked`).

**Direção visual oficial (Livro físico artesanal):**

- O livro deve parecer objeto físico real de caderno de receitas de barraca praiana.
- Priorizar composição editorial orgânica de páginas (não layout de interface em cards).
- Papel interno com tom levemente amarelado/envelhecido, sem estética glass/flat.
- Profundidade com camadas e sombras naturais entre páginas.
- Encadernação aparente com costura no miolo (`recipeGutter`) e dobra central sombreada.
- Curvatura leve nas folhas esquerda/direita para reforçar objeto físico (`recipeLeaf--left/right`).
- Iluminação suave vinda do topo (simulada via gradients radiais).
- Imperfeições sutis (granulação/noise/manchas discretas) para sensação tátil.
- Variante ativa atual: acabamento rústico nordestino (kraft mais escuro, costura mais marcada, desgaste artesanal mais visível).

**Camadas obrigatórias de implementação:**

- `bookContainer`: estrutura externa do livro.
- `recipeBookCover`: capa artesanal brasileira (opcional; atualmente não renderizada no layout ativo).
- `recipeSpread`: miolo do livro aberto (duas folhas).
- `recipeLeaf`: cada folha física da abertura.
- `recipeEntry`: entrada editorial de receita na folha.
- `pageShadowLayer`: camada de sombra e relevo.
- `paperTextureLayer`: camada de textura/granulação do papel.

**Estado atual da capa:**

- A capa artesanal está desativada no layout ativo para priorizar a leitura direta do miolo.
- O bloco de capa permanece apenas como recurso visual opcional (sem impacto em gameplay).

**Importante de Arquitetura:**

- O desbloqueio visual no livro é **apresentação**, não regra de gameplay.
- Mesmo com recipe visível, a compra só acontece via `buyUpgrade` (core valida custo, flavor e desbloqueio real).
- Não criar estado de jogo paralelo no React para upgrades.

**Padrão JSX resumido:**

```jsx
const visibleUpgradeKeys = getVisibleUpgradeKeys({ flavor, maxCocadasSeen, contentSeed });

return visibleUpgradeKeys.map((upgradeKey) => (
  <RecipeEntry key={upgradeKey} upgradeKey={upgradeKey} upgradeDef={defs.upgrades[upgradeKey]} />
));
```

**Padrão JSX físico (camadas):**

```jsx
<section className="recipeBook recipeBook--open">
  {/* capa opcional removida no layout ativo */}

  <div className="pageShadowLayer" aria-hidden="true" />
  <div className="paperTextureLayer" aria-hidden="true" />

  <div className="recipeSpread">
    <section className="recipeLeaf recipeLeaf--left">
      <article className="recipeEntry">{/* entrada editorial */}</article>
    </section>
    <div className="recipeGutter" />
    <section className="recipeLeaf recipeLeaf--right">
      <article className="recipeEntry">{/* entrada editorial */}</article>
    </section>
  </div>
</section>
```

### UX / UI para Livro de Receitas (Tema Praia Tropical)

- Estrutura em livro aberto com duas folhas físicas e miolo (`recipeSpread` + `recipeLeaf`).
- Fundo de papel com textura natural e granulação discreta (`paperTextureLayer`).
- Estado comprável com destaque lateral editorial (`recipeEntry--affordable`).
- Estado comprado com faixa de envelhecimento leve (`recipeEntry--bought`).
- Separadores e ritmo tipográfico para leitura contínua de caderno artesanal.
- Ícones em moldura de receita, com silhueta para bloqueados (`recipeIcon--silhouette`).

### Técnicas CSS recomendadas (livro físico)

- `linear-gradient` e `radial-gradient` combinados para iluminação e profundidade.
- `box-shadow` multicamadas (inset + externo) para emboss/deboss suave.
- overlays de textura com `repeating-linear-gradient` para noise/grain.
- animações curtas e sutis (máx ~1s), sem exagero visual.
- priorizar fluxo de leitura e hierarquia editorial sobre affordances de UI.

### Micro-interações oficiais (livro)

- Revelação com brilho suave ao desbloquear (`recipeUnlockPulse`).
- Leve simulação de virar página no desbloqueio (`recipePageTurnReveal`).
- Sem efeitos neon, sem glassmorphism e sem movimentos agressivos.

### Acessibilidade (obrigatório no padrão)

- Entradas editoriais com `article` e `aria-label`.
- Botões com `disabled` e `aria-disabled` coerentes.
- Textos de estado explícitos: “Bloqueada”, “Comprar receita”, “Receita comprada”.

### Padrão Oficial: Estruturas como Menu de Boteco Praiano

- O componente de estruturas usa layout de cardápio tropical em `BuildingsList.jsx` + `BuildingCard.jsx`.
- Cada construção é um item de menu (`beachMenuItem`) com leitura rápida de:
  - Produção por unidade (CPS)
  - Quantidade possuída
  - Total produzido
  - Custo atual
- Estados visuais obrigatórios para estrutura:
  - `Bloqueado` (`beachMenuItem--blocked`): não comprável e sem operação ativa.
  - `Disponível` (`beachMenuItem--available`): comprável no momento.
  - `Ativo` (`beachMenuItem--active`): possui ao menos 1 unidade.
- Feedback de compra com micro-interação leve (`beachMenuItem--justBought`).

**Importante de Arquitetura:**

- React apenas renderiza os estados visuais do menu.
- Compra continua via `buyBuilding` em `js/actions.js`.
- Cálculos de custo/CPS permanecem no core (`js/systems/economy.js`).
- Nenhuma mutação direta de state em componentes React.

**Padrão JSX resumido (estruturas):**

```jsx
function BuildingCard({ buildingKey, buildingDef }) {
  const cocadas = useGameState(stateSelectors.cocadas);
  const owned = useGameState(stateSelectors.buildingOwned(buildingKey));
  const cost = useGameState(stateSelectors.buildingCost(buildingKey));
  const { buyBuilding } = useGameActions();

  const canAfford = cocadas >= cost;
  const isActive = owned > 0;

  return (
    <article
      className={`beachMenuItem ${canAfford ? "beachMenuItem--available" : ""} ${isActive ? "beachMenuItem--active" : ""}`}
    >
      <h4>{buildingDef.name}</h4>
      <p>{buildingDef.desc}</p>
      <button disabled={!canAfford} onClick={() => buyBuilding(buildingKey)}>
        Comprar
      </button>
    </article>
  );
}
```

### UX / UI para Menu de Estruturas (Tema Tropical)

- Visual de cardápio artesanal com textura leve e acentos quentes/frios da praia.
- Hierarquia de leitura rápida: nome → produção → custo → ação.
- Indicadores numéricos claros para expansão do negócio (unidades e produção total).
- Destaque imediato do que pode ser comprado (borda/luz do estado disponível).
- Botão de compra com feedback visual consistente e sem ruído.

### Micro-interações recomendadas (estruturas)

- Hover sutil com elevação dos itens (`translateY(-2px)`).
- Pulso curto ao comprar estrutura (`beachMenuItem--justBought`).
- Transição suave entre estados bloqueado/disponível/ativo.
- Realce de custo com cor de destaque quando comprável.

### Melhorando Performance

**Uso de Selectors Eficientes:**

```javascript
// ❌ Ineficiente: re-renderiza quando qualquer coisa muda
const state = useGameState((s) => s);

// ✅ Eficiente: re-renderiza só quando cocadas mudam
const cocadas = useGameState((s) => Math.floor(s.cocadas));
```

**Uso de Memoização (quando necessário):**

```javascript
import { useMemo } from "react";

export function BuildingsList() {
  const buildings = useGameState((s) => Object.keys(s.buildings));

  // Memo: recalcula apenas quando buildings array muda
  const listItems = useMemo(
    () => buildings.map((key) => <BuildingCard key={key} building={key} />),
    [buildings],
  );

  return <div>{listItems}</div>;
}
```

**Componentes Puros com React.memo:**

```javascript
// ✅ Memo: não re-renderiza se props não mudam
export const BuildingCard = React.memo(function BuildingCard({ key }) {
  // ...
});
```

---

## 6.1. VISIBILIDADE CONDICIONAL DE UPGRADES E ESTRUTURAS (PADRÃO)

### Mecânica Atual (Seed + Progressão)

A visibilidade de upgrades e estruturas segue um modelo de **desbloqueio determinístico por seed**, com progresso baseado em cocadas acumuladas.

**Fluxo oficial:**

1. **Seed de conteúdo (`contentSeed`)**

- Definida no modal de sabor (campo opcional).
- Se vazia, gera automática em runtime ao confirmar sabor.
- Mesmo seed reproduz a mesma ordem para aquele sabor.

2. **Rastreamento de progresso (`maxCocadasSeen`)**

- Fica no core (`state.maxCocadasSeen`).
- Atualiza no clique e no game loop.
- Persiste no save.

3. **Desbloqueio no core (`js/systems/seededContent.js`)**

- `getVisibleBuildingKeys(state)` e `getVisibleUpgradeKeys(state)` retornam somente itens desbloqueados.
- `isBuildingUnlocked` e `isUpgradeUnlocked` validam compra real no core.

4. **Renderização na UI**

- React e vanilla renderizam apenas as listas vindas de `seededContent`.
- Itens não desbloqueados não são renderizados.

### Benefícios do Padrão

☑ **Progressão personalizada**: cada seed gera uma jornada única
☑ **Reprodutibilidade**: jogadores podem compartilhar seed
☑ **Sem divergência UI/Core**: desbloqueio é decidido no core
☑ **Escalabilidade**: mesma lógica para upgrades e estruturas
☑ **Persistência estável**: `maxCocadasSeen` e seed salvos no estado

---

## 6.2. COMPONENTE MODULAR: UpgradeTooltip

### Padrão de Card ao Hover

O componente `UpgradeTooltip.jsx` é um componente **puro e reutilizável** responsável por exibir um card informativo ao passar o mouse sobre um upgrade disponível.

**Arquivo:** `src/ui-react/components/Shop/UpgradeTooltip.jsx`

**Responsabilidades:**

- Exibição de informações do upgrade: ícone, nome, categoria, custo, descrição e call-to-action
- Estilo visual alinhado ao mockup (fundo escuro + borda dourada)
- Classe de tooltip isolada (`recipeUpgradeTooltip`) para evitar conflito com CSS anterior (`.upgradeTooltip`)
- Renderização via portal (`createPortal`) em `document.body` para evitar blur/stacking causado por transformações 3D do livro
- Posicionamento dinâmico por coordenadas de viewport (`style` com `left/top/width`)

**Estrutura do Card:**

```
┌─────────────────────────────────┐
│ [TÍTULO] ........................ [+500] │
├─────────────────────────────────┤
│ CATEGORIA / TIPO               │
│                                 │
│ Descrição do efeito da melhoria. │
│ Pode ter múltiplas linhas.       │
├─────────────────────────────────┤
│      Clique para comprar         │
└─────────────────────────────────┘
```

**Props do Componente:**

```javascript
<UpgradeTooltip
  upgradeDef={{
    // Definição do upgrade (defs.upgrades[key])
    name: "Fornecedor de Leite",
    desc: "Melhoria de clique",
    tooltip: "O mouse e cursores...",
  }}
  cost={60} // Custo em cocadas (formatado)
  isAffordable={false} // Se jogador tem cocadas o suficiente
  style={{ left: "120px", top: "260px", width: "320px" }} // coordenadas calculadas no RecipeEntry
/>
```

**Estados Visuais:**

| Estado        | Custo    | CTA                   |
| ------------- | -------- | --------------------- |
| Acessível     | Realçado | "Clique para comprar" |
| Não acessível | Normal   | "Saldo insuficiente"  |
| Não visível   | -        | (não renderiza)       |

**Integração com `RecipeBookUpgrades.jsx` (`RecipeEntry`):**

```jsx
// Estado local em RecipeEntry
const [showTooltip, setShowTooltip] = useState(false);
const [tooltipStyle, setTooltipStyle] = useState(null);
const entryRef = useRef(null);

// Hover no card do item
<article onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
  {showTooltip && (
    <UpgradeTooltip
      upgradeDef={upgradeDef}
      cost={cost}
      isAffordable={canAfford}
      style={tooltipStyle}
    />
  )}
</article>;
```

**Posicionamento Dinâmico Atual:**

- Ao abrir o tooltip, `RecipeEntry` mede `entryRect` via `getBoundingClientRect()`
- Calcula `left/top` respeitando `viewportPadding` e mantém largura fixa (`320px`)
- Recalcula posição em `resize` e `scroll` (captura) enquanto tooltip está aberto
- Tooltip usa `position: fixed` em nível de documento, evitando recorte/blur das páginas com `transform`

**Estilos CSS (`.recipeUpgradeTooltip` + `.upgradeTooltip*`):**

- **Posicionamento**: Fixed (viewport)
- **Aparência**: Card escuro com borda dourada (estilo editorial/receita)
- **Border**: 3px dourada com sombra interna/externa
- **Animação**: Fade-in suave por 0.2s (keyframe: `tooltipFadeIn`)
- **Z-index**: 9999

**Padrão de Modularização:**

Este componente exemplifica **reutilização horizontal**:

- Exports um único componente puro (sem hooks complexos)
- Recebe todos dados via props (nenhuma dependência de state global)
- Reutilizável em outras contextos (ex: TooltipContainer para múltiplos upgrades)
- CSS encapsulado por seletor de classe (sem conflitos)

---

## 6.3. COMPONENTE MODULAR: BuildingTooltip

### Tooltip de Estruturas no Hover

O componente `BuildingTooltip.jsx` exibe um card informativo ao passar o mouse sobre cada estrutura do menu.

**Arquivo:** `src/ui-react/components/Shop/BuildingTooltip.jsx`

**Campos exibidos no card:**

- Ícone da estrutura
- Nome
- Descrição
- Preço
- Produção por segundo da estrutura
- Total produzido por essa estrutura

### Ícone modular por estrutura (`tooltipIcon`)

Cada building pode definir um ícone exclusivo para o tooltip através do campo opcional `tooltipIcon` em `defs.buildings`.

**Regra de resolução do ícone:**

1. Se `tooltipIcon` existir, ele é usado no tooltip.
2. Se não existir, o tooltip usa `img` (fallback automático).
3. Se `tooltipIcon` for apenas nome de arquivo (sem `/`), o caminho vira `assets/buildings/<arquivo>`.
4. Se `tooltipIcon` já vier com caminho (ex.: `assets/icons/...`), esse caminho é usado direto.

**Exemplos em `js/defs.js`:**

```javascript
export const defs = {
  buildings: {
    ambulante: {
      name: "Vendedor Ambulante",
      desc: "Um vendedor na praia vendendo cocadas.",
      img: "assets/buildings/ambulante.png",
      tooltipIcon: "ambulante-tooltip.png", // resolve para assets/buildings/ambulante-tooltip.png
    },

    cozinha: {
      name: "Cozinha Caseira",
      desc: "Produz cocadas automaticamente.",
      tooltipIcon: "assets/icons/cozinha_tooltip.png", // usa caminho completo
    },

    fabrica: {
      name: "Fábrica de Cocada",
      desc: "Produção em massa!",
      // sem tooltipIcon -> fallback para img
      img: "assets/buildings/fabrica.png",
    },
  },
};
```

### Integração com `BuildingCard.jsx`

- `BuildingCard` controla abertura/fechamento por hover (`showTooltip`)
- `BuildingCard` calcula `tooltipStyle` (left/top/width) baseado em viewport
- `BuildingTooltip` é renderizado via `createPortal(document.body)` para evitar recorte
- O layout visual usa classes `.buildingHoverTooltip*` em `css/style.css`

### Estendendo o Componente

Se precisar adicionar funcionalidades futuras:

**Opção A: Adicionar mais metadados**

```javascript
// Em UpgradeTooltip.jsx
<div className="upgradeTooltipExtra">
  Requer: {upgradeDef.requires ? upgradeDef.requires.name : "Nenhum"}
</div>
```

**Opção B: Recalcular em `scroll/resize` enquanto tooltip estiver aberto**

```javascript
// Em RecipeEntry
useEffect(() => {
  if (!showTooltip) return;
  const handler = () => recalculateTooltipPosition();
  window.addEventListener("resize", handler);
  window.addEventListener("scroll", handler, true);
  return () => {
    window.removeEventListener("resize", handler);
    window.removeEventListener("scroll", handler, true);
  };
}, [showTooltip]);
```

---

## 6.3. AJUDA CONTEXTUAL DO LIVRO (`?`)

Foi adicionada ajuda contextual no cabeçalho de `RecipeBookUpgrades`:

- Botão `?` ao lado do título "Livro de Receitas"
- Ao clicar, exibe painel explicando o significado das páginas:
  - **Disponíveis (01)**: primeiros 10 upgrades disponíveis
  - **Disponíveis (02)**: próximos upgrades disponíveis (11-20), quando houver
  - **Comprados**: acessados pelo botão **📜** ao lado do 02
- O painel fecha em três cenários:
  - clique no próprio botão `?` (toggle)
  - clique fora do painel/botão
  - tecla `Escape`

Implementação principal no componente:

- Estado: `showBookHelp`
- Refs: `helpPanelRef`, `helpButtonRef`
- Efeito com listeners globais (`mousedown`, `touchstart`, `keydown`) somente quando o painel está aberto

---

## 6.4. PAGINAÇÃO DE UPGRADES (SOMENTE DISPONÍVEIS)

`RecipeBookUpgrades` mantém as duas páginas focadas apenas em upgrades compráveis:

- **Página esquerda (01 / Disponíveis):** até 10 upgrades não comprados
- **Página direita (02 / Disponíveis):** próximos 10 upgrades não comprados (quando houver)
- Upgrades comprados saem da vitrine principal e passam a ser exibidos no painel do botão **📜**

Detalhes de implementação:

- `spreadPages` filtra somente `!bought` e faz `slice(0,10)` / `slice(10,20)`
- Lista de comprados (`allBoughtEntries`) permanece ordenada pelos mais recentes (`boughtAt`) para o painel

**Opção C: Adicionar interatividade ao tooltip**

```javascript
// Em UpgradeTooltip.jsx
onClick = { handleClickInside }; // Permitir compra direto do tooltip
```

---

## 7. COMUNICAÇÃO ENTRE CORE E REACT

### Padrão EventEmitter

**De Core para React:**

```javascript
// js/actions.js
export function clickCocada(x, y) {
  state.cocadas += getPerClick();
  notifyStateChange(); // ← Sinaliza React
  spawnParticles(x, y);
}

// js/systems/time.js
intervalId = setInterval(() => {
  // ... acumula CPS ...
  notifyStateChange(); // ← Sinaliza React a cada 50ms
}, 100);
```

**De React para Core:**

```javascript
// src/ui-react/hooks/useGameActions.js
export function useGameActions() {
  return {
    clickCocada: (x, y) => actions.clickCocada(x, y),
    buyBuilding: (key) => actions.buyBuilding(key),
    buyUpgrade: (key) => actions.buyUpgrade(key),
    applyFlavor: (key) => actions.applyFlavor(key),
    saveGame: () => save.saveGame(),
    resetGame: () => save.resetGame(),
  };
}
```

**Observação de State:**

```javascript
// src/ui-react/hooks/useGameState.js
export function useGameState(selector) {
  const [snap, setSnap] = useState(() => selector(state));

  useEffect(() => {
    function onChange() {
      setSnap(selector(state));
    }

    eventEmitter.on("stateChange", onChange);
    return () => eventEmitter.off("stateChange", onChange);
  }, [selector]);

  return snap;
}
```

### Fluxo Completo: Compra de Construção

```
┌──────────────────────────────────────────────────┐
│ BuildingCard.jsx                                 │
│ - const { buyBuilding } = useGameActions()       │
│ - <button onClick={() => buyBuilding("farm")}>  │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│ useGameActions() retorna função wrappada         │
│ → buyBuilding("farm")                            │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│ js/actions.js: buyBuilding(key)                  │
│ - if (cocadas < cost) return                     │
│ - state.cocadas -= cost                          │
│ - state.buildings[key].owned++                   │
│ - notifyStateChange()  ← BRIDGE                  │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│ notifyStateChange() emite no eventEmitter        │
│ - eventEmitter.emit("stateChange")               │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│ Todos useGameState listeners notificados         │
│ - CocadaCounter (cocadas mudou) → re-render      │
│ - BuildingCard (owned mudou) → re-render         │
│ - StatsDisplay (CPS mudou) → re-render           │
└──────────────────────────────────────────────────┘
```

---

## 8. PERFORMANCE E BOAS PRÁTICAS

### Throttling de Atualizações

**Problema:** Game loop emite `stateChange` a cada 50ms. React re-renderizaria tudo 20 vezes por segundo.

**Solução:** Throttle via `requestAnimationFrame`

```javascript
// ✅ CORRETO: throttla via RAF (60fps max)
export function useGameState(selector) {
  const [snap, setSnap] = useState(() => selector(state));
  let rafId = 0;

  useEffect(() => {
    function onChange() {
      rafId = requestAnimationFrame(() => {
        setSnap(selector(state));
        rafId = 0;
      });
    }

    eventEmitter.on("stateChange", onChange);
    return () => {
      eventEmitter.off("stateChange", onChange);
      cancelAnimationFrame(rafId);
    };
  }, [selector]);

  return snap;
}
```

**Resultado:** Máximo 60 atualizações/segundo (tela), não 10 por lógica do jogo.

### Evitar Re-renderizações Desnecessárias

```javascript
// ❌ MÁ: componente filtra em cada render
export function BuildingsList() {
  const state = useGameState(s => s);  // Observa TUDO
  const buildings = state.buildings.filter(b => b.owned > 0);
  return <div>{buildings.map(...)}</div>;
}

// ✅ BOM: selector faz o filtro
export function BuildingsList() {
  const buildings = useGameState(s =>
    Object.values(s.buildings).filter(b => b.owned > 0)
  );
  return <div>{buildings.map(...)}</div>;
}
```

### Loop de Tempo Fora do React

**Garantia:** Game loop roda **independentemente** de React

```javascript
// src/ui-react/index.jsx
loadGame();
startGameLoop(); // Core começa rodando antes da primeira interação do usuário

// React monta e passa a escutar notifyStateChange()
// Game loop continua rodando mesmo se React parar
```

**Benefícios:**

- Offline não precisa de React
- Game loop não congela se React trava
- Save continua funcionando

### Uso de Constantes Evita Recalculos

```javascript
// js/defs.js (NUNCA muda durante gameplay)
export const GAME_TICK_MS = 100;
export const INITIAL_COCADAS = 0;
export const INITIAL_PER_CLICK = 1;

// React pode usar sem medo
<div>{Math.round(1000 / GAME_TICK_MS)} ticks por segundo</div>;
```

---

## 9. REGRAS DE MANUTENÇÃO

### Separação de Camadas

**Nunca faça:**

```javascript
// ❌ JavaScript do core em componente React
export function Stats() {
  const cps = buildings.reduce((acc, b) => acc + defs[b.key].cps * b.owned, 0) * state.cpsMult;
  return <div>{cps}</div>;
}

// ✅ Chamar função do core
export function Stats() {
  const cps = useGameState((s) => getCPS());
  return <div>{cps}</div>;
}
```

**Nunca faça:**

```javascript
// ❌ Estado de jogo em React
const [myCustomState, setMyCustomState] = useState(10);

// ✅ Usar state.js do core
const value = useGameState((s) => s.buildings.farm.owned);
```

**Nunca faça:**

```javascript
// ❌ Importar React componentes no core
import { BuildingCard } from "../src/ui-react/components";

// Core nunca conhece React
```

**Sempre faça:**

```javascript
// ✅ Importar core no React
import { state } from "../js/state.js";
import { actions } from "../js/actions.js";
```

### Adição de Novas Features

**Nova Construção:**

1. Adicionar em `js/defs.js`
2. Adicionar em `js/state.js`
3. Componente React importa de `defs` e `state` via hooks
4. Nenhuma mudança no core além disso

**Nova Ação:**

1. Implementar em `js/actions.js`
2. Chamar `notifyStateChange()` ao final
3. Componente React chama via `useGameActions()`

**Bug Fix:**

1. Reproduzir sem React (teste core isolado)
2. Corrigir em `js/` (core)
3. React automaticamente reflete a correção

### Manutenção de Save

**Nunca:**

```javascript
// ❌ Mudar chaves de state sem migração
state.myResource → state.myNewResource  // Quebra saves antigos
```

**Sempre:**

```javascript
// ✅ Adicionar campo, manter compatibilidade
if (!state.myNewResource) state.myNewResource = 0;

// ✅ Ou criar migrador
function migrateStateV1ToV2(old) {
  return {
    ...old,
    myNewResource: 0,
  };
}
```

---

## 10. PONTOS DE ATENÇÃO FUTUROS

### Riscos Comuns ao Misturar Lógica com UI

**1. Duplicação de Lógica**

- Problema: Código de economia em múltiplos lugares (core + componentes)
- Risco: Inconsistência quando atualizar um lado
- Solução: **Sempre** centralizar em `js/systems/economy.js`

**2. State Escondido em Componentes**

- Problema: `useState()` para valores que devem ser persistidos
- Risco: Saves incompletos, estados corruptos
- Solução: Tudo em `js/state.js`, nunca em React

**3. Validação em Múltiplos Lugares**

- Problema: Validar compra em React AND em actions.js
- Risco: Desincronização entre UI e lógica
- Solução: Validar **apenas** em `js/actions.js`

**4. Effects Silenciosos**

- Problema: Side effect em componente (ex: atualizar localStorage)
- Risco: Comportamento não-óbvio, difícil debugar
- Solução: Todos effects em `js/systems/` ou no bootstrap `src/ui-react/index.jsx`

### Escalabilidade Futura

**Quando Adicionar Nova Feature:**

1. **Defina** no core (state, actions, systems)
2. **Teste** sem React
3. **Implemente** componente React
4. **Valide** que core continua independente

**Exemplo: Novo Sistema de Prestige**

```javascript
// 1. Core (js/)
// ├── state.js: { prestige: 0, prestigeCount: 0 }
// ├── actions.js: export function applyPrestige() { ... }
// └── systems/prestige.js: function getPrestigeBuff() { ... }

// 2. Teste Core
// ├── Sem React, sim prestige funciona?

// 3. React
// └── src/ui-react/components/Prestige/PrestigeButton.jsx
//     └── useGameState, useGameActions, renderiza

// Garantia: Core continua 100% funcional sem React
```

**Quando Refatorar Código:**

- Nunca mova lógica de `js/` para `src/ui-react/`
- Sempre mova lógica de `src/ui-react/` para `js/` se encontrar
- Teste core isoladamente antes/depois

### Indicadores de Arquitetura Saudável

✅ **Bom Sinal:**

- Core roda sem erros em console (sem UI)
- React pode ser reiniciado sem perder estado
- Tests passam só com core (sem React)

❌ **Alerta Red:**

- Core importa `src/ui-react/`
- React tem `useState()` para dados de jogo
- Salvamento quebrado quando React desabilita
- Lógica duplicada entre core e React

---

## 11. REFERÊNCIAS PARA IMPLEMENTADORES

### Arquivos-Chave do Core

- [js/state.js](js/state.js) — Estrutura única do estado
- [js/actions.js](js/actions.js) — Onde mutações ocorrem e `notifyStateChange()` é chamado
- [js/systems/economy.js](js/systems/economy.js) — Funções puras de cálculo
- [js/systems/seededContent.js](js/systems/seededContent.js) — Seed, ordem determinística e desbloqueios
- [js/systems/time.js](js/systems/time.js) — Game loop 50ms
- [js/defs.js](js/defs.js) — Definições de conteúdo (imutável)
- [js/notifyStateChange.js](js/notifyStateChange.js) — Bridge EventEmitter

### Arquivos-Chave do React

- [src/ui-react/index.jsx](src/ui-react/index.jsx) — Entry point
- [src/ui-react/App.jsx](src/ui-react/App.jsx) — Componente raiz
- [src/ui-react/hooks/useGameState.js](src/ui-react/hooks/useGameState.js) — Observer principal
- [src/ui-react/hooks/useGameActions.js](src/ui-react/hooks/useGameActions.js) — Wrapper de actions
- [src/ui-react/adapters/eventEmitter.js](src/ui-react/adapters/eventEmitter.js) — Bridge de eventos

### Convenções

| Tipo              | Padrão         | Exemplo             |
| ----------------- | -------------- | ------------------- |
| Componente React  | PascalCase.jsx | `BuildingCard.jsx`  |
| Hook React        | useNameHook.js | `useGameState.js`   |
| Função utilitária | camelCase.js   | `formatCurrency.js` |
| State key         | lower_snake    | `per_click_base`    |
| CSS class         | kebab-case     | `building-card`     |
| ID HTML           | camelCase      | `cocadaButton`      |

### Checklist para Nova Implementação

- [ ] Defini no core (state + ações + sistemas)
- [ ] Testei core sem React
- [ ] Criei componente React
- [ ] React usa `useGameState()` para leitura
- [ ] React usa `useGameActions()` para escrita
- [ ] Nenhuma lógica econônica no componente
- [ ] Nenhum `useState()` para dados de jogo
- [ ] `notifyStateChange()` chamado após mudança no core
- [ ] Feature testada integrada

---

## 12. BALANCEAMENTO ECONÔMICO E TRILHAS POR SABOR (2026-02-23)

Este balanceamento passa a ser a referência oficial do projeto para gameplay completo (early, mid e late game), com conteúdo separado por sabor.

**Fonte de verdade:**

- `js/defs.js` para números de construções, upgrades e sabores.

### 12.1. Objetivos do rebalance

- Early game com entrada rápida e decisões claras de compra.
- Mid game com progressão constante, sem picos exagerados por upgrade barato.
- Late game desafiador com custo progressivo controlado (sem travamento abrupto).
- Sabores com trade-offs competitivos (nenhum dominante em todas as fases).

### 12.2. Construções (baseCost / cps / costGrowth)

Tabela base abaixo representa a trilha **COCO** (baseline de referência econômica):

| Key                    | Base Cost |   CPS | Growth |
| ---------------------- | --------: | ----: | -----: |
| ambulante              |         5 |  0.12 |  1.150 |
| cozinha                |        18 |  0.35 |  1.160 |
| fabrica                |       130 |  2.60 |  1.170 |
| quiosque_orla          |       560 |  9.50 |  1.180 |
| cozinha_industrial     |      1200 | 18.00 |  1.190 |
| usina_de_coco          |      2400 | 33.00 |  1.200 |
| doceria_artesanal      |      4600 | 58.00 |  1.210 |
| galpao_logistico       |      8600 | 100.0 |  1.220 |
| franquia_litoranea     |     15500 | 168.0 |  1.230 |
| centro_de_distribuicao |     28000 | 280.0 |  1.240 |
| complexo_cocadeiro     |     50000 | 460.0 |  1.245 |
| exportadora_tropical   |     90000 | 760.0 |  1.250 |
| imperio_da_cocada      |    160000 |  1240 |  1.255 |

### 12.3. Upgrades (tipo / valor / custo base)

Tabela base abaixo representa a trilha **COCO** (baseline de referência econômica):

| Key                         | Tipo                  | Valor | Custo |
| --------------------------- | --------------------- | ----: | ----: |
| leite_de_coco_cremoso       | clickMultiplier       |  1.35 |    60 |
| brisa_do_litoral            | globalCPSMultiplier   |  1.18 |    95 |
| colher_de_pau_bem_temperada | perClickBonus         |  1.00 |   140 |
| segredo_da_baiana           | buildingMultiplier    |  1.75 |   220 |
| forno_de_areia_quente       | buildingCostReduction |  0.08 |   320 |
| coco_ralado_na_hora         | perClickBonus         |  2.00 |   460 |
| panelao_do_sao_joao         | buildingMultiplier    |  1.60 |   700 |
| sombra_do_coqueiral         | synergyBonus          |  1.22 |  1050 |
| puxada_de_rede_coletiva     | buildingCostReduction |  0.09 |  1550 |
| sol_de_meio_dia             | clickMultiplier       |  1.80 |  2300 |

**Condição de sinergia ativa:** `sombra_do_coqueiral` requer `12 ambulante` + `8 cozinha`.

### 12.4. Sabores (buffs permanentes)

Cada sabor deve manter exatamente **6 efeitos**: **4 vantagens** e **2 desvantagens**.

| Sabor         | 4 Vantagens                                                                    | 2 Desvantagens                             |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------ |
| coco          | `cpsMult: 1.22`, `buildCostMult: 0.90`, `clickAdd: 1`, `globalMult: 1.06`      | `clickMult: 0.90`, `upgradeCostMult: 1.18` |
| chocolate     | `clickMult: 1.28`, `clickAdd: 2`, `upgradeCostMult: 0.90`, `globalMult: 1.05`  | `cpsMult: 0.84`, `buildCostMult: 1.12`     |
| doce de leite | `buildCostMult: 0.82`, `upgradeCostMult: 0.88`, `cpsMult: 1.15`, `clickAdd: 1` | `clickMult: 0.88`, `globalMult: 0.96`      |

**Observação técnica:** `globalMult` multiplica ganhos gerais de produção/clique no core.

### 12.5. Regras para próximos ajustes

- Alterar somente em `js/defs.js` (não duplicar cálculos em componentes).
- Sempre manter consistência entre valor mecânico e texto descritivo do upgrade.
- Revalidar `baseCost`, `cps` e `costGrowth` em conjunto (não ajustar isolado).
- Após rebalance, atualizar esta seção e revisar data/versão no rodapé.

### 12.6. Conteúdo exclusivo por sabor (NOVO)

- Cada sabor possui **sua própria trilha** de construções e upgrades.
- Existe conteúdo **base** pré-sabor para manter jogabilidade sem escolha inicial:
  - vantagem neutra global enquanto `flavor = null`
  - 1 upgrade base (`flavor: base`)
- Quantidade por sabor:
  - **13 construções** por sabor
  - **10 upgrades** por sabor
- A trilha antiga passou a ser a trilha do sabor **COCO**.
- Foram criadas trilhas novas e distintas para **Chocolate** e **Doce de leite**.
- UI da loja (Menu do Boteco + Livro de Receitas) exibe somente conteúdo do sabor escolhido.
- O core bloqueia compra de construção/upgrade que não pertença ao sabor ativo.

### 12.7. Regras de execução por sabor (runtime)

- Cada item em `defs.buildings` e `defs.upgrades` deve conter campo `flavor` (`base`, `coco`, `chocolate`, `doce`).
- Filtro de exibição no React:
  - `src/ui-react/components/Shop/BuildingsList.jsx`
  - `src/ui-react/components/Shop/RecipeBookUpgrades.jsx`
  - `src/ui-react/components/Shop/UpgradesList.jsx`
- Filtro de exibição no legado vanilla:
  - `js/ui/shop.js`
- Validação de compra no core:
  - `js/actions.js` impede `buyBuilding` e `buyUpgrade` quando item não está desbloqueado/compatível com flavor.
- Cálculo econômico por sabor:
  - `js/systems/economy.js` considera upgrades `base` + flavor ativo.

### 12.8. Seed e desbloqueio progressivo

- `contentSeed` define ordem determinística das trilhas por sabor.
- Desbloqueio ocorre por `maxCocadasSeen` + rank do item na ordem da seed.
- Fonte de verdade: `js/systems/seededContent.js`.
- UI não calcula regra própria de unlock; apenas consome listas já resolvidas.

### 12.9. Política de save (compatibilidade)

- A partir desta mudança, o projeto **não mantém compatibilidade com save antigo**.
- O estado inicial de `buildings` e `upgrades` agora é gerado dinamicamente a partir de `js/defs.js`.
- Save atual persiste também `contentSeed` e `maxCocadasSeen`.
- Em caso de comportamento inconsistente com save legado, resetar progresso é comportamento esperado.

---

## 13. SISTEMA DE NÍVEL (XP & PROGRESSION)

### 13.1. Visão Geral

O sistema de nível oferece uma camada de progressão paralela, independente de cocadas. Jogadores ganham XP ao executar ações de gameplay e sobem de nível em marcos progressivos. Máximo: Nível 50.

### 13.2. Cálculo de XP

- **XP por nível:** Nível N requer N × 100 XP
  - Nível 1: 100 XP
  - Nível 2: 200 XP (total acumulado: 300)
  - Nível 3: 300 XP (total acumulado: 600)
  - ... até Nível 50
- **XP Total até Nível N:** Σ(i=1 até N-1) de i × 100

### 13.3. Ganho de XP (Fonte)

| Ação              | XP Ganho |
| ----------------- | -------- |
| Clicar na cocada  | 0.1 XP   |
| Comprar estrutura | 5 XP     |
| Comprar upgrade   | 5 XP     |
| Escolher sabor    | 50 XP    |

### 13.4. Implementação no Core

**Arquivo:** `js/actions.js`

```javascript
// Funções disponíveis:
export function getXpForLevel(level)     // XP necessário para um nível (N × 100)
export function getTotalXpForLevel(level) // XP total acumulado até nível
export function getXpProgress()           // {xpNeeded, xpProgress, percentProgress}
export function addXp(amount)             // Adiciona XP e verifica level up
```

**Fluxo:**

1. Toda ação de gameplay chama `addXp(amount)`
2. `addXp` incrementa `state.xp`
3. Loop verifica se `state.xp >= getTotalXpForLevel(state.level + 1)`
4. Se sim, incrementa `state.level` e armazena em `state.lastLevelUp`
5. `notifyStateChange()` é chamado, sinalizando React

### 13.5. State do Jogador

```javascript
// Em js/state.js são adicionados:
level: 1,           // Nível atual (1-50)
xp: 0,              // XP absoluto acumulado
maxLevel: 50,       // Nível máximo atingível
lastLevelUp: null,  // {newLevel, timestamp} para notificação
```

### 13.6. UI de Nível (React)

**Componentes criados:**

- **`LevelDisplay.jsx`** (em `src/ui-react/components/Stats/`)
  - Exibe nível atual, XP, barra de progresso
  - Mostra "MAX" quando máximo nível atingido
  - Integrado acima do Grid principal (em `App.jsx`)

- **`LevelUpNotification.jsx`** (em `src/ui-react/components/Stats/`)
  - Notificação flutuante com animação ao passar de nível
  - Desaparece automaticamente após 3 segundos
  - Renderizada no topo do app (z-index alto)

**Selectors adicionados** (em `src/ui-react/adapters/stateAdapter.js`):

```javascript
level: (s) => s.level || 1;
maxLevel: (s) => s.maxLevel || 50;
xp: (s) => s.xp || 0;
xpProgress: (s) => getXpProgress();
lastLevelUp: (s) => s.lastLevelUp || null;
```

### 13.7. Estilos

**Arquivo:** `css/style.css` (adicionadas seções)

- `.level-section` — container com barra de progresso
- `.level-display` — layout principal
- `.xp-bar-background` e `.xp-bar-fill` — animação visual de XP
- `.level-up-notification` — popup com animação de escalabilidade
- `@keyframes levelUpPop` — pop-in/pop-out
- `@keyframes pulse` — efeito pulsante no subtitle

### 13.8. Persistência

- XP e nível são salvos automaticamente via `JSON.stringify(state)`
- Nenhuma mudança necessária em `js/systems/save.js` (serialização genérica)
- Save is retroactive: novos campos adicionados ao load com valores padrão

### 13.9. Recompensas (Lootbox)

- Subir de nível concede lootbox automaticamente (1 por nível alcançado)
- Lootboxes podem ser ganhos por cliques, compras, escolha de sabor e eventos especiais
- Notificação de level up permanece como feedback visual

---

## 14. SISTEMA DE LOOTBOX

### 14.1. Visão Geral

O sistema de lootbox implementa um mecanismo de recompensas aleatórias e escaláveis, fornecendo diversidade de gameplay e retenção de jogadores. Sistema disponível a partir do nível 1, com uma caixa grátis a cada 6 horas, e raridades baseadas em peso probabilístico com sistema de pity (sorte crescente).

### 14.2. Raridades e Taxas de Drop

Cinco raridades com design tropical temático:

| Raridade              | ID          | Emoji | Cor     | Taxa Drop | Peso |
| --------------------- | ----------- | ----- | ------- | --------- | ---- |
| **Coco Verde**        | `common`    | 🥥    | #00dd00 | 45%       | 0.45 |
| **Coco Queimado**     | `uncommon`  | 🤎    | #8B4513 | 30%       | 0.30 |
| **Coco Caramelizado** | `rare`      | 🟤    | #FFB347 | 15%       | 0.15 |
| **Coco Gourmet**      | `epic`      | ✨    | #FF00FF | 8%        | 0.08 |
| **Coco Imperial**     | `legendary` | 👑    | #FFD700 | 2%        | 0.02 |

### 14.3. Sistema de Pity (Sorte Crescente)

- **Mecânica:** Contador de aberturas incrementado a cada abertura comum (Verde/Queimado)
- **Recompensa:** +1% ao peso da raridade por contador (máximo 50% de boost)
- **Reset:** Contador reseta ao obter raridade rara ou superior (Caramelizado+)
- **Fórmula:** `adjusted_weight = rarity.weight ± (pityCounter × 0.01 boost_factor)`
- **Normalização:** Pesos normalizados após ajuste para manter distribuição válida

### 14.4. Tipos de Recompensa

Oito categorias de recompensas escaláveis:

1. **`COCADAS`** — Moeda base (min: 10, max: 1000+)
2. **`XP`** — Pontos de experiência (min: 5, max: 500+)
3. **`CPS_BOOST`** — Multiplicador de CPS temporário (1.2x–2.0x, duração: 1–10min)
4. **`CLICK_BOOST`** — Multiplicador de clique temporário (1.5x–3.0x, duração: 30s–2min)
5. **`TROPICAL_SUN`** — Buff +50% XP por 10min–1h
6. **`RAIN_OF_COCO`** — Chover cocadas extras em 5min–30min (ticks de +1% CPS)
7. **`COASTAL_BREEZE`** — Buff de produção +25% por 30min–2h
8. **`PREMIUM_SUGAR`** — Multiplicador global 1.5x por até 2h
9. **`BUILDING_DISCOUNT`** — Desconto 10–50% em construções por 1–2h
10. **`UPGRADE_DISCOUNT`** — Desconto 10–50% em upgrades por 1–2h
11. **`CPS_PERMANENT`** — Aumento permanente de CPS (+1%, acumulativo)
12. **`SKIN`** — Desbloqueio cosmético (sprite/visual do coco)
13. **`DECORATION`** — Desbloqueio de decoração ambiental (palmeira, sol, etc)
14. **`MASCOT`** — Desbloqueio de mascote (personagem flutuante, visual)
15. **`RANDOM_BUILDING`** — Estrutura exclusiva de lootbox (unica, muito forte)
16. **`RANDOM_UPGRADE`** — Upgrade exclusivo de lootbox (unico, muito forte)

**Exemplos atuais (lootbox-only):**

- Estruturas:
  - `Templo da Cocada Dourada` — CPS altissimo, custo 0, unica
  - `Usina Astral do Coco` — CPS extremo, custo 0, unica
- Upgrades:
  - `Legado do Coco Primordial` — CPS global 2.6x
  - `Tempestade Dourada` — Clique 3.2x

### 14.5. Escalabilidade por Nível

Recompensas ajustadas em 3 tiers conforme progressão:

| Tier       | Níveis | Aplicação                                          |
| ---------- | ------ | -------------------------------------------------- |
| **Tier 1** | 1–20   | Quantidades iniciais (cocadas: 10–50, XP: 5–20)    |
| **Tier 2** | 21–40  | Quantidades médias (cocadas: 50–200, XP: 20–100)   |
| **Tier 3** | 41–50  | Quantidades altas (cocadas: 200–1000, XP: 100–500) |

Cada template de recompensa possui `min`, `max`, `multiplier`, `duration` específicos por tier.

### 14.6. Implementação Core

**Arquivo:** `js/systems/lootbox.js` (350+ linhas)

Funções principais:

- **`selectRarity(pityCounter)`** — Seleção ponderada com boost de pity; retorna `{id, name, weight}`
- **`generateReward(rarityId, playerLevel)`** — Mapeia nível para tier, seleciona template aleatório, gera valores finais
- **`getLevelTier(playerLevel)`** — Mapeia nível (1–50) para tier (1, 2, 3)
- **`applyReward(state, reward)`** — Aplica mutations no state conforme tipo (cocadas, XP, boosts temporários com timestamps, itens desbloqueáveis)
- **`getActiveBoosts(state)`** — Retorna boosts ativos filtrando por timestamp de expiração
- **`canOpenFreeLootbox(lastFreeTime)`** — Valida se 6 horas se passaram desde última abertura grátis
- **`formatLootboxCooldown(lastFreeTime)`** — Formatação "Xh Ym" para display de cooldown
- **`updatePityCounter(rarityTier, currentPity)`** — Lógica de incremento/reset conforme raridade obtida

**Fallback de lootbox-only:**

- Se todas as estruturas lootbox-only ja foram obtidas, `RANDOM_BUILDING` converte para cocadas bonus
- Se todos os upgrades lootbox-only ja foram obtidos, `RANDOM_UPGRADE` converte para cocadas bonus

### 14.7. State Extensions

Novos campos adicionados a `js/state.js`:

```javascript
lootboxCount: 1; // Quantidade de lootboxes disponíveis
lootboxOpened: 0; // Total de lootboxes abertas
lastFreeLootboxTime: null; // Timestamp da última abertura grátis
lootboxPityCounter: 0; // Contador sorte crescente
temporaryBoosts: {
} // {boostId: {value, expiresAt, ...}}
permanentBoosts: {
} // {boostId: value, ...}
unlockedSkins: []; // Array de IDs de skins desbloqueadas
decorations: []; // Array de decorações
mascots: []; // Array de mascotes
clicksCount: 0; // Total de cliques manuais
buildsCount: 0; // Total de compras de estruturas
upgradesCount: 0; // Total de compras de upgrades
randomLootboxVisible: false; // Coco surpresa visível no mapa
```

**Estado por item (lootbox-only):**

- `state.buildings[key].lootboxUnlocked`
- `state.upgrades[key].lootboxUnlocked`

Boosts temporários armazenam `expiresAt` (timestamp), permitindo lógica de expiração sem polling.

### 14.8. Actions Integradas

**Arquivo:** `js/actions.js`

- **`addLootbox(amount)`** — Incrementa a contagem de lootboxes
- **`openLootbox()`** — Orquestra fluxo completo:
  1. Seleciona raridade (com boost pity)
  2. Gera recompensa (tier-específica)
  3. Aplica reward ao state
  4. Atualiza pity counter
  5. Emite `stateChange`
  6. Retorna `{rarityId, rarity, reward, summary}` para React
- **`getLootboxStatus()`** — Helper retornando `{canOpen, cooldownText, opened, pity}`

**Gatilhos de lootbox (core):**

- Level up: 1 lootbox por nivel alcançado
- Cliques: 1 lootbox a cada 100 cliques
- Estruturas: 1 lootbox a cada 25 compras
- Upgrades: 1 lootbox a cada 15 compras
- Escolha de sabor: 1 lootbox ao confirmar
- Coco surpresa aleatorio na tela (evento)

### 14.9. Componentes React

**Arquivo:** `src/ui-react/components/Lootbox/LootboxButton.jsx`

- Botão "Abrir Coco Surpresa" com contador de quantidade
- Desabilitado se nível < 1
- Sinaliza cooldown de lootbox grátis
- Callback `onClick` dispara abertura

**Arquivo:** `src/ui-react/components/Lootbox/RandomLootboxCoco.jsx`

- Coco surpresa aparece em intervalos aleatorios
- Clicar concede lootbox imediatamente

**Arquivo:** `src/ui-react/components/Lootbox/LootboxModal.jsx` (150+ linhas)

Sistema de 4 estágios de animação:

1. **`initial`** (300ms) — Mensagem introdutória ("Um coco misterioso aproxima...")
2. **`cracking`** (1500ms) — Animação de quebra:
   - Coco tremelicando (CSS `cocoShake`)
   - 15 partículas caindo com delays randômicos
   - Som de rachadura (opcional)
3. **`revealed`** (instantâneo) — Apresentação de recompensa:
   - Badge de raridade com cor temática
   - Texto descritivo da recompensa
   - Confete (20 partículas para raro+)
   - Efeito brilho (shine flash)
   - Botão "Fechar"
4. **`closing`** (400ms) — Fade out suave

Estrutura visual:

- Cena tropical com palmeiras (clip-path SVG-like), céu azul, areia com padrão diagonal
- Coco centralizado com gradiente radial (brilho em ::before, rachaduras em ::after)
- Partículas (3 tipos: pequenas/médias/grandes) com animação `particleFloat`
- Confete (4 cores: dourado/rosa/ciano/verde) com animação `confettiDrop`
- Reward display temático por raridade (cores, bordas, fontes pixeladas)

### 14.10. Selectors e Adapters

Adicionados em `src/ui-react/adapters/stateAdapter.js`:

```javascript
lootboxOpened: (s) => s.lootboxOpened || 0;
lastFreeLootboxTime: (s) => s.lastFreeLootboxTime || null;
lootboxPityCounter: (s) => s.lootboxPityCounter || 0;
lastLootboxReward: (s) => s.lastLootboxReward || null;
```

### 14.11. Hook de Ações

Adicionados em `src/ui-react/hooks/useGameActions.js`:

- **`openLootbox()`** — Wrapper ao core `openLootbox()`, retorna resultado completo
- **`addXp(amount)`** — Mutação direta de XP (suporte para XP de lootbox)

### 14.12. Estilo Visual

Adicionadas ~700 linhas em `css/style.css`:

**Botão:** (`.lootbox-btn`)

- Gradiente laranja (#FF8C42 → #FFB85C)
- Fonte pixelada (pixel-art)
- Sombra 8-bit com offset 2px
- Estados: hover (brilho), active (recuo 1px), desabilitado (opacidade 0.5)

**Modal:** (`.lootbox-modal-overlay`, `.lootbox-modal-container`)

- Overlay fixo com backdrop-filter blur
- Animações `fadeIn` / `fadeOut`
- Container central responsive (max 500px)

**Cena Tropical:** (`.lootbox-scene`)

- Background: gradiente sky-to-sand (azul → marrom)
- Palmeiras: clip-path polygons (SVG-like, sem imagens)
- Areia: repeating-linear-gradient 45° com padrão diagonal

**Coco:** (`.coco`)

- Radial gradient marrom (#8B7355 → #5C4033)
- Border-radius elíptica (50% lateral, 45% vertical) para aspecto 3D
- Brilho: pseudo-elemento ::before com radial gradient branco (transparency)
- Rachaduras: pseudo-elemento ::after com linear-gradient simulando fraturas
- Animação `cocoShake` quando quebrando (rotate ±2°)

**Partículas e Confete:**

- 3 tipos de partículas (small/medium/large) com cores tropicais
- 4 tipos de confete (gold/pink/cyan/green)
- Animações `particleFloat` (translate Y + scale fade) e `confettiDrop` (queda + rotateZ 720°)
- Delays via CSS variable `--delay` para efeito em cascata

**Shine Effect:** (`.shine-effect`)

- Radial gradient white → transparent
- Animação `shineFlash` (opacity fade rápida, 600ms)

**Reward Display:**

- 5 variantes por raridade (cores de borda, background temático)
- `.rarity-badge` — emblem circular com emoji/cor
- `.reward-text` — descrição legível, tamanho escalável
- `.close-btn` — botão pixelado estilo 8-bit

**Lootbox-only (loja):**

- `.beachMenuItem--lootbox` — card de estrutura exclusivo com borda dourada
- `.shopItem--lootbox` — card de upgrade exclusivo com destaque dourado
- `.lootboxBadge` — selo "LOOTBOX" no titulo
- `lootboxOnly` impede compra manual e custo visivel

### 14.13. Integração com Economia

Boosts aplicados via `getActiveBoosts()` quando necessário nos cálculos de CPS/click damage. Multiplicadores multiplicam valores antes de aplicação final (ex.: `effectiveCPS = baseCPS × activeCpsBoost`).

Tempo de verificação de boosts expirados pode ser integrado em `js/systems/time.js` para eficiência (checar expiração a cada tick).

### 14.14. Persistência

- Estado de lootbox (opened, pityCounter, timestamp, boosts) serializado em localStorage automaticamente
- Boosts desativados na desserialização se expiração já passou
- Nenhuma mudança manual necessária em `js/systems/save.js` (genérico)

### 14.15. Fluxo Completo de Usuário

1. Jogador atinge nível 1 → botão "Abrir Coco Surpresa" desbloqueado
2. Clica botão → Modal abre em estágio `initial`
3. Modal aguarda 300ms → Transita para `cracking`, inicia animações
4. Coco tremelica por 1500ms, partículas caem
5. Modal transita para `revealed` → exibe raridade, recompensa, confete (se raro+)
6. Efeito brilho pisca (600ms)
7. Jogador clica "Fechar" → estágio `closing`, fade out 400ms
8. Modal fecha, estado atualizado com reward aplicada
9. Boosts temporários começam contagem (timestamp set)
10. Se raro: pity counter reseta; se comum: pity counter incrementa
11. Cooldown de 6 horas para lootbox grátis ativado

### 14.16. Balanceamento

- **Drop rates:** 45% comum, 75% comum+ok, 90% comum+ok+bom, 98% todos — mantém senso de progressão/surpresa
- **Quantidades:** Tier 1 (1–20) fornece base igualável; Tier 2/3 recompensam dedicação
- **Duração boosts:** 1–2 horas máximo — impacto significativo sem dominação infinita
- **Pity cap 50%:** Garante chance viável de raro mesmo após muitas aberturas comuns, sem quebrar pesos

---

**Última atualização:** Fevereiro 2026
**Versão:** 2.7 (sistema de nível + XP + lootbox implementado)
**Status:** ✅ Lootbox system complete, 5 rarities with pity, recompensas exclusivas de lootbox, 16 reward types, modal animado, estado persistido
