
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { GridItem } from './components/GridItem';
import { Clock } from './components/Clock';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { SettingsOverlay } from './components/SettingsOverlay';
import { SystemStatusBar } from './components/SystemStatusBar';
import { MediaPlayer } from './components/MediaPlayer';
import { Screensaver } from './components/Screensaver';
import { ContextMenu } from './components/ContextMenu';
import { WeatherModal } from './components/WeatherModal';
import { VolumeHUD } from './components/VolumeHUD';
import { Toast } from './components/Toast';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { ZenithStore } from './components/ZenithStore';
import { SystemOptimizer } from './components/SystemOptimizer';
import { SmartHomeWidget } from './components/SmartHomeWidget';
import { MoodSelector } from './components/MoodSelector';
import { ParticleBackground } from './components/ParticleBackground'; 
import { NeuralCore } from './components/NeuralCore'; 
import { SpeedFlux } from './components/SpeedFlux'; 
import { InputHub } from './components/InputHub'; 
import { OmniSearch } from './components/OmniSearch'; 
import { GameBooster } from './components/GameBooster'; 
import { ZenithDeck } from './components/ZenithDeck'; 
import { CineVerse } from './components/CineVerse'; 
import { FileManager } from './components/FileManager'; 
import { TerminalModal } from './components/TerminalModal'; 
import { ProfileCreator } from './components/ProfileCreator'; 
import { ZenithDock } from './components/ZenithDock';
import { BootSequence } from './components/BootSequence';
import { nativeBridge } from './services/nativeBridge';
import { generateRecommendations } from './services/geminiService';
import { CATEGORIES, INITIAL_APPS, SETTINGS_ITEMS, PROFILES, STORE_APPS, MOODS, THEMES, TOOL_ITEMS } from './constants';
import { LauncherItem, FocusSection, ItemType, UserProfile, MoodType, ThemeType } from './types';
import { Mic, Loader2, Sparkles, Search, Play, Info, Plus, ChevronDown, User, Bell, Aperture, Layers } from 'lucide-react';
import { playSound } from './utils/sound';

// Configuration
const COLS = 4;
const GAP = 40; 
const SCREENSAVER_TIMEOUT = 30000;

