import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AppWindow,
  Bluetooth,
  ExternalLink,
  FolderOpen,
  Gamepad2,
  Grid3X3,
  HardDrive,
  Home,
  Info,
  Cpu,
  MonitorCog,
  Play,
  Power,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Trash2,
  Wifi,
} from 'lucide-react';
import { STORE_APPS } from './constants';
import { nativeBridge } from './services/nativeBridge';
import { ItemType, LauncherItem } from './types';

type TabId = 'home' | 'apps' | 'store' | 'tools' | 'settings';
type FocusArea = 'tabs' | 'grid';

interface DeviceInfo {
  manufacturer: string;
  model: string;
  androidVersion: string;
  sdk: number;
  webView: string;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
}

interface ToastState {
  text: string;
  tone?: 'ok' | 'warn' | 'error';
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'apps', label: 'Apps', icon: Grid3X3 },
  { id: 'store', label: 'Tienda', icon: Search },
  { id: 'tools', label: 'Tools', icon: HardDrive },
  { id: 'settings', label: 'Ajustes', icon: Settings },
];

const demoApps: LauncherItem[] = [
  {
    id: 'youtube-tv',
    title: 'YouTube',
    description: 'App sugerida',
    type: ItemType.APP,
    packageName: 'com.google.android.youtube.tv',
  },
  {
    id: 'netflix-tv',
    title: 'Netflix',
    description: 'App sugerida',
    type: ItemType.APP,
    packageName: 'com.netflix.ninja',
  },
  {
    id: 'spotify-tv',
    title: 'Spotify',
    description: 'App sugerida',
    type: ItemType.APP,
    packageName: 'com.spotify.tv.android',
  },
];

