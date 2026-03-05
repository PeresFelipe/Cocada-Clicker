import { flavorDefs } from "@core/defs.js";
import { stateSelectors } from "../../adapters/stateAdapter";
import { useGameState } from "../../hooks/useGameState";
import { uiIcons } from "../../utils/uiIcons";

/**
 * FlavorBadge - Badge que mostra o sabor selecionado
 * Clicável para abrir modal (se não estiver locked)
 */
export function FlavorBadge({ onOpenModal }) {
  const flavor = useGameState(stateSelectors.flavor);
  const flavorLocked = useGameState(stateSelectors.flavorLocked);

  const handleClick = () => {
    if (!flavorLocked && onOpenModal) {
      onOpenModal();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  if (!flavor) {
    return (
      <div
        className="flavorBadge"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        <div className="badgeContent">
          <span className="ui-inline-icon-wrap">
            <img className="ui-inline-icon" src={uiIcons.cookingPot} alt="" />
            <span>Sem sabor</span>
          </span>
          {!flavorLocked && <span> · Clique para escolher</span>}
        </div>
      </div>
    );
  }

  const def = flavorDefs[flavor];

  return (
    <div className={`flavorBadge ${flavorLocked ? "flavorBadge--active" : ""}`}>
      <div className="badgeContent">
        <span className="ui-inline-icon-wrap">
          <img className="ui-inline-icon" src={uiIcons.cookingPot} alt="" />
          <span>{def.label}</span>
        </span>
      </div>
    </div>
  );
}
