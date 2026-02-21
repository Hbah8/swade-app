# SWADE App

Character generator and interactive rules reference for **Savage Worlds Adventure Edition**.

## Features

- **Character Builder** — Create characters step-by-step following SWADE core rules
  - Attributes, Skills (core + non-core), Edges, Hindrances
  - Automatic point tracking and validation
  - Derived stats calculation (Pace, Parry, Toughness)
  - Race selection with racial abilities
  - Export to **PDF** and **JSON**
  - Import from **JSON**
  - Auto-save to browser localStorage

- **Rules Reference** — Interactive searchable guide to SWADE rules
  - Categorized browsing (Character Creation, Combat, Damage, etc.)
  - Full-text search with tag filtering
  - Step-by-step examples
  - Cross-linked related rules

- **Location Shops (LAN-ready)** — Manage location-specific item availability and prices
  - Import equipment catalog from JSON
  - Configure per-location markup and manual price overrides
  - Share read-only player shop views by location route (`/shop/:locationId`)
  - Sync campaign shop data with local LAN proxy server

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript (strict) | Type safety |
| Vite + SWC | Build tool |
| Tailwind CSS 4 | Styling |
| Zustand | State management |
| React Router v7 | Client-side routing |
| jsPDF | PDF export |
| Zod | Schema validation |
| Lucide React | Icons |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Start frontend + LAN proxy together
npm run dev:all

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # React UI components
│   ├── character/       # Character builder components
│   ├── layout/          # App shell (Navbar, Layout)
│   └── rules/           # Rules reference components
├── data/                # Static SWADE game data
├── lib/                 # Shared utilities
├── models/              # TypeScript types & interfaces
├── pages/               # Route page components
├── services/            # Business logic (export, validation)
└── store/               # Zustand state stores
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (port 5173) |
| `npm run server` | Start local LAN proxy server (port 5174 by default) |
| `npm run dev:all` | Run frontend + LAN proxy together |
| `npm run build` | Type-check + production build |
| `npm run prepare:server` | Initialize local campaign storage for LAN server |
| `npm run build:proxy` | Build standalone proxy executable for Tauri packaging |
| `npm run prepare:tauri` | Copy web build into Tauri resources |
| `npm run build:tauri` | Build MSI via Tauri (requires `src-tauri` init and toolchain) |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `npm run test` | Run Vitest suite |

By default, the proxy binds to `0.0.0.0` (LAN-visible). Set `ALLOW_LAN=false` before `npm run server` to restrict it to localhost.

## License

Fan-made tool for Savage Worlds Adventure Edition. Savage Worlds and all associated logos and trademarks are copyrights of Pinnacle Entertainment Group.