const tvStoreApps: LauncherItem[] = STORE_APPS.map((app) => ({
  ...app,
  type: ItemType.STORE,
}));

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [focusArea, setFocusArea] = useState<FocusArea>('grid');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [apps, setApps] = useState<LauncherItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => readFavorites());
  const [recentIds, setRecentIds] = useState<string[]>(() => readStorageList('zynex:recent'));
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [clock, setClock] = useState(() => new Date());
  const [contextItem, setContextItem] = useState<LauncherItem | null>(null);
  const [query, setQuery] = useState('');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  const showToast = useCallback((text: string, tone: ToastState['tone'] = 'ok') => {
    setToast({ text, tone });
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const loadApps = useCallback(async () => {
    setIsLoadingApps(true);
    try {
      const nativeApps = await nativeBridge.getInstalledApps();
      const sortedApps = nativeApps
        .filter((app) => app.packageName)
        .sort((first, second) => first.title.localeCompare(second.title));

      setApps(sortedApps.length ? sortedApps : demoApps);
      showToast(sortedApps.length ? `${sortedApps.length} apps detectadas` : 'Modo demo sin puente Android', sortedApps.length ? 'ok' : 'warn');
    } catch (error) {
      console.error(error);
      setApps(demoApps);
      showToast('No se pudieron cargar apps nativas', 'error');
    } finally {
      setIsLoadingApps(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadApps();
    nativeBridge.getDeviceInfo().then(setDeviceInfo).catch(() => setDeviceInfo(null));
    const timer = window.setInterval(() => setClock(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, [loadApps]);

  useEffect(() => {
    window.localStorage.setItem('zynex:favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    window.localStorage.setItem('zynex:recent', JSON.stringify(recentIds));
  }, [recentIds]);

  const favoriteApps = useMemo(() => {
    const selected = favorites
      .map((id) => apps.find((app) => app.id === id))
      .filter((app): app is LauncherItem => Boolean(app));

    return selected.length ? selected : apps.slice(0, 8);
  }, [apps, favorites]);

  const recentApps = useMemo(() => recentIds
    .map((id) => apps.find((app) => app.id === id))
    .filter((app): app is LauncherItem => Boolean(app)), [apps, recentIds]);

  const homeItems = useMemo(() => {
    const merged = [...recentApps, ...favoriteApps, ...apps];
    const seen = new Set<string>();
    return merged.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    }).slice(0, 20);
  }, [apps, favoriteApps, recentApps]);

  const installedPackageNames = useMemo(() => new Set(apps.map((app) => app.packageName).filter(Boolean)), [apps]);

  const storeItems = useMemo(() => tvStoreApps.map((app) => ({
    ...app,
    description: app.packageName && installedPackageNames.has(app.packageName)
      ? 'Instalada en este TV Box'
      : app.description || 'Abrir tienda compatible',
    isInstalled: Boolean(app.packageName && installedPackageNames.has(app.packageName)),
  })), [installedPackageNames]);

  const tools = useMemo<ActionItem[]>(() => [
    {
      id: 'refresh',
      title: 'Actualizar apps',
      description: 'Releer aplicaciones instaladas',
      icon: RefreshCw,
      action: loadApps,
    },
    {
      id: 'files',
      title: 'Archivos',
      description: 'Abrir selector del sistema',
      icon: FolderOpen,
      action: () => {
        if (!nativeBridge.openFileManager()) showToast('No hay gestor de archivos disponible', 'warn');
      },
    },
    {
      id: 'playstore',
      title: 'Buscar apps',
      description: 'Abrir tienda para instalar',
      icon: ExternalLink,
      action: () => nativeBridge.openAppStore('com.android.vending'),
    },
    {
      id: 'game',
      title: 'Modo juego',
      description: 'Prioriza una interfaz liviana',
      icon: Gamepad2,
      action: () => showToast('Zynex ya esta en modo liviano para TV Box'),
    },
    {
      id: 'device',
      title: 'Info del TV Box',
      description: deviceInfo ? `${deviceInfo.model} · Android ${deviceInfo.androidVersion}` : 'Leyendo hardware',
      icon: Cpu,
      action: () => showToast(deviceInfo ? `${deviceInfo.model} · SDK ${deviceInfo.sdk}` : 'Sin datos del dispositivo', deviceInfo ? 'ok' : 'warn'),
    },
  ], [deviceInfo, loadApps, showToast]);

  const settings = useMemo<ActionItem[]>(() => [
    {
      id: 'system',
      title: 'Ajustes completos',
      description: 'Abrir panel principal de Android',
      icon: Settings,
      action: () => nativeBridge.openSystemSettings('settings'),
    },
    {
      id: 'wifi',
      title: 'Red e Internet',
      description: 'Abrir configuracion de Wi-Fi',
      icon: Wifi,
      action: () => nativeBridge.openSystemSettings('wifi'),
    },
    {
      id: 'bluetooth',
      title: 'Bluetooth',
      description: 'Mandos y audio',
      icon: Bluetooth,
      action: () => nativeBridge.openSystemSettings('bluetooth'),
    },
    {
      id: 'display',
      title: 'Pantalla',
      description: 'Resolucion y escala',
      icon: MonitorCog,
      action: () => nativeBridge.openSystemSettings('display'),
    },
    {
      id: 'security',
      title: 'Apps instaladas',
      description: 'Administrar permisos y datos',
      icon: Shield,
      action: () => nativeBridge.openSystemSettings('applications'),
    },
  ], []);

  const baseItems = useMemo(() => {
    if (activeTab === 'home') return homeItems;
    if (activeTab === 'apps') return apps;
    if (activeTab === 'store') return storeItems;
    if (activeTab === 'tools') return tools;
    return settings;
  }, [activeTab, apps, homeItems, settings, storeItems, tools]);

  const currentItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery || activeTab === 'tools' || activeTab === 'settings') return baseItems;

    return baseItems.filter((item) => {
      const packageName = 'packageName' in item ? item.packageName ?? '' : '';
      return `${item.title} ${item.description} ${packageName}`.toLowerCase().includes(normalizedQuery);
    });
  }, [activeTab, baseItems, query]);

  const focusedItem = currentItems[focusedIndex] ?? null;

  useEffect(() => {
    setFocusedIndex(0);
  }, [activeTab, query]);

  const selectTab = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setFocusedIndex(0);
    setContextItem(null);
  }, []);

  const launchApp = useCallback((item: LauncherItem) => {
    if (!item.packageName) {
      showToast(`${item.title} no tiene paquete asociado`, 'warn');
      return;
    }

    const didLaunch = nativeBridge.launchApp(item.packageName);
    if (didLaunch) {
      setRecentIds((current) => [item.id, ...current.filter((id) => id !== item.id)].slice(0, 12));
    }
    showToast(didLaunch ? `Abriendo ${item.title}` : `No se pudo abrir ${item.title}`, didLaunch ? 'ok' : 'error');
  }, [showToast]);

  const runItem = useCallback((item: LauncherItem | ActionItem | null) => {
    if (!item) return;

    if ('action' in item) {
      item.action();
      return;
    }

    if (item.type === ItemType.STORE) {
      if (item.isInstalled) {
        launchApp(item);
        return;
      }

      if (!item.packageName) {
        showToast('Esta app no tiene enlace de tienda', 'warn');
        return;
      }
      const didOpenStore = nativeBridge.openAppStore(item.packageName);
      showToast(didOpenStore ? `Buscando ${item.title}` : `No encontre tienda para ${item.title}`, didOpenStore ? 'ok' : 'warn');
      return;
    }

    launchApp(item);
  }, [launchApp, showToast]);

  const toggleFavorite = useCallback((item: LauncherItem) => {
    setFavorites((current) => {
      if (current.includes(item.id)) return current.filter((id) => id !== item.id);
      return [item.id, ...current].slice(0, 12);
    });
    showToast(favorites.includes(item.id) ? 'Quitado de favoritos' : 'Anadido a inicio');
  }, [favorites, showToast]);

  const moveFocus = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    const columns = getColumnCount();
    setFocusedIndex((index) => {
      const maxIndex = Math.max(0, currentItems.length - 1);
      if (direction === 'left') return Math.max(0, index - 1);
      if (direction === 'right') return Math.min(maxIndex, index + 1);
      if (direction === 'up') return Math.max(0, index - columns);
      return Math.min(maxIndex, index + columns);
    });
  }, [currentItems.length]);

  useEffect(() => {
    if (focusArea !== 'grid') return;
    const focusedTile = document.getElementById(`tile-${focusedIndex}`);
    if (focusedTile) focusedTile.scrollIntoView(false);
  }, [focusArea, focusedIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (contextItem) {
        if (event.key === 'Escape' || event.key === 'Backspace') {
          setContextItem(null);
          event.preventDefault();
        }
        return;
      }

      const tabIndex = tabs.findIndex((tab) => tab.id === activeTab);
      const gridColumn = focusedIndex % getColumnCount();

      switch (event.key) {
        case 'ArrowLeft':
          if (focusArea === 'tabs') selectTab(tabs[Math.max(0, tabIndex - 1)].id);
          else if (gridColumn === 0) setFocusArea('tabs');
          else moveFocus('left');
          event.preventDefault();
          break;
        case 'ArrowRight':
          if (focusArea === 'tabs') setFocusArea('grid');
          else moveFocus('right');
          event.preventDefault();
          break;
        case 'ArrowUp':
          if (focusArea === 'tabs') selectTab(tabs[Math.max(0, tabIndex - 1)].id);
          else if (focusArea === 'grid' && focusedIndex < getColumnCount()) setFocusArea('tabs');
          else if (focusArea === 'grid') moveFocus('up');
          event.preventDefault();
          break;
        case 'ArrowDown':
          if (focusArea === 'tabs') selectTab(tabs[Math.min(tabs.length - 1, tabIndex + 1)].id);
          else moveFocus('down');
          event.preventDefault();
          break;
        case 'Enter':
        case 'NumpadEnter':
          if (focusArea === 'tabs') setFocusArea('grid');
          else runItem(focusedItem);
          event.preventDefault();
          break;
        case 'ContextMenu':
        case 'm':
        case 'M':
          if (focusedItem && !('action' in focusedItem)) setContextItem(focusedItem);
          event.preventDefault();
          break;
        case 'Backspace':
        case 'Escape':
          if (query) setQuery('');
          else selectTab('home');
          event.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, contextItem, focusArea, focusedIndex, focusedItem, moveFocus, runItem, selectTab]);

  return (
    <div className="min-h-screen w-screen overflow-hidden bg-[#03050b] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(99,102,241,0.28),transparent_28rem),radial-gradient(circle_at_88%_78%,rgba(34,211,238,0.16),transparent_30rem),linear-gradient(135deg,rgba(15,23,42,0.72),rgba(2,6,23,1))]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="relative z-10 flex h-screen">
        <aside className="flex w-60 shrink-0 flex-col border-r border-white/10 bg-slate-950/45 px-4 py-5 shadow-[30px_0_90px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-[0_0_32px_rgba(99,102,241,0.34)]">
              <span className="font-brand text-2xl text-white">Z</span>
            </div>
            <div>
              <div className="font-brand text-2xl tracking-[0.14em] text-white">ZYNEX</div>
              <div className="font-tech text-[9px] font-bold uppercase tracking-[0.36em] text-cyan-300">Vision OS</div>
            </div>
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                isFocused={focusArea === 'tabs' && activeTab === tab.id}
                onClick={() => selectTab(tab.id)}
              />
            ))}
          </nav>

          <div className="mt-auto space-y-2">
            <div className="rounded-[15px] border border-indigo-300/20 bg-indigo-400/10 p-3.5">
              <div className="flex items-center gap-3 text-indigo-100">
                <Cpu size={18} />
                <span className="font-tech text-xs font-bold uppercase tracking-[0.2em]">TV Box</span>
              </div>
              <div className="mt-2 truncate text-sm font-bold text-white">{deviceInfo?.model ?? 'Detectando...'}</div>
              <div className="mt-1 text-xs text-slate-400">Android {deviceInfo?.androidVersion ?? '?'} · SDK {deviceInfo?.sdk ?? '?'}</div>
            </div>
            <div className="rounded-[15px] border border-cyan-300/20 bg-cyan-300/10 p-3.5">
              <div className="flex items-center gap-3 text-cyan-100">
                <Wifi size={18} className="animate-pulse" />
                <span className="font-tech text-xs font-bold uppercase tracking-[0.2em]">Android Bridge</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-4/5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
              </div>
              <div className="mt-2 text-sm text-slate-300">{apps.length} apps listas</div>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col px-5 py-4">
          <Header
            clock={clock}
            appCount={apps.length}
            isNative={nativeBridge.isNative()}
            query={query}
            onQueryChange={setQuery}
            onPower={() => nativeBridge.openSystemSettings('settings')}
          />

          <HeroPanel focusedItem={focusedItem} activeTab={activeTab} resultCount={currentItems.length} />

          <div className="mt-3 grid min-h-0 flex-1 grid-cols-[1fr_300px] gap-3">
            <section className="min-h-0 rounded-[18px] border border-white/10 bg-white/[0.055] p-3.5 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <SectionTitle activeTab={activeTab} isLoadingApps={isLoadingApps} query={query} resultCount={currentItems.length} />
              {currentItems.length === 0 ? (
                <EmptyState activeTab={activeTab} onRefresh={loadApps} />
              ) : (
                <div className="mt-3 grid max-h-[calc(100vh-275px)] grid-cols-5 gap-2.5 overflow-y-auto pr-2">
                  {currentItems.map((item, index) => (
                    <LauncherTile
                      key={item.id}
                      id={`tile-${index}`}
                      item={item}
                      isFocused={focusArea === 'grid' && focusedIndex === index}
                      isFavorite={!('action' in item) && favorites.includes(item.id)}
                      onFocus={() => setFocusedIndex(index)}
                      onRun={() => runItem(item)}
                      onMenu={() => {
                        if (!('action' in item)) setContextItem(item);
                      }}
                    />
                  ))}
                </div>
              )}
            </section>

            <Aside
              focusedItem={focusedItem}
              activeTab={activeTab}
              onRun={() => runItem(focusedItem)}
              onRefresh={loadApps}
            />
          </div>
        </main>
      </div>

      {contextItem && (
        <ContextPanel
          item={contextItem}
          isFavorite={favorites.includes(contextItem.id)}
          onClose={() => setContextItem(null)}
          onLaunch={() => {
            setContextItem(null);
            launchApp(contextItem);
          }}
          onFavorite={() => {
            toggleFavorite(contextItem);
            setContextItem(null);
          }}
          onInfo={() => {
            if (contextItem.packageName) nativeBridge.openAppInfo(contextItem.packageName);
            setContextItem(null);
          }}
          onUninstall={() => {
            if (contextItem.packageName) nativeBridge.uninstallApp(contextItem.packageName);
            setContextItem(null);
          }}
        />
      )}

      {toast && <Toast toast={toast} />}
    </div>
  );
};

