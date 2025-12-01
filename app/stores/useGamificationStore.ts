import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LeaderboardEntry } from '../types';

interface ActivityDataPoint {
  date: string;
  challenges: number;
  xp: number;
  thinkingTime: number;
}

interface AnalyticsCache {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalChallenges: number;
  averageThinkingTime: number;
  trend: 'up' | 'down' | 'stable';
  activityData: ActivityDataPoint[];
  xpProgress: number;
  lastUpdated: string;
}

interface GamificationStore {
  // Leaderboard
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  setUserRank: (rank: number) => void;
  updateLeaderboard: (entry: LeaderboardEntry) => void;
  
  // Analytics cache
  analyticsCache: AnalyticsCache | null;
  setAnalyticsCache: (cache: AnalyticsCache) => void;
  clearAnalyticsCache: () => void;
  
  // Quick gamification actions
  addXp: (amount: number) => void;
  incrementStreak: () => void;
}

const XP_PER_LEVEL = 100;

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      // Leaderboard state
      leaderboard: [],
      userRank: null,
      setLeaderboard: (leaderboard) => set({ leaderboard }),
      setUserRank: (rank) => set({ userRank: rank }),
      updateLeaderboard: (entry) =>
        set((state) => ({
          leaderboard: state.leaderboard
            .filter((e) => e.userId !== entry.userId)
            .concat(entry)
            .sort((a, b) => b.xp - a.xp),
        })),
      
      // Analytics cache
      analyticsCache: null,
      setAnalyticsCache: (cache) => set({ 
        analyticsCache: { ...cache, lastUpdated: new Date().toISOString() } 
      }),
      clearAnalyticsCache: () => set({ analyticsCache: null }),
      
      // Quick actions for optimistic updates
      addXp: (amount) => {
        const cache = get().analyticsCache;
        if (cache) {
          const newXp = cache.xp + amount;
          const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
          const currentLevelXp = (newLevel - 1) * XP_PER_LEVEL;
          const xpInCurrentLevel = newXp - currentLevelXp;
          const xpProgress = Math.min((xpInCurrentLevel / XP_PER_LEVEL) * 100, 100);
          
          set({
            analyticsCache: {
              ...cache,
              xp: newXp,
              level: newLevel,
              xpProgress,
              totalChallenges: cache.totalChallenges + 1,
              lastUpdated: new Date().toISOString(),
            },
          });
        }
      },
      incrementStreak: () => {
        const cache = get().analyticsCache;
        if (cache) {
          set({
            analyticsCache: {
              ...cache,
              currentStreak: cache.currentStreak + 1,
              longestStreak: Math.max(cache.longestStreak, cache.currentStreak + 1),
              lastUpdated: new Date().toISOString(),
            },
          });
        }
      },
    }),
    {
      name: 'gamification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        analyticsCache: state.analyticsCache,
        userRank: state.userRank,
      }),
    }
  )
);
