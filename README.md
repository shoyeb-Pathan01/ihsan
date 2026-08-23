# IHSAN — 60-Day Mission

> Learn. Build. Worship. Improve.

A personal mission-control system for a young Muslim professional pursuing two major goals over 60 days — one worldly (Azure/cloud career), one spiritual (Qur'anic Arabic).

## Philosophy

**Ihsān (احسان)** — doing something with excellence, as if you can see the result before you see it.

This application is not a generic habit tracker. It is a deeply personal command center built to make consistency and steadfastness (istiqāmah) feel real.

### Core Principles

1. **Execution > Tracking** — The system should tell you what to do next
2. **Mastery > Completion** — Watching is not knowing
3. **Practice > Passive Watching** — Active recall builds competence
4. **Consistency > Motivation** — Systems beat willpower
5. **Recovery > Guilt** — Returning after a lapse should be easy
6. **Respect > Gamification** — Worship is tracked respectfully, never scored competitively

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: SQLite via Prisma + better-sqlite3
- **Icons**: Lucide React
- **No Auth**: Opens directly to dashboard, single-user

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/ihsan.git
cd ihsan

# Install dependencies
npm install

# Push database schema
npm run db:push

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Commands

```bash
npm run db:push      # Push schema to database
npm run db:seed      # Seed with initial data
npm run db:reset     # Reset and reseed database
npm run db:studio    # Open Prisma Studio
```

## Features

### Dashboard
- Dynamic 60-day mission tracking (start: Aug 23, 2026)
- Time-of-day-aware greeting
- Core mission progress (Azure + Arabic)
- Supporting consistency cards (Reading, Memorization, Tahajjud, Communication)
- Today's Mission with auto-generated tasks
- Mission Intelligence (Strongest, Needs Attention, Next Milestone)
- 60-day journey timeline
- Consistency chart with weekly trend
- Islamic reminders with real citations

### Azure Administration
- 21 modules with 170+ topics
- 44 real session links
- Priority system (Critical/Important/Supporting/Bonus)
- Completion vs Mastery tracking (two distinct metrics)
- Proof of Work: lab, notes, architecture, interview explanation
- 4 seeded projects

### Qur'anic Arabic (Lisān-ul-Qur'ān)
- 60 real lectures (1-15 pre-watched)
- 8-stage tracking per lecture (Watched → Book → Notes → Examples → Practice → Revision → Quiz → Doubts)
- Mastery calculation based on stages + understanding + confidence
- Pacing indicator for 60-lecture syllabus
- Spaced revision scheduling (1/3/7/14/30 days)

### Supporting Trackers
- **Qur'an Reading**: pages, streak, monthly consistency
- **Memorization**: surahs, revision schedule, weak areas
- **Tahajjud**: streak, consistency (no competitive framing)
- **Communication**: practice sessions, Explain It challenges

### Gamification
- XP system (no XP for worship activities)
- 7 levels (Beginner → Mission Ready)
- Independent streaks per category
- 16 auto-unlock badges
- Comeback mechanic (guilt-free return)

### Focus Mode
- Countdown timer with topic focus
- Session logging with accomplishment tracking
- Confidence scoring

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Dashboard
│   ├── azure/page.tsx           # Azure modules & topics
│   ├── quran-journey/page.tsx   # Arabic, Reading, Memorization, Tahajjud
│   ├── communication/page.tsx   # Communication practice
│   ├── daily-mission/page.tsx   # Today's tasks
│   ├── focus/page.tsx           # Focus Mode
│   ├── revision/page.tsx        # Revision queue
│   ├── projects/page.tsx        # Azure projects
│   ├── progress/page.tsx        # Progress overview
│   ├── reminders/page.tsx       # Islamic reminders
│   ├── settings/page.tsx        # Settings
│   └── api/                     # API routes
├── components/                  # Reusable UI components
├── lib/
│   ├── db.ts                    # Prisma client
│   ├── utils.ts                 # Utility functions
│   └── data/                    # Seed data
│       ├── azure-modules.ts     # 21 modules, 44 sessions
│       ├── arabic-lectures.ts   # 60 lectures
│       └── reminders.ts         # Islamic reminders
└── types/                       # TypeScript types
```

## Database

SQLite via Prisma with better-sqlite3 adapter. Tables:

- Profile, Goals, Modules, Topics
- Azure Sessions (44 real sessions)
- Lisan Lectures (60 real lectures)
- Daily Tasks, Daily Logs
- Streaks, XP Transactions, Badges
- Quran Reading, Memorization, Tahajjud
- Communication Logs, Reminders
- Projects, Project Tasks
- Focus Sessions, Weekly Reviews

## Deployment

### Vercel

This app uses SQLite which requires a persistent filesystem. For Vercel deployment, consider:

1. **Turso/libSQL**: Replace SQLite with Turso for serverless deployment
2. **Docker**: Deploy as a container with persistent volume
3. **VPS**: Deploy on a VPS with persistent storage

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dev.db ./

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

## 60-Day Mission

**Start**: August 23, 2026
**End**: October 23, 2026

### Goals

| Goal | Weight | Type |
|------|--------|------|
| Azure Administration | 40% | Core Mission |
| Qur'anic Arabic | 40% | Core Mission |
| Communication | 2.5% | Supporting Development |
| Qur'an Reading | 7.5% | Qur'an Journey |
| Memorization | 5% | Qur'an Journey |
| Tahajjud | 5% | Qur'an Journey |

## License

Personal use only.
