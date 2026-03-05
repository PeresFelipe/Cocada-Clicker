/**
 * Hook: useGameActions
 * Fornece actions do core
 *
 * As actions já emitem notificação via notifyStateChange()
 * React hooks escutam automaticamente via eventEmitter
 *
 * Uso:
 *   const { clickCocada, buyBuilding } = useGameActions();
 *   clickCocada(e.clientX, e.clientY);
 */

import * as coreActions from "@core/actions.js";
import { useCallback } from "react";

export function useGameActions() {
  const clickCocada = useCallback((x, y) => {
    coreActions.clickCocada(x, y);
  }, []);

  const buyBuilding = useCallback((buildingKey) => {
    coreActions.buyBuilding(buildingKey);
  }, []);

  const buyUpgrade = useCallback((upgradeKey) => {
    coreActions.buyUpgrade(upgradeKey);
  }, []);

  const applyFlavor = useCallback((flavorKey) => {
    coreActions.applyFlavor(flavorKey);
  }, []);

  const setContentSeed = useCallback((seedValue) => {
    coreActions.setContentSeed(seedValue);
  }, []);

  const openLootbox = useCallback(() => {
    return coreActions.openLootbox();
  }, []);

  const addXp = useCallback((amount) => {
    coreActions.addXp(amount);
  }, []);

  const maxOutGame = useCallback(() => {
    coreActions.maxOutGame();
  }, []);

  const addLootbox = useCallback((amount) => {
    coreActions.addLootbox(amount);
  }, []);

  return {
    clickCocada,
    buyBuilding,
    buyUpgrade,
    applyFlavor,
    setContentSeed,
    openLootbox,
    addXp,
    maxOutGame,
    addLootbox,
  };
}
