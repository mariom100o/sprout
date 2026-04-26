import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Topic = 'dinosaurs' | 'minecraft' | 'space';

export interface PrizeGoal {
  id: string;
  name: string;
  cost: number;
  current: number;
  hasParentVideo: boolean;
  videoUri?: string;
  emoji: string;
}

export interface Mission {
  id: string;
  topic: Topic;
  title: string;
  completedAt: number;
  fuelEarned: number;
  vocabWord: string;
}

export interface AccessibilitySettings {
  dyslexiaMode: boolean;
  largeFonts: boolean;
  speechEnabled: boolean;
}

export interface AppSettings {
  cost15min: number;
  cost30min: number;
  dailyLimitMinutes: number;
  missionsRequiredPerDay: number;
  childName: string;
  accessibility: AccessibilitySettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  cost15min: 50,
  cost30min: 100,
  dailyLimitMinutes: 60,
  missionsRequiredPerDay: 1,
  childName: 'DinoAce',
  accessibility: { dyslexiaMode: false, largeFonts: false, speechEnabled: false },
};

export interface Story {
  id: string;
  topic: Topic;
  title: string;
  sentences: string[];
  vocabWord: string;
  vocabDefinition: string;
  predictOptions: string[];
  inferenceQuestion: string;
  inferenceOptions: string[];
  correctInferenceIndex: number;
}

interface SproutState {
  settings: AppSettings;
  fuelBalance: number;
  totalEarned: number;
  missionsThisWeek: number;
  vocabMastered: number;
  readingLevel: number;
  readingLevelHistory: { week: string; level: number }[];
  prizeGoals: PrizeGoal[];
  recentMissions: Mission[];
  sessionEndsAt: number | null;
  sessionPausedAt: number | null;
  permissionsGranted: boolean;
  childInterests: Topic[];

  // Actions
  earnFuel: (amount: number, mission: Omit<Mission, 'id' | 'completedAt'>) => void;
  spendFuel: (amount: number) => void;
  grantSession: (durationMs: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  setPermissionsGranted: (granted: boolean) => void;
  setChildInterests: (interests: Topic[]) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  updateAccessibility: (patch: Partial<AccessibilitySettings>) => void;
  updatePrizeGoal: (id: string, patch: Partial<PrizeGoal>) => void;
  addPrizeGoal: (goal: Omit<PrizeGoal, 'id' | 'current'>) => void;
  removePrizeGoal: (id: string) => void;
  hasActiveSession: () => boolean;
}

const SEED_MISSIONS: Mission[] = [
  {
    id: '1',
    topic: 'dinosaurs',
    title: 'T-Rex: The Apex Predator',
    completedAt: Date.now() - 3600000,
    fuelEarned: 20,
    vocabWord: 'carnivore',
  },
  {
    id: '2',
    topic: 'space',
    title: 'Black Holes: Gravity\'s Monsters',
    completedAt: Date.now() - 7200000,
    fuelEarned: 20,
    vocabWord: 'gravity',
  },
  {
    id: '3',
    topic: 'minecraft',
    title: 'Creepers: Silent Explosions',
    completedAt: Date.now() - 86400000,
    fuelEarned: 20,
    vocabWord: 'camouflage',
  },
];

export const useSproutStore = create<SproutState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      fuelBalance: 435,
      totalEarned: 940,
      missionsThisWeek: 47,
      vocabMastered: 12,
      readingLevel: 3.0,
      readingLevelHistory: [
        { week: 'Week 1', level: 2.6 },
        { week: 'Week 2', level: 2.7 },
        { week: 'Week 3', level: 2.9 },
        { week: 'Week 4', level: 3.0 },
      ],
      prizeGoals: [
        {
          id: 'legoland',
          name: 'Legoland Trip',
          cost: 10000,
          current: 3420,
          hasParentVideo: true,
          emoji: '🏰',
        },
        {
          id: 'lego-set',
          name: 'Lego Technic Set',
          cost: 2000,
          current: 820,
          hasParentVideo: false,
          emoji: '🧱',
        },
        {
          id: 'movie',
          name: 'Movie Night',
          cost: 1000,
          current: 640,
          hasParentVideo: false,
          emoji: '🎬',
        },
      ],
      recentMissions: SEED_MISSIONS,
      sessionEndsAt: null,
      sessionPausedAt: null,
      permissionsGranted: false,
      childInterests: ['dinosaurs', 'space'],

      earnFuel: (amount, missionData) => {
        const mission: Mission = {
          ...missionData,
          id: Date.now().toString(),
          completedAt: Date.now(),
        };
        set((state) => ({
          fuelBalance: state.fuelBalance + amount,
          totalEarned: state.totalEarned + amount,
          missionsThisWeek: state.missionsThisWeek + 1,
          vocabMastered: state.vocabMastered + 1,
          recentMissions: [mission, ...state.recentMissions].slice(0, 20),
          prizeGoals: state.prizeGoals.map((g) => ({
            ...g,
            current: Math.min(g.current + amount, g.cost),
          })),
        }));
      },

      spendFuel: (amount) => {
        set((state) => ({
          fuelBalance: Math.max(0, state.fuelBalance - amount),
        }));
      },

      grantSession: (durationMs) => {
        const { sessionEndsAt } = get();
        const base =
          sessionEndsAt && sessionEndsAt > Date.now() ? sessionEndsAt : Date.now();
        set({ sessionEndsAt: base + durationMs, sessionPausedAt: null });
      },

      pauseSession: () => {
        const { sessionEndsAt, sessionPausedAt } = get();
        if (sessionPausedAt || !sessionEndsAt || sessionEndsAt <= Date.now()) return;
        set({ sessionPausedAt: Date.now() });
      },

      resumeSession: () => {
        const { sessionPausedAt, sessionEndsAt } = get();
        if (!sessionPausedAt || !sessionEndsAt) return;
        const paused = Date.now() - sessionPausedAt;
        set({ sessionEndsAt: sessionEndsAt + paused, sessionPausedAt: null });
      },

      setPermissionsGranted: (granted) => {
        set({ permissionsGranted: granted });
      },

      setChildInterests: (interests) => {
        set({ childInterests: interests });
      },

      updateSettings: (patch) => {
        set((state) => ({ settings: { ...state.settings, ...patch } }));
      },

      updateAccessibility: (patch) => {
        set((state) => ({
          settings: {
            ...state.settings,
            accessibility: { ...state.settings.accessibility, ...patch },
          },
        }));
      },

      updatePrizeGoal: (id, patch) => {
        set((state) => ({
          prizeGoals: state.prizeGoals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        }));
      },

      addPrizeGoal: (goal) => {
        const newGoal: PrizeGoal = { ...goal, id: Date.now().toString(), current: 0 };
        set((state) => ({ prizeGoals: [...state.prizeGoals, newGoal] }));
      },

      removePrizeGoal: (id) => {
        set((state) => ({ prizeGoals: state.prizeGoals.filter((g) => g.id !== id) }));
      },

      hasActiveSession: () => {
        const { sessionEndsAt, sessionPausedAt } = get();
        if (sessionPausedAt) return true;
        return sessionEndsAt !== null && sessionEndsAt > Date.now();
      },
    }),
    {
      name: 'sprout-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
