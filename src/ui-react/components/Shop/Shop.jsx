import { BuildingsList } from "./BuildingsList";
import { RecipeBookUpgrades } from "./RecipeBookUpgrades";

/**
 * Shop - Compatível com layout vanilla
 */
export function Shop() {
  return (
    <>
      <RecipeBookUpgrades />
      <BuildingsList />
    </>
  );
}
