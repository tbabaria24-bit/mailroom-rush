import { useState } from 'react'
import { DAYS, DIFFICULTIES, HALLS, SHELVES } from '../data/game'
import Leaderboard from './Leaderboard'
import { leaderboardEnabled } from '../data/leaderboard'

function CareerWeek({ career, onStart }) {
  return (
    <div className="week">
      {DAYS.map((d, i) => {
        const locked = i >= career.unlocked
        const best = career.best[d.id] || 0
        const passed = best >= d.target
        return (
          <button
            key={d.id}
            className={`daycard ${locked ? 'daycard--locked' : ''} ${passed ? 'daycard--done' : ''}`}
            disabled={locked}
            onClick={() => onStart({ kind: 'career', day: i })}
          >
            <span className="daycard__day">{d.day.slice(0, 3)}</span>
            <span className="daycard__title">{d.title}</span>
            <span className="daycard__rule">{locked ? '🔒 Locked' : d.newRule}</span>
            <span className="daycard__score">
              {passed ? '✓ ' : ''}
              {best ? best.toLocaleString() : '—'} / {d.target.toLocaleString()}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function QuickShift({ difficulty, setDifficulty, onStart }) {
  return (
    <>
      <div className="difficulty" role="radiogroup" aria-label="Difficulty">
        {Object.entries(DIFFICULTIES).map(([id, d]) => (
          <button
            key={id}
            role="radio"
            aria-checked={difficulty === id}
            className={`diff ${difficulty === id ? 'diff--on' : ''}`}
            onClick={() => setDifficulty(id)}
          >
            <span className="diff__name">{d.label}</span>
            <span className="diff__time">{d.seconds}s shift</span>
            <span className="diff__blurb">{d.blurb}</span>
          </button>
        ))}
      </div>
      <button className="btn btn--big" onClick={() => onStart({ kind: 'quick', difficulty })}>
        Clock in →
      </button>
    </>
  )
}

export default function StartScreen({ mode, career, scores, onStart }) {
  const [tab, setTab] = useState(mode.kind)
  const [difficulty, setDifficulty] = useState(mode.difficulty || 'normal')
  const [boardTab, setBoardTab] = useState(leaderboardEnabled ? 'global' : 'local')

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
          parcel onto the right hall&apos;s shelf, all before your shift ends.
        </p>

        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'career'} className={tab === 'career' ? 'on' : ''} onClick={() => setTab('career')}>
            Career: First Week {career.weekDone && '🏆'}
          </button>
          <button role="tab" aria-selected={tab === 'quick'} className={tab === 'quick' ? 'on' : ''} onClick={() => setTab('quick')}>
            Quick Shift
          </button>
        </div>

        {tab === 'career' ? (
          <>
            <p className="muted tabnote">
              Five days, one new rule each day. Hit the target score to unlock tomorrow.
            </p>
            <CareerWeek career={career} onStart={onStart} />
          </>
        ) : (
          <QuickShift difficulty={difficulty} setDifficulty={setDifficulty} onStart={onStart} />
        )}
      </div>

      <aside className="start__side">
        <section className="panel">
          <div className="panel__head">
            <h2>Top shifts</h2>
            {leaderboardEnabled && (
            <div className="minitabs">
              <button className={boardTab === 'global' ? 'on' : ''} onClick={() => setBoardTab('global')}>
                🌎 Global
              </button>
              <button className={boardTab === 'local' ? 'on' : ''} onClick={() => setBoardTab('local')}>
                This device
              </button>
            </div>
            )}
          </div>
          {boardTab === 'global' ? (
            <Leaderboard compact />
          ) : scores.length === 0 ? (
            <p className="muted">No shifts logged on this device yet.</p>
          ) : (
            <ol className="scores">
              {scores.map((s, i) => (
                <li key={i}>
                  <span>{s.score.toLocaleString()}</span>
                  <span className="muted">
                    {s.label || DIFFICULTIES[s.difficulty]?.label} · {s.correct} sorted
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="panel">
          <h2>How it works</h2>
          <ol className="steps">
            <li>
              <strong>Read the label.</strong> Note the recipient and the parcel size.
            </li>
            <li>
              <strong>Look them up.</strong> Search the roster to find their hall.
            </li>
            <li>
              <strong>Shelve it.</strong> Click that hall&apos;s bin on the shelf that fits the size.
            </li>
            <li>
              <strong>Special cases.</strong> ✍️ signature → Desk Hold · 🧊 perishable → hurry · unknown name →
              Return to sender.
            </li>
            <li>
              <strong>Pickups.</strong> 🙋 When a resident comes to the window, click the bin holding their parcel.
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
      </aside>
    </div>
  )
}
