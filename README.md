# LifeRewards

A gamified personal life tracker that turns your daily habits, work, and activities into points, streaks, and ranks. Built with React + TypeScript + Vite + Tailwind CSS.

---

## How It Works

LifeRewards lets you log activities across five categories — **Workout**, **Work**, **Reading**, **Music**, and **Habits** — and converts them into points. Points accumulate daily and weekly, unlocking rank ratings and achievement badges.

### Core Loop

1. **Log activities** — tap a quick-log button or pick an activity and enter a duration
2. **Earn points** — each activity awards points based on its type and your current streak
3. **Build streaks** — consecutive days in a category multiply your points
4. **Rank up** — meet the weekly conditions for each rank (D → C → B → A → S → SS → SSS)
5. **Unlock achievements** — badges for milestones, streaks, habits, and special events

### Data Storage

All data is saved locally in your browser's `localStorage`. No account or server required.

---

## Getting Started Locally

**Prerequisites:** Node.js 18+

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/liferewards.git
cd liferewards

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

### Desktop (Electron)

```bash
# Run as a desktop app in dev mode
npm run electron:dev

# Build a macOS .dmg for direct distribution
npm run electron:build:mac

# Build a .pkg for Mac App Store submission
npm run electron:build:mas
```

#### Before building for Mac App Store

- [ ] Add `build/icon.icns` — convert a 1024×1024 PNG with `iconutil` or `electron-icon-builder`
- [ ] Enroll in the Apple Developer Program (developer.apple.com, $99/yr)
- [ ] Create App ID `com.liferewards.app` in App Store Connect
- [ ] Generate a **Mac App Distribution** certificate + **Mac Installer Distribution** certificate
- [ ] Set env vars: `CSC_NAME`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`
- [ ] Run `npm run electron:build:mas` on a **macOS machine** (Apple's toolchain requirement)

---

## Rule Book

### Activities & Points

Points are awarded per minute for duration-based activities, or as flat points for habits.

| Activity | Category | Points |
| --- | --- | --- |
| Workout (general) | Workout | 3 pts/min |
| Bouldering | Workout | 3 pts/min |
| Cardio | Workout | 3 pts/min |
| Work | Work | 1 pt/min |
| Reading | Reading | 1 pt/min |
| Electric Guitar Practice | Music | 2 pts/min |
| Classical Guitar Practice | Music | 2 pts/min |
| Get Up at 9 | Habits | +30 pts (flat) |
| Sleep at 12:30 | Habits | +20 pts (flat) |
| Meal — Clean | Habits | +15 pts (flat) |
| Meal — Regular | Habits | 0 pts |
| Meal — Heavy (1st & 2nd per week) | Habits | 0 pts |
| Meal — Heavy (3rd+ per week) | Habits | −20 pts |

### Daily Caps

| Category | Daily Cap |
| --- | --- |
| Workout | 500 pts |
| Work | No cap |
| Reading | 300 pts |
| Music | 400 pts |
| Habits | No cap |

### Streak Multipliers

Consecutive days with activity in a category boost your points for that category.

| Streak | Multiplier |
| --- | --- |
| 3–6 days | ×1.2 |
| 7–13 days | ×1.5 |
| 14+ days | ×2.0 |

Streak multipliers are applied before the daily cap.

### Balance Bonus

Log at least one activity in **Workout, Work, and Reading** on the same day to earn a **+50 pt Balance Bonus**.

---

### Weekly Rankings

Your rank resets every Monday and is determined by meeting **all conditions** for that rank during the week. Points alone don't grant rank — every condition must be satisfied.

#### D

No conditions required.

#### C

- 5+ hours of work
- 1+ workout session

#### B

- 20+ hours of work
- 2+ workout sessions
- 2+ music sessions
- 3+ clean meals

#### A

- 40+ hours of work
- 4+ workout sessions
- 5+ guitar practice sessions
- 10+ clean meals

#### S

- 40+ hours of work
- 5+ workout sessions
- 7+ guitar practice sessions
- 14+ clean meals
- 3+ reading sessions

#### SS

- 40+ hours of work
- 6+ workout sessions
- 10+ guitar practice sessions
- 14+ clean meals
- 5+ reading sessions
- Get up at 9 — 5+ days

#### SSS

- 40+ hours of work
- 7+ workout sessions (every day)
- 14+ guitar practice sessions
- 21+ clean meals
- 7+ reading sessions
- Get up at 9 — every day
- Sleep at 12:30 — every day

---

### Achievements

Badges are earned permanently and displayed in the Achievements tab. They cover:

- **Activity firsts** — first bouldering session, first guitar session, etc.
- **Streak milestones** — 3, 7, 14, and 30-day streaks
- **Habit consistency** — getting up early 5/20 times, 7 clean meals in a week, etc.
- **Volume milestones** — 10 or 50 workout sessions, 10 music sessions, etc.
- **Rank milestones** — reaching B, A, S, SS, and SSS for the first time
- **Special** — Balance Master (all 5 categories in one day), Perfect Week (7 consecutive days logged)

A toast notification appears when a new achievement is unlocked.

---

### Calendar & Heatmap

The 📅 Calendar tab shows:

- A **90-day heatmap** (GitHub-style) — color intensity reflects daily points earned
- A **monthly calendar** — each day shows its points total, color-coded by intensity
- A **day detail panel** — click any day to see every activity logged that day

---

## Tech Stack

| | |
| --- | --- |
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Storage | Browser localStorage |
| No backend | Fully client-side |
