import { state } from "@core/state.js";
import { useEffect, useState } from "react";
import { eventEmitter } from "../adapters/eventEmitter.js";
import { stateSelectors } from "../adapters/stateAdapter.js";

/**
 * Hook especializado para o painel de estatísticas do jogador.
 * Escuta "stateChange" do core e monta um snapshot já pronto para renderização.
 */
export function usePlayerStats() {
  const [stats, setStats] = useState(() => stateSelectors.playerStatsSnapshot(state));

  useEffect(() => {
    const handleStateChange = () => {
      setStats(stateSelectors.playerStatsSnapshot(state));
    };

    const handleUiFormatChange = () => {
      setStats(stateSelectors.playerStatsSnapshot(state));
    };

    eventEmitter.on("stateChange", handleStateChange);
    eventEmitter.on("uiFormatChange", handleUiFormatChange);

    return () => {
      eventEmitter.off("stateChange", handleStateChange);
      eventEmitter.off("uiFormatChange", handleUiFormatChange);
    };
  }, []);

  return stats;
}