const Header: React.FC<{
  clock: Date;
  appCount: number;
  isNative: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onPower: () => void;
}> = ({ clock, appCount, isNative, query, onQueryChange, onPower }) => (
  <header className="flex h-14 shrink-0 items-center justify-between gap-5">
    <div className="flex min-w-[440px] items-center gap-3 rounded-[14px] border border-white/10 bg-black/30 px-4 py-2 shadow-[0_18px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <Search size={24} className="text-cyan-300" />
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Busca en Zynex OS..."
        className="w-full bg-transparent text-lg font-semibold text-slate-100 outline-none placeholder:text-slate-500"
      />
      <div className="rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1 text-xs font-bold text-indigo-100">{appCount}</div>
    </div>
    <div className="flex items-center gap-5 text-right">
      <div className="hidden rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100 xl:block">
        {isNative ? 'Nativo' : 'Preview'}
      </div>
      <div>
        <div className="font-tech text-3xl leading-none">{clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div className="mt-1 text-sm capitalize text-slate-400">{clock.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}</div>
      </div>
      <button onClick={onPower} className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-cyan-300/30 bg-cyan-300/15 text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.18)]">
        <Power size={22} />
      </button>
    </div>
  </header>
);

const HeroPanel: React.FC<{ focusedItem: LauncherItem | ActionItem | null; activeTab: TabId; resultCount: number }> = ({ focusedItem, activeTab, resultCount }) => {
  const titleByTab: Record<TabId, string> = {
    home: 'Zynex Home',
    apps: 'Aplicaciones',
    store: 'Zynex Store',
    tools: 'Herramientas',
    settings: 'Ajustes',
  };

  return (
    <section className="mt-3 flex h-24 shrink-0 items-end justify-between overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-r from-slate-950/80 via-indigo-950/45 to-cyan-950/30 px-6 py-4 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <span className="rounded-full bg-white/10 px-3 py-1 font-tech text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
            {titleByTab[activeTab]}
          </span>
          <span className="h-1 w-1 rounded-full bg-cyan-300" />
          <span className="text-sm font-semibold text-slate-400">{resultCount} elementos</span>
        </div>
        <h1 className="font-tech text-4xl font-black leading-none tracking-tight text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.15)]">
          {focusedItem?.title ?? titleByTab[activeTab]}
        </h1>
      </div>
      <p className="max-w-xl pb-1 text-right text-sm leading-relaxed text-slate-300">
        {focusedItem?.description ?? 'Launcher real para Android TV con apps instaladas, acciones nativas y navegacion por control remoto.'}
      </p>
    </section>
  );
};

