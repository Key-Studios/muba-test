import React, { useState, useEffect, useRef } from "react";
import { FurnitureCatalog } from "./components/FurnitureCatalog";
import { CanvasEditor } from "./components/CanvasEditor";
import { BackgroundSelector } from "./components/BackgroundSelector";
import { Toolbar } from "./components/Toolbar";
import { ScenesPanel } from "./components/ScenesPanel";
import { BackgroundWelcome } from "./components/BackgroundWelcome";
import { exportCanvasAsImage } from "./utils/exportUtils";
import "./App.css";

function App() {
  const [categories, setCategories] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [activeSceneId, setActiveSceneId] = useState(null);
  const stageRef = useRef();
  const [loading, setLoading] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [catalogHidden, setCatalogHidden] = useState(true);
  const [panels, setPanels] = useState({
    catalog: false, // Se ajustará según el tamaño de pantalla
    backgrounds: false,
    scenes: false,
  });
  const [showWelcome, setShowWelcome] = useState(false);
  const [predefinedBackgrounds, setPredefinedBackgrounds] = useState([]);
  // Auto-save debounce
  const saveTimerRef = useRef(null);

  // Ajustar paneles según el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      if (isDesktop) {
        // En desktop, abrir catálogo por defecto
        setPanels(prev => ({
          ...prev,
          catalog: prev.catalog === false ? true : prev.catalog,
        }));
      } else {
        // En móviles, cerrar todos los paneles
        setPanels({
          catalog: false,
          backgrounds: false,
          scenes: false,
        });
      }
    };

    // Ejecutar al montar
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load furniture catalog
  useEffect(() => {
    const loadCatalog = async () => {
      const path = "/furniture.json";
      const base = import.meta.env.VITE_PUBLIC_URL || "";
      try {
        let res = await fetch(base + path);
        if (!res.ok) {
          // fallback to relative path
          res = await fetch(path);
        }
        const data = await res.json();
        setCategories(data.categories);
      } catch (error) {
        console.error("Error loading furniture catalog:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, []);

  // Load backgrounds
  useEffect(() => {
    const loadBackgrounds = async () => {
      const path = "/backgrounds.json";
      const base = import.meta.env.VITE_PUBLIC_URL || "";
      try {
        let res = await fetch(base + path);
        if (!res.ok) {
          res = await fetch(path);
        }
        const data = await res.json();
        setPredefinedBackgrounds(data.backgrounds || []);
      } catch (error) {
        console.error("Error loading backgrounds:", error);
      }
    };
    loadBackgrounds();
  }, []);

  // Check if welcome should be shown (first time visit)
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("muba_has_seen_welcome");
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  // Load scenes from localStorage or initialize default
  useEffect(() => {
    const raw = localStorage.getItem("muba_scenes_v1");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setScenes(parsed);
          setActiveSceneId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error("Error parsing scenes", e);
      }
    }
    // Default scene
    const defaultScene = {
      id: `scene-${Date.now()}`,
      name: "Escena 1",
      furniture: [],
      background: null,
      scale: 1,
      showGrid: false,
      snapEnabled: false,
    };
    setScenes([defaultScene]);
    setActiveSceneId(defaultScene.id);
  }, []);

  // Auto-save scenes when they change
  useEffect(() => {
    if (!scenes.length) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem("muba_scenes_v1", JSON.stringify(scenes));
    }, 400);
  }, [scenes]);

  const activeScene = scenes.find((s) => s.id === activeSceneId) || null;

  const updateActiveScene = (partial) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === activeSceneId ? { ...s, ...partial } : s))
    );
  };

  const createScene = () => {
    const index = scenes.length + 1;
    const newScene = {
      id: `scene-${Date.now()}-${Math.random()}`,
      name: `Escena ${index}`,
      furniture: [],
      background: null,
      scale: activeScene ? activeScene.scale : 1,
      showGrid: activeScene ? activeScene.showGrid : false,
      snapEnabled: activeScene ? activeScene.snapEnabled : false,
    };
    setScenes((prev) => [...prev, newScene]);
    setActiveSceneId(newScene.id);
  };

  const selectScene = (id) => {
    setActiveSceneId(id);
  };

  const renameScene = (id, name) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const deleteScene = (id) => {
    if (scenes.length <= 1) return;
    setScenes((prev) => prev.filter((s) => s.id !== id));
    if (activeSceneId === id) {
      setActiveSceneId((prev) => {
        const remaining = scenes.filter((s) => s.id !== id);
        return remaining[0]?.id || null;
      });
    }
  };

  // Handle drop on canvas
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      // Precise position relative to stage container & current scale
      let x = 50;
      let y = 50;
      if (stageRef.current && activeScene) {
        const rect = stageRef.current.container().getBoundingClientRect();
        x = (e.clientX - rect.left) / activeScene.scale;
        y = (e.clientY - rect.top) / activeScene.scale;
      }

      // Adjust size according to current zoom so visual size at creation matches intended viewport scale
      const adjustedWidth = Math.round(data.width * (activeScene?.scale || 1));
      const adjustedHeight = Math.round(
        data.height * (activeScene?.scale || 1)
      );
      const newFurniture = {
        id: `furniture-${Date.now()}-${Math.random()}`,
        name: data.name,
        image: data.image,
        width: adjustedWidth,
        height: adjustedHeight,
        x,
        y,
        rotation: 0,
        baseWidth: data.width,
        baseHeight: data.height,
      };
      if (activeScene) {
        updateActiveScene({
          furniture: [...activeScene.furniture, newFurniture],
        });
      }
    } catch (error) {
      console.error("Error parsing drag data:", error);
    }
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleExport = () => {
    if (!activeScene || activeScene.furniture.length === 0) {
      alert("Por favor añade muebles al canvas antes de exportar.");
      return;
    }
    exportCanvasAsImage(stageRef);
  };

  const zoomIn = () =>
    activeScene &&
    updateActiveScene({ scale: Math.min(3, activeScene.scale + 0.1) });
  const zoomOut = () =>
    activeScene &&
    updateActiveScene({ scale: Math.max(0.3, activeScene.scale - 0.1) });
  const zoomReset = () => activeScene && updateActiveScene({ scale: 1 });
  const toggleGrid = () =>
    activeScene && updateActiveScene({ showGrid: !activeScene.showGrid });
  const togglePan = () => setIsPanning((p) => !p);
  const toggleSnap = () =>
    activeScene && updateActiveScene({ snapEnabled: !activeScene.snapEnabled });

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    localStorage.setItem("muba_has_seen_welcome", "true");
  };

  const handleWelcomeUpload = (newBg) => {
    // Guardar el fondo subido en localStorage
    const savedBgs = localStorage.getItem("uploadedBackgrounds");
    const uploadedBgs = savedBgs ? JSON.parse(savedBgs) : [];
    uploadedBgs.push(newBg);
    localStorage.setItem("uploadedBackgrounds", JSON.stringify(uploadedBgs));
  };

  const handleWelcomeSelectBackground = (bg) => {
    if (activeScene) {
      updateActiveScene({ background: bg });
    }
  };

  // Remove old single layout save/load; scenes auto-saved

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
        <div className='text-center'>
          <div className='relative'>
            <div className='animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 mx-auto mb-4'></div>
            <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mx-auto absolute top-0 left-1/2 -translate-x-1/2'></div>
          </div>
          <p className='text-indigo-600 font-medium'>Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  const togglePanel = (key) => setPanels((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className='h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col'>
      {/* Welcome Modal - Solo primera vez */}
      {showWelcome && (
        <BackgroundWelcome
          backgrounds={predefinedBackgrounds}
          onSelectBackground={handleWelcomeSelectBackground}
          onUploadBackground={handleWelcomeUpload}
          onClose={handleWelcomeClose}
        />
      )}
      {/* Toolbar fijo en la parte superior */}
      <div className='flex-shrink-0 border-b border-border bg-white/80 backdrop-blur-xl shadow-sm z-30'>
        <Toolbar
          onExport={handleExport}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onZoomReset={zoomReset}
          scale={activeScene ? activeScene.scale : 1}
          showGrid={activeScene ? activeScene.showGrid : false}
          onToggleGrid={toggleGrid}
          isPanning={isPanning}
          onTogglePan={togglePan}
          snapEnabled={activeScene ? activeScene.snapEnabled : false}
          onToggleSnap={toggleSnap}
          scenes={scenes}
          activeSceneId={activeSceneId}
          onCreateScene={createScene}
          onSelectScene={selectScene}
          onRenameScene={renameScene}
          onDeleteScene={deleteScene}
          panels={panels}
          onTogglePanel={togglePanel}
        />
      </div>

      {/* Contenedor principal: paneles laterales + canvas */}
      <div className='flex-1 flex overflow-hidden relative'>
        {/* Overlay para móviles cuando un panel está abierto */}
        {(panels.backgrounds || panels.catalog) && (
          <div 
            className='fixed inset-0 bg-black/50 z-40 md:hidden'
            onClick={() => {
              if (panels.backgrounds) togglePanel("backgrounds");
              if (panels.catalog) togglePanel("catalog");
            }}
          />
        )}

        {/* Panel izquierdo: Fondos */}
        {panels.backgrounds && (
          <div className={`flex-shrink-0 border-r border-border bg-white/95 backdrop-blur-xl shadow-xl z-50 overflow-y-auto transition-transform duration-300
            ${panels.backgrounds ? 'translate-x-0' : '-translate-x-full'}
            w-80 max-w-[85vw] md:w-80 md:max-w-none
            fixed md:relative h-full md:h-auto
            ${panels.backgrounds ? 'left-0' : '-left-full'}`}>
            <div className='p-4'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-bold text-text'>Fondos</h3>
                <button
                  onClick={() => togglePanel("backgrounds")}
                  className='w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 border border-border flex items-center justify-center transition-all'
                  title='Ocultar fondos'
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <BackgroundSelector
                onSelectBackground={(bg) => {
                  activeScene && updateActiveScene({ background: bg });
                  // Cerrar panel en móviles después de seleccionar
                  if (window.innerWidth < 768) {
                    togglePanel("backgrounds");
                  }
                }}
                currentBackground={activeScene ? activeScene.background : null}
                isEmbedded={true}
              />
            </div>
          </div>
        )}

        {/* Botón para mostrar panel de fondos si está oculto - solo en desktop */}
        {!panels.backgrounds && (
          <button
            onClick={() => togglePanel("backgrounds")}
            className='hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-20 bg-white/90 backdrop-blur-sm border-r border-t border-b border-border rounded-r-xl shadow-lg hover:bg-white transition-all items-center justify-center'
            title='Mostrar fondos'
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        )}

        {/* Canvas area - ocupa todo el espacio disponible */}
        <div
          className='flex-1 relative overflow-hidden'
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
        >
          {activeScene && (
            <CanvasEditor
              furniture={activeScene.furniture}
              onUpdateFurniture={(arr) => updateActiveScene({ furniture: arr })}
              stageRef={stageRef}
              background={activeScene.background}
              scale={activeScene.scale}
              showGrid={activeScene.showGrid}
              isPanning={isPanning}
              snapEnabled={activeScene.snapEnabled}
            />
          )}
        </div>

        {/* Panel derecho: Catálogo */}
        {panels.catalog && (
          <div className={`flex-shrink-0 border-l border-border bg-white/95 backdrop-blur-xl shadow-xl z-50 overflow-y-auto transition-transform duration-300
            ${panels.catalog ? 'translate-x-0' : 'translate-x-full'}
            w-80 max-w-[85vw] md:w-80 md:max-w-none
            fixed md:relative h-full md:h-auto
            ${panels.catalog ? 'right-0' : '-right-full'}`}>
            <FurnitureCatalog
              categories={categories}
              onAddFurniture={() => {}}
              existingFurniture={activeScene ? activeScene.furniture.length : 0}
              hidden={false}
              onToggle={() => togglePanel("catalog")}
              isEmbedded={true}
            />
          </div>
        )}

        {/* Botón para mostrar catálogo si está oculto - solo en desktop */}
        {!panels.catalog && (
          <button
            onClick={() => togglePanel("catalog")}
            className='hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-20 bg-white/90 backdrop-blur-sm border-l border-t border-b border-border rounded-l-xl shadow-lg hover:bg-white transition-all items-center justify-center'
            title='Mostrar catálogo'
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        )}
      </div>

      {/* Panel inferior: Escenas */}
      {panels.scenes && (
        <div className={`flex-shrink-0 border-t border-border bg-white/95 backdrop-blur-xl shadow-xl z-50 overflow-y-auto transition-transform duration-300
          ${panels.scenes ? 'translate-y-0' : 'translate-y-full'}
          max-h-[70vh] md:max-h-64
          fixed md:relative bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-auto`}>
          <ScenesPanel
            scenes={scenes}
            activeSceneId={activeSceneId}
            onCreate={createScene}
            onSelect={(id) => {
              selectScene(id);
              // Cerrar panel en móviles después de seleccionar
              if (window.innerWidth < 768) {
                togglePanel("scenes");
              }
            }}
            onRename={renameScene}
            onDelete={deleteScene}
            onClose={() => togglePanel("scenes")}
            isEmbedded={true}
          />
        </div>
      )}

      {/* Botón para mostrar escenas si está oculto */}
      {!panels.scenes && (
        <button
          onClick={() => togglePanel("scenes")}
          className='fixed md:absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-20 h-10 bg-white/90 backdrop-blur-sm border-t border-l border-r border-border rounded-t-xl shadow-lg hover:bg-white transition-all flex items-center justify-center'
          title='Mostrar escenas'
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </button>
      )}

      {/* Botones flotantes para móviles */}
      <div className='md:hidden fixed bottom-4 right-4 z-30 flex flex-col gap-2'>
        <button
          onClick={() => togglePanel("catalog")}
          className='w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center'
          title='Catálogo'
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button
          onClick={() => togglePanel("backgrounds")}
          className='w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center'
          title='Fondos'
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default App;
