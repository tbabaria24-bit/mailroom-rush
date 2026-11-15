# Mailroom Rush

An interactive React game for CGS 3853 (Project #7). You work the front desk of a campus mailroom: read each parcel's label, look the resident up in the roster, and click the right hall and shelf before your shift ends. Unknown names go back with "Return to sender."

**Play it:** https://tbabaria24-bit.github.io/mailroom-rush/

## React concepts used
- **Components:** `StartScreen`, `GameScreen`, `ParcelLabel`, `RosterLookup`, `MailroomWall`/`Bin`, `ResultsScreen`
- **State:** score, streak, timer, current parcel, search query, bin counts, pause, game phase (`useState`, `useMemo`, `useRef`)
- **Effects:** countdown timer, keyboard shortcut (P to pause), auto-focus on each new parcel
- **Events:** bin clicks, live roster search, difficulty selection, pause/quit
- High scores saved in `localStorage`

## Run locally
```bash
npm install
npm run dev
```
