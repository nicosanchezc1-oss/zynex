import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AppWindow,
  Bluetooth,
  ExternalLink,
  FolderOpen,
  Grid3X3,
  HardDrive,
  Home,
  Info,
  MonitorCog,
  Play,
  Power,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Star,
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
  { id: 'apps', label: 'Todas', icon: Grid3X3 },
  { id: 'store', label: 'Tienda', icon: Search },
  { id: 'tools', label: 'Sistema', icon: HardDrive },
  { id: 'settings', label: 'Ajustes', icon: Settings },
];

const demoApps: LauncherItem[] = [
  {
    id: 'youtube-tv',
    title: 'YouTube',
    description: 'Video y música',
    type: ItemType.APP,
    packageName: 'com.google.android.youtube.tv',
  },
  {
    id: 'netflix-tv',
    title: 'Netflix',
    description: 'Series y películas',
    type: ItemType.APP,
    packageName: 'com.netflix.ninja',
  },
  {
    id: 'spotify-tv',
    title: 'Spotify',
    description: 'Música',
    type: ItemType.APP,
    packageName: 'com.spotify.tv.android',
  },
];

const tvStoreApps: LauncherItem[] = STORE_APPS.map((app) => ({
  ...app,
  imageUrl: undefined,
  type: ItemType.STORE,
}));

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [focusArea, setFocusArea] = useState<FocusArea>('grid');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [apps, setApps] = useState<LauncherItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => readStorageList('zynex:favorites'));
  const [recentIds, setRecentIds] = useState<string[]>(() => readStorageList('zynex:recent'));
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [clock, setClock] = useState(() => new Date());
  const [contextItem, setContextItem] = useState<LauncherItem | null>(null);
  const [query, setQuery] = useState('');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  const showToast = useCallback((text: string, tone: ToastState['tone'] = 'ok') => {
    setToast({ text, tone });
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const loadApps = useCallback(async () => {
    setIsLoadingApps(true);
    try {
      const nativeApps = await nativeBridge.getInstalledApps();
      const sortedApps = sortAppsForLauncher(nativeApps.filter((app) => app.packageName));
      setApps(sortedApps.length ? sortedApps : demoApps);
      if (!sortedApps.length) showToast('Modo demo sin puente Android', 'warn');
    } catch (error) {
      console.error(error);
      setApps(demoApps);
      showToast('No se pudieron cargar las apps', 'error');
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
    const nativeWindow = window as Window & { reloadInstalledApps?: () => void };
    nativeWindow.reloadInstalledApps = loadApps;
    return () => {
      delete nativeWindow.reloadInstalledApps;
    };
  }, [loadApps]);

  useEffect(() => {
    window.localStorage.setItem('zynex:favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    window.localStorage.setItem('zynex:recent', JSON.stringify(recentIds));
  }, [recentIds]);

  const recentApps = useMemo(() => recentIds
    .map((id) => apps.find((app) => app.id === id))
    .filter((app): app is LauncherItem => Boolean(app)), [apps, recentIds]);

  const favoriteApps = useMemo(() => favorites
    .map((id) => apps.find((app) => app.id === id))
    .filter((app): app is LauncherItem => Boolean(app)), [apps, favorites]);

  const dailyApps = useMemo(() => {
    const preferred = apps.filter((app) => scoreApp(app) >= 50);
    return (preferred.length ? preferred : apps).slice(0, 12);
  }, [apps]);

  const homeItems = useMemo(() => {
    const usefulRecent = recentApps.filter((app) => scoreApp(app) >= 30);
    return uniqueItems([...dailyApps, ...usefulRecent, ...favoriteApps, ...apps]).slice(0, 10);
  }, [apps, dailyApps, favoriteApps, recentApps]);

  const installedPackageNames = useMemo(() => new Set(apps.map((app) => app.packageName).filter(Boolean)), [apps]);

  const storeItems = useMemo(() => tvStoreApps.map((app) => ({
    ...app,
    description: app.packageName && installedPackageNames.has(app.packageName)
      ? 'Instalada en este TV Box'
      : app.description || 'Buscar en tienda',
    isInstalled: Boolean(app.packageName && installedPackageNames.has(app.packageName)),
  })), [installedPackageNames]);

  const tools = useMemo<ActionItem[]>(() => [
    {
      id: 'refresh',
      title: 'Actualizar apps',
      description: 'Vuelve a leer tus apps instaladas',
      icon: RefreshCw,
      action: loadApps,
    },
    {
      id: 'files',
      title: 'Archivos',
      description: 'Abre el gestor de archivos del sistema',
      icon: FolderOpen,
      action: () => {
        if (!nativeBridge.openFileManager()) showToast('No hay gestor de archivos disponible', 'warn');
      },
    },
    {
      id: 'store-search',
      title: 'Buscar en tienda',
      description: 'Abre búsqueda de apps para Android TV',
      icon: ExternalLink,
      action: () => {
        if (!nativeBridge.openAppStore('search:android tv')) showToast('No hay tienda disponible', 'warn');
      },
    },
    {
      id: 'device',
      title: 'Estado del TV Box',
      description: deviceInfo ? `${deviceInfo.model} · Android ${deviceInfo.androidVersion}` : 'Leyendo dispositivo',
      icon: Info,
      action: () => showToast(deviceInfo ? `${deviceInfo.model} · Android ${deviceInfo.androidVersion}` : 'Sin datos del dispositivo', deviceInfo ? 'ok' : 'warn'),
    },
  ], [deviceInfo, loadApps, showToast]);

  const settings = useMemo<ActionItem[]>(() => [
    {
      id: 'system',
      title: 'Ajustes de Android',
      description: 'Panel principal del sistema',
      icon: Settings,
      action: () => nativeBridge.openSystemSettings('settings'),
    },
    {
      id: 'wifi',
      title: 'Wi‑Fi',
      description: 'Red e Internet',
      icon: Wifi,
      action: () => nativeBridge.openSystemSettings('wifi'),
    },
    {
      id: 'bluetooth',
      title: 'Bluetooth',
      description: 'Mandos, audio y accesorios',
      icon: Bluetooth,
      action: () => nativeBridge.openSystemSettings('bluetooth'),
    },
    {
      id: 'display',
      title: 'Pantalla',
      description: 'Resolución, escala y salida HDMI',
      icon: MonitorCog,
      action: () => nativeBridge.openSystemSettings('display'),
    },
    {
      id: 'apps',
      title: 'Apps instaladas',
      description: 'Permisos, datos y desinstalación',
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
      showToast(didOpenStore ? `Buscando ${item.title}` : `No encontré tienda para ${item.title}`, didOpenStore ? 'ok' : 'warn');
      return;
    }
    launchApp(item);
  }, [launchApp, showToast]);

  const toggleFavorite = useCallback((item: LauncherItem) => {
    setFavorites((current) => {
      if (current.includes(item.id)) return current.filter((id) => id !== item.id);
      return [item.id, ...current].slice(0, 12);
    });
    showToast(favorites.includes(item.id) ? 'Quitado de inicio' : 'Añadido a inicio');
  }, [favorites, showToast]);

  const openContext = useCallback((item: LauncherItem | ActionItem | null) => {
    if (!item || 'action' in item) return;
    if (item.type === ItemType.STORE && !item.isInstalled) return;
    setContextItem(item);
  }, []);

  const moveFocus = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    const columns = getColumnCount(activeTab);
    setFocusedIndex((index) => {
      const maxIndex = Math.max(0, currentItems.length - 1);
      if (direction === 'left') return Math.max(0, index - 1);
      if (direction === 'right') return Math.min(maxIndex, index + 1);
      if (direction === 'up') return Math.max(0, index - columns);
      return Math.min(maxIndex, index + columns);
    });
  }, [activeTab, currentItems.length]);

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
      const gridColumn = focusedIndex % getColumnCount(activeTab);

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
          else if (focusArea === 'grid' && focusedIndex < getColumnCount(activeTab)) setFocusArea('tabs');
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
          openContext(focusedItem);
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
  }, [activeTab, contextItem, focusArea, focusedIndex, focusedItem, moveFocus, openContext, runItem, selectTab]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#02040a] p-8 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_8%,rgba(30,64,175,0.34),transparent_26rem),radial-gradient(circle_at_75%_20%,rgba(34,211,238,0.14),transparent_32rem),radial-gradient(circle_at_76%_92%,rgba(14,165,233,0.18),transparent_26rem),linear-gradient(135deg,#02040a,#07101e_48%,#02040a)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="relative z-10 flex h-full min-h-0 gap-7">
        <aside className="flex w-48 shrink-0 flex-col rounded-[28px] border border-white/[0.08] bg-black/25 p-3 shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="mb-7 flex items-center gap-3 px-2 pt-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-[17px] bg-gradient-to-br from-blue-500 via-sky-400 to-cyan-300 shadow-[0_14px_35px_rgba(34,211,238,0.22)]">
              <span className="font-brand text-xl text-white">Z</span>
            </div>
            <div>
              <div className="font-brand text-xl tracking-[0.12em] text-white">ZYNEX</div>
              <div className="font-tech text-[8px] font-bold uppercase tracking-[0.32em] text-cyan-300">Vision OS</div>
            </div>
          </div>

          <nav className="grid gap-2">
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

          <div className="mt-auto rounded-[22px] border border-white/[0.08] bg-white/[0.04] px-4 py-4">
            <div className="font-tech text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-200">Biblioteca</div>
            <div className="mt-2 text-2xl font-black text-white">{apps.length}</div>
            <div className="text-xs text-slate-400">apps en este TV</div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <Header
            clock={clock}
            appCount={apps.length}
            isNative={nativeBridge.isNative()}
            query={query}
            onQueryChange={setQuery}
            onPower={() => nativeBridge.openSystemSettings('settings')}
          />

          <HeroPanel
            focusedItem={focusedItem}
            activeTab={activeTab}
            onRun={() => runItem(focusedItem)}
            onRefresh={loadApps}
          />

          <section className="mt-5 flex min-h-0 flex-1 flex-col">
            <SectionTitle activeTab={activeTab} isLoadingApps={isLoadingApps} query={query} resultCount={currentItems.length} />
            {currentItems.length === 0 ? (
              <EmptyState activeTab={activeTab} onRefresh={loadApps} />
            ) : (
              <div className={`mt-4 grid min-h-0 flex-1 items-start overflow-y-auto pr-2 ${activeTab === 'home' ? 'grid-cols-5 auto-rows-[178px] gap-4' : 'grid-cols-5 auto-rows-[150px] gap-4'}`}>
                {currentItems.map((item, index) => (
                  <LauncherTile
                    key={item.id}
                    id={`tile-${index}`}
                    item={item}
                    isFocused={focusArea === 'grid' && focusedIndex === index}
                    isFavorite={!('action' in item) && favorites.includes(item.id)}
                    isHome={activeTab === 'home'}
                    onFocus={() => setFocusedIndex(index)}
                    onRun={() => runItem(item)}
                    onMenu={() => openContext(item)}
                  />
                ))}
              </div>
            )}
          </section>
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
    <div className="flex min-w-[460px] items-center gap-3 rounded-full border border-white/10 bg-black/25 px-5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <Search size={23} className="text-cyan-300" />
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Buscar app..."
        className="w-full bg-transparent text-xl font-bold text-slate-100 outline-none placeholder:text-slate-500"
      />
      <div className="rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1 text-sm font-bold text-indigo-100">{appCount}</div>
    </div>
      <div className="flex items-center gap-4 text-right">
      <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-100">
        {isNative ? 'TV Box' : 'Preview'}
      </div>
      <div>
        <div className="font-tech text-4xl leading-none">{clock.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
        <div className="mt-1 text-base text-slate-400">{formatSpanishDate(clock)}</div>
      </div>
      <button onClick={onPower} className="flex h-[52px] w-[52px] items-center justify-center rounded-[18px] border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
        <Power size={25} />
      </button>
    </div>
  </header>
);

const HeroPanel: React.FC<{
  focusedItem: LauncherItem | ActionItem | null;
  activeTab: TabId;
  onRun: () => void;
  onRefresh: () => void;
}> = ({ focusedItem, activeTab, onRun, onRefresh }) => {
  const Icon = focusedItem && 'action' in focusedItem ? focusedItem.icon : AppWindow;

  return (
    <section className="mt-5 flex h-32 shrink-0 items-center justify-between gap-5 overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-r from-white/[0.075] via-indigo-500/10 to-cyan-400/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex min-w-0 items-center gap-5">
        <AppArtwork item={focusedItem} icon={Icon} size="hero" />
        <div className="min-w-0">
          <div className="font-tech text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">{getHeroLabel(activeTab)}</div>
          <h1 className="mt-1 line-clamp-1 text-[2.35rem] font-black leading-none text-white">{focusedItem?.title ?? 'Elegí qué ver'}</h1>
          <p className="mt-2 line-clamp-1 max-w-3xl text-base leading-snug text-slate-300">
            {activeTab === 'home' ? 'Inicio ordenado para mirar, jugar o escuchar sin buscar entre herramientas.' : focusedItem?.description ?? 'Acciones reales, navegación por control remoto y apps instaladas.'}
          </p>
        </div>
      </div>
      <div className="grid w-52 shrink-0 gap-3">
        <button onClick={onRun} className="h-[52px] rounded-[17px] bg-cyan-300 text-lg font-black text-slate-950 shadow-[0_14px_36px_rgba(34,211,238,0.22)]">
          {activeTab === 'store' ? 'Buscar' : 'Abrir'}
        </button>
        <button onClick={onRefresh} className="h-11 rounded-[17px] border border-white/10 bg-white/5 text-sm font-bold text-slate-100">
          Actualizar
        </button>
      </div>
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
      className={`relative flex h-14 w-full items-center gap-3 rounded-[18px] border px-4 text-left text-lg font-black ${
        isActive ? 'border-cyan-300/30 bg-white/[0.12] text-white shadow-[0_12px_34px_rgba(34,211,238,0.08)]' : 'border-transparent bg-transparent text-slate-500'
      } ${isFocused ? 'outline outline-3 outline-offset-2 outline-cyan-300' : ''}`}
    >
      {isActive && <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-cyan-300" />}
      <Icon size={24} />
      <span>{tab.label}</span>
    </button>
  );
};

const SectionTitle: React.FC<{ activeTab: TabId; isLoadingApps: boolean; query: string; resultCount: number }> = ({ activeTab, isLoadingApps, query, resultCount }) => {
  const titleByTab: Record<TabId, string> = {
    home: 'Para usar ahora',
    apps: 'Todas tus apps',
    store: 'Instalar o buscar',
    tools: 'Herramientas reales',
    settings: 'Ajustes del sistema',
  };

  return (
    <div className="flex h-9 shrink-0 items-center justify-between">
      <h2 className="font-tech text-[2rem] font-black leading-none text-white">{titleByTab[activeTab]}</h2>
      <div className="flex items-center gap-3">
        {query && <span className="rounded-[10px] bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-200">{resultCount} resultados</span>}
        {isLoadingApps && <span className="rounded-[10px] bg-indigo-400/10 px-3 py-1 text-sm font-bold text-indigo-200">Leyendo apps...</span>}
      </div>
    </div>
  );
};

const LauncherTile: React.FC<{
  id: string;
  item: LauncherItem | ActionItem;
  isFocused: boolean;
  isFavorite: boolean;
  isHome: boolean;
  onFocus: () => void;
  onRun: () => void;
  onMenu: () => void;
}> = ({ id, item, isFocused, isFavorite, isHome, onFocus, onRun, onMenu }) => {
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
      className={`relative h-full overflow-hidden rounded-[24px] border text-left ${isHome ? 'p-4' : 'p-4'} ${
        isFocused ? 'border-cyan-200 bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-600 text-white shadow-[0_24px_70px_rgba(14,165,233,0.34)]' : 'border-white/[0.08] bg-white/[0.045] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-black/20 opacity-80" />
      <div className={`relative flex h-full min-w-0 flex-col ${isHome ? 'items-center justify-center text-center' : 'justify-between'}`}>
        <div className="flex w-full items-start justify-between">
          <span />
          {isFavorite && <Star size={18} className="fill-cyan-200 text-cyan-200" />}
        </div>
        <AppArtwork item={item} icon={Icon} size={isHome ? 'large' : 'normal'} />
        <div className="min-w-0">
          <div className={`${isHome ? 'mt-4 text-[1.35rem]' : 'text-xl'} line-clamp-2 font-black leading-[1.05]`}>{item.title}</div>
        {!isHome && (
          <div className={`mt-1 line-clamp-1 text-sm ${isFocused ? 'text-indigo-50' : 'text-slate-400'}`}>
            {'isInstalled' in item && item.isInstalled ? 'Instalada' : item.description}
          </div>
        )}
        </div>
      </div>
    </button>
  );
};

const AppArtwork: React.FC<{ item: LauncherItem | ActionItem | null; icon: React.ElementType; size: 'normal' | 'large' | 'hero' }> = ({ item, icon: Icon, size }) => {
  const dimensions = size === 'hero' ? 'h-[72px] w-[72px] rounded-[22px]' : size === 'large' ? 'h-[86px] w-[86px] rounded-[24px]' : 'h-16 w-16 rounded-[18px]';
  const iconSize = size === 'hero' ? 36 : size === 'large' ? 42 : 32;

  if (item && 'imageUrl' in item && item.imageUrl) {
    return (
      <img
        src={item.imageUrl}
        className={`${dimensions} shrink-0 bg-black/25 object-contain p-2 shadow-[0_16px_38px_rgba(0,0,0,0.26)]`}
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div className={`${dimensions} flex shrink-0 items-center justify-center bg-white/10 text-cyan-200 shadow-[0_16px_38px_rgba(0,0,0,0.24)]`}>
      <Icon size={iconSize} />
    </div>
  );
};

const EmptyState: React.FC<{ activeTab: TabId; onRefresh: () => void }> = ({ activeTab, onRefresh }) => (
  <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-[18px] border border-dashed border-white/15 bg-white/5 text-center">
    <AppWindow size={52} className="text-cyan-300" />
    <div className="mt-4 font-tech text-4xl">No hay elementos</div>
    <div className="mt-2 max-w-md text-lg text-slate-400">
      {activeTab === 'apps' ? 'No pude leer aplicaciones instaladas todavía.' : 'Esta sección no tiene contenido.'}
    </div>
    <button onClick={onRefresh} className="mt-6 rounded-[14px] bg-cyan-300 px-7 py-3 text-lg font-black text-slate-950">
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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
    <div className="w-[560px] rounded-[24px] border border-white/10 bg-slate-950 p-6 text-slate-100">
      <div className="font-tech text-4xl">{item.title}</div>
      <div className="mt-1 text-sm text-slate-400">Opciones de la aplicación</div>
      <div className="mt-6 grid gap-3">
        <ActionButton icon={Play} label="Abrir" onClick={onLaunch} />
        <ActionButton icon={Home} label={isFavorite ? 'Quitar de inicio' : 'Añadir a inicio'} onClick={onFavorite} />
        <ActionButton icon={Info} label="Información de app" onClick={onInfo} />
        <ActionButton icon={Trash2} label="Desinstalar" onClick={onUninstall} danger />
        <button onClick={onClose} className="mt-2 h-14 rounded-[14px] border border-white/10 bg-white/5 text-lg font-bold">
          Volver
        </button>
      </div>
    </div>
  </div>
);

const ActionButton: React.FC<{ icon: React.ElementType; label: string; onClick: () => void; danger?: boolean }> = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`flex h-14 items-center gap-3 rounded-[14px] px-5 text-lg font-bold ${
      danger ? 'bg-red-500/15 text-red-200' : 'bg-white/10 text-slate-100'
    }`}
  >
    <Icon size={22} />
    <span>{label}</span>
  </button>
);

const Toast: React.FC<{ toast: ToastState }> = ({ toast }) => {
  const color = toast.tone === 'error' ? 'border-red-400 text-red-100' : toast.tone === 'warn' ? 'border-amber-300 text-amber-100' : 'border-emerald-300 text-emerald-100';
  return (
    <div className={`fixed bottom-10 left-1/2 z-50 -translate-x-1/2 rounded-[16px] border bg-black/90 px-6 py-4 text-2xl font-black ${color}`}>
      {toast.text}
    </div>
  );
};

function readStorageList(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function uniqueItems(items: LauncherItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function sortAppsForLauncher(items: LauncherItem[]) {
  return [...items].sort((first, second) => {
    const scoreDifference = scoreApp(second) - scoreApp(first);
    if (scoreDifference !== 0) return scoreDifference;
    return first.title.localeCompare(second.title);
  });
}

function scoreApp(item: LauncherItem) {
  const text = `${item.title} ${item.packageName ?? ''}`.toLowerCase();
  let score = 0;

  if (matches(text, ['netflix', 'youtube', 'disney', 'hbo', 'max', 'prime', 'amazon', 'kodi', 'plex', 'spotify', 'música', 'musica', 'mxl', 'iptv', 'claro', 'video', 'media', 'movifly', 'multivision', 'sports'])) score += 100;
  if (matches(text, ['tv', 'play', 'stream', 'cine', 'movie', 'pelicula', 'series'])) score += 35;
  if (matches(text, ['ajustes', 'settings', 'installer', 'install', 'file', 'browser', 'download', 'downloader', 'launcher', 'aurora', 'aptoide', 'happymod'])) score -= 90;

  return score;
}

function matches(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function getColumnCount(activeTab: TabId) {
  if (activeTab === 'home') return window.innerWidth >= 1600 ? 5 : 3;
  return window.innerWidth >= 1600 ? 5 : 4;
}

function getHeroLabel(activeTab: TabId) {
  if (activeTab === 'home') return 'Inicio';
  if (activeTab === 'apps') return 'Aplicaciones';
  if (activeTab === 'store') return 'Tienda';
  if (activeTab === 'tools') return 'Sistema';
  return 'Ajustes';
}

function formatSpanishDate(date: Date) {
  const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}.`;
}

export default App;
