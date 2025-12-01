import React, { useState, useEffect, useRef } from "react";
import { publicUrl } from "../utils/publicUrl";

export const BackgroundSelector = ({
  onSelectBackground,
  currentBackground,
  isEmbedded = false,
}) => {
  const [backgrounds, setBackgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadedBgs, setUploadedBgs] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadBackgrounds = async () => {
      const path = "/backgrounds.json";
      const base = import.meta.env.VITE_PUBLIC_URL || "";
      try {
        let res = await fetch(base + path);
        if (!res.ok) {
          // fallback to relative path
          res = await fetch(path);
        }
        const data = await res.json();
        setBackgrounds(data.backgrounds);
      } catch (error) {
        console.error("Error loading backgrounds:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBackgrounds();

    // Load uploaded backgrounds from localStorage
    const savedBgs = localStorage.getItem("uploadedBackgrounds");
    if (savedBgs) {
      setUploadedBgs(JSON.parse(savedBgs));
    }
  }, []);

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        alert("Por favor sube solo archivos de imagen");
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        const img = new Image();
        img.onload = () => {
          const newBg = {
            id: `uploaded-${Date.now()}-${Math.random()}`,
            name: file.name.replace(/\.[^/.]+$/, ""),
            image: dataUrl,
            width: img.width,
            height: img.height,
            isUploaded: true,
          };

          const updated = [...uploadedBgs, newBg];
          setUploadedBgs(updated);
          localStorage.setItem("uploadedBackgrounds", JSON.stringify(updated));
          onSelectBackground(newBg);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteUploaded = (id) => {
    const updated = uploadedBgs.filter((bg) => bg.id !== id);
    setUploadedBgs(updated);
    localStorage.setItem("uploadedBackgrounds", JSON.stringify(updated));
    if (currentBackground?.id === id) {
      onSelectBackground(null);
    }
  };

  // Auto-hide logic similar to toolbar
  const [visible, setVisible] = useState(true);
  const inactivityTimerRef = useRef(null);
  const containerRef = useRef(null);

  const resetTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, 2500);
  };

  useEffect(() => {
    const handleGlobalMove = (e) => {
      // If user moves near where selector is (top area), show it
      if (e.clientY < 140) {
        setVisible(true);
        resetTimer();
      }
    };
    window.addEventListener("mousemove", handleGlobalMove);
    return () => window.removeEventListener("mousemove", handleGlobalMove);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleInteract = () => {
      setVisible(true);
      resetTimer();
    };
    el.addEventListener("mouseenter", handleInteract);
    el.addEventListener("focusin", handleInteract);
    el.addEventListener("mousemove", handleInteract);
    return () => {
      el.removeEventListener("mouseenter", handleInteract);
      el.removeEventListener("focusin", handleInteract);
      el.removeEventListener("mousemove", handleInteract);
    };
  }, []);

  const UploadIcon = () => (
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
        d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
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

  const wrapperClasses = `glass border border-border rounded-2xl px-6 py-5 shadow-2xl transition-all duration-500 ease-out backdrop-blur-xl max-w-md ${
    visible
      ? "translate-y-0 opacity-100"
      : "-translate-y-full opacity-0 pointer-events-none"
  }`;

  return (
    <div ref={containerRef} className={wrapperClasses}>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center'>
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
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          </div>
          <h3 className='text-lg font-bold text-text'>Fondos</h3>
        </div>
        {!isEmbedded && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className='text-sm px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium'
            title='Sube tus propias imágenes'
          >
            <UploadIcon />
            <span>Subir</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type='file'
          multiple
          accept='image/*'
          onChange={handleFileUpload}
          className='hidden'
        />
      </div>
      {isEmbedded && (
        <div className='mb-4'>
          <button
            onClick={() => fileInputRef.current?.click()}
            className='w-full text-sm px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium'
            title='Sube tus propias imágenes'
          >
            <UploadIcon />
            <span>Subir fondo</span>
          </button>
        </div>
      )}

      <div
        className={`grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 ${
          isEmbedded ? "" : "max-h-[60vh]"
        } overflow-y-auto pr-2`}
      >
        {/* Sin fondo */}
        <button
          onClick={() => onSelectBackground(null)}
          className={`relative aspect-square rounded-xl border-2 transition-all overflow-hidden group ${
            currentBackground === null
              ? "border-indigo-500 shadow-lg ring-2 ring-indigo-200"
              : "border-border hover:border-indigo-300 hover:shadow-md"
          }`}
        >
          <div className='absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center'>
            <div className='text-center'>
              <svg
                className='w-8 h-8 mx-auto text-gray-400 mb-1'
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
              <p className='text-xs font-medium text-gray-600'>Sin fondo</p>
            </div>
          </div>
          {currentBackground === null && (
            <div className='absolute inset-0 bg-indigo-500/10 flex items-center justify-center'>
              <div className='w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center'>
                <svg
                  className='w-4 h-4 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
            </div>
          )}
        </button>

        {/* Fondos predefinidos */}
        {backgrounds.map((bg) => (
          <button
            key={bg.id}
            onClick={() => onSelectBackground(bg)}
            className={`relative aspect-square rounded-xl border-2 transition-all overflow-hidden group ${
              currentBackground?.id === bg.id
                ? "border-indigo-500 shadow-lg ring-2 ring-indigo-200 scale-105"
                : "border-border hover:border-indigo-300 hover:shadow-md"
            }`}
            title={bg.name}
          >
            <img
              src={publicUrl(bg.image)}
              alt={bg.name}
              className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity'>
              <p className='absolute bottom-2 left-2 right-2 text-xs font-medium text-white text-center truncate'>
                {bg.name}
              </p>
            </div>
            {currentBackground?.id === bg.id && (
              <div className='absolute inset-0 bg-indigo-500/20 flex items-center justify-center'>
                <div className='w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg'>
                  <svg
                    className='w-4 h-4 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}

        {/* Fondos subidos */}
        {uploadedBgs.map((bg) => (
          <div key={bg.id} className='relative group' title={bg.name}>
            <button
              onClick={() => onSelectBackground(bg)}
              className={`relative aspect-square rounded-xl border-2 transition-all overflow-hidden w-full ${
                currentBackground?.id === bg.id
                  ? "border-indigo-500 shadow-lg ring-2 ring-indigo-200 scale-105"
                  : "border-border hover:border-indigo-300 hover:shadow-md"
              }`}
            >
              <img
                src={bg.image}
                alt={bg.name}
                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity'>
                <p className='absolute bottom-2 left-2 right-2 text-xs font-medium text-white text-center truncate'>
                  {bg.name.length > 10
                    ? bg.name.substring(0, 10) + "..."
                    : bg.name}
                </p>
              </div>
              {currentBackground?.id === bg.id && (
                <div className='absolute inset-0 bg-indigo-500/20 flex items-center justify-center'>
                  <div className='w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg'>
                    <svg
                      className='w-4 h-4 text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteUploaded(bg.id);
              }}
              className='absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10'
              title='Eliminar'
            >
              <DeleteIcon />
            </button>
          </div>
        ))}
      </div>

      {uploadedBgs.length > 0 && (
        <div className='text-xs text-text-subtle mt-4 text-center bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-200'>
          <span className='font-medium text-indigo-700'>
            {uploadedBgs.length}
          </span>{" "}
          fondo(s) personalizado(s)
        </div>
      )}
    </div>
  );
};
