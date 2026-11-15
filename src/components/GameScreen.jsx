import { useEffect, useRef, useState } from 'react'
import { DIFFICULTIES, HALLS, SHELVES, makeParcel, makeRoster } from '../data/game'
import ParcelLabel from './ParcelLabel'
import RosterLookup from './RosterLookup'
import MailroomWall from './MailroomWall'

function describe(answer) {
  if (answer === 'rts') return 'Return to sender'
  const hall = HALLS.find((h) => h.id === answer.hallId).name
  const shelf = SHELVES.find((s) => s.id === answer.shelfId).label
  return `${hall} · ${shelf}`
}

export default function GameScreen({ difficulty, onFinish, onQuit }) {
  const config = DIFFICULTIES[difficulty]
  const [roster] = useState(() => makeRoster())
  const [parcel, setParcel] = useState(() => makeParcel(roster, difficulty))
  const [timeLeft, setTimeLeft] = useState(config.seconds)
  const [paused, setPaused] = useState(false)
  const [query, setQuery] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [stats, setStats] = useState({ correct: 0, wrong: 0, bestStreak: 0 })
  const [counts, setCounts] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [flash, setFlash] = useState(null)
  const finished = useRef(false)

  // Shift clock.
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [paused])

  // End of shift.
  useEffect(() => {
    if (timeLeft === 0 && !finished.current) {
      finished.current = true
      onFinish({ score, ...stats, difficulty })
    }
  }, [timeLeft, score, stats, difficulty, onFinish])

  // Keyboard: P toggles pause.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'p' && e.target.tagName !== 'INPUT') setPaused((p) => !p)
      if (e.key === 'Escape' && paused) setPaused(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paused])

  function handleSort(target) {
    if (paused || timeLeft === 0) return
    const correctAnswer = parcel.answer
    const isRight =
      target === 'rts'
        ? correctAnswer === 'rts'
        : correctAnswer !== 'rts' &&
          target.hallId === correctAnswer.hallId &&
          target.shelfId === correctAnswer.shelfId

    const binId = target === 'rts' ? 'rts' : `${target.hallId}-${target.shelfId}`
    setFlash({ id: binId, type: isRight ? 'good' : 'bad', n: Date.now() })

    if (isRight) {
      const nextStreak = streak + 1
      const points = 100 + Math.min(nextStreak - 1, 10) * 20
      setScore((s) => s + points)
      setStreak(nextStreak)
      setStats((s) => ({ ...s, correct: s.correct + 1, bestStreak: Math.max(s.bestStreak, nextStreak) }))
      setCounts((c) => ({ ...c, [binId]: (c[binId] || 0) + 1 }))
      let text = `+${points}`
      if (nextStreak % 5 === 0) {
        setTimeLeft((t) => t + 5)
        text += ` · ${nextStreak} in a row! +5s`
      }
      setFeedback({ type: 'good', text })
    } else {
      setScore((s) => Math.max(0, s - 50))
      setStreak(0)
      setStats((s) => ({ ...s, wrong: s.wrong + 1 }))
      setFeedback({ type: 'bad', text: `−50 · That last one belonged in ${describe(correctAnswer)}` })
    }

    setParcel(makeParcel(roster, difficulty))
    setQuery('')
  }

  // Clear the bin flash shortly after it appears.
  useEffect(() => {
    if (!flash) return
    const id = setTimeout(() => setFlash(null), 450)
    return () => clearTimeout(id)
  }, [flash])

  const pct = (timeLeft / config.seconds) * 100
  const urgent = timeLeft <= 10

  return (
    <div className="game">
      <header className="hud">
        <div className="hud__brand">
          <span className="logo-box" aria-hidden="true" />
          Mailroom Rush <span className="tag">{config.label}</span>
        </div>
        <div className="hud__stats">
          <div className="stat">
            <span className="stat__k">Score</span>
            <span className="stat__v">{score.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat__k">Streak</span>
            <span className={`stat__v ${streak >= 5 ? 'hot' : ''}`}>
              {streak}
              {streak >= 5 && ' 🔥'}
            </span>
          </div>
          <div className="stat">
            <span className="stat__k">Sorted</span>
            <span className="stat__v">{stats.correct}</span>
          </div>
          <div className={`stat ${urgent ? 'urgent' : ''}`}>
            <span className="stat__k">Shift ends</span>
            <span className="stat__v">
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
        </div>
        <div className="hud__actions">
          <button className="btn btn--ghost" onClick={() => setPaused(true)}>
            Pause
          </button>
        </div>
        <div className="timebar" aria-hidden="true">
          <span style={{ width: `${Math.min(pct, 100)}%` }} className={urgent ? 'urgent' : ''} />
        </div>
      </header>

      <main className="game__body">
        <div className="game__left">
          <section className="panel intake">
            <div className="panel__head">
              <h2>Now scanning</h2>
              <span className="muted">Pick the right hall &amp; shelf →</span>
            </div>
            <ParcelLabel parcel={parcel} showHall={config.showHall} feedback={feedback} />
            <div className={`feedback ${feedback ? `feedback--${feedback.type}` : ''}`} key={parcel.key} role="status">
              {feedback ? feedback.text : 'Every 5 in a row adds 5 seconds to the clock.'}
            </div>
          </section>
          <RosterLookup roster={roster} query={query} onQueryChange={setQuery} parcelKey={parcel.key} />
        </div>
        <MailroomWall counts={counts} flash={flash} onSort={handleSort} />
      </main>

      {paused && (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <h2>On break ☕</h2>
            <p>The clock is stopped. Parcels will wait.</p>
            <div className="modal__actions">
              <button className="btn" onClick={() => setPaused(false)} autoFocus>
                Back to the desk
              </button>
              <button className="btn btn--ghost" onClick={onQuit}>
                Quit shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
