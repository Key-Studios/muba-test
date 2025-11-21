import React, { useState, useEffect, useRef } from 'react';

export const Toolbar = ({
  onExport,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  scale,
  showGrid,
  onToggleGrid,
  isPanning,
  onTogglePan,
  snapEnabled,
  onToggleSnap,
  scenes,
  activeSceneId,
  onCreateScene,
  onSelectScene,
  onRenameScene,
  onDeleteScene
}) => {
  const [renaming, setRenaming] = useState(false);
  const activeScene = scenes.find(s => s.id === activeSceneId);
  const [nameInput, setNameInput] = useState(activeScene?.name || '');

  const startRename = () => {
    setNameInput(activeScene?.name || '');
    setRenaming(true);
  };
  const commitRename = () => {
    if (activeScene && nameInput.trim()) {
      onRenameScene(activeScene.id, nameInput.trim());
    }
    setRenaming(false);
  };
  const cancelRename = () => {
    setRenaming(false);
  };
  const [visible, setVisible] = useState(true);
  const inactivityTimerRef = useRef(null);
  const barRef = useRef(null);

  // Show toolbar when mouse moves near top or focus enters toolbar
  useEffect(() => {
    const handleMove = (e) => {
      if (e.clientY < 100) {
        setVisible(true);
        resetTimer();
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const resetTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, 2500);
  };

  useEffect(() => {
    // Reset timer on interactions inside toolbar
    const el = barRef.current;
    if (!el) return;
    const handleInteract = () => {
      setVisible(true);
      resetTimer();
    };
    el.addEventListener('mouseenter', handleInteract);
    el.addEventListener('focusin', handleInteract);
    el.addEventListener('mousemove', handleInteract);
    return () => {
      el.removeEventListener('mouseenter', handleInteract);
      el.removeEventListener('focusin', handleInteract);
      el.removeEventListener('mousemove', handleInteract);
    };
  }, []);

  const barClasses = `flex items-center gap-3 px-6 py-3 border border-border rounded-xl bg-gray-100 text-sm shadow-md transition-transform duration-500 ease-out ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`;

  return (
    <div ref={barRef} className={barClasses}>
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-text font-medium shadow-sm transition-colors"
        >
          Exportar
        </button>
      </div>
      <div className="flex items-center gap-1 ml-4">
        <button onClick={onZoomOut} className="px-2 py-1 rounded-md border border-border bg-surface hover:bg-gray-200">-</button>
        <span className="min-w-[60px] text-center text-text-subtle">{Math.round(scale * 100)}%</span>
        <button onClick={onZoomIn} className="px-2 py-1 rounded-md border border-border bg-surface hover:bg-gray-200">+</button>
        <button onClick={onZoomReset} className="px-2 py-1 rounded-md border border-border bg-surface hover:bg-gray-200">Reset</button>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={onToggleGrid}
          className={`px-3 py-1.5 rounded-md border border-border ${showGrid ? 'bg-gray-300 text-text shadow-inner' : 'bg-surface hover:bg-gray-200 text-text'} transition`}
        >
          Grid
        </button>
        <button
          onClick={onToggleSnap}
          className={`px-3 py-1.5 rounded-md border border-border ${snapEnabled ? 'bg-gray-300 text-text shadow-inner' : 'bg-surface hover:bg-gray-200 text-text'} transition`}
        >
          Snap
        </button>
        <button
          onClick={onTogglePan}
          className={`px-3 py-1.5 rounded-md border border-border ${isPanning ? 'bg-gray-300 text-text shadow-inner' : 'bg-surface hover:bg-gray-200 text-text'} transition`}
        >
          Pan
        </button>
      </div>
      {/* Scene Management */}
      <div className="flex items-center gap-2 ml-6">
        <select
          value={activeSceneId || ''}
          onChange={(e) => onSelectScene(e.target.value)}
          className="px-2 py-1 border border-border rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
        >
          {scenes.map(sc => (
            <option key={sc.id} value={sc.id}>{sc.name}</option>
          ))}
        </select>
        {renaming ? (
          <div className="flex items-center gap-1">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="px-2 py-1 border border-border rounded bg-surface w-32"
              autoFocus
            />
            <button onClick={commitRename} className="px-2 py-1 rounded border border-border bg-surface hover:bg-accent-soft">OK</button>
            <button onClick={cancelRename} className="px-2 py-1 rounded border border-border bg-surface hover:bg-accent-soft">X</button>
          </div>
        ) : (
          <>
            <button onClick={startRename} className="px-2 py-1 rounded-md border border-border bg-surface hover:bg-gray-200">Renombrar</button>
            <button onClick={onCreateScene} className="px-2 py-1 rounded-md border border-border bg-surface hover:bg-gray-200">Nueva</button>
            {scenes.length > 1 && (
              <button onClick={() => onDeleteScene(activeSceneId)} className="px-2 py-1 rounded-md border border-danger bg-danger text-white hover:opacity-90">Eliminar</button>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-text-subtle">Escenas: {scenes.length}</span>
      </div>
    </div>
  );
};
