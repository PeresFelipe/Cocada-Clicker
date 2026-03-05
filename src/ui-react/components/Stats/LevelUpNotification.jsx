import { useEffect, useState } from "react";
import { stateSelectors } from "../../adapters/stateAdapter";
import { useGameState } from "../../hooks/useGameState";

/**
 * Notificação visual que aparece quando o jogador passa de nível
 * Desaparece automaticamente após 3 segundos
 */
export function LevelUpNotification() {
  const lastLevelUp = useGameState(stateSelectors.lastLevelUp);
  const [showNotification, setShowNotification] = useState(false);
  const [displayLevel, setDisplayLevel] = useState(null);

  useEffect(() => {
    if (lastLevelUp) {
      setDisplayLevel(lastLevelUp.newLevel);
      setShowNotification(true);

      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [lastLevelUp?.timestamp]); // Re-trigger quando timestamp muda (novo level up)

  if (!showNotification || !displayLevel) {
    return null;
  }

  return (
    <div className={`level-up-notification ${showNotification ? "active" : ""}`}>
      <div className="level-up-content">
        <div className="level-up-text">⭐ NÍVEL {displayLevel}! ⭐</div>
        <div className="level-up-subtitle">Recompensa desbloqueada!</div>
      </div>
    </div>
  );
}