export default function App() {
  // -- Initialization State --
  const [isBooting, setIsBooting] = useState(true);

  // -- Global Mouse Tracking (Spotlight) --
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // -- Screensaver State --
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -- Context Menu State --
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: LauncherItem | null } | null>(null);

  // -- State --
  const [activeCategory, setActiveCategory] = useState<string>('home');
  const [focusSection, setFocusSection] = useState<FocusSection>('SIDEBAR'); 
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<UserProfile>(PROFILES[0]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Overlays State - "No Dead Ends" Policy
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [isMoodSelectorOpen, setIsMoodSelectorOpen] = useState(false);
  const [isNeuralCoreOpen, setIsNeuralCoreOpen] = useState(false); 
  const [isSpeedFluxOpen, setIsSpeedFluxOpen] = useState(false); 
  const [isInputHubOpen, setIsInputHubOpen] = useState(false); 
  const [isOmniSearchOpen, setIsOmniSearchOpen] = useState(false); 
  const [isZenithDeckOpen, setIsZenithDeckOpen] = useState(false); 
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false); 
  const [isTerminalOpen, setIsTerminalOpen] = useState(false); 
  const [isProfileCreatorOpen, setIsProfileCreatorOpen] = useState(false); 

  // CineVerse State
  const [cineVerse, setCineVerse] = useState<{ isOpen: boolean, movie: LauncherItem | null }>({ isOpen: false, movie: null });

  // PiP State
  const [isPipActive, setIsPipActive] = useState(false);

  // HyperLaunch / GameBooster State
  const [hyperLaunch, setHyperLaunch] = useState<{ isOpen: boolean, item: LauncherItem | null }>({ isOpen: false, item: null });
  
  const [activeSettingsItem, setActiveSettingsItem] = useState<LauncherItem | null>(null);
  const [currentWifi, setCurrentWifi] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState<MoodType>('FOCUS');
  
  // -- Theme State --
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('NIGHT');
  const activeThemeConfig = THEMES.find(t => t.id === currentTheme) || THEMES[0];
  
  // Smart Home State
  const [areLightsOn, setAreLightsOn] = useState(true);

  // Keyboard State
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardTarget, setKeyboardTarget] = useState<'search' | null>(null);

  // Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Interaction State
  const [launchingItem, setLaunchingItem] = useState<LauncherItem | null>(null);

  // Data state
  const [items, setItems] = useState<LauncherItem[]>(INITIAL_APPS);
  const [bgImage, setBgImage] = useState<string>('https://images.unsplash.com/photo-1614850523060-8da1d56ae167?q=80&w=2600&auto=format&fit=crop');
  
  // AI State
  const [isListening, setIsListening] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  // Derived Mood Config
  const activeMoodConfig = MOODS.find(m => m.id === currentMood) || MOODS[0];

  // -- Native App Loading (Background) --
  useEffect(() => {
      // We load native apps in background while booting
      if (nativeBridge.isNative()) {
        const loadApps = async () => {
            try {
                const realApps = await nativeBridge.getInstalledApps();
                if (realApps.length > 0) {
                    setItems(prev => {
                        const nonApps = prev.filter(i => i.type !== ItemType.APP && i.type !== ItemType.WIDGET && i.type !== ItemType.SMART_HOME);
                        const customItems = prev.filter(i => i.type === ItemType.APP || i.type === ItemType.WIDGET || i.type === ItemType.SMART_HOME);
                        return [...customItems.filter(i => !realApps.some(r => r.id === i.id)), ...realApps];
                    });
                }
            } catch (e) {
                console.error("Failed to load native apps", e);
            }
        };
        loadApps();
      }
  }, []);

  // -- Idle Timer Logic --
  const resetIdleTimer = useCallback(() => {
    if (isScreensaverActive) setIsScreensaverActive(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    
    idleTimerRef.current = setTimeout(() => {
        setIsScreensaverActive(true);
    }, SCREENSAVER_TIMEOUT);
  }, [isScreensaverActive]);

  useEffect(() => {
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    resetIdleTimer(); // Initial start
    return () => {
        window.removeEventListener('mousemove', resetIdleTimer);
        window.removeEventListener('keydown', resetIdleTimer);
        window.removeEventListener('click', resetIdleTimer);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  // -- Mouse Tracker --
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // -- Helpers --
  const getItemsForCategory = useCallback(() => {
    switch (activeCategory) {
      case 'home': return items.slice(0, 12); 
      case 'apps': return items.filter(i => i.type === ItemType.APP);
      case 'movies': return items.filter(i => i.type === ItemType.MOVIE);
      case 'tools': return TOOL_ITEMS;
      case 'settings': return SETTINGS_ITEMS;
      case 'store': return STORE_APPS; 
      default: return [];
    }
  }, [activeCategory, items]);

  const currentGridItems = getItemsForCategory();
  const focusedItem = activeCategory === 'store' ? STORE_APPS[focusedIndex] : currentGridItems[focusedIndex];

  // -- Actions --
  const showToast = (msg: string) => { setToastMessage(msg); };

  const handleMoodChange = (mood: MoodType) => {
      setCurrentMood(mood);
      const config = MOODS.find(m => m.id === mood)!;
      playSound('success');
      setIsMoodSelectorOpen(false);
      showToast(`Ambiente: ${config.label} activado`);
  };

  // The actual final launch function
  const executeLaunch = (item: LauncherItem) => {
      // 1. Movies -> CineVerse
      if (item.type === ItemType.MOVIE) {
          setCineVerse({ isOpen: true, movie: item });
          playSound('select');
          return;
      }

      // 2. Specific Tools
      if (item.id === 'file_manager') {
          setIsFileManagerOpen(true);
          playSound('select');
          return;
      }
      if (item.id === 'terminal') {
          setIsTerminalOpen(true);
          playSound('select');
          return;
      }
      if (item.id === 'speedtest') {
          setIsSpeedFluxOpen(true);
          playSound('select');
          return;
      }
      if (item.id === 'inputs') {
          setIsInputHubOpen(true);
          playSound('select');
          return;
      }

      // 3. Settings
      if (item.type === ItemType.SETTING) {
          setActiveSettingsItem(item);
          setIsSettingsOpen(true);
          playSound('select');
          return;
      }

      // 4. Widgets (Non-launchable directly except via interactions inside them)
      if (item.type === ItemType.WIDGET || item.type === ItemType.SMART_HOME) return;

      // 5. Standard Apps (Game Booster Effect)
      setLaunchingItem(item);
      setTimeout(() => {
        if (item.type === ItemType.APP && item.packageName) {
            const success = nativeBridge.launchApp(item.packageName);
            if (!success) {
                setLaunchingItem(null);
                showToast(`Error: No se pudo abrir ${item.title}`);
                playSound('error');
                return;
            }
        }
        setTimeout(() => setLaunchingItem(null), 2000); 
    }, 500); 
  };

  const handleLaunch = (item: LauncherItem) => {
    playSound('select');

    // Trigger HyperLaunch for Apps (Game Booster effect) only for Apps, not Tools/Movies
    if (item.type === ItemType.APP && item.packageName) { 
        setHyperLaunch({ isOpen: true, item: item });
        return;
    }

    executeLaunch(item);
  };

  const onHyperLaunchComplete = () => {
      if (hyperLaunch.item) {
          executeLaunch(hyperLaunch.item);
      }
      setHyperLaunch({ isOpen: false, item: null });
  };

  const handleInstallApp = (app: LauncherItem) => {
      if (items.some(i => i.id === app.id)) return;
      const newApp: LauncherItem = { ...app, type: ItemType.APP, color: 'from-blue-600 to-blue-400', isInstalled: true };
      setItems(prev => [...prev, newApp]);
      showToast(`${app.title} añadido a Aplicaciones`);
  };

  const handleContextMenu = (e: React.MouseEvent, item: LauncherItem) => {
      e.preventDefault();
      playSound('select');
      setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const handleCategorySelect = (id: string) => {
    playSound('select');
    setActiveCategory(id);
    setFocusSection('GRID');
    setFocusedIndex(0);
  };

  const handleGeminiSearch = async () => {
    if (!aiPrompt.trim()) return;
    setIsLoadingAI(true);
    playSound('select');
    const response = await generateRecommendations(aiPrompt);
    if (response && response.recommendations) {
      playSound('success');
      const newItems: LauncherItem[] = response.recommendations.map((rec, idx) => ({
        id: `ai-${Date.now()}-${idx}`,
        title: rec.title,
        description: rec.description,
        type: ItemType.MOVIE,
        imageUrl: `https://picsum.photos/800/600?random=${Date.now() + idx}`,
        color: 'from-purple-900 to-indigo-900'
      }));
      setItems(prev => [...newItems, ...prev]);
      setActiveCategory('movies');
      setFocusSection('GRID');
      setFocusedIndex(0);
      showToast(`Se encontraron ${newItems.length} resultados`);
    } else {
        playSound('error');
    }
    setIsLoadingAI(false);
    setAiPrompt("");
  };

  const toggleMic = () => {
    playSound('select');
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Navegador no soportado para voz.");
      return;
    }
    if (isListening) {
        setIsListening(false);
        // @ts-ignore
        window.recognition?.stop();
        return;
    }
    setIsListening(true);
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    // @ts-ignore
    window.recognition = recognition;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAiPrompt(transcript);
      setIsListening(false);
      handleGeminiSearch(); 
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const openSearchKeyboard = () => {
      playSound('select');
      setIsOmniSearchOpen(true); 
  };

  const handleKeyboardSubmit = (text: string) => {
      playSound('success');
      if (keyboardTarget === 'search') {
          setAiPrompt(text);
          setIsKeyboardOpen(false);
          handleGeminiSearch();
      }
  };

  const getScrollOffset = () => {
    if (focusSection === 'SIDEBAR') return 0;
    const row = Math.floor(focusedIndex / COLS);
    const itemHeight = focusedItem?.type === ItemType.APP || focusedItem?.type === ItemType.WIDGET || focusedItem?.type === ItemType.SMART_HOME || focusedItem?.type === ItemType.TOOL ? 180 : 340; 
    const rowHeight = itemHeight + GAP;
    const offset = row * rowHeight;
    if (row === 0) return 0;
    return -offset;
  };

  // Keyboard Logic
  useEffect(() => {
    // Block interaction if any overlay is open
    if (isKeyboardOpen || isMoodSelectorOpen || isNeuralCoreOpen || isSpeedFluxOpen || isInputHubOpen || isOmniSearchOpen || hyperLaunch.isOpen || isZenithDeckOpen || cineVerse.isOpen || isFileManagerOpen || isTerminalOpen || isProfileCreatorOpen) return; 
    if (launchingItem || isBooting || isSettingsOpen || contextMenu || isWeatherOpen) return; 

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '-' || e.key === '=') return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (e.key === 'Escape') {
        playSound('back');
        setFocusSection('SIDEBAR');
        setIsProfileMenuOpen(false);
        setContextMenu(null);
        return;
      }
      
       if (focusSection === 'SIDEBAR') {
        const catIndex = CATEGORIES.findIndex(c => c.id === activeCategory);
        switch (e.key) {
          case 'ArrowUp':
            playSound('hover');
            const prev = Math.max(0, catIndex - 1);
            setActiveCategory(CATEGORIES[prev].id);
            break;
          case 'ArrowDown':
            playSound('hover');
            const next = Math.min(CATEGORIES.length - 1, catIndex + 1);
            setActiveCategory(CATEGORIES[next].id);
            break;
          case 'ArrowRight':
          case 'Enter':
            playSound('hover');
            setFocusSection('GRID');
            setFocusedIndex(0);
            break;
        }
      } else if (focusSection === 'GRID') {
        const gridItems = activeCategory === 'store' ? STORE_APPS : currentGridItems;
        const totalItems = gridItems.length;
        const row = Math.floor(focusedIndex / COLS);
        const col = focusedIndex % COLS;

        switch (e.key) {
          case 'ArrowLeft':
            playSound('hover');
            if (col === 0) setFocusSection('SIDEBAR');
            else setFocusedIndex(focusedIndex - 1);
            break;
          case 'ArrowRight':
            playSound('hover');
            if (focusedIndex < totalItems - 1) setFocusedIndex(focusedIndex + 1);
            break;
          case 'ArrowUp':
             playSound('hover');
             if (row > 0) setFocusedIndex(focusedIndex - COLS);
             break;
          case 'ArrowDown':
             playSound('hover');
             if (focusedIndex + COLS < totalItems) setFocusedIndex(focusedIndex + COLS);
             break;
           case 'Enter':
             if (activeCategory === 'store') {
                 const app = STORE_APPS[focusedIndex];
                 if(app) {
                     const isInstalled = items.some(a => a.id === app.id);
                     if(isInstalled) handleLaunch(app);
                     else handleInstallApp(app);
                 }
             } else if (focusedItem) {
                 handleLaunch(focusedItem);
             }
             break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusSection, focusedIndex, activeCategory, currentGridItems, launchingItem, isBooting, isSettingsOpen, contextMenu, focusedItem, isWeatherOpen, isKeyboardOpen, isMoodSelectorOpen, isNeuralCoreOpen, isSpeedFluxOpen, isInputHubOpen, isOmniSearchOpen, hyperLaunch, isZenithDeckOpen, items, cineVerse, isFileManagerOpen, isTerminalOpen, isProfileCreatorOpen]);

  // --- MOVED UP: Hook was previously after return, causing error #310 ---
  useEffect(() => {
    if (focusedItem?.imageUrl && !isSettingsOpen && !isScreensaverActive && !isWeatherOpen && !isNeuralCoreOpen && activeCategory !== 'store' && activeCategory !== 'tools' && !focusedItem.videoUrl) {
      const timer = setTimeout(() => {
        setBgImage(focusedItem.imageUrl!);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [focusedIndex, focusedItem, isSettingsOpen, isScreensaverActive, isWeatherOpen, isNeuralCoreOpen, activeCategory]);
  // ---------------------------------------------------------------------

  // Handle Boot Sequence (Conditional Return is now safe as hooks are above)
  if (isBooting) {
      return <BootSequence onComplete={() => setIsBooting(false)} />;
  }

  // -- Render --
  // Added "animate-scaleDown" to simulate the UI settling in after the big bang entry
  return (
    <div 
        className={`w-full h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-[var(--accent)]/30 ${activeThemeConfig.font} cursor-default animate-scaleDown`} 
        onContextMenu={(e) => e.preventDefault()}
        style={activeThemeConfig.vars as React.CSSProperties}
    >
      <style>{`
          @keyframes scaleDown {
              0% { transform: scale(1.05); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
          }
          .animate-scaleDown {
              animation: scaleDown 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
      `}</style>

      {/* GLOBAL LIGHTING OVERLAY (Smart Home) */}
      <div 
        className={`fixed inset-0 z-[10] bg-black pointer-events-none transition-opacity duration-1000 ease-in-out ${areLightsOn ? 'opacity-0' : 'opacity-95'}`}
      />

      {/* --- ALL OVERLAYS --- */}
      <MoodSelector 
         currentMood={currentMood} 
         onSelect={handleMoodChange}
         isOpen={isMoodSelectorOpen}
         onClose={() => setIsMoodSelectorOpen(false)}
      />
      <NeuralCore isOpen={isNeuralCoreOpen} onClose={() => setIsNeuralCoreOpen(false)} />
      <SpeedFlux isOpen={isSpeedFluxOpen} onClose={() => setIsSpeedFluxOpen(false)} />
      <InputHub isOpen={isInputHubOpen} onClose={() => setIsInputHubOpen(false)} />
      <OmniSearch 
        isOpen={isOmniSearchOpen} 
        onClose={() => setIsOmniSearchOpen(false)} 
        items={[...items, ...SETTINGS_ITEMS, ...STORE_APPS, ...TOOL_ITEMS]}
        onLaunch={handleLaunch}
      />
      <ZenithDeck 
        isOpen={isZenithDeckOpen} 
        onClose={() => setIsZenithDeckOpen(false)} 
        onLaunchSettings={() => { setIsZenithDeckOpen(false); setIsSettingsOpen(true); }}
      />
      <GameBooster 
        isOpen={hyperLaunch.isOpen}
        appName={hyperLaunch.item?.title || ''}
        onComplete={onHyperLaunchComplete}
      />
      <CineVerse 
        isOpen={cineVerse.isOpen} 
        movie={cineVerse.movie} 
        onClose={() => setCineVerse({ isOpen: false, movie: null })} 
        onPlay={() => { setIsPipActive(true); showToast(`Reproduciendo en PiP`); }}
      />
      <FileManager isOpen={isFileManagerOpen} onClose={() => setIsFileManagerOpen(false)} />
      <TerminalModal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
      <ProfileCreator isOpen={isProfileCreatorOpen} onClose={() => setIsProfileCreatorOpen(false)} />
      
      {/* Zenith Dock - Persistent Access */}
      <ZenithDock 
        items={[...items, ...STORE_APPS]} 
        onLaunch={handleLaunch} 
      />

      <VirtualKeyboard 
          isVisible={isKeyboardOpen} 
          onCancel={() => { setIsKeyboardOpen(false); playSound('back'); }}
          onEnter={handleKeyboardSubmit}
          initialValue={aiPrompt}
          placeholder="Escribe para buscar..."
      />

      <Screensaver isActive={isScreensaverActive} onWake={() => setIsScreensaverActive(false)} />
      
      <SettingsOverlay 
        isOpen={isSettingsOpen} 
        onClose={() => { setIsSettingsOpen(false); playSound('back'); }} 
        activeItem={activeSettingsItem}
        currentSsid={currentWifi}
        onWifiConnect={(ssid) => {
            setCurrentWifi(ssid);
            showToast(`Conectado a ${ssid}`);
        }}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme} 
      />
      
      <WeatherModal isOpen={isWeatherOpen} onClose={() => { setIsWeatherOpen(false); playSound('back'); }} />
      <VolumeHUD />
      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
      
      {contextMenu && (
        <ContextMenu 
            position={contextMenu} 
            item={contextMenu.item} 
            onClose={() => setContextMenu(null)}
        />
      )}

      {/* Dynamic Cursor Spotlight */}
      <div 
        className="fixed pointer-events-none z-0 transition-opacity duration-1000 mix-blend-screen"
        style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${activeMoodConfig.glowColor}10, transparent 40%)`
        }}
      />

      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ParticleBackground mood={currentMood} />
        {currentTheme !== 'DAY' && (
             <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-[1500ms] ease-in-out transform scale-110 blur-[4px] opacity-40"
                style={{ backgroundImage: `url(${bgImage})` }} 
             />
        )}
        <div 
            className="absolute inset-0 transition-colors duration-[2000ms]"
            style={{ backgroundColor: currentTheme === 'DAY' ? 'transparent' : `${activeMoodConfig.glowColor}15` }} 
        />
        {currentTheme !== 'DAY' && (
            <>
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-main)] via-[var(--bg-main)]/90 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/50 to-transparent" />
            </>
        )}
      </div>

      <div className={`relative z-10 w-full h-full flex transition-all duration-700 ${isBooting || launchingItem || isSettingsOpen || isWeatherOpen || isKeyboardOpen || isMoodSelectorOpen || isNeuralCoreOpen || isSpeedFluxOpen || isInputHubOpen || isOmniSearchOpen || hyperLaunch.isOpen || isZenithDeckOpen || cineVerse.isOpen || isFileManagerOpen || isTerminalOpen || isProfileCreatorOpen ? 'scale-95 opacity-50 blur-sm' : 'scale-100 opacity-100'}`}>
        
        <div 
            onMouseEnter={() => {
                // Prevent focus stealing if an overlay is open
                if(!isSettingsOpen && !isWeatherOpen && !isKeyboardOpen && !isMoodSelectorOpen && !isNeuralCoreOpen && !isSpeedFluxOpen && !isInputHubOpen && !isOmniSearchOpen && !hyperLaunch.isOpen && !isZenithDeckOpen && !cineVerse.isOpen && !isFileManagerOpen && !isTerminalOpen && !isProfileCreatorOpen) {
                    setFocusSection('SIDEBAR');
                    playSound('hover');
                }
            }}
            className="h-full z-40"
        >
            <Sidebar 
            categories={CATEGORIES} 
            selectedCategoryId={activeCategory} 
            isFocused={focusSection === 'SIDEBAR'} 
            onSelectCategory={handleCategorySelect}
            />
        </div>

        <main 
            className="flex-1 flex flex-col h-full overflow-hidden relative pb-12"
            onMouseEnter={() => {
                if(!isSettingsOpen && !isWeatherOpen && !isKeyboardOpen && !isMoodSelectorOpen && !isNeuralCoreOpen && !isSpeedFluxOpen && !isInputHubOpen && !isOmniSearchOpen && !hyperLaunch.isOpen && !isZenithDeckOpen && !cineVerse.isOpen && !isFileManagerOpen && !isTerminalOpen && !isProfileCreatorOpen) {
                    setFocusSection('GRID');
                    playSound('hover');
                }
            }}
        >
          
          {/* Header Row */}
          <header className="flex justify-between items-start px-16 py-8 z-20">
            {/* Search Pill */}
            {(activeCategory === 'movies' || activeCategory === 'home') ? (
               <div className={`
                    group flex items-center gap-4 bg-[var(--bg-surface)] hover:bg-white/20 border border-[var(--border)]
                    backdrop-blur-xl px-5 py-3 rounded-2xl transition-all duration-300 w-full max-w-lg cursor-text
                    shadow-[0_4px_30px_rgba(0,0,0,0.2)]
                    ${focusSection === 'SIDEBAR' ? 'opacity-60' : 'opacity-100'}
               `} onClick={openSearchKeyboard}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleMic(); }}
                    className={`p-2 rounded-xl transition-all duration-300 ${isListening ? 'bg-red-500/20 text-red-500' : 'bg-transparent text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}`}
                  >
                    {isListening ? <Mic size={18} className="animate-pulse" /> : <Mic size={18} />}
                  </button>
                  <div className="flex-1 flex items-center gap-3">
                     {isListening ? (
                         <div className="flex items-center gap-3 w-full">
                             <VoiceVisualizer isListening={isListening} />
                             <span className="text-xs font-bold text-red-400 animate-pulse font-tech tracking-wider uppercase">Escuchando...</span>
                         </div>
                     ) : (
                         <>
                            {isLoadingAI ? <Loader2 size={16} className="animate-spin text-indigo-400"/> : <Sparkles size={16} className={`text-[var(--accent)]`} />}
                            <span className="text-sm text-[var(--text-muted)] font-medium tracking-wide">
                                {aiPrompt || "Busca en Zynex OS..."}
                            </span>
                         </>
                     )}
                  </div>
               </div>
            ) : <div />}

            <div className="flex items-start gap-8">
                {/* Mood Button */}
                <button 
                    onClick={() => { setIsMoodSelectorOpen(true); playSound('select'); }}
                    className={`
                        flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] hover:bg-white/10 rounded-full border border-[var(--border)] transition-colors group
                    `}
                >
                    <Aperture size={18} className={`text-[var(--accent)] animate-spin-slow`} style={{ animationDuration: '10s' }}/>
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--text-main)]">
                        {activeMoodConfig.label}
                    </span>
                </button>

                <Clock onClick={() => { setIsWeatherOpen(true); playSound('select'); }} />
                
                {/* Deck Button replaces Notifications */}
                <button 
                    onClick={() => { setIsZenithDeckOpen(true); playSound('select'); }}
                    className="relative p-2.5 bg-[var(--bg-surface)] hover:bg-white/10 rounded-full border border-[var(--border)] transition-colors group"
                >
                    <Layers size={20} className="text-[var(--text-muted)] group-hover:text-[var(--text-main)]" />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[var(--bg-main)] animate-pulse" />
                </button>

                {/* User Profile */}
                <div className="relative z-50">
                    <button 
                        onClick={() => { setIsProfileMenuOpen(!isProfileMenuOpen); playSound('select'); }}
                        className={`flex items-center gap-3 bg-[var(--bg-surface)] hover:bg-white/10 border border-[var(--border)] rounded-full p-1.5 pr-4 transition-all duration-300 ${isProfileMenuOpen ? 'bg-white/10' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${currentUser.avatar} flex items-center justify-center text-xs font-bold shadow-lg text-white`}>
                            {currentUser.name[0]}
                        </div>
                        <span className="text-sm font-medium text-[var(--text-main)]">{currentUser.name}</span>
                        <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileMenuOpen && (
                        <div className="absolute top-full right-0 mt-3 w-56 bg-[var(--bg-main)] backdrop-blur-2xl border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-fadeIn origin-top-right z-[100]">
                            <div className="p-2 space-y-1">
                                {PROFILES.map(profile => (
                                    <button
                                        key={profile.id}
                                        onClick={() => {
                                            setCurrentUser(profile);
                                            setIsProfileMenuOpen(false);
                                            showToast(`Bienvenido de nuevo, ${profile.name}`);
                                            playSound('success');
                                        }}
                                        className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${currentUser.id === profile.id ? 'bg-[var(--bg-surface)]' : 'hover:bg-[var(--bg-surface)]'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${profile.avatar} flex items-center justify-center text-[10px] font-bold text-white`}>
                                            {profile.name[0]}
                                        </div>
                                        <span className={`text-sm ${currentUser.id === profile.id ? 'text-[var(--text-main)] font-bold' : 'text-[var(--text-muted)]'}`}>
                                            {profile.name}
                                        </span>
                                    </button>
                                ))}
                                <div className="h-px bg-[var(--border)] my-2" />
                                <button 
                                    onClick={() => { setIsProfileCreatorOpen(true); setIsProfileMenuOpen(false); playSound('select'); }}
                                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-full border border-dashed border-[var(--text-muted)] flex items-center justify-center">
                                        <Plus size={12} />
                                    </div>
                                    <span className="text-xs font-medium">Añadir Perfil</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </header>

          {/* Hero Details */}
          <div className="px-16 flex-shrink-0 min-h-[300px] flex flex-col justify-end pb-10 transition-all duration-500 z-10">
             {focusedItem && activeCategory !== 'store' && activeCategory !== 'tools' ? (
               <div className="animate-slideUp space-y-6">
                  {/* Meta Tags */}
                  <div className="flex items-center gap-3 opacity-0 animate-[fadeIn_0.5s_ease-out_0.2s_forwards]">
                    {focusedItem.type === ItemType.MOVIE && <span className="bg-[var(--text-main)] text-[var(--bg-main)] text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider font-tech shadow-[0_0_15px_rgba(255,255,255,0.4)]">Top 10</span>}
                    
                    <span className="text-[var(--text-muted)] text-xs font-semibold tracking-widest uppercase font-tech flex items-center gap-2 backdrop-blur-md bg-[var(--bg-surface)] px-3 py-1 rounded-full border border-[var(--border)]">
                        {focusedItem.type}
                        <span className={`w-1 h-1 bg-[var(--accent)] rounded-full shadow-[0_0_5px_${activeMoodConfig.glowColor}]`}/>
                        {activeCategory === 'home' ? 'Destacado' : 'Explorar'}
                    </span>
                  </div>
                  
                  {/* Title & Desc */}
                  <div>
                      <h1 className="text-8xl font-black mb-3 drop-shadow-2xl text-[var(--text-main)] leading-none font-tech tracking-tight max-w-4xl py-2">
                        {focusedItem.title}
                      </h1>
                      <p className="max-w-3xl text-xl text-[var(--text-muted)] font-light leading-relaxed drop-shadow-lg line-clamp-2 text-shadow-sm">
                        {focusedItem.description || "Sumérgete en una experiencia de entretenimiento de próxima generación diseñada para ti."}
                      </p>
                  </div>

                  {/* Hero Actions */}
                  {focusedItem.type === ItemType.MOVIE && (
                      <div className="flex items-center gap-4 pt-2">
                          <button 
                            onClick={() => handleLaunch(focusedItem)}
                            className={`
                                flex items-center gap-3 bg-[var(--text-main)] text-[var(--bg-main)] px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg group 
                                hover:bg-[var(--accent)] hover:text-white
                            `}
                          >
                              <Play size={20} className="fill-current" />
                              <span className="font-tech tracking-wider text-sm">REPRODUCIR</span>
                          </button>
                          <button onClick={() => showToast('Detalles no disponibles en demo')} className="flex items-center gap-3 bg-[var(--bg-surface)] hover:bg-white/20 text-[var(--text-main)] border border-[var(--border)] px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all backdrop-blur-md">
                              <Info size={20} />
                              <span className="font-tech tracking-wider text-sm">DETALLES</span>
                          </button>
                      </div>
                  )}
               </div>
             ) : activeCategory === 'store' ? (
                 <div className="flex flex-col justify-end h-full animate-slideUp">
                    <h1 className="text-8xl font-black text-[var(--text-main)] mb-2 font-brand tracking-tighter">ZYNEX STORE</h1>
                    <p className="text-xl text-[var(--text-muted)]">Descarga las mejores aplicaciones para tu TV</p>
                 </div>
             ) : activeCategory === 'tools' ? (
                <div className="flex flex-col justify-end h-full animate-slideUp">
                   <h1 className="text-8xl font-black text-[var(--text-main)] mb-2 font-tech tracking-tighter">HERRAMIENTAS</h1>
                   <p className="text-xl text-[var(--text-muted)]">Utilidades del sistema y conectividad avanzada.</p>
                </div>
            ) : (
                 <div className="flex flex-col justify-end h-full">
                    <h1 className="text-8xl font-bold text-[var(--text-muted)]/10 tracking-tighter select-none font-brand">ZYNEX OS</h1>
                 </div>
             )}
          </div>

          {/* Grid Engine */}
          <div className="flex-1 relative overflow-visible z-10 perspective-1000">
             <div 
                className="transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1)" 
                style={{ transform: activeCategory === 'store' ? 'none' : `translateY(${getScrollOffset()}px)` }}
             >
                {activeCategory === 'store' ? (
                    <ZenithStore 
                        isFocused={focusSection === 'GRID'} 
                        focusedIndex={focusedIndex} 
                        onInstall={handleInstallApp}
                        installedApps={items}
                        onLaunch={handleLaunch}
                        onHover={(idx) => {
                            if (!isSettingsOpen && !isKeyboardOpen && !isMoodSelectorOpen && !isNeuralCoreOpen && !isSpeedFluxOpen && !isInputHubOpen && !isOmniSearchOpen && !hyperLaunch.isOpen && !isZenithDeckOpen && !cineVerse.isOpen && !isFileManagerOpen && !isTerminalOpen && !isProfileCreatorOpen) {
                                if(focusedIndex !== idx) playSound('hover');
                                setFocusSection('GRID');
                                setFocusedIndex(idx);
                            }
                        }}
                    />
                ) : currentGridItems.length === 0 ? (
                  <div className="mt-10 mx-16 border border-dashed border-[var(--border)] rounded-3xl p-16 flex flex-col items-center justify-center text-center bg-[var(--bg-surface)] backdrop-blur-sm">
                      <div className="bg-[var(--bg-surface)] p-6 rounded-full mb-6 ring-1 ring-[var(--border)]">
                        <Search className="text-[var(--text-muted)]" size={32} />
                      </div>
                      <h3 className="text-3xl font-bold text-[var(--text-main)] mb-2 font-tech">Sin Señal</h3>
                      <p className="text-[var(--text-muted)] max-w-xs mx-auto">No hay contenido en este sector.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-10 px-16 pb-40">
                    {currentGridItems.map((item, index) => (
                      <div key={item.id} id={`card-${item.id}`} onContextMenu={(e) => handleContextMenu(e, item)}>
                         {item.type === ItemType.WIDGET ? (
                             <div className="col-span-2">
                                <SystemOptimizer 
                                    isFocused={(focusSection === 'GRID' && focusedIndex === index)}
                                    onClick={() => { showToast('Optimizando...'); playSound('select'); }}
                                />
                             </div>
                         ) : item.type === ItemType.SMART_HOME ? (
                            <div className="col-span-2">
                                <SmartHomeWidget
                                    isFocused={(focusSection === 'GRID' && focusedIndex === index)}
                                    onToggleLights={setAreLightsOn}
                                />
                             </div>
                         ) : (
                            <GridItem 
                                item={item} 
                                index={index}
                                isFocused={(focusSection === 'GRID' && focusedIndex === index)}
                                onHover={(idx) => {
                                    if(!isSettingsOpen && !isSettingsOpen && !contextMenu && !isWeatherOpen && !isKeyboardOpen && !isMoodSelectorOpen && !isNeuralCoreOpen && !isSpeedFluxOpen && !isInputHubOpen && !isOmniSearchOpen && !hyperLaunch.isOpen && !isZenithDeckOpen && !cineVerse.isOpen && !isFileManagerOpen && !isTerminalOpen && !isProfileCreatorOpen) {
                                        if(focusedIndex !== idx) playSound('hover');
                                        setFocusSection('GRID');
                                        setFocusedIndex(idx);
                                    }
                                }}
                                onClick={handleLaunch}
                            />
                         )}
                      </div>
                    ))}
                  </div>
                )}
             </div>
             {/* Bottom Fade for Scroll */}
             <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/80 to-transparent pointer-events-none z-20" />
          </div>
          
          <MediaPlayer 
             pipMode={isPipActive} 
             onExpand={() => { setIsPipActive(false); showToast('Modo normal restaurado'); }}
             onClose={() => { setIsPipActive(false); showToast('Reproducción detenida'); }}
          />

          <SystemStatusBar onOpenNeuralCore={() => { setIsNeuralCoreOpen(true); playSound('select'); }} />
          
        </main>
      </div>
      
    </div>
  );
}
