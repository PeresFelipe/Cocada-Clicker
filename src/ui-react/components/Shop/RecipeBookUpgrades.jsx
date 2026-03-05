import { defs } from "@core/defs.js";
import { getVisibleUpgradeKeys } from "@core/systems/seededContent.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { stateSelectors } from "../../adapters/stateAdapter";
import { useGameActions } from "../../hooks/useGameActions";
import { useGameState } from "../../hooks/useGameState";
import { UpgradeTooltip } from "./UpgradeTooltip";

const STARTER_UPGRADE_KEY = "vantagem_da_casa";

function RecipeEntry({ upgradeKey, upgradeDef, showDetails }) {
  const cocadas = useGameState(stateSelectors.cocadas);
  const bought = useGameState(stateSelectors.upgradeBought(upgradeKey));
  const cost = useGameState(stateSelectors.upgradeCost(upgradeKey));
  const { buyUpgrade } = useGameActions();

  const isUnlocked = true;
  const canAfford = cocadas >= cost && !bought;

  // Hooks devem ser chamados antes de qualquer return condicional
  const [isJustUnlocked, setIsJustUnlocked] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState(null);
  const previousUnlocked = useRef(isUnlocked);
  const entryRef = useRef(null);

  useEffect(() => {
    if (!previousUnlocked.current && isUnlocked && !bought) {
      setIsJustUnlocked(true);
      const timeoutId = setTimeout(() => setIsJustUnlocked(false), 1200);
      return () => clearTimeout(timeoutId);
    }

    previousUnlocked.current = isUnlocked;
    return undefined;
  }, [isUnlocked, bought]);

  useEffect(() => {
    previousUnlocked.current = isUnlocked;
  }, [isUnlocked]);

  useEffect(() => {
    if (!showTooltip || !entryRef.current) return undefined;

    const tooltipWidth = 320;
    const tooltipHeight = 236;
    const gap = 10;
    const viewportPadding = 12;

    const updateTooltipPosition = () => {
      if (!entryRef.current) return;
      const entryRect = entryRef.current.getBoundingClientRect();

      let left = entryRect.left + entryRect.width / 2 - tooltipWidth / 2;
      left = Math.max(
        viewportPadding,
        Math.min(left, window.innerWidth - tooltipWidth - viewportPadding),
      );

      const spaceAbove = entryRect.top - viewportPadding;
      const spaceBelow = window.innerHeight - entryRect.bottom - viewportPadding;

      const prefersTop = spaceAbove >= tooltipHeight + gap || spaceAbove >= spaceBelow;
      let top = prefersTop ? entryRect.top - tooltipHeight - gap : entryRect.bottom + gap;

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

  const handleBuy = () => {
    if (!canAfford) return;
    buyUpgrade(upgradeKey);
  };

  const pageState = bought
    ? "active"
    : canAfford
      ? "available"
      : isUnlocked
        ? "revealed"
        : "blocked";

  return (
    <article
      ref={entryRef}
      className={`recipeEntry ${showDetails ? "recipeEntry--detailed" : ""} ${isUnlocked ? "" : "recipeEntry--locked"} ${canAfford ? "recipeEntry--affordable" : ""} ${bought ? "recipeEntry--bought" : ""} ${isJustUnlocked ? "recipeEntry--justUnlocked" : ""}`}
      data-page-state={pageState}
      aria-label={`Receita ${upgradeDef.name}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`recipeEntryTop ${showDetails ? "" : "recipeEntryTop--iconOnly"}`}
        onClick={!bought ? handleBuy : undefined}
        role={!bought ? "button" : undefined}
        tabIndex={!bought ? 0 : undefined}
        onKeyDown={!bought ? (e) => e.key === "Enter" && handleBuy() : undefined}
      >
        <div className={`recipeIcon ${isUnlocked ? "" : "recipeIcon--silhouette"}`}>
          {upgradeDef.icon ? (
            <img
              src={`assets/upgrades/${upgradeDef.icon}`}
              alt={isUnlocked ? upgradeDef.name : "Receita bloqueada"}
            />
          ) : (
            <span aria-hidden="true">📖</span>
          )}
        </div>

        {showDetails && (
          <div className="recipeEntryInfo">
            <strong className="recipeEntryName">{upgradeDef.name}</strong>
            <span className="recipeEntryCost">{bought ? "✓ Comprado" : `${cost} cocadas`}</span>
          </div>
        )}
      </div>

      {/* Tooltip renderizado ao hover - FORA do recipeEntryTop */}
      {showTooltip && (
        <UpgradeTooltip
          upgradeDef={upgradeDef}
          cost={cost}
          isAffordable={canAfford}
          style={tooltipStyle}
        />
      )}
    </article>
  );
}

export function RecipeBookUpgrades() {
  const flavor = useGameState(stateSelectors.flavor);
  const maxCocadasSeen = useGameState(stateSelectors.maxCocadasSeen);
  const contentSeed = useGameState(stateSelectors.contentSeed);
  const upgradesState = useGameState(stateSelectors.upgradesState);
  const [showBookHelp, setShowBookHelp] = useState(false);
  const [showOwnedList, setShowOwnedList] = useState(false);
  const helpPanelRef = useRef(null);
  const helpButtonRef = useRef(null);
  const ownedPanelRef = useRef(null);
  const ownedButtonRef = useRef(null);

  useEffect(() => {
    if (!showBookHelp) return undefined;

    const handlePointerDown = (event) => {
      const target = event.target;

      if (helpPanelRef.current?.contains(target) || helpButtonRef.current?.contains(target)) {
        return;
      }

      setShowBookHelp(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowBookHelp(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showBookHelp]);

  useEffect(() => {
    if (!showOwnedList) return undefined;

    const handlePointerDown = (event) => {
      const target = event.target;

      if (ownedPanelRef.current?.contains(target) || ownedButtonRef.current?.contains(target)) {
        return;
      }

      setShowOwnedList(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowOwnedList(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showOwnedList]);

  const upgrades = useMemo(
    () =>
      getVisibleUpgradeKeys({
        flavor,
        maxCocadasSeen,
        contentSeed,
      }).map((key) => [key, defs.upgrades[key]]),
    [flavor, maxCocadasSeen, contentSeed],
  );

  const allBoughtEntries = useMemo(() => {
    const orderByDefinition = new Map(upgrades.map(([key], index) => [key, index]));

    return upgrades
      .filter(([upgradeKey]) => upgradesState?.[upgradeKey]?.bought)
      .sort((a, b) => {
        const aBoughtAt = upgradesState?.[a[0]]?.boughtAt ?? 0;
        const bBoughtAt = upgradesState?.[b[0]]?.boughtAt ?? 0;

        if (bBoughtAt !== aBoughtAt) {
          return bBoughtAt - aBoughtAt;
        }

        return (orderByDefinition.get(a[0]) ?? 0) - (orderByDefinition.get(b[0]) ?? 0);
      });
  }, [upgrades, upgradesState]);

  const spreadPages = useMemo(() => {
    const availableEntries = upgrades.filter(
      ([upgradeKey]) => !upgradesState?.[upgradeKey]?.bought,
    );
    const page1 = availableEntries.slice(0, 10);
    const page2 = availableEntries.slice(10, 20);

    return [page1, page2];
  }, [upgrades, upgradesState]);

  const isLeftCompact = spreadPages[0].length >= 5;
  const isRightCompact = spreadPages[1].length >= 5;

  return (
    <section className="recipeBook recipeBook--open" aria-label="Livro de receitas de upgrades">
      <div className="pageShadowLayer" aria-hidden="true" />
      <div className="paperTextureLayer" aria-hidden="true" />
      <div className="paperImperfectionLayer" aria-hidden="true" />

      <div className="recipeBookInner">
        <header className="recipeBookHeader">
          <div className="recipeBookTitleWrap">
            <h3>Livro de Receitas</h3>
            {showBookHelp && (
              <div ref={helpPanelRef} className="recipeBookHelp" role="note">
                <p>
                  Este livro mostra apenas upgrades <strong>Disponíveis</strong> para compra em duas
                  páginas (até 10 por página).
                </p>
                <p>
                  Para ver os upgrades já adquiridos, use o botão <strong>📜</strong> ao lado do 02.
                </p>
              </div>
            )}
          </div>

          <button
            ref={helpButtonRef}
            type="button"
            className="recipeHelpButton"
            aria-label="Ajuda sobre o livro de receitas"
            aria-expanded={showBookHelp}
            onClick={() => setShowBookHelp((prev) => !prev)}
          >
            ?
          </button>
        </header>

        <div className="bookPageEdge" aria-hidden="true" />
        <div className="recipeBookSpine" aria-hidden="true" />

        <div className="recipeSpread">
          <section
            className="recipeLeaf recipeLeaf--left"
            aria-label="Página esquerda de disponíveis"
          >
            <div className="paperTextureLayer paperTextureLayer--page" aria-hidden="true" />
            <div
              className="paperImperfectionLayer paperImperfectionLayer--page"
              aria-hidden="true"
            />

            <div className="recipeSectionLabel">Disponíveis +</div>

            <div className={`recipeEntryList ${isLeftCompact ? "recipeEntryList--compact" : ""}`}>
              {spreadPages[0].map(([upgradeKey, upgradeDef]) => (
                <RecipeEntry
                  key={upgradeKey}
                  upgradeKey={upgradeKey}
                  upgradeDef={upgradeDef}
                  showDetails={upgradeKey === STARTER_UPGRADE_KEY}
                />
              ))}
            </div>

            <span className="recipePageNumber">01</span>
          </section>

          <div className="recipeGutter" aria-hidden="true" />

          <section
            className="recipeLeaf recipeLeaf--right"
            aria-label="Página direita de disponíveis"
          >
            <div className="paperTextureLayer paperTextureLayer--page" aria-hidden="true" />
            <div
              className="paperImperfectionLayer paperImperfectionLayer--page"
              aria-hidden="true"
            />

            <div className="recipeSectionLabel">Disponíveis</div>

            <div className={`recipeEntryList ${isRightCompact ? "recipeEntryList--compact" : ""}`}>
              {spreadPages[1].map(([upgradeKey, upgradeDef]) => (
                <RecipeEntry
                  key={upgradeKey}
                  upgradeKey={upgradeKey}
                  upgradeDef={upgradeDef}
                  showDetails={upgradeKey === STARTER_UPGRADE_KEY}
                />
              ))}
            </div>

            {showOwnedList && (
              <div
                ref={ownedPanelRef}
                className="recipeOwnedListPanel"
                role="dialog"
                aria-label="Upgrades adquiridos"
              >
                <div className="recipeOwnedListTitle">Todos os upgrades adquiridos</div>
                {allBoughtEntries.length ? (
                  <ul className="recipeOwnedListItems">
                    {allBoughtEntries.map(([upgradeKey, upgradeDef]) => (
                      <li key={upgradeKey}>
                        {upgradeDef.icon ? (
                          <span className="recipeOwnedListItemIcon" aria-hidden="true">
                            <img src={`assets/upgrades/${upgradeDef.icon}`} alt="" loading="lazy" />
                          </span>
                        ) : null}
                        <span className="recipeOwnedListItemName">{upgradeDef.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="recipeOwnedListEmpty">Nenhum upgrade adquirido ainda.</p>
                )}
              </div>
            )}

            <div className="recipePageActions">
              <span className="recipePageNumber recipePageNumber--inline">02</span>
              <button
                ref={ownedButtonRef}
                type="button"
                className="recipeOwnedListButton"
                aria-label="Ver upgrades adquiridos"
                aria-expanded={showOwnedList}
                onClick={() => setShowOwnedList((prev) => !prev)}
              >
                📜
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
