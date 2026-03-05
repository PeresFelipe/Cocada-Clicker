/**
 * Hook: useGameState
 * Observa mudanças no state do core e re-renderiza componente
 *
 * Uso:
 *   const cocadas = useGameState(stateSelectors.cocadas);
 *   const cps = useGameState(stateSelectors.cps);
 */

import { state } from "@core/state.js";
import { useEffect, useState } from "react";
import { eventEmitter } from "../adapters/eventEmitter.js";

export function useGameState(selector, equalityFn = Object.is) {
  // Estado inicial
  const [value, setValue] = useState(() => {
    try {
      return selector(state);
    } catch (e) {
      console.warn("Erro ao selecionar state inicial:", e);
      return undefined;
    }
  });
  const [, forceRender] = useState(0);

  useEffect(() => {
    const handleStateChange = () => {
      try {
        const nextValue = selector(state);
        setValue((prevValue) => (equalityFn(prevValue, nextValue) ? prevValue : nextValue));
      } catch (e) {
        console.warn("Erro ao atualizar state:", e);
      }
    };

    const handleUiFormatChange = () => {
      forceRender((current) => current + 1);
    };

    // Escutar evento de mudança do core
    eventEmitter.on("stateChange", handleStateChange);
    eventEmitter.on("uiFormatChange", handleUiFormatChange);

    // Limpeza ao desmontar
    return () => {
      eventEmitter.off("stateChange", handleStateChange);
      eventEmitter.off("uiFormatChange", handleUiFormatChange);
    };
  }, [selector, equalityFn]);

  return value;
}
