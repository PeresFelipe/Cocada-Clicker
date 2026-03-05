import { useEffect, useState } from "react";
import { useGameActions } from "../../hooks/useGameActions";

/**
 * Componente que renderiza um coco aleatório na tela
 * O jogador pode clicar nele para ganhar um lootbox
 */
export function RandomLootboxCoco() {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { addLootbox } = useGameActions();
  const [nextSpawnTime, setNextSpawnTime] = useState(null);

  // Configurar spawn aleatório do coco
  useEffect(() => {
    const scheduleNextSpawn = () => {
      // Spawn aleatório a cada 15-45 segundos
      const delay = Math.random() * 30000 + 15000;

      const timeout = setTimeout(() => {
        // Gera posição aleatória na tela
        const x = Math.random() * (window.innerWidth - 80);
        const y = Math.random() * (window.innerHeight - 80);

        setPosition({ x, y });
        setVisible(true);

        // Desaparece após 8 segundos se não clicar
        setTimeout(() => {
          setVisible(false);
          scheduleNextSpawn();
        }, 8000);
      }, delay);

      return () => clearTimeout(timeout);
    };

    const cleanup = scheduleNextSpawn();
    return cleanup;
  }, []);

  const handleCocoClick = (e) => {
    e.stopPropagation();
    if (!visible) return;

    setVisible(false);
    addLootbox(1);
    console.log("🎁 Lootbox ganha ao clicar no coco aleatório!");

    // Re-agendar próximo spawn
    const delay = Math.random() * 30000 + 15000;
    setTimeout(() => {
      const x = Math.random() * (window.innerWidth - 80);
      const y = Math.random() * (window.innerHeight - 80);
      setPosition({ x, y });
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
      }, 8000);
    }, delay);
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleCocoClick}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: "pointer",
        zIndex: 1000,
        animation: "cocoAppear 0.5s ease-out",
      }}
      className="random-coco"
      title="Clique para ganhar uma lootbox!"
    >
      <div
        style={{
          fontSize: "60px",
          filter: "drop-shadow(0 0 8px rgba(255, 200, 0, 0.8))",
          animation: "cocoBob 2s ease-in-out infinite",
        }}
      >
        🥥
      </div>
    </div>
  );
}
