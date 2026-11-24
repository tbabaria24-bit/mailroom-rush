# Mailroom Rush

An interactive React game about working the front desk of a campus mailroom. Read each parcel's label, look the resident up in the roster, and shelve it in the right hall and bin before your shift ends.

Started as CGS 3853 Project #7 and expanded for the **CGS 3853 Final Project**.

**Play it:** https://tbabaria24-bit.github.io/mailroom-rush/

## What's new in the final version
- **Career mode: "Your First Week".** Five days (Mon–Fri). Each day adds one new rule, has a target score, and unlocks the next day. Progress is saved in `localStorage`.
- **✍️ Signature-required parcels** go to a new **Desk Hold** bin instead of a shelf.
- **🙋 Resident pickups.** Residents walk up to the window asking for a package you already shelved; click the right bin before their patience runs out.
- **🧊 Perishables.** Meal kits and flowers spoil if they aren't shelved before their countdown ends.
- **Shift report.** Accuracy per hall plus a list of every mistake and where the parcel actually belonged.
- **🌎 Global leaderboard** stored in **Google Firebase (Cloud Firestore)**. Post your score with a name and see the top 10 across all players.
- **Sound effects** (Web Audio API) with a mute toggle.
- Game logic moved into a single `useReducer` so the shift clock, perishable timers and pickups stay in sync.

## Tech
- **React 19 + Vite**, deployed to **GitHub Pages**
- **Firebase Cloud Firestore** (lite SDK) for the global leaderboard
- `localStorage` for career progress and personal bests

## React concepts used
- **Components:** `StartScreen`, `Briefing`, `GameScreen`, `ParcelLabel`, `RosterLookup`, `MailroomWall`/`Bin`, `PickupWindow`, `ResultsScreen`, `Leaderboard`
- **State:** `useReducer` for game state, `useState` for UI state, `useMemo` for roster search, `useRef` for focus/one-time end of shift
- **Effects:** game clock, sounds, keyboard shortcut (P to pause), leaderboard fetching, auto-focus on each new parcel
- **Events:** bin clicks, live roster search, mode/day selection, score submission

## Run locally
```bash
npm install
cp .env.example .env   # add your Firebase web config (optional)
npm run dev
```
Without a Firebase config the game still works; the global leaderboard is simply hidden.
