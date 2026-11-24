import { useEffect, useReducer, useRef, useState } from 'react'
import {
  PERISHABLE_SECONDS,
  PICKUP_PATIENCE,
  binIdFor,
  describe,
  makeParcel,
  makeRoster,
  sameTarget,
} from '../data/game'
import { isMuted, play, setMuted } from '../data/sound'
import ParcelLabel from './ParcelLabel'
import RosterLookup from './RosterLookup'
import MailroomWall from './MailroomWall'
import PickupWindow from './PickupWindow'

const MAX_BONUS_SECONDS = 30
const nameOf = (p) => `${p.recipient.first} ${p.recipient.last}`

// ---------- Game state lives in one reducer so timers and clicks stay in sync ----------

function initState(config) {
  const roster = makeRoster()
  const parcel = makeParcel(roster, config)
  return {
    config,
    roster,
    parcel,
    perishLeft: PERISHABLE_SECONDS,
    timeLeft: config.seconds,
    score: 0,
    streak: 0,
    correct: 0,
    wrong: 0,
    bestStreak: 0,
    pickupsDone: 0,
    pickupsMissed: 0,
    spoiled: 0,
    counts: {},
    shelved: [], // parcels on the wall that a resident can come and collect
    pickup: null, // { key, name, binId, left }
    sincePickup: 0,
    bonusTime: 0, // streak bonus seconds earned (capped)
    mistakes: [],
    hallStats: {}, // hallId -> { right, total }
    feedback: null,
    flash: null,
    sound: null,
  }
}

function nextParcel(state) {
  const parcel = makeParcel(state.roster, state.config)
  return { parcel, perishLeft: PERISHABLE_SECONDS }
}

function trackHall(hallStats, parcel, right) {
  if (!parcel.resident) return hallStats
  const id = parcel.resident.hallId
  const cur = hallStats[id] || { right: 0, total: 0 }
  return { ...hallStats, [id]: { right: cur.right + (right ? 1 : 0), total: cur.total + 1 } }
}