const TabButton: React.FC<{
  tab: { id: TabId; label: string; icon: React.ElementType };
  isActive: boolean;
  isFocused: boolean;
  onClick: () => void;
}> = ({ tab, isActive, isFocused, onClick }) => {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={`relative flex w-full items-center gap-3 rounded-[14px] border px-4 py-3 text-left text-base font-bold transition-all ${
        isActive ? 'border-cyan-300/30 bg-white/10 text-white shadow-[0_0_26px_rgba(99,102,241,0.24)]' : 'border-white/5 bg-white/[0.035] text-slate-400 hover:border-white/10 hover:bg-white/5'
      } ${isFocused ? 'outline outline-2 outline-offset-2 outline-cyan-300' : ''}`}
    >
      {isActive && <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.85)]" />}
      <Icon size={22} />
      <span>{tab.label}</span>
    </button>
  );
};

const SectionTitle: React.FC<{ activeTab: TabId; isLoadingApps: boolean; query: string; resultCount: number }> = ({ activeTab, isLoadingApps, query, resultCount }) => {
  const titleByTab: Record<TabId, string> = {
    home: 'Favoritos e inicio',
    apps: 'Aplicaciones instaladas',
    store: 'Instalar apps populares',
    tools: 'Herramientas',
    settings: 'Ajustes del sistema',
  };

  return (
    <div className="flex items-center justify-between">
      <h1 className="font-tech text-2xl">{titleByTab[activeTab]}</h1>
      <div className="flex items-center gap-3">
        {query && <span className="rounded-[8px] bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-200">{resultCount} resultados</span>}
        {isLoadingApps && <span className="rounded-[8px] bg-indigo-400/10 px-3 py-1 text-sm font-bold text-indigo-200">Leyendo apps...</span>}
      </div>
    </div>
  );
};

