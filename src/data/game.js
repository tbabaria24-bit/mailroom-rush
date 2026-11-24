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

// Every shift is described by one config object. Quick-play difficulties and the
// five career days share the same shape, so GameScreen doesn't care which it got.
//   signatureChance  – parcel needs a signature → goes to the Desk Hold bin
//   perishableChance – parcel spoils if it isn't shelved before its countdown ends
//   pickupEvery      – seconds between residents walking up to collect (0 = off)
export const DIFFICULTIES = {
  easy: {
    label: 'Easy',
    blurb: 'The hall is printed on every label. Learn the shelves.',
    seconds: 90,
    showHall: true,
    rtsChance: 0,
    signatureChance: 0,
    perishableChance: 0,
    pickupEvery: 0,
  },
  normal: {
    label: 'Normal',
    blurb: 'Roster lookups, signature parcels and residents at the window.',
    seconds: 75,
    showHall: false,
    rtsChance: 0.12,
    signatureChance: 0.08,
    perishableChance: 0,
    pickupEvery: 16,
  },
  rush: {
    label: 'Move-in Rush',
    blurb: 'Everything at once: strangers, signatures, perishables, pickups.',
    seconds: 60,
    showHall: false,
    rtsChance: 0.18,
    signatureChance: 0.1,
    perishableChance: 0.12,
    pickupEvery: 12,
  },
}

// Career mode: your first week on the desk. Each day teaches one new rule and
// has a target score that unlocks the next day.
export const DAYS = [
  {
    id: 'mon',
    day: 'Monday',
    title: 'Orientation',
    label: 'Mon · Orientation',
    seconds: 60,
    target: 900,
    showHall: true,
    rtsChance: 0,
    signatureChance: 0,
    perishableChance: 0,
    pickupEvery: 0,
    briefing: [
      'Welcome to the desk! Today every label has the hall printed on it.',
      'Match the parcel size to the shelf: envelopes on A, small boxes on B, large on C, oversize on the floor.',
    ],
    newRule: 'Shelving basics',
  },
  {
    id: 'tue',
    day: 'Tuesday',
    title: 'The Roster',
    label: 'Tue · The Roster',
    seconds: 70,
    target: 1000,
    showHall: false,
    rtsChance: 0.12,
    signatureChance: 0,
    perishableChance: 0,
    pickupEvery: 0,
    briefing: [
      'Labels only say "Student Housing" now. Search the resident roster to find their hall.',
      'If nobody by that name lives here, send it back with Return to sender.',
    ],
    newRule: 'Roster lookup & return to sender',
  },
  {
    id: 'wed',
    day: 'Wednesday',
    title: 'Sign Here',
    label: 'Wed · Sign Here',
    seconds: 70,
    target: 1200,
    showHall: false,
    rtsChance: 0.1,
    signatureChance: 0.18,
    perishableChance: 0,
    pickupEvery: 0,
    briefing: [
      'Some parcels carry a ✍️ SIGNATURE REQUIRED stamp.',
      'Those never go on a shelf. Put them in the Desk Hold bin so the resident can sign for them.',
    ],
    newRule: 'Signature parcels → Desk Hold',
  },
  {
    id: 'thu',
    day: 'Thursday',
    title: 'Pickup Window',
    label: 'Thu · Pickup Window',
    seconds: 75,
    target: 1400,
    showHall: false,
    rtsChance: 0.1,
    signatureChance: 0.1,
    perishableChance: 0,
    pickupEvery: 13,
    briefing: [
      'Residents start showing up at the window 🙋 asking for packages you already shelved.',
      'When someone is waiting, click the bin where you put their parcel before they lose patience.',
    ],
    newRule: 'Resident pickups',
  },
  {
    id: 'fri',
    day: 'Friday',
    title: 'Move-in Rush',
    label: 'Fri · Move-in Rush',
    seconds: 75,
    target: 1600,
    showHall: false,
    rtsChance: 0.15,
    signatureChance: 0.1,
    perishableChance: 0.14,
    pickupEvery: 12,
    briefing: [
      'Move-in weekend. Meal kits and flowers 🧊 are PERISHABLE: shelve them before their countdown hits zero.',
      'Everything from this week is in play. Hit the target to finish your first week!',
    ],
    newRule: 'Perishables + everything',
  },
]

export const PERISHABLE_SECONDS = 8
export const PICKUP_PATIENCE = 12

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

// Create the next parcel from a shift config. Some are addressed to people who
// don't live here; some need a signature; some are perishable.
export function makeParcel(roster, config) {
  const { rtsChance, signatureChance = 0, perishableChance = 0 } = config
  const carrier = pick(CARRIERS)
  const sizeRoll = Math.random()
  let size =
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

  // Only real residents get special handling; strangers are always return-to-sender.
  const flagRoll = Math.random()
  const signature = Boolean(resident) && flagRoll < signatureChance
  const perishable =
    Boolean(resident) && !signature && flagRoll >= signatureChance && flagRoll < signatureChance + perishableChance
  if (perishable && size === 'envelope') size = 'small' // meal kits aren't envelopes
  if (perishable) size = size === 'oversize' ? 'large' : size

  let answer = 'rts'
  if (resident && signature) answer = 'desk'
  else if (resident) answer = { hallId: resident.hallId, shelfId: SHELVES.find((s) => s.fits === size).id }

  parcelCounter += 1
  return {
    key: parcelCounter,
    carrier: perishable ? pick(['HelloFresh', 'FedEx', 'UPS']) : carrier,
    tracking: trackingNumber(carrier),
    size,
    recipient,
    resident,
    signature,
    perishable,
    // The correct answer: a hall + shelf, "desk" for signature holds, or "rts".
    answer,
  }
}

// Turn an answer/target into a bin id and a readable description.
export function binIdFor(target) {
  if (target === 'rts' || target === 'desk') return target
  return `${target.hallId}-${target.shelfId}`
}

export function describe(target) {
  if (target === 'rts') return 'Return to sender'
  if (target === 'desk') return 'Desk Hold'
  const hall = HALLS.find((h) => h.id === target.hallId).name
  const shelf = SHELVES.find((s) => s.id === target.shelfId).label
  return `${hall} · ${shelf}`
}

export function sameTarget(a, b) {
  return binIdFor(a) === binIdFor(b)
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

// Career progress: which days are unlocked and the best score for each.
const CAREER_KEY = 'mailroom-rush-career'

export function loadCareer() {
  try {
    const c = JSON.parse(localStorage.getItem(CAREER_KEY))
    if (c && typeof c.unlocked === 'number') return { best: {}, ...c }
  } catch {
    /* fall through */
  }
  return { unlocked: 1, best: {} }
}

export function saveCareerResult(dayIndex, score) {
  const c = loadCareer()
  const day = DAYS[dayIndex]
  const best = { ...c.best, [day.id]: Math.max(c.best[day.id] || 0, score) }
  const passed = score >= day.target
  const unlocked = passed ? Math.max(c.unlocked, Math.min(dayIndex + 2, DAYS.length)) : c.unlocked
  const weekDone = c.weekDone || (passed && dayIndex === DAYS.length - 1)
  const next = { unlocked, best, weekDone }
  try {
    localStorage.setItem(CAREER_KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable */
  }
  return { career: next, passed }
}
