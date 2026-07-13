// lib/constants/categories.ts
export const MUSIC_CATEGORIES = {
  opm: {
    id: 'opm',
    label: 'OPM',
    query: 'filipino music',
    icon: ''
  },
  trending: {
    id: 'trending',
    label: 'Trending Now',
    query: 'trending music 2026',
    icon: 'TrendingUp'
  },
  nostalgia: {
    id: 'nostalgia',
    label: 'Nostalgia',
    query: 'old songs',
    icon: ''
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
  acoustic: {
    id: 'acoustic',
    label: 'Acoustic Sessions',
    query: 'acoustic cover songs',
    icon: 'Guitar'
  }
} as const;