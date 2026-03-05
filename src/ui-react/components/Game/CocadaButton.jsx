import { useRef } from "react";
import { useGameActions } from "../../hooks/useGameActions";

/**
 * Botão da cocada que dispara o click do jogo
 */
export function CocadaButton() {
  const buttonRef = useRef(null);
  const { clickCocada } = useGameActions();

  const handleClick = (e) => {
    // Dispara o click no core
    clickCocada(e.clientX, e.clientY);

    // Animação visual
    if (buttonRef.current) {
      buttonRef.current.classList.add("cocada-pop");
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.classList.remove("cocada-pop");
        }
      }, 280);
    }
  };

  return (
    <button
      ref={buttonRef}
      id="cocadaBtn"
      className="cocada-btn"
      onClick={handleClick}
      title="Clique para ganhar cocadas!"
    >
      <img src="assets/cocada-coco.png" alt="Clique para ganhar cocadas" className="cocada-image" />
    </button>
  );
}