const LauncherTile: React.FC<{
  id: string;
  item: LauncherItem | ActionItem;
  isFocused: boolean;
  isFavorite: boolean;
  onFocus: () => void;
  onRun: () => void;
  onMenu: () => void;
}> = ({ id, item, isFocused, isFavorite, onFocus, onRun, onMenu }) => {
  const isAction = 'action' in item;
  const Icon = isAction ? item.icon : AppWindow;

  return (
    <button
      id={id}
      onMouseEnter={onFocus}
      onClick={onRun}
      onContextMenu={(event) => {
        event.preventDefault();
        onMenu();
      }}
      className={`group relative h-24 rounded-[12px] border p-2.5 text-left transition-transform ${
        isFocused
          ? 'scale-[1.035] border-cyan-300 bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-[0_22px_60px_rgba(34,211,238,0.22)]'
          : 'border-white/10 bg-slate-950/55 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
      }`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          {'imageUrl' in item && item.imageUrl ? (
            <img
              src={item.imageUrl}
              className="h-9 w-9 shrink-0 rounded-[10px] bg-black/30 object-contain"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${isFocused ? 'bg-white/15' : 'bg-white/10'}`}>
              <Icon size={22} />
            </div>
          )}
          {isFavorite && <div className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.75)]" />}
        </div>
        <div className="min-w-0">
          <div className="line-clamp-2 text-[15px] font-bold leading-tight">{item.title}</div>
          <div className={`mt-1 line-clamp-1 text-[11px] ${isFocused ? 'text-indigo-50' : 'text-slate-400'}`}>
            {'isInstalled' in item && item.isInstalled ? 'Instalada' : item.description}
          </div>
        </div>
      </div>
    </button>
  );
};

const Aside: React.FC<{
  focusedItem: LauncherItem | ActionItem | null;
  activeTab: TabId;
  onRun: () => void;
  onRefresh: () => void;
}> = ({ focusedItem, activeTab, onRun, onRefresh }) => (
  <aside className="rounded-[18px] border border-white/10 bg-white/[0.055] p-3.5 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
    <div className="flex h-full flex-col">
      <div className="rounded-[14px] border border-cyan-300/20 bg-gradient-to-br from-indigo-500/95 to-cyan-500/90 p-3.5 text-white shadow-[0_0_36px_rgba(99,102,241,0.25)]">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-cyan-50">
          <Sparkles size={16} />
          Seleccionado
        </div>
        <div className="mt-2 line-clamp-2 font-tech text-xl leading-tight">{focusedItem?.title ?? 'Sin elemento'}</div>
        <div className="mt-2 line-clamp-2 min-h-9 text-sm text-indigo-50">{focusedItem?.description ?? 'Elegi una opcion con el control remoto.'}</div>
      </div>

      <div className="mt-3 space-y-2 text-xs text-slate-400">
        <InfoLine icon={Play} text="OK abre la app o ejecuta accion" />
        <InfoLine icon={Info} text="Menu abre info, favorito o desinstalar" />
        <InfoLine icon={RefreshCw} text="Actualizar vuelve a leer apps nativas" />
      </div>

      <div className="mt-auto grid gap-3">
        <button onClick={onRun} className="h-10 rounded-[12px] bg-cyan-300 font-bold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
          {activeTab === 'store' ? 'Buscar / instalar' : 'Abrir'}
        </button>
        <button onClick={onRefresh} className="h-10 rounded-[12px] border border-white/10 bg-white/5 font-bold text-slate-100">
          Actualizar apps
        </button>
      </div>
    </div>
  </aside>
);

const InfoLine: React.FC<{ icon: React.ElementType; text: string }> = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2.5 rounded-[12px] bg-white/5 p-2.5">
    <Icon size={18} className="text-cyan-300" />
    <span>{text}</span>
  </div>
);

const EmptyState: React.FC<{ activeTab: TabId; onRefresh: () => void }> = ({ activeTab, onRefresh }) => (
  <div className="mt-4 flex h-[420px] flex-col items-center justify-center rounded-[14px] border border-dashed border-white/15 bg-white/5 text-center">
    <AppWindow size={42} className="text-cyan-300" />
    <div className="mt-4 font-tech text-3xl">No hay elementos</div>
    <div className="mt-2 max-w-md text-slate-400">
      {activeTab === 'apps' ? 'No pude leer aplicaciones instaladas todavia.' : 'Esta seccion no tiene contenido.'}
    </div>
    <button onClick={onRefresh} className="mt-6 rounded-[12px] bg-cyan-300 px-6 py-3 font-bold text-slate-950">
      Reintentar
    </button>
  </div>
);

const ContextPanel: React.FC<{
  item: LauncherItem;
  isFavorite: boolean;
  onClose: () => void;
  onLaunch: () => void;
  onFavorite: () => void;
  onInfo: () => void;
  onUninstall: () => void;
}> = ({ item, isFavorite, onClose, onLaunch, onFavorite, onInfo, onUninstall }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
    <div className="w-[520px] rounded-[18px] border border-white/10 bg-slate-950/95 p-5 text-slate-100 shadow-2xl backdrop-blur-xl">
      <div className="font-tech text-3xl">{item.title}</div>
      <div className="mt-1 text-sm text-slate-400">{item.packageName ?? 'Sin paquete'}</div>
      <div className="mt-5 grid gap-3">
        <ActionButton icon={Play} label="Abrir" onClick={onLaunch} />
        <ActionButton icon={Home} label={isFavorite ? 'Quitar de inicio' : 'Anadir a inicio'} onClick={onFavorite} />
        <ActionButton icon={Info} label="Informacion de app" onClick={onInfo} />
        <ActionButton icon={Trash2} label="Desinstalar" onClick={onUninstall} danger />
        <button onClick={onClose} className="mt-2 h-12 rounded-[12px] border border-white/10 bg-white/5 font-bold">
          Volver
        </button>
      </div>
    </div>
  </div>
);

const ActionButton: React.FC<{ icon: React.ElementType; label: string; onClick: () => void; danger?: boolean }> = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`flex h-12 items-center gap-3 rounded-[12px] px-4 font-bold ${
      danger ? 'bg-red-500/15 text-red-200' : 'bg-white/10 text-slate-100'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

const Toast: React.FC<{ toast: ToastState }> = ({ toast }) => {
  const color = toast.tone === 'error' ? 'border-red-400 text-red-100' : toast.tone === 'warn' ? 'border-amber-300 text-amber-100' : 'border-emerald-300 text-emerald-100';
  return (
    <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[12px] border bg-black/85 px-5 py-3 text-lg font-bold shadow-2xl backdrop-blur-xl ${color}`}>
      {toast.text}
    </div>
  );
};

function readFavorites(): string[] {
  return readStorageList('zynex:favorites');
}

function readStorageList(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getColumnCount() {
  if (window.innerWidth >= 1600) return 5;
  return window.innerWidth < 1100 ? 3 : 4;
}

export default App;
