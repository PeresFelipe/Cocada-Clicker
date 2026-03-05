import { useState } from "react";
import "../../css/style.css"; // CSS vanilla original
import { AchievementsPanel } from "./components/Achievements/AchievementsPanel.jsx";
import { AchievementToast } from "./components/Achievements/AchievementToast.jsx";
import { FlavorBadge } from "./components/Flavor/FlavorBadge";
import { FlavorModal } from "./components/Flavor/FlavorModal";
import { BeachTiledBackground } from "./components/Game/BeachTiledBackground";
import { CocadaButton } from "./components/Game/CocadaButton";
import { LootboxButton } from "./components/Lootbox/LootboxButton";
import { LootboxModal } from "./components/Lootbox/LootboxModal";
import { RandomLootboxCoco } from "./components/Lootbox/RandomLootboxCoco";
import { SaveButtons } from "./components/Save/SaveButtons";
import { Shop } from "./components/Shop/Shop";
import { CocadaCounter } from "./components/Stats/CocadaCounter";
import { LevelDisplay } from "./components/Stats/LevelDisplay";
import { LevelUpNotification } from "./components/Stats/LevelUpNotification";
import { PlayerStatsButton } from "./components/Stats/PlayerStatsButton";
import { PlayerStatsModal } from "./components/Stats/PlayerStatsModal";
import { StatsDisplay } from "./components/Stats/StatsDisplay";
import { useGameActions } from "./hooks/useGameActions";
import { uiIcons } from "./utils/uiIcons";

/**
 * App - Renderiza com a estrutura visual da UI original (vanilla)
 * Layout: Grid com leftCol (production) e rightCol (shop)
 */
export function App() {
  const [flavorModalOpen, setFlavorModalOpen] = useState(false);
  const [lootboxModalOpen, setLootboxModalOpen] = useState(false);
  const [playerStatsOpen, setPlayerStatsOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const { maxOutGame } = useGameActions();

  return (
    <div className="app">
      <BeachTiledBackground />

      {/* NOTIFICAÇÃO DE LEVEL UP */}
      <LevelUpNotification />

      {/* HEADER */}
      <header className="top">
        <div className="meta">
          <SaveButtons />
          <button
            type="button"
            className="btn-options achievements-open-button"
            onClick={() => setAchievementsOpen(true)}
          >
            <span className="ui-inline-icon-wrap">
              <img className="ui-inline-icon" src={uiIcons.trophy} alt="" />
              <span>CONQUISTAS</span>
            </span>
          </button>
          <PlayerStatsButton onOpen={() => setPlayerStatsOpen(true)} />
          <button
            onClick={maxOutGame}
            style={{
              marginLeft: "10px",
              padding: "8px 12px",
              background: "#ff6b5b",
              color: "white",
              border: "2px solid #ff8c42",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
            }}
            title="DEBUG: Maximiza tudo no jogo"
          >
            🎮 DEBUG MAX
          </button>
        </div>
      </header>

      {/* GRID LAYOUT */}
      <div className="grid">
        {/* LEFT COLUMN: PRODUCTION */}
        <div className="leftCol">
          <section className="production production-scene">
            {/* CLICKER AREA */}
            <div className="cocada-stage cocada-stage--bar">
              <CocadaButton />

              <div className="status-on-table">
                <div className="wood-sign">
                  <div className="wood-sign__value">
                    <CocadaCounter />
                  </div>
                  <div className="wood-sign__rate">
                    <StatsDisplay />
                  </div>
                </div>
                <div className="bar-table" aria-hidden="true" />
              </div>
            </div>

            {/* FLAVOR & XP DISPLAY */}
            <div className="activeFlavorRow">
              <div className="activeFlavor">
                <FlavorBadge onOpenModal={() => setFlavorModalOpen(true)} />
              </div>
              <div className="ownedUpgrades" id="ownedUpgrades"></div>
            </div>

            {/* LEVEL & XP BAR */}
            <div className="levelXpSection">
              <LevelDisplay />
            </div>

            {/* LOOTBOX BUTTON */}
            <div className="lootboxSection">
              <LootboxButton onOpen={() => setLootboxModalOpen(true)} />
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: SHOP */}
        <div className="rightCol">
          <Shop />
        </div>
      </div>

      {/* FLAVOR MODAL */}
      {flavorModalOpen && <FlavorModal onClose={() => setFlavorModalOpen(false)} />}

      {/* LOOTBOX MODAL */}
      {lootboxModalOpen && <LootboxModal onClose={() => setLootboxModalOpen(false)} />}

      {/* PLAYER STATS MODAL */}
      {playerStatsOpen && <PlayerStatsModal onClose={() => setPlayerStatsOpen(false)} />}

      {/* ACHIEVEMENTS PANEL */}
      {achievementsOpen && <AchievementsPanel onClose={() => setAchievementsOpen(false)} />}

      {/* ACHIEVEMENT TOAST */}
      <AchievementToast />

      {/* COCO ALEATÓRIO */}
      <RandomLootboxCoco />
    </div>
  );
}

export default App;
