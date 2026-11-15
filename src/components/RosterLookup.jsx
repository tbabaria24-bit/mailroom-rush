import { useMemo, useRef, useEffect } from 'react'
import { HALLS } from '../data/game'

export default function RosterLookup({ roster, query, onQueryChange, parcelKey }) {
  const inputRef = useRef(null)

  // Clear and refocus the search box whenever a new parcel arrives.
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [parcelKey])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return roster
    return roster.filter((r) => `${r.first} ${r.last} ${r.last}, ${r.first}`.toLowerCase().includes(q))
  }, [roster, query])

  return (
    <section className="panel roster">
      <div className="panel__head">
        <h2>Resident lookup</h2>
        <span className="muted">{results.length} found</span>
      </div>
      <input
        ref={inputRef}
        className="search"
        type="search"
        placeholder="Type a last name…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onQueryChange('')}
        aria-label="Search residents"
      />
      <ul className="roster__list">
        {results.length === 0 && (
          <li className="roster__empty">
            No resident by that name.
            <br />
            <strong>Return to sender?</strong>
          </li>
        )}
        {results.map((r) => {
          const hall = HALLS.find((h) => h.id === r.hallId)
          return (
            <li key={r.id} className="roster__row">
              <span>
                <strong>{r.last}</strong>, {r.first}
              </span>
              <span className="hall-chip" style={{ '--hall': hall.color }}>
                {hall.name.replace(' Hall', '')} · {r.room}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
