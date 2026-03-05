import { getUpgradeMechanicalEffect } from "@core/utils/upgradeEffects.js";
import { createPortal } from "react-dom";
import { formatCurrency } from "../../utils/formatters";

export function UpgradeTooltip({ upgradeDef, cost, isAffordable, style }) {
  const mechanicalEffect = getUpgradeMechanicalEffect(upgradeDef);

  const tooltipNode = (
    <div className="recipeUpgradeTooltip" style={style}>
      <div className="upgradeTooltipContent">
        {/* Icon + Header */}
        <div className="upgradeTooltipTop">
          <div className="upgradeTooltipIcon">
            {upgradeDef.icon ? (
              <img src={`assets/upgrades/${upgradeDef.icon}`} alt={upgradeDef.name} />
            ) : (
              <span>📖</span>
            )}
          </div>

          <div className="upgradeTooltipHeading">
            <h3 className="upgradeTooltipTitle">{upgradeDef.name}</h3>
            <div className="upgradeTooltipCategory">Melhoria</div>
          </div>
        </div>

        {/* Custo */}
        <div className="upgradeTooltipCostBadge">
          <span className="upgradeTooltipCostLabel">Preço:</span>
          {formatCurrency(cost)}
        </div>

        <div className="upgradeTooltipEffect">{mechanicalEffect}</div>

        {/* Descrição */}
        <div className="upgradeTooltipDescription">
          {upgradeDef.desc || "Melhoria especial do jogo"}
        </div>

        {/* Rodapé com CTA */}
        <div className="upgradeTooltipFooter">
          {isAffordable ? (
            <span className="upgradeTooltipActionLabel">Clique para comprar</span>
          ) : (
            <span className="upgradeTooltipActionLabel upgradeTooltipActionLabel--disabled">
              Saldo insuficiente
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return tooltipNode;
  }

  return createPortal(tooltipNode, document.body);
}
