import { getUpgradeMechanicalEffect } from "@core/utils/upgradeEffects.js";
import { stateSelectors } from "../../adapters/stateAdapter";
import { useGameActions } from "../../hooks/useGameActions";
import { useGameState } from "../../hooks/useGameState";
import { formatCurrency } from "../../utils/formatters";

/**
 * UpgradeCard - Compatível com .shopItem vanilla
 */
export function UpgradeCard({ upgradeKey, upgradeDef }) {
  const cocadas = useGameState(stateSelectors.cocadas);
  const bought = useGameState(stateSelectors.upgradeBought(upgradeKey));
  const cost = useGameState(stateSelectors.upgradeCost(upgradeKey));

  const { buyUpgrade } = useGameActions();
  const canAfford = cocadas >= cost && !bought;
  const mechanicalEffect = getUpgradeMechanicalEffect(upgradeDef);
  const isLootbox = Boolean(upgradeDef.lootboxOnly);

  const handleBuy = () => {
    if (!canAfford) return;
    buyUpgrade(upgradeKey);
  };

  return (
    <div
      className={`shopItem ${isLootbox ? "shopItem--lootbox" : ""} ${bought ? "shopItem--bought" : ""}`}
    >
      {upgradeDef.icon && (
        <div
          className="shopArt"
          style={{ backgroundImage: `url(assets/upgrades/${upgradeDef.icon})` }}
        />
      )}
      <div className="shopTitle">
        {upgradeDef.name}
        {isLootbox && <span className="lootboxBadge">LOOTBOX</span>}
      </div>
      <div className="shopEffect">{mechanicalEffect}</div>
      <div className="shopDesc">{upgradeDef.desc}</div>
      <div className="shopMeta">
        {isLootbox ? "Exclusivo do Lootbox" : bought ? "✓ Comprado" : formatCurrency(cost)}
      </div>
      {!bought && !isLootbox && (
        <button className={canAfford ? "primary" : ""} onClick={handleBuy} disabled={!canAfford}>
          Comprar
        </button>
      )}
    </div>
  );
}
