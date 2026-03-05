import { memo, useEffect, useRef, useState } from "react";
import { useGameActions } from "../../hooks/useGameActions";
import { formatCurrency } from "../../utils/formatters";
import { BuildingTooltip } from "./BuildingTooltip";

/**
 * BuildingCard - Compatível com .shopItem vanilla
 */
function BuildingCardBase({ buildingModel }) {
  const {
    key: buildingKey,
    def: buildingDef,
    owned,
    cost,
    cps: buildingCps,
    produced,
    canAfford,
    isActive,
    isBlocked,
    isLootbox,
  } = buildingModel;

  const { buyBuilding } = useGameActions();

  const [isJustBought, setIsJustBought] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState(null);
  const previousOwned = useRef(owned);
  const cardRef = useRef(null);

  useEffect(() => {
    if (owned > previousOwned.current) {
      setIsJustBought(true);
      const timeoutId = setTimeout(() => setIsJustBought(false), 900);
      previousOwned.current = owned;
      return () => clearTimeout(timeoutId);
    }

    previousOwned.current = owned;
    return undefined;
  }, [owned]);

  useEffect(() => {
    if (!showTooltip || !cardRef.current) return undefined;

    const tooltipWidth = 320;
    const tooltipHeight = 262;
    const gap = 10;
    const viewportPadding = 12;

    const updateTooltipPosition = () => {
      if (!cardRef.current) return;
      const cardRect = cardRef.current.getBoundingClientRect();

      let left = cardRect.left + cardRect.width / 2 - tooltipWidth / 2;
      left = Math.max(
        viewportPadding,
        Math.min(left, window.innerWidth - tooltipWidth - viewportPadding),
      );

      const spaceAbove = cardRect.top - viewportPadding;
      const spaceBelow = window.innerHeight - cardRect.bottom - viewportPadding;
      const prefersTop = spaceAbove >= tooltipHeight + gap || spaceAbove >= spaceBelow;

      let top = prefersTop ? cardRect.top - tooltipHeight - gap : cardRect.bottom + gap;
      top = Math.max(
        viewportPadding,
        Math.min(top, window.innerHeight - tooltipHeight - viewportPadding),
      );

      setTooltipStyle({
        left: `${Math.round(left)}px`,
        top: `${Math.round(top)}px`,
        width: `${tooltipWidth}px`,
      });
    };

    updateTooltipPosition();

    window.addEventListener("resize", updateTooltipPosition);
    window.addEventListener("scroll", updateTooltipPosition, true);

    return () => {
      window.removeEventListener("resize", updateTooltipPosition);
      window.removeEventListener("scroll", updateTooltipPosition, true);
    };
  }, [showTooltip]);

  const handleBuy = (e) => {
    e.stopPropagation();
    if (!canAfford) return;
    buyBuilding(buildingKey);
  };

  const buildingImage = buildingDef.icon || buildingDef.img;

  return (
    <article
      ref={cardRef}
      className={`beachMenuItem ${isLootbox ? "beachMenuItem--lootbox" : ""} ${isBlocked ? "beachMenuItem--blocked" : ""} ${canAfford ? "beachMenuItem--available" : ""} ${isActive ? "beachMenuItem--active" : ""} ${isJustBought ? "beachMenuItem--justBought" : ""}`}
      aria-label={`Estrutura ${buildingDef.name}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {buildingImage && (
        <div className="beachMenuIconWrap">
          <img src={buildingImage} alt={buildingDef.name} className="beachMenuIcon" />
        </div>
      )}

      <div className="beachMenuInfo">
        <h4 className="beachMenuName">
          {buildingDef.name}
          {isLootbox && <span className="lootboxBadge">LOOTBOX</span>}
        </h4>
        <div className="beachMenuDetails">
          {isLootbox ? (
            <>
              <span className="beachMenuCost lootboxCost">Exclusivo do Lootbox</span>
              <span className="beachMenuOwned">Unico: {owned > 0 ? "Sim" : "Nao"}</span>
            </>
          ) : (
            <>
              <span className="beachMenuCost">
                🥥 <strong>{formatCurrency(cost)}</strong>
              </span>
              <span className="beachMenuOwned">Comprados: {owned}</span>
            </>
          )}
        </div>
      </div>

      {!isLootbox && (
        <button
          className="beachMenuBuyBtn"
          onClick={handleBuy}
          disabled={!canAfford}
          aria-label={`Comprar ${buildingDef.name}`}
        >
          COMPRAR
        </button>
      )}

      {showTooltip && (
        <BuildingTooltip
          buildingDef={buildingDef}
          cost={cost}
          buildingCps={buildingCps}
          produced={produced}
          style={tooltipStyle}
        />
      )}
    </article>
  );
}

export const BuildingCard = memo(BuildingCardBase);
