import { stateSelectors } from "../../adapters/stateAdapter";
import { useGameState } from "../../hooks/useGameState";
import { uiIcons } from "../../utils/uiIcons";

/**
 * Botão para abrir lootbox "Abrir Coco Surpresa"
 */
export function LootboxButton({ onOpen }) {
  const level = useGameState(stateSelectors.level);
  const lootboxCount = useGameState(stateSelectors.lootboxCount);
  const lootboxCanOpen = useGameState(stateSelectors.lootboxCanOpen);
  const lootboxFreeAvailable = useGameState(stateSelectors.lootboxFreeAvailable);
  const lootboxCooldownText = useGameState(stateSelectors.lootboxCooldownText);

  // Bloqueia lootbox até pelo menos nível 1
  if (level < 1) {
    return (
      <button className="lootbox-btn disabled" disabled title="Desbloqueado após progresso">
        <span className="ui-inline-icon-wrap">
          <img className="ui-inline-icon" src={uiIcons.locked} alt="" />
          <span>Bloqueado</span>
        </span>
      </button>
    );
  }

  // Bloqueia se não houver lootboxes e cooldown grátis indisponível
  if (!lootboxCanOpen) {
    return (
      <button
        className="lootbox-btn disabled"
        disabled
        title={`Próximo coco grátis em ${lootboxCooldownText}`}
      >
        <span className="ui-inline-icon-wrap">
          <img className="ui-inline-icon" src={uiIcons.chestTreasure} alt="" />
          <span>Sem Coco Surpresa (0)</span>
        </span>
      </button>
    );
  }

  const buttonLabel =
    lootboxCount > 0 ? `Abrir Coco Surpresa (${lootboxCount})` : "Abrir Coco Surpresa (Gratis)";

  const buttonTitle =
    lootboxCount > 0
      ? `Abrir um Coco Surpresa! (${lootboxCount} disponível)`
      : lootboxFreeAvailable
        ? "Abrir Coco Surpresa grátis (cooldown pronto)"
        : `Próximo coco grátis em ${lootboxCooldownText}`;

  return (
    <button className="lootbox-btn" onClick={onOpen} title={buttonTitle}>
      <span className="ui-inline-icon-wrap">
        <img className="ui-inline-icon" src={uiIcons.chestTreasure} alt="" />
        <span>{buttonLabel}</span>
      </span>
    </button>
  );
}
