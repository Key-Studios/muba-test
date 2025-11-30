import React, { useState } from 'react';

export const ScenesPanel = ({ scenes, activeSceneId, onCreate, onSelect, onRename, onDelete, onClose, isEmbedded = false }) => {
  const [renamingId, setRenamingId] = useState(null);
  const [nameValue, setNameValue] = useState('');

  const startRename = (scene) => {
    setRenamingId(scene.id);
    setNameValue(scene.name);
  };
  const commitRename = () => {
    if (renamingId && nameValue.trim()) {
      onRename(renamingId, nameValue.trim());
    }
    setRenamingId(null);
    setNameValue('');
  };
  const cancelRename = () => {
    setRenamingId(null);
    setNameValue('');
  };

  const CloseIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const DeleteIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );

  return (
    <div className={`${isEmbedded ? 'w-full' : 'rounded-2xl shadow-2xl glass border border-border w-80 max-h-[85vh]'} flex flex-col overflow-hidden ${!isEmbedded ? 'backdrop-blur-xl' : ''}`}>
      <div className={`flex items-center justify-between px-6 py-3 border-b border-border bg-gradient-to-r from-cyan-50 to-blue-50 ${isEmbedded ? 'flex-shrink-0' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-text">Escenas</h2>
        </div>
        <button 
          onClick={onClose} 
          className="w-8 h-8 rounded-lg bg-white border border-border hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all flex items-center justify-center shadow-sm"
        >
          <CloseIcon />
        </button>
      </div>
      <div className={`p-4 space-y-3 overflow-y-auto bg-gradient-to-b from-white to-cyan-50/30 ${isEmbedded ? 'flex-1' : ''}`}>
        {scenes.map(scene => (
          <div 
            key={scene.id} 
            className={`rounded-xl border-2 transition-all ${
              scene.id === activeSceneId 
                ? 'border-cyan-500 bg-cyan-50 shadow-lg ring-2 ring-cyan-200' 
                : 'border-border bg-white hover:border-cyan-300 hover:shadow-md'
            } p-4 flex flex-col gap-3`}
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => onSelect(scene.id)}
                className={`text-sm font-semibold truncate text-left flex-1 transition-colors ${
                  scene.id === activeSceneId 
                    ? 'text-cyan-700' 
                    : 'text-text hover:text-cyan-600'
                }`}
                title={scene.name}
              >
                {scene.name}
              </button>
              {scenes.length > 1 && (
                <button
                  onClick={() => onDelete(scene.id)}
                  className="w-7 h-7 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-sm ml-2"
                  title="Eliminar"
                >
                  <DeleteIcon />
                </button>
              )}
            </div>
            {renamingId === scene.id ? (
              <div className="flex items-center gap-2">
                <input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') cancelRename();
                  }}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                  className="px-3 py-2 rounded-lg border border-border bg-white hover:bg-gray-50 transition-all shadow-sm"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button 
                onClick={() => startRename(scene)} 
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-white hover:bg-cyan-50 hover:border-cyan-300 transition-all flex items-center justify-center gap-2 font-medium text-gray-700 hover:text-cyan-700"
              >
                <EditIcon />
                <span>Renombrar</span>
              </button>
            )}
          </div>
        ))}
        {scenes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-medium">No hay escenas</p>
            <p className="text-xs text-gray-400 mt-1">Crea una nueva escena para comenzar</p>
          </div>
        )}
      </div>
      <div className={`p-4 border-t border-border flex items-center justify-between bg-gradient-to-r from-cyan-50 to-blue-50 ${isEmbedded ? 'flex-shrink-0' : ''}`}>
        <span className="text-sm font-semibold text-gray-700">
          Total: <span className="text-cyan-600">{scenes.length}</span>
        </span>
        <button 
          onClick={onCreate} 
          className="text-sm px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-none transition-all shadow-md hover:shadow-lg font-medium"
        >
          + Nueva Escena
        </button>
      </div>
    </div>
  );
};
