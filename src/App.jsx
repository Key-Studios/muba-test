import React, { useState, useEffect, useRef } from 'react';
import { FurnitureCatalog } from './components/FurnitureCatalog';
import { CanvasEditor } from './components/CanvasEditor';
import { BackgroundSelector } from './components/BackgroundSelector';
import { Toolbar } from './components/Toolbar';
import { ScenesPanel } from './components/ScenesPanel';
import { exportCanvasAsImage } from './utils/exportUtils';
import './App.css';

function App() {
  const [categories, setCategories] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [activeSceneId, setActiveSceneId] = useState(null);
  const stageRef = useRef();
  const [loading, setLoading] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [catalogHidden, setCatalogHidden] = useState(true);
  const [panels, setPanels] = useState({ toolbar: false, catalog: false, backgrounds: false, scenes: false });
  // Auto-save debounce
  const saveTimerRef = useRef(null);

  // Load furniture catalog
  useEffect(() => {
    fetch('/furniture.json')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading furniture catalog:', error);
        setLoading(false);
      });
  }, []);

  // Load scenes from localStorage or initialize default
  useEffect(() => {
    const raw = localStorage.getItem('muba_scenes_v1');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setScenes(parsed);
          setActiveSceneId(parsed[0].id);
          return;
        }
      } catch (e) { console.error('Error parsing scenes', e); }
    }
    // Default scene
    const defaultScene = {
      id: `scene-${Date.now()}`,
      name: 'Escena 1',
      furniture: [],
      background: null,
      scale: 1,
      showGrid: false,
      snapEnabled: false
    };
    setScenes([defaultScene]);
    setActiveSceneId(defaultScene.id);
  }, []);

  // Auto-save scenes when they change
  useEffect(() => {
    if (!scenes.length) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem('muba_scenes_v1', JSON.stringify(scenes));
    }, 400);
  }, [scenes]);

  const activeScene = scenes.find(s => s.id === activeSceneId) || null;

  const updateActiveScene = (partial) => {
    setScenes(prev => prev.map(s => s.id === activeSceneId ? { ...s, ...partial } : s));
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
      snapEnabled: activeScene ? activeScene.snapEnabled : false
    };
    setScenes(prev => [...prev, newScene]);
    setActiveSceneId(newScene.id);
  };

  const selectScene = (id) => {
    setActiveSceneId(id);
  };

  const renameScene = (id, name) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  };

  const deleteScene = (id) => {
    if (scenes.length <= 1) return;
    setScenes(prev => prev.filter(s => s.id !== id));
    if (activeSceneId === id) {
      setActiveSceneId(prev => {
        const remaining = scenes.filter(s => s.id !== id);
        return remaining[0]?.id || null;
      });
    }
  };

  // Handle drop on canvas
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
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
      const adjustedHeight = Math.round(data.height * (activeScene?.scale || 1));
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
        baseHeight: data.height
      };
      if (activeScene) {
        updateActiveScene({ furniture: [...activeScene.furniture, newFurniture] });
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleExport = () => {
    if (!activeScene || activeScene.furniture.length === 0) {
      alert('Por favor añade muebles al canvas antes de exportar.');
      return;
    }
    exportCanvasAsImage(stageRef);
  };

  const zoomIn = () => activeScene && updateActiveScene({ scale: Math.min(3, activeScene.scale + 0.1) });
  const zoomOut = () => activeScene && updateActiveScene({ scale: Math.max(0.3, activeScene.scale - 0.1) });
  const zoomReset = () => activeScene && updateActiveScene({ scale: 1 });
  const toggleGrid = () => activeScene && updateActiveScene({ showGrid: !activeScene.showGrid });
  const togglePan = () => setIsPanning((p) => !p);
  const toggleSnap = () => activeScene && updateActiveScene({ snapEnabled: !activeScene.snapEnabled });

  // Remove old single layout save/load; scenes auto-saved

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  const togglePanel = (key) => setPanels(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-surface">
      {/* Floating trigger buttons (desktop) */}
      <div className="hidden sm:flex fixed top-3 left-1/2 -translate-x-1/2 z-50 flex-col items-center gap-2">
        <button onClick={() => togglePanel('toolbar')} className="btn-base btn-primary">Toolbar</button>
      </div>
      <div className="hidden sm:flex fixed top-1/2 right-3 -translate-y-1/2 z-50 flex-col gap-2">
        <button onClick={() => togglePanel('catalog')} className="btn-base btn-secondary">Catálogo</button>
      </div>
      <div className="hidden sm:flex fixed top-1/2 left-3 -translate-y-1/2 z-50 flex-col gap-2">
        <button onClick={() => togglePanel('backgrounds')} className="btn-base btn-tertiary">Fondos</button>
      </div>
      <div className="hidden sm:flex fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex-col gap-2">
        <button onClick={() => togglePanel('scenes')} className="btn-base btn-scenes">Escenas</button>
        <button onClick={handleExport} className="btn-base btn-export">Exportar</button>
      </div>

      {/* Mobile clustered buttons */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50 w-40 h-40 pointer-events-none">
        <div className="relative w-full h-full">
          <button onClick={() => togglePanel('toolbar')} className="absolute top-0 left-0 btn-base btn-primary btn-mobile pointer-events-auto">Toolbar</button>
          <button onClick={() => togglePanel('catalog')} className="absolute top-12 left-0 btn-base btn-secondary btn-mobile pointer-events-auto">Catálogo</button>
          <button onClick={() => togglePanel('backgrounds')} className="absolute top-12 left-20 btn-base btn-tertiary btn-mobile pointer-events-auto">Fondos</button>
          <button onClick={() => togglePanel('scenes')} className="absolute top-24 left-0 btn-base btn-scenes btn-mobile pointer-events-auto">Escenas</button>
          <button onClick={handleExport} className="absolute top-24 left-20 btn-base btn-export btn-mobile pointer-events-auto">Exportar</button>
        </div>
      </div>

      {/* Floating panels */}
      {panels.catalog && (
        <div className="fixed bottom-40 right-4 z-40 sm:bottom-auto sm:top-1/2 sm:right-20 sm:-translate-y-1/2">
          <FurnitureCatalog
            categories={categories}
            onAddFurniture={() => {}}
            existingFurniture={activeScene ? activeScene.furniture.length : 0}
            hidden={false}
            onToggle={() => togglePanel('catalog')}
          />
        </div>
      )}
      {panels.toolbar && (
        <div className="fixed bottom-[calc(40px+12rem)] right-4 z-40 w-[85vw] max-w-[420px] sm:bottom-auto sm:top-14 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[900px] sm:max-w-[95vw]">
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
          />
        </div>
      )}
      {panels.backgrounds && (
        <div className="fixed bottom-24 right-4 z-40 w-[85vw] max-w-[420px] sm:bottom-auto sm:top-1/2 sm:left-20 sm:right-auto sm:-translate-y-1/2 sm:w-[420px] sm:max-w-[90vw]">
          <BackgroundSelector
            onSelectBackground={(bg) => activeScene && updateActiveScene({ background: bg })}
            currentBackground={activeScene ? activeScene.background : null}
          />
        </div>
      )}
      {panels.scenes && (
        <div className="fixed bottom-60 right-4 z-40 sm:bottom-20 sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
          <ScenesPanel
            scenes={scenes}
            activeSceneId={activeSceneId}
            onCreate={createScene}
            onSelect={selectScene}
            onRename={renameScene}
            onDelete={deleteScene}
            onClose={() => togglePanel('scenes')}
          />
        </div>
      )}

      {/* Canvas area (designer) */}
      <div
        className="absolute inset-0 pt-0 flex items-end justify-center"
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
      >
        <div className="w-full h-full">
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
    </div>
  );
}

export default App;