function penalty(state, amount, text, mistake) {
  return {
    score: Math.max(0, state.score - amount),
    streak: 0,
    wrong: state.wrong + 1,
    mistakes: mistake ? [...state.mistakes, mistake] : state.mistakes,
    feedback: { type: 'bad', text },
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'tick': {
      if (state.timeLeft === 0) return state
      let s = { ...state, timeLeft: state.timeLeft - 1, sound: null }

      // Perishable countdown.
      // (Paused while a resident is at the window, so you're never punished twice.)
      if (s.parcel.perishable && !s.pickup) {
        s.perishLeft -= 1
        if (s.perishLeft <= 0) {
          s = {
            ...s,
            ...penalty(s, 75, `🧊 Spoiled! ${nameOf(s.parcel)}'s delivery sat too long. −75`, {
              name: nameOf(s.parcel),
              issue: 'Perishable spoiled before it was shelved',
              fix: `belonged in ${describe(s.parcel.answer)}`,
            }),
            spoiled: s.spoiled + 1,
            hallStats: trackHall(s.hallStats, s.parcel, false),
            sound: { name: 'spoil', n: Date.now() },
            ...nextParcel(s),
          }
        }
      }

      // Resident at the window: patience runs down, or someone new walks up.
      if (s.pickup) {
        const left = s.pickup.left - 1
        if (left <= 0) {
          s = {
            ...s,
            ...penalty(s, 75, `😤 ${s.pickup.name} gave up and left. −75`, {
              name: s.pickup.name,
              issue: 'Resident left the window without their package',
              fix: `it was in ${describe(s.pickup.target)}`,
            }),
            wrong: s.wrong, // a missed pickup isn't a mis-sort
            pickupsMissed: s.pickupsMissed + 1,
            pickup: null,
            sincePickup: 0,
            sound: { name: 'bad', n: Date.now() },
          }
        } else {
          s.pickup = { ...s.pickup, left }
        }
      } else if (s.config.pickupEvery && s.shelved.length) {
        s.sincePickup += 1
        if (s.sincePickup >= s.config.pickupEvery) {
          const i = Math.floor(Math.random() * s.shelved.length)
          const item = s.shelved[i]
          s = {
            ...s,
            pickup: { ...item, left: PICKUP_PATIENCE },
            shelved: s.shelved.filter((_, j) => j !== i),
            sincePickup: 0,
            sound: { name: 'bell', n: Date.now() },
          }
        }
      }
      return s
    }

    case 'sort': {
      const { target } = action
      const binId = binIdFor(target)
      const s = { ...state, flash: null, sound: null }

      // A resident is waiting: this click hands over their package.
      if (s.pickup) {
        if (binId === s.pickup.binId) {
          return {
            ...s,
            score: s.score + 150,
            pickupsDone: s.pickupsDone + 1,
            counts: { ...s.counts, [binId]: Math.max(0, (s.counts[binId] || 0) - 1) },
            pickup: null,
            feedback: { type: 'good', text: `🙋 Handed ${s.pickup.name} their package. +150` },
            flash: { id: binId, type: 'good', n: Date.now() },
            sound: { name: 'streak', n: Date.now() },
          }
        }
        return {
          ...s,
          score: Math.max(0, s.score - 50),
          feedback: { type: 'bad', text: `Not there! ${s.pickup.name}'s package isn't in that bin. −50` },
          flash: { id: binId, type: 'bad', n: Date.now() },
          sound: { name: 'bad', n: Date.now() },
        }
      }

      // Normal sorting.
      const { parcel } = s
      const right = sameTarget(target, parcel.answer)
      const flash = { id: binId, type: right ? 'good' : 'bad', n: Date.now() }
      const hallStats = trackHall(s.hallStats, parcel, right)

      if (right) {
        const streak = s.streak + 1
        let points = 100 + Math.min(streak - 1, 10) * 20
        let text = `+${points}`
        let timeLeft = s.timeLeft
        if (parcel.perishable) {
          points += 50
          text = `🧊 Fresh! +${points}`
        }
        if (parcel.signature) text = `✍️ Held for signature. +${points}`
        let bonusTime = s.bonusTime
        if (streak % 5 === 0 && bonusTime < MAX_BONUS_SECONDS) {
          timeLeft += 5
          bonusTime += 5
          text += ` · ${streak} in a row! +5s`
        } else if (streak % 5 === 0) {
          text += ` · ${streak} in a row!`
        }
        const shelved =
          parcel.answer === 'rts'
            ? s.shelved
            : [...s.shelved, { key: parcel.key, name: nameOf(parcel), binId, target: parcel.answer }]
        return {
          ...s,
          ...nextParcel(s),
          score: s.score + points,
          streak,
          bestStreak: Math.max(s.bestStreak, streak),
          correct: s.correct + 1,
          timeLeft,
          bonusTime,
          counts: parcel.answer === 'rts' ? s.counts : { ...s.counts, [binId]: (s.counts[binId] || 0) + 1 },
          shelved,
          hallStats,
          feedback: { type: 'good', text },
          flash,
          sound: { name: streak % 5 === 0 ? 'streak' : 'good', n: Date.now() },
        }
      }

      return {
        ...s,
        ...nextParcel(s),
        ...penalty(s, 50, `−50 · That last one belonged in ${describe(parcel.answer)}`, {
          name: nameOf(parcel),
          issue: `Put in ${describe(target)}`,
          fix: `belonged in ${describe(parcel.answer)}`,
          flags: [parcel.signature && 'signature', parcel.perishable && 'perishable'].filter(Boolean),
        }),
        hallStats,
        flash,
        sound: { name: 'bad', n: Date.now() },
      }
    }

    case 'clearFlash':
      return state.flash ? { ...state, flash: null } : state

    default:
      return state
  }
}

// ---------- Component ----------

