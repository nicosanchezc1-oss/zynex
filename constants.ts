
import { LauncherItem, ItemType, Category, UserProfile, MoodConfig, ThemeConfig } from './types';

export const CATEGORIES: Category[] = [
  { id: 'home', name: 'Inicio', icon: 'Home' },
  { id: 'apps', name: 'Aplicaciones', icon: 'Grid' },
  { id: 'tools', name: 'Herramientas', icon: 'Cpu' }, // New Category
  { id: 'store', name: 'Zynex Store', icon: 'ShoppingBag' },
  { id: 'movies', name: 'Cine AI', icon: 'Clapperboard' },
  { id: 'settings', name: 'Ajustes', icon: 'Settings' },
];

export const PROFILES: UserProfile[] = [
  { id: '1', name: 'Admin', avatar: 'from-indigo-500 to-purple-600', color: 'indigo' },
  { id: '2', name: 'Kids', avatar: 'from-green-400 to-emerald-600', color: 'emerald' },
  { id: '3', name: 'Invitado', avatar: 'from-gray-500 to-slate-700', color: 'gray' },
];

export const MOODS: MoodConfig[] = [
  { 
    id: 'FOCUS', 
    label: 'Zynex OS', 
    accentColor: 'indigo-500', 
    glowColor: '#6366f1', 
    icon: 'Zap'
  },
  { 
    id: 'CINEMA', 
    label: 'Modo Cine', 
    accentColor: 'red-600', 
    glowColor: '#dc2626', 
    icon: 'Clapperboard'
  },
  { 
    id: 'GAMING', 
    label: 'Modo Juego', 
    accentColor: 'emerald-400', 
    glowColor: '#34d399', 
    icon: 'Gamepad2'
  }
];

export const THEMES: ThemeConfig[] = [
    {
        id: 'NIGHT',
        label: 'Original Dark',
        font: 'font-sans',
        vars: {
            '--bg-main': '#050505',
            '--text-main': '#f1f5f9',
            '--text-muted': '#94a3b8',
            '--bg-surface': 'rgba(255, 255, 255, 0.05)',
            '--border': 'rgba(255, 255, 255, 0.1)',
            '--accent': '#6366f1'
        }
    },
    {
        id: 'DAY',
        label: 'Frost Ice',
        font: 'font-sans',
        vars: {
            '--bg-main': '#f0f9ff', // Very light ice blue
            '--text-main': '#0c4a6e', // Dark blue text
            '--text-muted': '#64748b', // Slate
            '--bg-surface': 'rgba(255, 255, 255, 0.65)', // High opacity glass
            '--border': 'rgba(14, 165, 233, 0.2)', // Light blue border
            '--accent': '#0ea5e9' // Sky 500
        }
    },
    {
        id: 'HACKER',
        label: 'Terminal',
        font: 'font-mono',
        vars: {
            '--bg-main': '#000000',
            '--text-main': '#4ade80', // Green 400
            '--text-muted': '#166534', // Green 800
            '--bg-surface': 'rgba(0, 20, 0, 0.8)', // Dark green tint
            '--border': '#22c55e', // Solid green border
            '--accent': '#22c55e'
        }
    },
    {
        id: 'SUNSET',
        label: 'Vaporwave',
        font: 'font-sans',
        vars: {
            '--bg-main': '#2e1065', // Deep purple base
            '--text-main': '#fdf4ff',
            '--text-muted': '#e879f9',
            '--bg-surface': 'rgba(0, 0, 0, 0.3)',
            '--border': 'rgba(232, 121, 249, 0.3)',
            '--accent': '#d946ef'
        }
    }
];

