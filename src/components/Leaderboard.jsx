import { useEffect, useState } from 'react'
import { fetchTopScores, leaderboardEnabled } from '../data/leaderboard'

// Global top scores from Firestore. `refreshKey` changes after a new submit.
export default function Leaderboard({ refreshKey = 0, highlightId, compact = false }) {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!leaderboardEnabled) return
    let alive = true
    fetchTopScores(compact ? 5 : 10)
      .then((r) => alive && (setRows(r), setError(null)))
      .catch(() => alive && setError('Could not reach the leaderboard.'))
    return () => {
      alive = false
    }
  }, [refreshKey, compact])

  if (!leaderboardEnabled) return <p className="muted">Global leaderboard is offline.</p>
  if (error) return <p className="muted">{error}</p>
  if (!rows) return <p className="muted">Loading scores…</p>
  if (rows.length === 0) return <p className="muted">No shifts posted yet. Be the first!</p>

  return (
    <ol className="board">
      {rows.map((r, i) => (
        <li key={r.id} className={r.id === highlightId ? 'board__me' : ''}>
          <span className="board__rank">{i + 1}</span>
          <span className="board__name">{r.name}</span>
          <span className="board__mode muted">{r.mode}</span>
          <span className="board__score">{r.score.toLocaleString()}</span>
        </li>
      ))}
    </ol>
  )
}
