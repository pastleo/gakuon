# Tech Stack

- **Framework**: Next.js 16.0.0 (App Router) + React 19.2.0
- **Language**: TypeScript 5.x
- **Package Manager**: Bun
- **Styling**: Tailwind CSS 4.1.9, dark mode via next-themes
- **UI Components**: shadcn/ui + Radix UI primitives, Lucide icons
- **Forms**: React Hook Form + Zod validation
- **Media**: react-youtube
- **Charts**: recharts
- **Date**: date-fns, react-day-picker

# Core Features

## Flashcard Playlist Player (`components/media-player.tsx`)

YouTube playlist player that shows flashcards between videos for learning.

- **Playlist-only**: Validates URLs must contain `list=` parameter
- **Flashcard decks**: Mock decks with front/back cards (Japanese vocab, numbers, music theory)
- **Auto-display**: Detects video transitions via YouTube state `-1` (unstarted), ignores initial state with `hasStartedPlaying` flag
- **Interaction overlay**: Transparent overlay over iframe that enables player control access; click to enter 10s interaction mode that suppresses flashcards during manual navigation
- **Interactive UI**: Click to flip card, configurable duration (2-15s), high contrast text
- **Configuration**: Deck selection dropdown, duration slider
