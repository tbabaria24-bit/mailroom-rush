// Tiny sound effects made with the Web Audio API (no audio files needed).
let ctx = null
let muted = (() => {
  try {
    return localStorage.getItem('mailroom-rush-muted') === '1'
  } catch {
    return false
  }
})()

export const isMuted = () => muted

export function setMuted(value) {
  muted = value
  try {
    localStorage.setItem('mailroom-rush-muted', value ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function tone(freq, start, duration, type = 'sine', gain = 0.12) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(gain, ctx.currentTime + start)
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration)
  osc.connect(g).connect(ctx.destination)
  osc.start(ctx.currentTime + start)
  osc.stop(ctx.currentTime + start + duration + 0.02)
}

const SOUNDS = {
  good: () => tone(880, 0, 0.12, 'triangle'),
  streak: () => [660, 880, 1320].forEach((f, i) => tone(f, i * 0.07, 0.14, 'triangle')),
  bad: () => tone(160, 0, 0.25, 'sawtooth', 0.07),
  bell: () => [1320, 990].forEach((f, i) => tone(f, i * 0.12, 0.35, 'sine', 0.1)),
  spoil: () => [300, 200].forEach((f, i) => tone(f, i * 0.12, 0.2, 'square', 0.05)),
  end: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.1, 0.25, 'triangle')),
}

export function play(name) {
  if (muted) return
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)()
    SOUNDS[name]?.()
  } catch {
    /* audio not available */
  }
}
