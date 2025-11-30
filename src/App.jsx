import React, { useState, useEffect, useRef } from "react";
import { FurnitureCatalog } from "./components/FurnitureCatalog";
import { CanvasEditor } from "./components/CanvasEditor";
import { BackgroundSelector } from "./components/BackgroundSelector";
import { Toolbar } from "./components/Toolbar";
import { ScenesPanel } from "./components/ScenesPanel";
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
    catalog: true, // Catálogo siempre abierto a la izquierda
    backgrounds: false, // Fondos en toolbar, oculto por defecto
    scenes: false, // Escenas en toolbar, oculto por defecto
  });
  // Auto-save debounce
  const saveTimerRef = useRef(null);

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

  // Remove old single layout save/load; scenes auto-saved

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 mx-auto mb-4'></div>
          <p className='text-gray-600'>Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  const togglePanel = (key) => setPanels((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className='h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col'>
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
          onSelectBackground={(bg) =>
            activeScene && updateActiveScene({ background: bg })
          }
          currentBackground={activeScene ? activeScene.background : null}
        />
      </div>

      {/* Contenedor principal: catálogo izquierdo + canvas */}
      <div className='flex-1 flex overflow-hidden relative'>
        {/* Panel izquierdo: Catálogo de muebles (siempre visible) */}
        <div className='flex-shrink-0 w-80 border-r border-border bg-white/80 backdrop-blur-xl shadow-sm z-20 overflow-y-auto'>
          <FurnitureCatalog
            categories={categories}
            onAddFurniture={() => {}}
            existingFurniture={activeScene ? activeScene.furniture.length : 0}
            hidden={false}
            onToggle={() => togglePanel("catalog")}
            isEmbedded={true}
          />
        </div>

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
      </div>

      {/* Paneles desplegables desde el toolbar */}
      {panels.backgrounds && (
        <div className='absolute top-[73px] left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-border shadow-xl max-h-[60vh] overflow-y-auto'>
          <div className='p-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-text'>Fondos</h3>
              <button
                onClick={() => togglePanel("backgrounds")}
                className='w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 border border-border flex items-center justify-center transition-all'
                title='Ocultar fondos'
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
            <BackgroundSelector
              onSelectBackground={(bg) =>
                activeScene && updateActiveScene({ background: bg })
              }
              currentBackground={activeScene ? activeScene.background : null}
              isEmbedded={true}
            />
          </div>
        </div>
      )}

      {panels.scenes && (
        <div className='absolute top-[73px] left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-border shadow-xl max-h-[60vh] overflow-y-auto'>
          <ScenesPanel
            scenes={scenes}
            activeSceneId={activeSceneId}
            onCreate={createScene}
            onSelect={selectScene}
            onRename={renameScene}
            onDelete={deleteScene}
            onClose={() => togglePanel("scenes")}
            isEmbedded={true}
          />
        </div>
      )}
    </div>
  );
}

export default App;
