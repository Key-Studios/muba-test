import React, { useState } from 'react';

export const ScenesPanel = ({ scenes, activeSceneId, onCreate, onSelect, onRename, onDelete, onClose }) => {
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

  return (
    <div className="rounded-xl shadow-2xl bg-pastel-lilac border border-border w-72 max-h-[80vh] flex flex-col overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-pastel-peach">
        <h2 className="text-sm font-semibold text-text">Escenas</h2>
        <button onClick={onClose} className="text-xs px-2 py-1 rounded-md bg-surface border border-border hover:bg-pastel-peach/40">Cerrar</button>
      </div>
      <div className="p-4 space-y-3 overflow-y-auto bg-pastel-lilac">
        {scenes.map(scene => (
          <div key={scene.id} className={`rounded-lg border ${scene.id === activeSceneId ? 'border-pastel-lilac bg-pastel-lilac/20' : 'border-border bg-surface'} p-2 flex flex-col gap-2`}>
            <div className="flex items-center justify-between">
              <button
                onClick={() => onSelect(scene.id)}
                className={`text-xs font-medium truncate text-left flex-1 ${scene.id === activeSceneId ? 'text-text' : 'text-text-subtle hover:text-text'}`}
                title={scene.name}
              >
                {scene.name}
              </button>
              {scenes.length > 1 && (
                <button
                  onClick={() => onDelete(scene.id)}
                  className="text-[10px] px-1 py-0.5 rounded bg-danger text-white ml-2 hover:opacity-90"
                  title="Eliminar"
                >×</button>
              )}
            </div>
            {renamingId === scene.id ? (
              <div className="flex items-center gap-1">
                <input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs rounded border border-border bg-surface"
                  autoFocus
                />
                <button onClick={commitRename} className="text-[10px] px-2 py-1 rounded border border-border bg-pastel-green hover:bg-pastel-green">OK</button>
                <button onClick={cancelRename} className="text-[10px] px-2 py-1 rounded border border-border bg-pastel-rose hover:bg-pastel-rose">X</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => startRename(scene)} className="flex-1 text-[10px] px-2 py-1 rounded border border-border bg-surface hover:bg-pastel-lilac/40">Renombrar</button>
              </div>
            )}
          </div>
        ))}
        {scenes.length === 0 && (
          <p className="text-xs text-text-subtle">No hay escenas</p>
        )}
      </div>
      <div className="p-3 border-t border-border flex items-center justify-between bg-pastel-peach">
        <span className="text-[11px] text-text-subtle">Total: {scenes.length}</span>
        <button onClick={onCreate} className="text-xs px-3 py-1 rounded-md bg-pastel-lilac hover:bg-pastel-peach text-text border border-border">Nueva</button>
      </div>
    </div>
  );
};
