# E-Ticket - Event Ticketing Platform

A beautiful, modern event ticketing platform built with Next.js 14, TypeScript, and Tailwind CSS. This application allows users to discover, search, and book tickets for various events across Nepal.

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

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glass morphism effects
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

## 🎨 Design Features

- **Glass Morphism**: Beautiful frosted glass effects throughout the UI
- **Gradient Backgrounds**: Animated gradient orbs and patterns
- **Smooth Animations**: Hover effects and transitions
- **Modern Typography**: Poppins and Inter font combinations
- **Responsive Grid**: Adaptive layouts for all screen sizes

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

## 📱 Event Features

### Event Cards
- High-quality event images
- Status badges (On Sale, Sale on Hold, Sold Out)
- Category tags
- Date and location information
- Pricing and ticket availability
- Hover animations and effects

### Search & Filtering
- Real-time search across event titles, descriptions, and locations
- Category-based filtering
- Debounced search for optimal performance
- Clear filters functionality

### Mock Data
The application includes comprehensive mock data featuring:
- 6 sample events across different categories
- Realistic pricing and ticket information
- Nepal-based venues and locations
- Various event types (Music festivals, conferences, workshops, etc.)

## 🔮 Future Enhancements

- Event detail pages
- Ticket booking flow
- User authentication
- Payment integration
- Admin dashboard
- Real-time notifications
- Social sharing
- Event recommendations

## 🎯 User Flow

1. **Landing**: Users arrive at the beautiful hero section
2. **Discovery**: Browse featured events and categories
3. **Search**: Use search and filters to find specific events
4. **Explore**: View event cards with detailed information
5. **Action**: Click to view more details or book tickets

## 📄 License

This project is built for demonstration purposes as part of an event ticketing platform.

---

Built with ❤️ using modern web technologies and best practices.
