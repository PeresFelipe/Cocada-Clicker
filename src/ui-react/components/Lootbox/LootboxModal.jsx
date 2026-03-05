import { formatLootboxCooldown } from "@core/systems/lootbox.js";
import { useEffect, useState } from "react";
import { stateSelectors } from "../../adapters/stateAdapter";
import { useGameActions } from "../../hooks/useGameActions";
import { useGameState } from "../../hooks/useGameState";
import { uiIcons } from "../../utils/uiIcons";

/**
 * Modal de abertura de lootbox com animação de quebra do coco
 */
export function LootboxModal({ onClose }) {
  const { openLootbox } = useGameActions();
  const level = useGameState(stateSelectors.level);
  const lastFreeLootboxTime = useGameState(stateSelectors.lastFreeLootboxTime);

  const [stage, setStage] = useState("initial"); // initial → cracking → revealed → closing
  const [lootboxResult, setLootboxResult] = useState(null);
  const [particlesActive, setParticlesActive] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [cooldownText, setCooldownText] = useState(() =>
    formatLootboxCooldown(lastFreeLootboxTime),
  );

  useEffect(() => {
    const updateCooldownText = () => {
      setCooldownText(formatLootboxCooldown(lastFreeLootboxTime));
    };

    updateCooldownText();
    const intervalId = setInterval(updateCooldownText, 60000);

    return () => clearInterval(intervalId);
  }, [lastFreeLootboxTime]);

  const attemptOpenLootbox = () => {
    const result = openLootbox();

    if (!result) {
      setStage("revealed");
      setIsUnavailable(true);
      setParticlesActive(false);
      return;
    }

    setIsUnavailable(false);
    setLootboxResult(result);
    setStage("cracking");
    setParticlesActive(true);

    setTimeout(() => {
      setStage("revealed");
    }, 1500);
  };

  // Abre o lootbox ao montar o componente
  useEffect(() => {
    const timer = setTimeout(() => {
      attemptOpenLootbox();
    }, 300);

    return () => clearTimeout(timer);
  }, [openLootbox]);

  const handleClose = () => {
    setStage("closing");
    setTimeout(onClose, 400);
  };

  if (isUnavailable) {
    const canTryNow = cooldownText === "Disponível agora!";

    return (
      <div className="lootbox-modal-overlay">
        <div className="lootbox-modal">
          <div className="reward-display reward-common">
            <div className="reward-content">
              <div className="reward-text">
                Sem Coco Surpresa disponível agora. Próximo grátis em {cooldownText}.
              </div>
            </div>
            {canTryNow ? (
              <button className="close-btn" onClick={attemptOpenLootbox}>
                <span className="ui-inline-icon-wrap">
                  <img className="ui-inline-icon" src={uiIcons.play} alt="" />
                  <span>Tentar abrir</span>
                </span>
              </button>
            ) : (
              <button className="close-btn" onClick={handleClose}>
                <span className="ui-inline-icon-wrap">
                  <img className="ui-inline-icon" src={uiIcons.exit} alt="" />
                  <span>Fechar</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!lootboxResult) {
    return (
      <div className="lootbox-modal-overlay">
        <div className="lootbox-modal">
          <div className="cocoda-loading">🥥 Abrindo...</div>
        </div>
      </div>
    );
  }

  const rarity = lootboxResult.rarity;
  const summary = lootboxResult.summary;

  return (
    <div className={`lootbox-modal-overlay ${stage === "closing" ? "fade-out" : ""}`}>
      <div className={`lootbox-modal ${stage}`}>
        {/* CENÁRIO TROPICAL */}
        <div className="lootbox-scene">
          {/* PALMEIRAS */}
          <div className="palm palm-left"></div>
          <div className="palm palm-right"></div>

          {/* AREIA */}
          <div className="sand-layer"></div>

          {/* COCO PRINCIPAL */}
          <div className={`coco-container ${stage}`}>
            <div
              className={`coco ${stage === "cracking" ? "cracking" : ""}`}
              style={{
                borderColor: rarity.color,
              }}
            >
              {stage === "cracking" && <div className="crack-effect"></div>}
            </div>
          </div>

          {/* PARTÍCULAS */}
          {particlesActive && (
            <div className="particles-container">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className={`particle particle-${(i % 3) + 1}`}
                  style={{
                    "--delay": `${i * 0.1}s`,
                  }}
                ></div>
              ))}
            </div>
          )}

          {/* CONFETES PARA RARIDADES ALTAS */}
          {rarity.tier >= 4 && particlesActive && (
            <div className="confetti-container">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={`confetti-${i}`}
                  className={`confetti confetti-${(i % 4) + 1}`}
                  style={{
                    "--delay": `${i * 0.15}s`,
                    "--duration": `${2 + Math.random()}s`,
                  }}
                ></div>
              ))}
            </div>
          )}

          {/* BRILHO AO REVELAR */}
          {stage === "revealed" && <div className={`shine-effect shine-${rarity.tier}`}></div>}
        </div>

        {/* RECOMPENSA REVELADA */}
        {stage === "revealed" && (
          <div className={`reward-display reward-${rarity.id}`}>
            <div className="rarity-badge">
              <span className="rarity-emoji">{rarity.emoji}</span>
              <span className="rarity-name">{rarity.name}</span>
            </div>

            <div className="reward-content">
              <div className="reward-text">{summary.display}</div>
            </div>

            <button className="close-btn" onClick={handleClose}>
              <span className="ui-inline-icon-wrap">
                <img className="ui-inline-icon" src={uiIcons.play} alt="" />
                <span>Continuar</span>
              </span>
            </button>
          </div>
        )}

        {/* ANIMAÇÃO INICIAL */}
        {stage === "initial" && (
          <div className="lootbox-opening-text">🌴 Abrindo um Coco Surpresa... 🌴</div>
        )}
      </div>
    </div>
  );
}
