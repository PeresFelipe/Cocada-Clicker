import { flavorDefs } from "@core/defs.js";
import { useEffect, useState } from "react";
import { stateSelectors } from "../../adapters/stateAdapter";
import { useGameActions } from "../../hooks/useGameActions";
import { useGameState } from "../../hooks/useGameState";
import { uiIcons } from "../../utils/uiIcons";

const flavorIconByKey = {
  coco: "assets/icons/cocada-coco.png",
  chocolate: "assets/icons/cocada-chocolate.png",
  doce: "assets/icons/cocada-doce-leite.png",
};

function getFlavorName(label) {
  const parts = label.match(/^\S+\s+(.+)$/);
  return parts ? parts[1] : label;
}

function getBuffGroups(desc) {
  const lines = String(desc || "")
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);

  const positive = lines.filter((line) => !line.startsWith("-"));
  const negative = lines.filter((line) => line.startsWith("-"));

  return { positive, negative };
}

/**
 * FlavorModal - Modal para escolher sabor
 * Permite ao jogador escolher um sabor que afeta buffs do jogo
 */
export function FlavorModal({ onClose }) {
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [seedInput, setSeedInput] = useState("");

  const flavorLocked = useGameState(stateSelectors.flavorLocked);
  const contentSeed = useGameState(stateSelectors.contentSeed);
  const { applyFlavor, setContentSeed } = useGameActions();

  useEffect(() => {
    setSeedInput(contentSeed || "");
  }, [contentSeed]);

  if (flavorLocked) {
    return null;
  }

  const handleSelectFlavor = (flavorKey) => {
    setSelectedFlavor(flavorKey);
  };

  const handleConfirmFlavor = () => {
    if (!selectedFlavor) return;

    setContentSeed(seedInput);
    applyFlavor(selectedFlavor);
    setTimeout(() => {
      onClose?.();
    }, 500);
  };

  const handleCloseModal = () => {
    onClose?.();
  };

  return (
    <div className="flavorModal" role="dialog" aria-modal="true" aria-label="Escolha do sabor">
      <div className="flavorModalBackdrop" onClick={handleCloseModal} />
      <div className="flavorModalCard flavorModalCard--wood">
        <header className="flavorModalHeader">
          <h2>Escolha o Sabor da Cocada</h2>
        </header>

        <p className="flavorModalLead">
          Cada sabor concede buffs únicos. Essa escolha será <strong>permanente</strong>!
        </p>

        <div className="flavorSeedBox">
          <label htmlFor="flavorSeedInput" className="flavorSeedLabel">
            Seed (opcional)
          </label>
          <input
            id="flavorSeedInput"
            className="flavorSeedInput"
            type="text"
            value={seedInput}
            onChange={(event) => setSeedInput(event.target.value)}
            placeholder="Ex.: cocada-123"
          />
        </div>

        <div className="flavorOptions flavorOptions--wood">
          {Object.entries(flavorDefs).map(([key, def]) => {
            const flavorName = getFlavorName(def.label);
            const buffGroups = getBuffGroups(def.desc);
            const iconSrc = flavorIconByKey[key] || "assets/icons/cocada-sem-sabor.png";
            const isSelected = selectedFlavor === key;

            return (
              <article
                key={key}
                className={`flavorOption flavorOption--wood flavorOption--${key} ${isSelected ? "flavorOption--selected" : ""}`}
              >
                <h3 className="flavorOptionTitle">{flavorName}</h3>

                <div className="flavorOptionIcon" aria-hidden="true">
                  <img src={iconSrc} alt={flavorName} />
                </div>

                <div className="flavorOptionBuffs">
                  {buffGroups.positive.length > 0 && (
                    <div className="flavorBuffGroup">
                      <h4 className="flavorBuffGroupTitle">Vantagens</h4>
                      {buffGroups.positive.map((line) => (
                        <p key={`pos-${key}-${line}`} className="flavorBuff flavorBuff--positive">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}

                  {buffGroups.negative.length > 0 && (
                    <div className="flavorBuffGroup">
                      <h4 className="flavorBuffGroupTitle">Desvantagens</h4>
                      {buffGroups.negative.map((line) => (
                        <p key={`neg-${key}-${line}`} className="flavorBuff flavorBuff--negative">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className={`flavorSelectBtn ${isSelected ? "flavorSelectBtn--active" : ""}`}
                  onClick={() => handleSelectFlavor(key)}
                  aria-pressed={isSelected}
                >
                  <span className="ui-inline-icon-wrap">
                    <img className="ui-inline-icon" src={uiIcons.play} alt="" />
                    <span>Selecionar</span>
                  </span>
                </button>
              </article>
            );
          })}
        </div>

        <div className="flavorActions flavorActions--wood">
          <button
            className="flavorActionConfirm"
            onClick={handleConfirmFlavor}
            disabled={!selectedFlavor}
          >
            <span className="ui-inline-icon-wrap">
              <img className="ui-inline-icon" src={uiIcons.enter} alt="" />
              <span>Confirmar Selecao</span>
            </span>
          </button>
          <button className="flavorActionCancel" onClick={handleCloseModal}>
            <span className="ui-inline-icon-wrap">
              <img className="ui-inline-icon" src={uiIcons.exit} alt="" />
              <span>Cancelar</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
