// lib/constants/categories.ts
export const MUSIC_CATEGORIES = {
  trending: {
    id: 'trending',
    label: 'Trending Now',
    query: 'trending music 2026',
    icon: 'TrendingUp'
  },
  topHits: {
    id: 'topHits',
    label: 'Top Hits',
    query: 'top hits 2026',
    icon: 'Flame'
  },
  chillVibes: {
    id: 'chillVibes',
    label: 'Chill Vibes',
    query: 'lofi chill music mix',
    icon: 'Coffee'
  },
  workout: {
    id: 'workout',
    label: 'Workout',
    query: 'workout music motivation',
    icon: 'Dumbbell'
  },
  focus: {
    id: 'focus',
    label: 'Deep Focus',
    query: 'focus music concentration',
    icon: 'Brain'
  },
  party: {
    id: 'party',
    label: 'Party Mix',
    query: 'party mix 2026 dance',
    icon: 'PartyPopper'
  },
  sleep: {
    id: 'sleep',
    label: 'Sleep & Relax',
    query: 'sleep music relaxation',
    icon: 'Moon'
  },
  throwback: {
    id: 'throwback',
    label: 'Throwback Classics',
    query: '90s 2000s greatest hits',
    icon: 'Clock'
  },
  acoustic: {
    id: 'acoustic',
    label: 'Acoustic Sessions',
    query: 'acoustic cover songs',
    icon: 'Guitar'
  },
  electronic: {
    id: 'electronic',
    label: 'Electronic',
    query: 'electronic music mix 2026',
    icon: 'Zap'
  }
} as const;