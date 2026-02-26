# 🏀 HoopsIntel — NBA Analytics Frontend

A production-grade NBA analytics web app built with React + TypeScript + Three.js.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start dev server (mock data enabled by default)
npm run dev
```

App runs at http://localhost:5173

## Configuration

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | FastAPI backend URL |
| `VITE_USE_MOCKS` | `true` | Use mock data (no backend needed) |

## Mock Data Mode

When `VITE_USE_MOCKS=true` (default), all API calls return realistic mock data. Toggle in the Settings drawer (⚙️ top right) while running in dev mode.

## Pages

| Route | Description |
|---|---|
| `/` | Home with 3D arena hero |
| `/players` | Player search + full analytics dashboard |
| `/games` | Game finder + detailed breakdown |
| `/compare` | Side-by-side player comparison |

## Architecture

```
src/
├── api/
│   ├── client.ts              # Base fetch wrapper
│   ├── endpoints/
│   │   ├── players.ts         # Player API functions
│   │   └── games.ts           # Games API functions
│   └── hooks/
│       ├── usePlayers.ts      # React Query hooks
│       └── useGames.ts
├── mocks/
│   ├── players.ts             # Mock player data
│   └── games.ts               # Mock game data + PBP generator
├── three/
│   ├── ThreeShell.tsx         # Persistent Canvas + controls
│   ├── scenes/ArenaScene.tsx  # Arena + court + discs
│   └── components/
│       ├── TeamLogoDisc.tsx   # Floating logo discs
│       ├── PulseMarker.tsx    # Court event pulse
│       └── PlayerCard3D.tsx   # Player card pedestal
├── context/
│   ├── SettingsContext.tsx    # App settings (dark/perf/mock)
│   └── ThreeContext.tsx       # Three.js cross-page API
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── charts/                # Recharts wrappers
│   ├── layout/                # Navbar, drawers, search
│   ├── players/               # Player dashboard
│   └── games/                 # Game detail view
├── pages/                     # Route pages
├── types/index.ts             # All TypeScript types
└── utils/
    ├── formatters.ts          # Number/date formatters
    └── pbpAdapters.ts         # PBP -> chart data
```

## Features

- 🎯 **Player Analytics**: Career stats, season progression, accolades, percentiles, rankings
- 🏀 **Game Breakdown**: Score timeline, box scores, player stats, play-by-play explorer
- 📊 **Charts**: Recharts line/bar charts with quarters, tooltips, legends
- ⚖️ **Compare**: Side-by-side player stats + percentile bars
- 🌐 **3D Arena**: Three.js persistent canvas with court, discs, scoreboard
- ⚡ **3D Integration**: PulseMarker on court events, PlayerCard3D updates per season
- 🔧 **Settings**: Dark mode, performance mode, 3D toggle, mock data toggle
- 🔍 **Global Search**: Players + games quick access from anywhere
- 💀 **Skeleton Loaders**: All async states have loading skeletons
- 🚨 **Error States**: All queries have retry buttons

## Tech Stack

- React 18 + TypeScript (strict)
- Vite 5
- TailwindCSS 3
- React Router 6
- TanStack Query 5
- Three.js + @react-three/fiber + @react-three/drei
- Recharts
