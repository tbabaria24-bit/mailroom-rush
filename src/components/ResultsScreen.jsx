import { DIFFICULTIES, rankFor } from '../data/game'

export default function ResultsScreen({ result, scores, onReplay, onMenu }) {
  const total = result.correct + result.wrong
  const accuracy = total ? result.correct / total : 0
  const rank = rankFor(result.score, accuracy)
  const isBest = scores[0] && scores[0].score === result.score && result.score > 0

  return (
    <div className="results">
      <div className="results__card">
        <p className="eyebrow">Shift complete · {DIFFICULTIES[result.difficulty].label}</p>
        <div className="results__rank">
          <span className="results__emoji">{rank.emoji}</span>
          <h1>{rank.title}</h1>
        </div>
        <div className="results__score">
          {result.score.toLocaleString()}
          <span>points</span>
        </div>
        {isBest && <p className="badge">New personal best!</p>}

        <div className="results__grid">
          <div>
            <span className="stat__v">{result.correct}</span>
            <span className="stat__k">Sorted right</span>
          </div>
          <div>
            <span className="stat__v">{result.wrong}</span>
            <span className="stat__k">Mis-sorted</span>
          </div>
          <div>
            <span className="stat__v">{Math.round(accuracy * 100)}%</span>
            <span className="stat__k">Accuracy</span>
          </div>
          <div>
            <span className="stat__v">{result.bestStreak}</span>
            <span className="stat__k">Best streak</span>
          </div>
        </div>

        <div className="modal__actions">
          <button className="btn btn--big" onClick={onReplay}>
            Work another shift
          </button>
          <button className="btn btn--ghost" onClick={onMenu}>
            Change difficulty
          </button>
        </div>
      </div>
    </div>
  )
}
