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
| `npm run build` | Type-check + production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## License

Fan-made tool for Savage Worlds Adventure Edition. Savage Worlds and all associated logos and trademarks are copyrights of Pinnacle Entertainment Group.
