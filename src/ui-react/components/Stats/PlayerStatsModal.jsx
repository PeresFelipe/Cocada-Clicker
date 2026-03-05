import { useEffect, useMemo, useState } from "react";
import { usePlayerStats } from "../../hooks/usePlayerStats";
import { formatDurationMs, formatNumber, formatPercent } from "../../utils/formatters";
import { uiIcons } from "../../utils/uiIcons";

function StatsSection({ title, rows }) {
  return (
    <section className="player-stats-section">
      <h3>{title}</h3>
      <div className="player-stats-rows">
        {rows.map((row) => (
          <p key={`${title}-${row.label}`} className="player-stats-row">
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </p>
        ))}
      </div>
    </section>
  );
}

export function PlayerStatsModal({ onClose }) {
  const stats = usePlayerStats();
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const baseSections = useMemo(() => {
    if (!stats) return [];

    return [
      {
        title: "ECONOMIA",
        rows: [
          { label: "Produção total", value: formatNumber(stats.economy.cocadasTotalProduced) },
          { label: "Cocadas atuais", value: formatNumber(stats.economy.cocadasCurrent) },
          { label: "CPS", value: formatNumber(stats.economy.cps) },
        ],
      },
      {
        title: "INTERAÇÃO",
        rows: [
          { label: "Cliques totais", value: formatNumber(stats.interaction.totalClicks) },
          { label: "Cocadas por clique", value: formatNumber(stats.interaction.cocadasPerClick) },
        ],
      },
      {
        title: "PROGRESSÃO",
        rows: [
          {
            label: "Construções compradas",
            value: formatNumber(stats.progression.totalBuildingsBought),
          },
          {
            label: "Upgrades comprados",
            value: formatNumber(stats.progression.totalUpgradesBought),
          },
        ],
      },
      {
        title: "TEMPO",
        rows: [
          { label: "Tempo total jogado", value: formatDurationMs(stats.time.totalPlayTimeMs) },
          {
            label: "Desde o último save",
            value:
              stats.time.timeSinceLastSaveMs === null
                ? "Sem save"
                : formatDurationMs(stats.time.timeSinceLastSaveMs),
          },
        ],
      },
      {
        title: "EXTRA",
        rows: [
          { label: "Maior CPS", value: formatNumber(stats.extra.highestCps || 0) },
          { label: "Cocadas gastas", value: formatNumber(stats.extra.cocadasSpent) },
          { label: "Ganhas por clique", value: formatNumber(stats.extra.cocadasFromClicks) },
          { label: "Ganhas automático", value: formatNumber(stats.extra.cocadasFromAuto) },
        ],
      },
    ];
  }, [stats]);

  if (!stats) return null;

  return (
    <div
      className="player-stats-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Painel de estatísticas"
    >
      <div className="player-stats-backdrop" onClick={onClose} />

      <div className="player-stats-window">
        <header className="player-stats-header">
          <h2>ESTATÍSTICAS</h2>
        </header>

        <div className="player-stats-content">
          {baseSections.map((section) => (
            <StatsSection key={section.title} title={section.title} rows={section.rows} />
          ))}

          <section className="player-stats-section">
            <h3>CONSTRUÇÕES POR TIPO</h3>
            <div className="player-stats-buildings">
              {stats.progression.buildingBreakdown.map((building) => (
                <p key={building.key} className="player-stats-row">
                  <span>{building.name}</span>
                  <strong>{formatNumber(building.owned)}</strong>
                </p>
              ))}
            </div>
          </section>

          {showAdvanced && (
            <>
              <StatsSection
                title="EFICIÊNCIA"
                rows={[
                  {
                    label: "Cocadas por minuto",
                    value: formatNumber(stats.efficiency.cocadasPerMinute),
                  },
                  {
                    label: "Média por clique",
                    value: formatNumber(stats.efficiency.averageCocadasPerClick),
                  },
                  {
                    label: "% automático",
                    value: formatPercent(stats.efficiency.autoProductionPercent),
                  },
                  {
                    label: "% clique",
                    value: formatPercent(stats.efficiency.clickProductionPercent),
                  },
                ]}
              />

              <StatsSection
                title="HISTÓRICO"
                rows={[
                  { label: "Pico de CPS", value: formatNumber(stats.history.peakCps) },
                  { label: "Maior clique", value: formatNumber(stats.history.biggestClick) },
                  {
                    label: "Melhor minuto",
                    value: formatNumber(stats.history.bestMinuteProduction),
                  },
                ]}
              />

              <StatsSection
                title="COMPORTAMENTO"
                rows={[
                  {
                    label: "Cliques por minuto",
                    value: formatNumber(stats.behavior.clicksPerMinute),
                  },
                  { label: "Tempo ocioso", value: formatDurationMs(stats.behavior.idleTimeMs) },
                  { label: "Construção favorita", value: stats.behavior.favoriteBuilding },
                ]}
              />

              <StatsSection
                title="ESTATÍSTICAS AVANÇADAS"
                rows={[
                  { label: "RNG seed do sabor", value: stats.advanced.rngSeed },
                  {
                    label: "Taxa de crescimento",
                    value: formatPercent(stats.advanced.economyGrowthRate * 100),
                  },
                  {
                    label: "Multiplicadores",
                    value: `G:${formatNumber(stats.advanced.multipliers.global)} C:${formatNumber(stats.advanced.multipliers.click)} A:${formatNumber(stats.advanced.multipliers.cps)}`,
                  },
                ]}
              />
            </>
          )}
        </div>

        <footer className="player-stats-footer">
          <button
            type="button"
            className="player-stats-toggle-advanced"
            onClick={() => setShowAdvanced((prev) => !prev)}
          >
            <span className="ui-inline-icon-wrap">
              <img className="ui-inline-icon" src={uiIcons.option} alt="" />
              <span>{showAdvanced ? "OCULTAR AVANCADAS" : "ESTATISTICAS AVANCADAS"}</span>
            </span>
          </button>

          <button type="button" className="player-stats-close" onClick={onClose}>
            <span className="ui-inline-icon-wrap">
              <img className="ui-inline-icon" src={uiIcons.exit} alt="" />
              <span>Fechar</span>
            </span>
          </button>
        </footer>
      </div>
    </div>
  );
}