export default function GameScreen({ config, onFinish, onQuit }) {
  const [state, dispatch] = useReducer(reducer, config, initState)
  const [paused, setPaused] = useState(false)
  const [query, setQuery] = useState('')
  const [muted, setMutedState] = useState(isMuted)
  const finished = useRef(false)
  const { parcel, timeLeft, score, streak, pickup, flash, feedback } = state

  // One clock drives the shift timer, perishables and pickups.
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000)
    return () => clearInterval(id)
  }, [paused])

  // Play whatever sound the last action asked for.
  useEffect(() => {
    if (state.sound) play(state.sound.name)
  }, [state.sound])

  // New parcel → clear the roster search.
  useEffect(() => setQuery(''), [parcel.key])

  // End of shift.
  useEffect(() => {
    if (timeLeft === 0 && !finished.current) {
      finished.current = true
      play('end')
      const { score, correct, wrong, bestStreak, pickupsDone, pickupsMissed, spoiled, mistakes, hallStats } = state
      onFinish({ score, correct, wrong, bestStreak, pickupsDone, pickupsMissed, spoiled, mistakes, hallStats })
    }
  }, [timeLeft, state, onFinish])

  // Keyboard: P toggles pause.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'p' && e.target.tagName !== 'INPUT') setPaused((p) => !p)
      if (e.key === 'Escape' && paused) setPaused(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paused])

  // Clear the bin flash shortly after it appears.
  useEffect(() => {
    if (!flash) return
    const id = setTimeout(() => dispatch({ type: 'clearFlash' }), 450)
    return () => clearTimeout(id)
  }, [flash])

  const handleSort = (target) => {
    if (paused || timeLeft === 0) return
    dispatch({ type: 'sort', target })
  }

  const toggleMute = () => {
    setMuted(!muted)
    setMutedState(!muted)
  }

  const pct = (timeLeft / config.seconds) * 100
  const urgent = timeLeft <= 10
  const hasDesk = config.signatureChance > 0

  return (
    <div className="game">
      <header className="hud">
        <div className="hud__brand">
          <span className="logo-box" aria-hidden="true" />
          Mailroom Rush <span className="tag">{config.label}</span>
        </div>
        <div className="hud__stats">
          {config.target && (
            <div className="stat">
              <span className="stat__k">Target</span>
              <span className={`stat__v ${score >= config.target ? 'met' : ''}`}>
                {config.target.toLocaleString()}
                {score >= config.target && ' ✓'}
              </span>
            </div>
          )}
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
            <span className="stat__v">{state.correct}</span>
          </div>
          <div className={`stat ${urgent ? 'urgent' : ''}`}>
            <span className="stat__k">Shift ends</span>
            <span className="stat__v">
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
        </div>
        <div className="hud__actions">
          <button className="btn btn--ghost btn--icon" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
            {muted ? '🔇' : '🔊'}
          </button>
          <button className="btn btn--ghost" onClick={() => setPaused(true)}>
            Pause
          </button>
        </div>
        <div className="timebar" aria-hidden="true">
          <span style={{ width: `${Math.min(pct, 100)}%` }} className={urgent ? 'urgent' : ''} />
        </div>
      </header>

      <main className="game__body">
        <div className={`game__left ${pickup ? 'is-waiting' : ''}`}>
          <section className="panel intake">
            <div className="panel__head">
              <h2>Now scanning</h2>
              <span className="muted">Pick the right bin →</span>
            </div>
            <ParcelLabel
              parcel={parcel}
              showHall={config.showHall}
              feedback={feedback}
              perishLeft={state.perishLeft}
            />
            <div className={`feedback ${feedback ? `feedback--${feedback.type}` : ''}`} key={parcel.key} role="status">
              {feedback ? feedback.text : 'Every 5 in a row adds 5 seconds to the clock.'}
            </div>
          </section>
          <RosterLookup roster={state.roster} query={query} onQueryChange={setQuery} parcelKey={parcel.key} />
        </div>
        <div className="game__right">
          {pickup && <PickupWindow pickup={pickup} patience={PICKUP_PATIENCE} />}
          <MailroomWall
            counts={state.counts}
            flash={flash}
            onSort={handleSort}
            hasDesk={hasDesk}
            pickupMode={Boolean(pickup)}
          />
        </div>
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

