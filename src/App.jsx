import { useCallback, useState } from 'react'
import StartScreen from './components/StartScreen'
import GameScreen from './components/GameScreen'
import ResultsScreen from './components/ResultsScreen'
import { loadScores, saveScore } from './data/game'

export default function App() {
  const [phase, setPhase] = useState('start') // 'start' | 'playing' | 'results'
  const [difficulty, setDifficulty] = useState('normal')
  const [result, setResult] = useState(null)
  const [scores, setScores] = useState(loadScores)
  const [round, setRound] = useState(0) // remounts GameScreen for a fresh shift

  const start = () => {
    setRound((r) => r + 1)
    setPhase('playing')
  }

  const finish = useCallback((res) => {
    setResult(res)
    setScores(saveScore({ ...res, at: Date.now() }))
    setPhase('results')
  }, [])

  return (
    <div className="app">
      {phase === 'start' && (
        <StartScreen difficulty={difficulty} onDifficulty={setDifficulty} onStart={start} scores={scores} />
      )}
      {phase === 'playing' && (
        <GameScreen key={round} difficulty={difficulty} onFinish={finish} onQuit={() => setPhase('start')} />
      )}
      {phase === 'results' && (
        <ResultsScreen result={result} scores={scores} onReplay={start} onMenu={() => setPhase('start')} />
      )}
      <footer className="foot">Built with React · CGS 3853 Project #7</footer>
    </div>
  )
}
