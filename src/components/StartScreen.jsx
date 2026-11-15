import { DIFFICULTIES, HALLS, SHELVES } from '../data/game'

export default function StartScreen({ difficulty, onDifficulty, onStart, scores }) {
  return (
    <div className="start">
      <div className="start__hero">
        <p className="eyebrow">A sorting game for the campus mail desk</p>
        <h1>
          Mailroom
          <br />
          Rush<span className="dot">.</span>
        </h1>
        <p className="lede">
          Packages are piling up at the front desk. Scan each label, find the resident, and get the
          parcel onto the right hall&apos;s shelf before your shift ends.
        </p>

        <div className="difficulty" role="radiogroup" aria-label="Difficulty">
          {Object.entries(DIFFICULTIES).map(([id, d]) => (
            <button
              key={id}
              role="radio"
              aria-checked={difficulty === id}
              className={`diff ${difficulty === id ? 'diff--on' : ''}`}
              onClick={() => onDifficulty(id)}
            >
              <span className="diff__name">{d.label}</span>
              <span className="diff__time">{d.seconds}s shift</span>
              <span className="diff__blurb">{d.blurb}</span>
            </button>
          ))}
        </div>

        <button className="btn btn--big" onClick={onStart}>
          Clock in →
        </button>
      </div>

      <aside className="start__side">
        <section className="panel">
          <h2>How it works</h2>
          <ol className="steps">
            <li>
              <strong>Read the label.</strong> Note the recipient and the parcel size.
            </li>
            <li>
              <strong>Look them up.</strong> Search the roster to find which hall they live in.
            </li>
            <li>
              <strong>Shelve it.</strong> Click the bin for that hall, on the shelf that fits the size.
            </li>
            <li>
              <strong>No match?</strong> Send it back with <em>Return to sender</em>.
            </li>
          </ol>
        </section>

        <section className="panel">
          <h2>Shelf guide</h2>
          <ul className="guide">
            {SHELVES.map((s) => (
              <li key={s.id}>
                <span className="guide__k">{s.label}</span>
                <span>{s.hint}</span>
              </li>
            ))}
          </ul>
          <div className="halls">
            {HALLS.map((h) => (
              <span key={h.id} className="hall-chip" style={{ '--hall': h.color }}>
                {h.name}
              </span>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Top shifts</h2>
          {scores.length === 0 ? (
            <p className="muted">No shifts logged on this device yet.</p>
          ) : (
            <ol className="scores">
              {scores.map((s, i) => (
                <li key={i}>
                  <span>{s.score.toLocaleString()}</span>
                  <span className="muted">
                    {DIFFICULTIES[s.difficulty]?.label} · {s.correct} sorted
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </aside>
    </div>
  )
}
