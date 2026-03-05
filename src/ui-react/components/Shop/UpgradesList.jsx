import { defs } from "@core/defs.js";
import { getVisibleUpgradeKeys } from "@core/systems/seededContent.js";
import { stateSelectors } from "../../adapters/stateAdapter";
import { useGameState } from "../../hooks/useGameState";
import { UpgradeCard } from "./UpgradeCard";

/**
 * UpgradesList - Compatível com .shopList vanilla
 */
export function UpgradesList() {
  const flavor = useGameState(stateSelectors.flavor);
  const maxCocadasSeen = useGameState(stateSelectors.maxCocadasSeen);
  const contentSeed = useGameState(stateSelectors.contentSeed);

  const visibleKeys = getVisibleUpgradeKeys({
    flavor,
    maxCocadasSeen,
    contentSeed,
  });

  return (
    <div className="shopList">
      {visibleKeys.map((key) => (
        <UpgradeCard key={key} upgradeKey={key} upgradeDef={defs.upgrades[key]} />
      ))}
    </div>
  );
}
