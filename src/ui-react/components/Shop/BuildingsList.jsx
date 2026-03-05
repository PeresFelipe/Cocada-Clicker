import { stateSelectors } from "../../adapters/stateAdapter";
import { useGameState } from "../../hooks/useGameState";
import { BuildingCard } from "./BuildingCard";

/**
 * BuildingsList - Compatível com .shopList vanilla
 */
export function BuildingsList() {
  const buildingCards = useGameState(stateSelectors.shopBuildingCards);

  const hasOnlyBaseContent =
    buildingCards.length > 0 &&
    buildingCards.every((buildingCard) => buildingCard?.def?.flavor === "base");

  return (
    <section className="beachMenu" aria-label="Menu de estruturas do boteco">
      <header className="beachMenuHeader">
        <div>
          <h3>🍹 Menu do Boteco</h3>
          <p>
            {hasOnlyBaseContent
              ? "Itens iniciais (sem sabor): comece por aqui antes de escolher um sabor."
              : "Expanda seu quiosque: mais produção, mais cocadas por segundo."}
          </p>
        </div>
      </header>

      <div className="beachMenuList">
        {buildingCards.map((buildingCard) => (
          <BuildingCard key={buildingCard.key} buildingModel={buildingCard} />
        ))}
      </div>
    </section>
  );
}
