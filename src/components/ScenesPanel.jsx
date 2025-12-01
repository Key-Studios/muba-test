import React, { useState } from "react";
import { publicUrl } from "../utils/publicUrl";

export const ScenesPanel = ({
  scenes,
  activeSceneId,
  onCreate,
  onSelect,
  onRename,
  onDelete,
  onClose,
  isEmbedded = false,
}) => {
  const [renamingId, setRenamingId] = useState(null);
  const [nameValue, setNameValue] = useState("");

  const startRename = (scene) => {
    setRenamingId(scene.id);
    setNameValue(scene.name);
  };
  const commitRename = () => {
    if (renamingId && nameValue.trim()) {
      onRename(renamingId, nameValue.trim());
    }
    setRenamingId(null);
    setNameValue("");
  };
  const cancelRename = () => {
    setRenamingId(null);
    setNameValue("");
  };

  const CloseIcon = () => (
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
  );

  const DeleteIcon = () => (
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
        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
      />
    </svg>
  );

  const EditIcon = () => (
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
        d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
      />
    </svg>
  );

  return (
    <div
      className={`${
        isEmbedded
          ? "w-full"
          : "rounded-2xl shadow-2xl glass border border-border w-80 max-h-[85vh]"
      } flex flex-col overflow-hidden ${!isEmbedded ? "backdrop-blur-xl" : ""}`}
    >
      <div
        className={`flex items-center justify-between px-6 py-3 border-b border-border bg-gradient-to-r from-cyan-50 to-blue-50 ${
          isEmbedded ? "flex-shrink-0" : ""
        }`}
      >
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center'>
            <svg
              className='w-5 h-5 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3'
              />
            </svg>
          </div>
          <h2 className='text-lg font-bold text-text'>Escenas</h2>
        </div>
        {!isEmbedded && (
          <button
            onClick={onClose}
            className='w-8 h-8 rounded-lg bg-white border border-border hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all flex items-center justify-center shadow-sm'
          >
            <CloseIcon />
          </button>
        )}
        {isEmbedded && (
          <button
            onClick={onClose}
            className='w-8 h-8 rounded-lg bg-white border border-border hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all flex items-center justify-center shadow-sm'
          >
            <CloseIcon />
          </button>
        )}
      </div>
      <div
        className={`p-4 overflow-y-auto bg-gradient-to-b from-white to-cyan-50/30 ${
          isEmbedded ? "flex-1" : ""
        }`}
      >
        <div className='flex gap-3 items-start overflow-x-auto pb-3'>
          {scenes.map((scene) => (
            <div key={scene.id} className={`w-28 flex-shrink-0`}>
              <button
                onClick={() => onSelect(scene.id)}
                className={`w-28 h-28 rounded-md overflow-hidden border-2 transition-all flex items-center justify-center ${
                  scene.id === activeSceneId
                    ? "border-cyan-500 shadow-lg ring-2 ring-cyan-200"
                    : "border-border hover:border-cyan-300"
                }`}
                title={scene.name}
              >
                {scene.background && scene.background.image ? (
                  <img
                    src={publicUrl(scene.background.image)}
                    alt={scene.name}
                    className='w-full h-full object-cover'
                    draggable={false}
                  />
                ) : (
                  <div className='w-full h-full bg-gray-100 flex items-center justify-center text-gray-400'>
                    <svg
                      className='w-8 h-8'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3'
                      />
                    </svg>
                  </div>
                )}
              </button>
              <div className='mt-2 flex items-center justify-between gap-2'>
                <div className='flex-1'>
                  {renamingId === scene.id ? (
                    <input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename();
                        if (e.key === "Escape") cancelRename();
                      }}
                      className='w-full px-2 py-1 text-xs rounded border border-border bg-white focus:outline-none'
                      autoFocus
                    />
                  ) : (
                    <div
                      className={`text-xs truncate ${
                        scene.id === activeSceneId
                          ? "text-cyan-700 font-semibold"
                          : "text-text"
                      }`}
                      title={scene.name}
                    >
                      {scene.name}
                    </div>
                  )}
                </div>
                <div className='flex items-center gap-1'>
                  <button
                    onClick={() => startRename(scene)}
                    className='w-7 h-7 rounded-md bg-white border border-border flex items-center justify-center text-gray-600 hover:bg-cyan-50'
                  >
                    <EditIcon />
                  </button>
                  {scenes.length > 1 && (
                    <button
                      onClick={() => onDelete(scene.id)}
                      className='w-7 h-7 rounded-md bg-red-500 text-white flex items-center justify-center hover:bg-red-600'
                    >
                      <DeleteIcon />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {scenes.length === 0 && (
          <div className='text-center py-12'>
            <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center'>
              <svg
                className='w-8 h-8 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3'
                />
              </svg>
            </div>
            <p className='text-sm text-gray-500 font-medium'>No hay escenas</p>
            <p className='text-xs text-gray-400 mt-1'>
              Crea una nueva escena para comenzar
            </p>
          </div>
        )}
      </div>
      <div
        className={`p-4 border-t border-border flex items-center justify-between bg-gradient-to-r from-cyan-50 to-blue-50 ${
          isEmbedded ? "flex-shrink-0" : ""
        }`}
      >
        <span className='text-sm font-semibold text-gray-700'>
          Total: <span className='text-cyan-600'>{scenes.length}</span>
        </span>
        <button
          onClick={onCreate}
          className='text-sm px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-none transition-all shadow-md hover:shadow-lg font-medium'
        >
          + Nueva Escena
        </button>
      </div>
    </div>
  );
};

