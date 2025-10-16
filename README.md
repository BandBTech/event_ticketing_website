# Timro-Ticket - Event Ticketing Platform

A beautiful, modern event ticketing platform built with Next.js 15, TypeScript, and shadcn/ui. This application allows users to discover, search, and book tickets for various events.

## 🚀 Features

- **Beautiful Landing Page**: Glass morphism design with animated backgrounds
- **Event Discovery**: Browse and search through various events
- **Category Filtering**: Filter events by categories (Music, Concert, Festival, etc.)
- **Responsive Design**: Optimized for all device sizes
- **Real-time Search**: Debounced search functionality
- **Modern UI**: Built with shadcn/ui components
- **State Management**: Zustand for global state management
- **Data Fetching**: TanStack Query for efficient data fetching and caching

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Phosphor Icons (Duotone variants)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Date Handling**: date-fns

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles and Tailwind config
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Landing page
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── events/                  # Event-specific components
│   │   ├── EventCard.tsx        # Event card with glass morphism
│   │   ├── EventGrid.tsx        # Event grid with loading states
│   │   └── EventSearch.tsx      # Search component
│   └── providers/               # Context providers
│       └── QueryProvider.tsx    # TanStack Query provider
├── hooks/                       # Custom React hooks
│   └── useEvents.ts            # Event-related queries
├── lib/                         # Utilities and configurations
│   ├── api.ts                  # Mock API client
│   └── utils.ts                # Utility functions
├── store/                       # Zustand stores
│   └── eventStore.ts           # Event state management
├── types/                       # TypeScript definitions
│   ├── event.ts                # Event-related types
│   ├── api.ts                  # API types
│   └── index.ts                # Type exports
└── data/                        # Mock data
    └── mockEvents.ts           # Sample event data
```

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Run the development server**:
   ```bash
   pnpm dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)