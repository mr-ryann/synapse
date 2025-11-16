// Global types for Synapse app
// Designed for scalability and extensibility

export interface User {
  $id: string;
  email: string;
  name?: string;
  username?: string;
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  selectedTopics: string[];
  totalChallengesCompleted: number;
  onboardingCompleted: boolean;
  lastActivityDate?: string;
  emailVerified?: boolean;
  // Legacy fields (for backwards compatibility)
  streak?: number;
  preferences?: {
    topics: string[];
    difficulty: number;
  };
}

export interface Challenge {
  id: string;
  type: 'quest' | 'pop';
  title: string; // for display
  topic: string; // for display
  topicId: string;
  coreProvocation?: string; // The main challenge question/prompt
  subcategory?: string;
  difficulty: number;
  xpReward: number;
  estimatedTime: number; // in minutes
  stepsCount?: number; // for quests
  source?: string; // 'curated' | 'ai_generated'
}

export interface ChallengeStep {
  id: string;
  challengeId: string;
  stepType: 'ice-breaker' | 'mcq' | 'thought-drop' | 'text' | 'image' | 'puzzle'; // extensible enum
  content: string;
  options?: string[]; // for MCQ
  aiPrompt?: string;
  order: number;
}

export interface UserProgress {
  userId: string;
  challengeId: string;
  currentStep: number;
  startTime: Date;
  totalTime: number; // in seconds
  xpEarned: number;
  completed: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
}

// For future extensibility
export type StepType = ChallengeStep['stepType'];

export interface GamificationData {
  xp: number;
  level: number;
  streak: number;
  nextLevelXp: number;
}
