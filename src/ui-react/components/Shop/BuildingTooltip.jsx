import { createPortal } from "react-dom";
import { formatCurrency, formatNumber } from "../../utils/formatters";

export function BuildingTooltip({ buildingDef, cost, buildingCps, produced, style }) {
  const tooltipIconValue = buildingDef.tooltipIcon || buildingDef.icon || buildingDef.img;
  const tooltipIconSrc =
    typeof tooltipIconValue === "string" &&
    tooltipIconValue.length > 0 &&
    !tooltipIconValue.includes("/") &&
    !tooltipIconValue.startsWith("http")
      ? `assets/buildings/${tooltipIconValue}`
      : tooltipIconValue;

  const tooltipNode = (
    <div className="buildingHoverTooltip" style={style}>
      <div className="buildingHoverTooltipContent">
        <div className="buildingHoverTooltipTop">
          <div className="buildingHoverTooltipIcon">
            {tooltipIconSrc ? (
              <img src={tooltipIconSrc} alt={buildingDef.name} />
            ) : (
              <span aria-hidden="true">🏪</span>
            )}
          </div>

          <div className="buildingHoverTooltipHeading">
            <h3 className="buildingHoverTooltipTitle">{buildingDef.name}</h3>
            <p className="buildingHoverTooltipDescription">{buildingDef.desc}</p>
          </div>
        </div>

        <div className="buildingHoverTooltipCostBadge">
          <span className="buildingHoverTooltipCostLabel">Preço:</span>
          {buildingDef.lootboxOnly ? "Exclusivo do Lootbox" : formatCurrency(cost)}
        </div>

        <div className="buildingHoverTooltipStats">
          <div className="buildingHoverTooltipStatRow buildingHoverTooltipStatRow--production">
            <span className="buildingHoverTooltipLabel">Produção:</span>
            <strong className="buildingHoverTooltipValue">{formatNumber(buildingCps)}/s</strong>
          </div>

          <div className="buildingHoverTooltipStatRow buildingHoverTooltipStatRow--produced">
            <span className="buildingHoverTooltipLabel">Produzido até agora:</span>
            <strong className="buildingHoverTooltipValue">{formatNumber(produced)} cocadas</strong>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return tooltipNode;
  }

  return createPortal(tooltipNode, document.body);
}
