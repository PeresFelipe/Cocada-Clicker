import { defs } from "../defs.js";
import { formatNumber, formatPercent } from "./numberFormat.js";

function getBuildingName(buildingKey) {
  return defs.buildings?.[buildingKey]?.name || buildingKey;
}

function formatCondition(condition) {
  if (!condition?.buildings) return "";

  return Object.entries(condition.buildings)
    .map(([buildingKey, amount]) => `${formatNumber(amount)} ${getBuildingName(buildingKey)}`)
    .join(" + ");
}

export function getUpgradeMechanicalEffect(upgradeDef) {
  switch (upgradeDef.type) {
    case "clickMultiplier":
      return `Clique x${formatNumber(upgradeDef.value)}`;

    case "globalCPSMultiplier":
      return `CPS global x${formatNumber(upgradeDef.value)}`;

    case "perClickBonus":
      return `+${formatNumber(upgradeDef.value)} por clique`;

    case "buildingMultiplier": {
      const buildingName = getBuildingName(upgradeDef.target);
      return `${buildingName}: CPS x${formatNumber(upgradeDef.value)}`;
    }

    case "buildingCostReduction": {
      const reduction = formatPercent(upgradeDef.value);
      if (upgradeDef.target === "all") {
        return `Todas construções: -${reduction} no custo`;
      }

      const buildingName = getBuildingName(upgradeDef.target);
      return `${buildingName}: -${reduction} no custo`;
    }

    case "synergyBonus": {
      const conditionLabel = formatCondition(upgradeDef.condition);
      if (upgradeDef.synergyType === "globalCPSMultiplier") {
        return conditionLabel
          ? `Sinergia (${conditionLabel}): CPS global x${formatNumber(upgradeDef.value)}`
          : `Sinergia: CPS global x${formatNumber(upgradeDef.value)}`;
      }

      return conditionLabel
        ? `Sinergia (${conditionLabel}): bônus especial`
        : "Sinergia: bônus especial";
    }

    default:
      return upgradeDef.effect || "Efeito especial";
  }
}
