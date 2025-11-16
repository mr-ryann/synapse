import { create } from 'zustand';
import { Challenge, ChallengeStep } from '../types';

interface ChallengeStore {
  currentChallenge: Challenge | null;
  currentStep: ChallengeStep | null;
  progress: {
    currentStepIndex: number;
    totalSteps: number;
    startTime: Date | null;
  };
  thinkingTime: number;
  currentHint: string | null;
  setCurrentChallenge: (challenge: Challenge) => void;
  setCurrentStep: (step: ChallengeStep) => void;
  updateProgress: (updates: Partial<ChallengeStore['progress']>) => void;
  setThinkingTime: (time: number) => void;
  setCurrentHint: (hint: string | null) => void;
  resetChallengeSession: () => void;
  clearChallenge: () => void;
}

export const useChallengeStore = create<ChallengeStore>((set) => ({
  currentChallenge: null,
  currentStep: null,
  progress: {
    currentStepIndex: 0,
    totalSteps: 0,
    startTime: null,
  },
  thinkingTime: 0,
  currentHint: null,
  setCurrentChallenge: (challenge) =>
    set({
      currentChallenge: challenge,
      progress: {
        currentStepIndex: 0,
        totalSteps: challenge.stepsCount || 0,
        startTime: new Date(),
      },
    }),
  setCurrentStep: (step) => set({ currentStep: step }),
  updateProgress: (updates) =>
    set((state) => ({
      progress: { ...state.progress, ...updates },
    })),
  setThinkingTime: (time) => set({ thinkingTime: time }),
  setCurrentHint: (hint) => set({ currentHint: hint }),
  resetChallengeSession: () =>
    set({
      currentChallenge: null,
      currentStep: null,
      thinkingTime: 0,
      currentHint: null,
      progress: {
        currentStepIndex: 0,
        totalSteps: 0,
        startTime: null,
      },
    }),
  clearChallenge: () =>
    set({
      currentChallenge: null,
      currentStep: null,
      progress: {
        currentStepIndex: 0,
        totalSteps: 0,
        startTime: null,
      },
    }),
}));
