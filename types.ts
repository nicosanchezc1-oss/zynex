
export enum ItemType {
  APP = 'APP',
  MOVIE = 'MOVIE',
  SETTING = 'SETTING',
  STORE = 'STORE',
  WIDGET = 'WIDGET',
  SMART_HOME = 'SMART_HOME',
  TOOL = 'TOOL' // New Type
}

export interface LauncherItem {
  id: string;
  title: string;
  description?: string;
  icon?: string; // URL or Lucide icon name
  imageUrl?: string;
  videoUrl?: string; // New: For CineMotion previews
  type: ItemType;
  color?: string;
  packageName?: string; // New: For Android Intents
  isInstalled?: boolean; // For Store
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string; // Color gradient or image url
  color: string;
}

export type FocusSection = 'SIDEBAR' | 'GRID' | 'HERO_ACTIONS' | 'KEYBOARD' | 'MOOD_SELECTOR';

export interface GeminiContentResponse {
  recommendations: {
    title: string;
    description: string;
    genre: string;
  }[];
}

// New Ambiance Types
export type MoodType = 'FOCUS' | 'CINEMA' | 'GAMING';

export interface MoodConfig {
  id: MoodType;
  label: string;
  accentColor: string; // Tailwind class mostly for text
  glowColor: string; // Hex for shadows/canvas
  icon: string;
}

// Theme System
export type ThemeType = 'NIGHT' | 'DAY' | 'HACKER' | 'SUNSET';

export interface ThemeConfig {
    id: ThemeType;
    label: string;
    font: string;
    vars: {
        '--bg-main': string;
        '--text-main': string;
        '--text-muted': string;
        '--bg-surface': string;
        '--border': string;
        '--accent': string;
    }
}
