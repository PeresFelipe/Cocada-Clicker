import { stateSelectors } from "../../adapters/stateAdapter";
import { useGameState } from "../../hooks/useGameState";
import { formatNumber } from "../../utils/formatters";

/**
 * Exibe o contador principal de cocadas
 */
export function CocadaCounter() {
  const cocadas = useGameState(stateSelectors.cocadas);

  return (
    <div id="cocadasText" className="stats-cocadas">
      {formatNumber(cocadas)}
    </div>
  );
}
