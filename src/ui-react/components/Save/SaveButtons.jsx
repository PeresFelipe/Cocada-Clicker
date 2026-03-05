import { resetGame, saveGame } from "@core/systems/save.js";
import { useEffect, useRef, useState } from "react";
import { eventEmitter } from "../../adapters/eventEmitter.js";
import {
  getAvailableNumberFormatModes,
  getNumberFormatMode,
  setNumberFormatMode,
} from "../../utils/formatters";
import { uiIcons } from "../../utils/uiIcons";
import { SaveStatus } from "./SaveStatus";

/**
 * SaveButtons - Botões para controlar save/reset do jogo
 */
export function SaveButtons() {
  const [isSaving, setIsSaving] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [numberFormatMode, setNumberFormatModeState] = useState(() => getNumberFormatMode());
  const menuRef = useRef(null);

  const numberFormatModes = getAvailableNumberFormatModes();

  useEffect(() => {
    if (!isOptionsOpen) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current?.contains(event.target)) return;
      setIsOptionsOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOptionsOpen(false);
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
  }, [isOptionsOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      saveGame();
      console.log("✅ Jogo salvo!");
      setIsOptionsOpen(false);
    } catch (e) {
      console.error("Erro ao salvar:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm("⚠️ Tem certeza? Isso vai deletar todo o progresso do jogo!");
    if (!confirmed) return;

    try {
      resetGame();
      console.log("✅ Jogo resetado!");
      setIsOptionsOpen(false);
    } catch (e) {
      console.error("Erro ao resetar:", e);
    }
  };

  const handleSetNumberFormat = (mode) => {
    const resolvedMode = setNumberFormatMode(mode);
    setNumberFormatModeState(resolvedMode);
    eventEmitter.emit("uiFormatChange", { mode: resolvedMode });
  };

  const getModeLabel = (mode) => {
    if (mode === "short") return "Curto (K/M)";
    if (mode === "long") return "Longo";
    return "Raw";
  };

  return (
    <div className="save-buttons" ref={menuRef}>
      <button
        type="button"
        className="btn-options"
        aria-haspopup="menu"
        aria-expanded={isOptionsOpen}
        onClick={() => setIsOptionsOpen((prev) => !prev)}
      >
        <span className="ui-inline-icon-wrap">
          <img className="ui-inline-icon" src={uiIcons.gear} alt="" />
          <span>Opções</span>
        </span>
      </button>

      {isOptionsOpen && (
        <div className="save-options-menu" role="menu" aria-label="Opções do jogo">
          <section className="options-section" aria-label="Sessão de salvamento">
            <div className="options-section-title">Salvamento</div>

            <div className="options-section-items">
              <button
                className="btn-save options-action"
                onClick={handleSave}
                disabled={isSaving}
                title="Salvar progresso do jogo"
                role="menuitem"
              >
                <span className="ui-inline-icon-wrap">
                  <img className="ui-inline-icon" src={uiIcons.floppyDisk} alt="" />
                  <span>{isSaving ? "Salvando..." : "Salvar"}</span>
                </span>
              </button>
              <button
                className="btn-reset options-action options-action--danger"
                onClick={handleReset}
                title="Resetar jogo e deletar progresso"
                role="menuitem"
              >
                <span className="ui-inline-icon-wrap">
                  <img className="ui-inline-icon" src={uiIcons.restart} alt="" />
                  <span>Reset</span>
                </span>
              </button>
            </div>

            <div className="options-section-status">
              <SaveStatus />
            </div>
          </section>

          <section className="options-section" aria-label="Sessão de formatação numérica">
            <div className="options-section-title">Números</div>

            <div className="options-section-items options-format-items">
              {numberFormatModes.map((mode) => (
                <button
                  key={mode}
                  className={`options-action options-action--format ${numberFormatMode === mode ? "options-action--active" : ""}`}
                  onClick={() => handleSetNumberFormat(mode)}
                  role="menuitemradio"
                  aria-checked={numberFormatMode === mode}
                >
                  {getModeLabel(mode)}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
