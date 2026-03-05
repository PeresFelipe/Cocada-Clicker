import { stateSelectors } from "../../adapters/stateAdapter";
import { useGameState } from "../../hooks/useGameState";

/**
 * Exibe nível, XP e barra de progresso
 * Renderizada abaixo do flavor badge
 */
export function LevelDisplay() {
  const level = useGameState(stateSelectors.level);
  const maxLevel = useGameState(stateSelectors.maxLevel);
  const xpProgress = useGameState(stateSelectors.xpProgress);

  const isMaxLevel = level >= maxLevel;

  return (
    <div className="xp-display-container">
      <div className="xp-info-row">
        <span className="xp-level-text">Nível {level}</span>
        <span className="xp-value-text">
          {Math.floor(xpProgress.xpProgress)} / {xpProgress.xpNeeded} XP
        </span>
      </div>
      {!isMaxLevel && (
        <div className="xp-bar-wrapper">
          <div className="xp-bar-background">
            <div
              className="xp-bar-fill"
              style={{ width: `${Math.min(xpProgress.percentProgress, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
      {isMaxLevel && (
        <div className="xp-bar-wrapper">
          <div className="xp-max-text">Nível Máximo Atingido!</div>
        </div>
      )}
    </div>
  );
}
