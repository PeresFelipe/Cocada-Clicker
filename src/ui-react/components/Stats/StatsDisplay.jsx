import { stateSelectors } from "../../adapters/stateAdapter";
import { useGameState } from "../../hooks/useGameState";
import { formatNumber } from "../../utils/formatters";

/**
 * Exibe somente a produção por segundo na área principal
 */
export function StatsDisplay() {
  const cps = useGameState(stateSelectors.cps);

  return <div className="stats-display">{formatNumber(cps)} cocadas/s</div>;
}
