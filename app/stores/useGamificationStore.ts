import { create } from 'zustand';
import { LeaderboardEntry } from '../types';

interface GamificationStore {
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  setUserRank: (rank: number) => void;
  updateLeaderboard: (entry: LeaderboardEntry) => void;
}

export const useGamificationStore = create<GamificationStore>((set) => ({
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
}));
