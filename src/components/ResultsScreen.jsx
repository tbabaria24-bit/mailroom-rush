import { useState } from 'react'
import { HALLS, rankFor } from '../data/game'
import { leaderboardEnabled, submitScore } from '../data/leaderboard'
import Leaderboard from './Leaderboard'

function PostScore({ result, onPosted }) {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem('mailroom-rush-name') || ''
    } catch {
      return ''
    }
  })
  const [status, setStatus] = useState('idle') // idle | saving | done | error

  if (!leaderboardEnabled || result.score <= 0) return null

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setStatus('saving')
    try {
      localStorage.setItem('mailroom-rush-name', name.trim())
    } catch {
      /* ignore */
    }
    try {
      const saved = await submitScore({ ...result, name, mode: result.label })
      setStatus('done')
      onPosted(saved.id)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') return <p className="badge badge--good">Posted to the global leaderboard ✓</p>

  return (
    <form className="post" onSubmit={submit}>
      <input
        className="search"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name for the leaderboard"
        maxLength={16}
        aria-label="Name for the leaderboard"
      />
      <button className="btn" disabled={status === 'saving' || !name.trim()}>
        {status === 'saving' ? 'Posting…' : 'Post score'}
      </button>
      {status === 'error' && <p className="muted post__err">Couldn&apos;t reach the leaderboard. Try again.</p>}
    </form>
  )
}

export default function ResultsScreen({ result, onReplay, onNextDay, onMenu }) {
  const [postedId, setPostedId] = useState(null)
  const total = result.correct + result.wrong
  const accuracy = total ? result.correct / total : 0
  const rank = rankFor(result.score, accuracy)
  const { career } = result

  return (
    <div className="results">
      <div className="results__card">
        <p className="eyebrow">Shift complete · {result.label}</p>

        {career && (
          <div className={`verdict ${career.passed ? 'verdict--pass' : 'verdict--fail'}`}>
            {career.passed
              ? career.isLastDay
                ? '🏆 You survived your first week on the desk!'
                : '✅ Target hit. Tomorrow is unlocked.'
              : `Target was ${career.target.toLocaleString()}. Try the day again.`}
          </div>
        )}

        <div className="results__rank">
          <span className="results__emoji">{rank.emoji}</span>
          <h1>{rank.title}</h1>
        </div>
        <div className="results__score">
          {result.score.toLocaleString()}
          <span>points</span>
        </div>

        <div className="results__grid">
          <div>
            <span className="stat__v">{result.correct}</span>
            <span className="stat__k">Sorted right</span>
          </div>
          <div>
            <span className="stat__v">{Math.round(accuracy * 100)}%</span>
            <span className="stat__k">Accuracy</span>
          </div>
          <div>
            <span className="stat__v">{result.bestStreak}</span>
            <span className="stat__k">Best streak</span>
          </div>
          <div>
            <span className="stat__v">
              {result.pickupsDone}/{result.pickupsDone + result.pickupsMissed}
            </span>
            <span className="stat__k">Pickups</span>
          </div>
        </div>

        <PostScore result={result} onPosted={setPostedId} />

        <div className="modal__actions">
          {career?.passed && !career.isLastDay ? (
            <button className="btn btn--big" onClick={onNextDay}>
              Next day →
            </button>
          ) : (
            <button className="btn btn--big" onClick={onReplay}>
              {career ? (career.passed ? 'Play this day again' : 'Retry the day') : 'Work another shift'}
            </button>
          )}
          <button className="btn btn--ghost" onClick={onMenu}>
            Main menu
          </button>
        </div>
      </div>

      <div className="results__side">
        <section className="panel">
          <h2>Shift report</h2>
          <div className="hallbars">
            {HALLS.map((h) => {
              const st = result.hallStats[h.id]
              const pct = st?.total ? Math.round((st.right / st.total) * 100) : null
              return (
                <div key={h.id} className="hallbar" style={{ '--hall': h.color }}>
                  <span className="hallbar__k">{h.name}</span>
                  <span className="hallbar__track">
                    <i style={{ width: `${pct ?? 0}%` }} />
                  </span>
                  <span className="hallbar__v">{pct === null ? '—' : `${pct}%`}</span>
                </div>
              )
            })}
          </div>
          {result.mistakes.length === 0 ? (
            <p className="muted">No mistakes this shift. Clean desk! 🧼</p>
          ) : (
            <>
              <p className="muted report__sub">What went wrong ({result.mistakes.length})</p>
              <ul className="mistakes">
                {result.mistakes.slice(0, 8).map((m, i) => (
                  <li key={i}>
                    <strong>{m.name}</strong>
                    <span className="mistakes__issue">{m.issue}</span>
                    <span className="mistakes__fix">→ {m.fix}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {leaderboardEnabled && (
          <section className="panel">
            <h2>🌎 Global leaderboard</h2>
            <Leaderboard refreshKey={postedId} highlightId={postedId} />
          </section>
        )}
      </div>
    </div>
  )
}