export const INITIAL_APPS: LauncherItem[] = [
  {
    id: 'nexus_home',
    title: 'Nexus Home',
    type: ItemType.SMART_HOME, // New Widget
    color: 'from-gray-900 to-black',
    description: 'Control del Hogar'
  },
  {
    id: 'optimizer_widget',
    title: 'Optimización',
    type: ItemType.WIDGET,
    color: 'from-gray-800 to-gray-900',
    description: 'Widget del Sistema'
  },
  {
    id: 'netflix',
    title: 'Netflix',
    type: ItemType.APP,
    imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=800&auto=format&fit=crop',
    color: 'from-red-900 to-red-600',
    isInstalled: true
  },
  {
    id: 'movie_dune',
    title: 'Dune: Parte Dos',
    type: ItemType.MOVIE,
    imageUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'Paul Atreides se une a Chani y a los Fremen mientras busca venganza.',
    color: 'from-orange-700 to-yellow-900'
  },
  {
    id: 'youtube',
    title: 'YouTube',
    type: ItemType.APP,
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop',
    color: 'from-red-700 to-red-500',
    isInstalled: true
  },
  {
    id: 'movie_blade',
    title: 'Blade Runner 2049',
    type: ItemType.MOVIE,
    imageUrl: 'https://images.unsplash.com/photo-1533177243638-8fa1bb7a93ac?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    description: 'Un nuevo blade runner descubre un secreto enterrado durante mucho tiempo.',
    color: 'from-cyan-900 to-blue-900'
  },
  {
    id: 'spotify',
    title: 'Spotify',
    type: ItemType.APP,
    imageUrl: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=800&auto=format&fit=crop',
    color: 'from-green-700 to-green-500',
    isInstalled: true
  },
];

export const TOOL_ITEMS: LauncherItem[] = [
    { id: 'speedtest', title: 'SpeedFlux', type: ItemType.TOOL, icon: 'Gauge', description: 'Test de Velocidad Cuántico', color: 'from-cyan-900 to-blue-900' },
    { id: 'inputs', title: 'HyperInput', type: ItemType.TOOL, icon: 'HdmiPort', description: 'Selector de Fuentes HDMI', color: 'from-purple-900 to-pink-900' },
    { id: 'file_manager', title: 'File Core', type: ItemType.TOOL, icon: 'FolderKanban', description: 'Gestor de Archivos Root', color: 'from-amber-900 to-orange-900' },
    { id: 'terminal', title: 'Sys Terminal', type: ItemType.TOOL, icon: 'Terminal', description: 'Consola de Comandos', color: 'from-black to-gray-900' },
];

export const STORE_APPS: LauncherItem[] = [
  {
    id: 'hbo',
    title: 'HBO Max',
    type: ItemType.STORE,
    imageUrl: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?q=80&w=800&auto=format&fit=crop',
    description: 'Entretenimiento de calidad',
    isInstalled: false
  },
  {
    id: 'disney',
    title: 'Disney+',
    type: ItemType.STORE,
    imageUrl: 'https://images.unsplash.com/photo-1606229338681-189f7831d4d3?q=80&w=800&auto=format&fit=crop',
    description: 'Las mejores historias',
    isInstalled: false
  },
  {
    id: 'geforce',
    title: 'GeForce Now',
    type: ItemType.STORE,
    imageUrl: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=800&auto=format&fit=crop',
    description: 'Cloud Gaming',
    isInstalled: false
  },
  {
    id: 'kodi',
    title: 'Kodi',
    type: ItemType.STORE,
    imageUrl: 'https://images.unsplash.com/photo-1543536448-d209d2d13a1c?q=80&w=800&auto=format&fit=crop',
    description: 'Media Center',
    isInstalled: false
  }
];

export const SETTINGS_ITEMS: LauncherItem[] = [
  { id: 'wifi', title: 'Wi-Fi', type: ItemType.SETTING, icon: 'Wifi', color: 'from-slate-700 to-slate-600' },
  { id: 'display', title: 'Pantalla', type: ItemType.SETTING, icon: 'Monitor', color: 'from-slate-700 to-slate-600' },
  { id: 'account', title: 'Cuenta', type: ItemType.SETTING, icon: 'User', color: 'from-slate-700 to-slate-600' }, 
];
