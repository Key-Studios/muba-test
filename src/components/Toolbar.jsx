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
  onDeleteScene,
  panels,
  onTogglePanel,
  onSelectBackground,
  currentBackground
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

  // Icons
  const ZoomInIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
    </svg>
  );

  const ZoomOutIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
    </svg>
  );

  const GridIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );

  const SnapIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );

  const PanIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );

  const ExportIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );

  const ResetIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );

  const ScenesIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  );

  const BackgroundIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  return (
    <div className="flex items-center gap-4 px-6 py-3 text-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-md transition-all flex items-center gap-2"
        >
          <ExportIcon />
          <span>Exportar</span>
        </button>
      </div>
      
      <div className="h-8 w-px bg-border"></div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onZoomOut} 
          className="px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-alt transition-all shadow-sm"
          title="Alejar"
        >
          <ZoomOutIcon />
        </button>
        <span className="min-w-[70px] text-center text-text font-semibold bg-surface-alt px-3 py-2 rounded-lg border border-border">
          {Math.round(scale * 100)}%
        </span>
        <button 
          onClick={onZoomIn} 
          className="px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-alt transition-all shadow-sm"
          title="Acercar"
        >
          <ZoomInIcon />
        </button>
        <button 
          onClick={onZoomReset} 
          className="px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-alt transition-all shadow-sm flex items-center gap-1"
          title="Resetear zoom"
        >
          <ResetIcon />
        </button>
      </div>
      
      <div className="h-8 w-px bg-border"></div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleGrid}
          className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
            showGrid 
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300 shadow-inner' 
              : 'bg-surface hover:bg-surface-alt border-border text-text'
          }`}
          title="Mostrar/Ocultar cuadrícula"
        >
          <GridIcon />
          <span>Grid</span>
        </button>
        <button
          onClick={onToggleSnap}
          className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
            snapEnabled 
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300 shadow-inner' 
              : 'bg-surface hover:bg-surface-alt border-border text-text'
          }`}
          title="Activar/Desactivar alineación"
        >
          <SnapIcon />
          <span>Snap</span>
        </button>
        <button
          onClick={onTogglePan}
          className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
            isPanning 
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300 shadow-inner' 
              : 'bg-surface hover:bg-surface-alt border-border text-text'
          }`}
          title="Activar/Desactivar arrastre"
        >
          <PanIcon />
          <span>Pan</span>
        </button>
      </div>
      <div className="h-8 w-px bg-border"></div>
      
      {/* Botones para paneles desplegables */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onTogglePanel("scenes")}
          className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
            panels?.scenes
              ? 'bg-cyan-100 text-cyan-700 border-cyan-300 shadow-inner'
              : 'bg-surface hover:bg-surface-alt border-border text-text'
          }`}
          title="Mostrar/Ocultar panel de escenas"
        >
          <ScenesIcon />
          <span>Escenas</span>
        </button>
        <button
          onClick={() => onTogglePanel("backgrounds")}
          className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
            panels?.backgrounds
              ? 'bg-pink-100 text-pink-700 border-pink-300 shadow-inner'
              : 'bg-surface hover:bg-surface-alt border-border text-text'
          }`}
          title="Mostrar/Ocultar panel de fondos"
        >
          <BackgroundIcon />
          <span>Fondos</span>
        </button>
      </div>

      <div className="h-8 w-px bg-border"></div>
      
      {/* Scene Management */}
      <div className="flex items-center gap-2">
        <select
          value={activeSceneId || ''}
          onChange={(e) => onSelectScene(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-surface hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-all shadow-sm"
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') cancelRename();
              }}
              className="px-3 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32 text-sm"
              autoFocus
            />
            <button 
              onClick={commitRename} 
              className="px-3 py-2 rounded-lg border border-success bg-success text-white hover:bg-success/90 transition-all shadow-sm"
            >
              ✓
            </button>
            <button 
              onClick={cancelRename} 
              className="px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-alt transition-all shadow-sm"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={startRename} 
              className="px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-alt transition-all shadow-sm text-sm font-medium"
            >
              Renombrar
            </button>
            <button 
              onClick={onCreateScene} 
              className="px-3 py-2 rounded-lg border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all shadow-sm text-sm font-medium"
            >
              + Nueva
            </button>
            {scenes.length > 1 && (
              <button 
                onClick={() => onDeleteScene(activeSceneId)} 
                className="px-3 py-2 rounded-lg border border-danger bg-danger text-white hover:bg-danger/90 transition-all shadow-sm text-sm font-medium"
              >
                Eliminar
              </button>
            )}
          </>
        )}
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-text-subtle text-sm font-medium bg-surface-alt px-3 py-2 rounded-lg border border-border">
          {scenes.length} {scenes.length === 1 ? 'escena' : 'escenas'}
        </span>
      </div>
    </div>
  );
};
