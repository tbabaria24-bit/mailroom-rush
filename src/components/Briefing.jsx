// Shown before each career day: what's new on the desk today.
export default function Briefing({ day, onReady, onBack }) {
  return (
    <div className="overlay overlay--page" role="dialog" aria-modal="true" aria-labelledby="brief-title">
      <div className="modal modal--brief">
        <p className="eyebrow">
          {day.day} · Target {day.target.toLocaleString()} pts · {day.seconds}-second shift
        </p>
        <h2 id="brief-title">{day.title}</h2>
        <div className="new-rule">New today: {day.newRule}</div>
        <ul className="brief__list">
          {day.briefing.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="modal__actions">
          <button className="btn btn--big" onClick={onReady} autoFocus>
            Clock in →
          </button>
          <button className="btn btn--ghost" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
