import { useEffect, useState } from "react";
import { uiIcons } from "../../utils/uiIcons";

/**
 * SaveStatus - Mostra o status do save do jogo
 * Exibe: "Não salvo ainda", "Salvando...", "Salvo em HH:MM"
 */
export function SaveStatus() {
  const [status, setStatus] = useState("Não salvo ainda");

  useEffect(() => {
    const handleStatus = (event) => {
      const detail = event?.detail;
      if (typeof detail === "string" && detail.trim()) {
        setStatus(detail);
      }
    };

    window.addEventListener("cocada:save-status", handleStatus);

    return () => window.removeEventListener("cocada:save-status", handleStatus);
  }, []);

  return (
    <div className="save-status">
      <span className="status-icon" aria-hidden="true">
        <img className="ui-inline-icon" src={uiIcons.floppyDisk} alt="" />
      </span>
      <span className="status-text">{status}</span>
    </div>
  );
}
