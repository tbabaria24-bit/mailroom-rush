// Global leaderboard stored in Google Firebase (Cloud Firestore).
// Uses the "lite" Firestore SDK: plain REST calls, no realtime listeners, small bundle.
import { initializeApp } from 'firebase/app'
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore/lite'

// Web config comes from .env (VITE_FIREBASE_*) at build time. A Firebase web
// config is not a secret; Firestore security rules decide what clients may do.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const leaderboardEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

const COLLECTION = 'mailroom_rush_scores'
let db = null

function getDb() {
  if (!leaderboardEnabled) throw new Error('Leaderboard is not configured')
  if (!db) db = getFirestore(initializeApp(firebaseConfig))
  return db
}

export function cleanName(name) {
  return name.replace(/[^\p{L}\p{N} ._'-]/gu, '').trim().slice(0, 16)
}

// Save one finished shift. Returns the stored record.
export async function submitScore({ name, score, mode, correct, wrong, bestStreak }) {
  const record = {
    name: cleanName(name) || 'Anonymous',
    score: Math.max(0, Math.round(score)),
    mode,
    correct,
    accuracy: correct + wrong ? Math.round((correct / (correct + wrong)) * 100) : 0,
    bestStreak,
    createdAt: serverTimestamp(),
  }
  const ref = await addDoc(collection(getDb(), COLLECTION), record)
  return { id: ref.id, ...record }
}

// Top N scores across everyone who has played.
export async function fetchTopScores(n = 10) {
  const snap = await getDocs(query(collection(getDb(), COLLECTION), orderBy('score', 'desc'), limit(n)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
