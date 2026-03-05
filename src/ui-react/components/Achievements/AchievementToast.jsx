import { useEffect, useState } from "react";
import { eventEmitter } from "../../adapters/eventEmitter.js";

const TOAST_DURATION_MS = 4000;

export function AchievementToast() {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const handleUnlocked = (achievement) => {
      if (!achievement) return;
      setQueue((prev) => [...prev, achievement]);
    };

    eventEmitter.on("achievementUnlocked", handleUnlocked);

    return () => {
      eventEmitter.off("achievementUnlocked", handleUnlocked);
    };
  }, []);

  useEffect(() => {
    if (current || queue.length === 0) return;

    const [next, ...remaining] = queue;
    setCurrent(next);
    setQueue(remaining);

    const timeout = setTimeout(() => {
      setCurrent(null);
    }, TOAST_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [current, queue]);

  if (!current) return null;

  const iconSrc = current?.icon || "";

  return (
    <aside className="achievement-toast" role="status" aria-live="polite">
      <div className="achievement-toast-header">
        <div className="achievement-toast-icon" aria-hidden="true">
          {iconSrc ? (
            <img
              className="achievement-toast-icon-image"
              src={iconSrc}
              alt=""
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="achievement-toast-icon-fallback">🏆</span>
          )}
        </div>
        <p className="achievement-toast-title">CONQUISTA!</p>
      </div>
      <p className="achievement-toast-name">{current.name}</p>
      <p className="achievement-toast-description">{current.description}</p>
    </aside>
  );
}
