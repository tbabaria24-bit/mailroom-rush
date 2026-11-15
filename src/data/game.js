// Game data and helpers for Mailroom Rush.

export const HALLS = [
  { id: 'osprey', name: 'Osprey Hall', color: '#2f6f8f' },
  { id: 'pelican', name: 'Pelican Hall', color: '#c0542d' },
  { id: 'heron', name: 'Heron Hall', color: '#4f7a3a' },
]

export const SHELVES = [
  { id: 'A', label: 'Shelf A', fits: 'envelope', hint: 'Envelopes & mailers' },
  { id: 'B', label: 'Shelf B', fits: 'small', hint: 'Small boxes' },
  { id: 'C', label: 'Shelf C', fits: 'large', hint: 'Large boxes' },
  { id: 'F', label: 'Floor', fits: 'oversize', hint: 'Oversize items' },
]

export const SIZES = {
  envelope: { label: 'Envelope', icon: '✉️' },
  small: { label: 'Small box', icon: '📦' },
  large: { label: 'Large box', icon: '📦' },
  oversize: { label: 'Oversize', icon: '🛋️' },
}

export const CARRIERS = ['UPS', 'FedEx', 'USPS', 'Amazon', 'DHL']

export const DIFFICULTIES = {
  easy: {
    label: 'Easy',
    blurb: 'The hall is printed on every label. Learn the shelves.',
    seconds: 90,
    showHall: true,
    rtsChance: 0,
  },
  normal: {
    label: 'Normal',
    blurb: 'Look each resident up in the roster, just like the real desk.',
    seconds: 75,
    showHall: false,
    rtsChance: 0.12,
  },
  rush: {
    label: 'Move-in Rush',
    blurb: 'Less time, more strangers. Return unknown names to sender.',
    seconds: 50,
    showHall: false,
    rtsChance: 0.2,
  },
}

const FIRST = [
  'Ava', 'Liam', 'Maya', 'Noah', 'Priya', 'Ethan', 'Sofia', 'Marcus', 'Chloe',
  'Diego', 'Hannah', 'Jamal', 'Lena', 'Omar', 'Ruby', 'Tyler', 'Zoe', 'Kenji',
  'Isabel', 'Caleb', 'Nadia', 'Felix', 'Grace', 'Ravi', 'Talia', 'Owen',
  'Mei', 'Andre', 'Leah', 'Victor',
]

const LAST = [
  'Alvarez', 'Bennett', 'Chen', 'Dawson', 'Estrada', 'Fischer', 'Gupta',
  'Hayes', 'Ibrahim', 'Jensen', 'Kowalski', 'Lambert', 'Moreno', 'Nakamura',
  'Okafor', 'Patel', 'Quinn', 'Reyes', 'Sullivan', 'Tran', 'Underwood',
  'Vasquez', 'Whitaker', 'Young', 'Zimmerman', 'Brooks', 'Castillo', 'Desai',
]

const rand = (n) => Math.floor(Math.random() * n)
const pick = (arr) => arr[rand(arr.length)]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build a fresh roster of residents for one shift.
export function makeRoster(count = 30) {
  const used = new Set()
  const roster = []
  while (roster.length < count) {
    const first = pick(FIRST)
    const last = pick(LAST)
    const key = `${first} ${last}`
    if (used.has(key)) continue
    used.add(key)
    const hall = HALLS[roster.length % HALLS.length]
    roster.push({
      id: key,
      first,
      last,
      hallId: hall.id,
      room: `${rand(4) + 1}${String(rand(30) + 1).padStart(2, '0')}`,
    })
  }
  return shuffle(roster).sort((a, b) => a.last.localeCompare(b.last))
}

function trackingNumber(carrier) {
  const digits = (n) => Array.from({ length: n }, () => rand(10)).join('')
  switch (carrier) {
    case 'UPS':
      return `1Z${digits(4)}${String.fromCharCode(65 + rand(26))}${digits(11)}`
    case 'FedEx':
      return digits(12)
    case 'USPS':
      return `9400${digits(18)}`
    case 'Amazon':
      return `TBA${digits(12)}`
    default:
      return digits(10)
  }
}

let parcelCounter = 0

// Create the next parcel. Some are addressed to people who don't live here.
export function makeParcel(roster, difficulty) {
  const { rtsChance } = DIFFICULTIES[difficulty]
  const carrier = pick(CARRIERS)
  const sizeRoll = Math.random()
  const size =
    sizeRoll < 0.32 ? 'envelope' : sizeRoll < 0.68 ? 'small' : sizeRoll < 0.9 ? 'large' : 'oversize'

  let recipient
  let resident = null
  if (Math.random() < rtsChance) {
    const names = new Set(roster.map((r) => r.id))
    do {
      recipient = { first: pick(FIRST), last: pick(LAST) }
    } while (names.has(`${recipient.first} ${recipient.last}`))
  } else {
    resident = pick(roster)
    recipient = { first: resident.first, last: resident.last }
  }

  parcelCounter += 1
  return {
    key: parcelCounter,
    carrier,
    tracking: trackingNumber(carrier),
    size,
    recipient,
    resident,
    // The correct answer: a hall + shelf, or "rts" for return to sender.
    answer: resident
      ? { hallId: resident.hallId, shelfId: SHELVES.find((s) => s.fits === size).id }
      : 'rts',
  }
}

export function rankFor(score, accuracy) {
  if (score >= 3000 && accuracy >= 0.9) return { title: 'Mailroom Legend', emoji: '🏆' }
  if (score >= 1800) return { title: 'Desk Lead', emoji: '⭐' }
  if (score >= 900) return { title: 'Reliable Sorter', emoji: '📬' }
  if (score >= 300) return { title: 'New Hire', emoji: '🧑‍💼' }
  return { title: 'Lost in the Stacks', emoji: '🫠' }
}

// High scores live in localStorage, which can be unavailable — fail quietly.
const STORE_KEY = 'mailroom-rush-scores'

export function loadScores() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || []
  } catch {
    return []
  }
}

export function saveScore(entry) {
  const scores = [...loadScores(), entry].sort((a, b) => b.score - a.score).slice(0, 5)
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(scores))
  } catch {
    /* storage unavailable */
  }
  return scores
}
