import { uiIcons } from "../../utils/uiIcons";

export function PlayerStatsButton({ onOpen }) {
  return (
    <button type="button" className="btn-options stats-open-button" onClick={onOpen}>
      <span className="ui-inline-icon-wrap">
        <img className="ui-inline-icon" src={uiIcons.info} alt="" />
        <span>ESTATÍSTICAS</span>
      </span>
    </button>
  );
}
