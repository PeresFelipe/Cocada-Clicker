import { stateSelectors } from "../../adapters/stateAdapter.js";
import { useGameState } from "../../hooks/useGameState.js";

const CATEGORY_LABELS = {
  clique: "CLIQUE",
  producao: "PRODUCAO",
  estruturas: "ESTRUTURAS",
  upgrades: "UPGRADES",
  tempo: "TEMPO JOGADO",
  secretas: "SECRETAS",
  absurdas: "ABSURDAS",
};

function AchievementCard({ achievement }) {
  const iconSrc = achievement?.icon || "";
  const iconAlt = `Icone da conquista ${achievement.name}`;

  return (
    <article
      className={`achievement-card ${achievement.unlocked ? "achievement-card--unlocked" : "achievement-card--locked"}`}
    >
      <div className="achievement-card-icon" aria-hidden="true">
        {iconSrc ? (
          <img
            className="achievement-card-icon-image"
            src={iconSrc}
            alt={iconAlt}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="achievement-card-icon-fallback">
            {achievement.unlocked ? "🏆" : "🔒"}
          </span>
        )}
      </div>
      <div className="achievement-card-text">
        <strong>{achievement.name}</strong>
        <p>{achievement.description}</p>
      </div>
    </article>
  );
}

export function AchievementsPanel({ onClose }) {
  const achievements = useGameState(stateSelectors.achievements);
  const totalUnlocked = useGameState(stateSelectors.achievementsTotalUnlocked);

  const grouped = achievements.reduce((acc, item) => {
    const key = item.category || "geral";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div
      className="achievements-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Painel de conquistas"
    >
      <div className="achievements-backdrop" onClick={onClose} />

      <section className="achievements-window">
        <header className="achievements-header">
          <h2>CONQUISTAS</h2>
          <span>{totalUnlocked} desbloqueadas</span>
        </header>

        <div className="achievements-content">
          {Object.keys(grouped).map((categoryKey) => (
            <section key={categoryKey} className="achievements-category">
              <h3>{CATEGORY_LABELS[categoryKey] || categoryKey.toUpperCase()}</h3>

              <div className="achievements-grid">
                {grouped[categoryKey].map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="achievements-footer">
          <button type="button" className="achievements-close" onClick={onClose}>
            Fechar
          </button>
        </footer>
      </section>
    </div>
  );
}
