import { useCallback, useState } from 'react'
import StartScreen from './components/StartScreen'
import Briefing from './components/Briefing'
import GameScreen from './components/GameScreen'
import ResultsScreen from './components/ResultsScreen'
import { DAYS, DIFFICULTIES, loadCareer, loadScores, saveCareerResult, saveScore } from './data/game'

// A "mode" is either a quick shift at some difficulty or a day of the career week.
const configFor = (mode) => (mode.kind === 'career' ? DAYS[mode.day] : DIFFICULTIES[mode.difficulty])

export default function App() {
  const [phase, setPhase] = useState('start') // 'start' | 'briefing' | 'playing' | 'results'
  const [mode, setMode] = useState({ kind: 'career', day: 0 })
  const [result, setResult] = useState(null)
  const [scores, setScores] = useState(loadScores)
  const [career, setCareer] = useState(loadCareer)
  const [round, setRound] = useState(0) // remounts GameScreen for a fresh shift

  const begin = (m = mode) => {
    setMode(m)
    setPhase(m.kind === 'career' ? 'briefing' : 'playing')
    setRound((r) => r + 1)
  }

  const finish = useCallback(
    (res) => {
      const config = configFor(mode)
      const full = { ...res, label: config.label, mode }
      if (mode.kind === 'career') {
        const { career: next, passed } = saveCareerResult(mode.day, res.score)
        setCareer(next)
        full.career = { passed, target: config.target, isLastDay: mode.day === DAYS.length - 1 }
      }
      setScores(saveScore({ score: res.score, correct: res.correct, label: config.label, at: Date.now() }))
      setResult(full)
      setPhase('results')
    },
    [mode],
  )

  const nextDay = () => begin({ kind: 'career', day: Math.min(mode.day + 1, DAYS.length - 1) })

  return (
    <div className="app">
      {phase === 'start' && <StartScreen mode={mode} career={career} scores={scores} onStart={begin} />}
      {phase === 'briefing' && (
        <Briefing day={DAYS[mode.day]} onReady={() => setPhase('playing')} onBack={() => setPhase('start')} />
      )}
      {phase === 'playing' && (
        <GameScreen key={round} config={configFor(mode)} onFinish={finish} onQuit={() => setPhase('start')} />
      )}
      {phase === 'results' && (
        <ResultsScreen
          result={result}
          onReplay={() => begin(mode)}
          onNextDay={nextDay}
          onMenu={() => setPhase('start')}
        />
      )}
      <footer className="foot">Built with React + Firebase · CGS 3853 Final Project · Tarang Babaria</footer>
    </div>
  )
}
