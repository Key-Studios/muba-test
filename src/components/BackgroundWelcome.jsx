import React, { useState, useRef, useEffect } from "react";
import { publicUrl } from "../utils/publicUrl";

export const BackgroundWelcome = ({
  onSelectBackground,
  onUploadBackground,
  backgrounds,
  onClose,
}) => {
  const fileInputRef = useRef(null);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [showGallery, setShowGallery] = useState(false);

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Por favor sube solo archivos de imagen");
      return;
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
        onUploadBackground(newBg);
        onSelectBackground(newBg);
        onClose();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectPredefined = (bg) => {
    onSelectBackground(bg);
    onClose();
  };

  const UploadIcon = () => (
    <svg className="w-12 h-12 md:w-16 md:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );

  const GalleryIcon = () => (
    <svg className="w-12 h-12 md:w-16 md:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 md:p-8 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido!
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Elige cómo quieres comenzar tu diseño
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Opción 1: Subir imagen */}
          <button
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={() => setHoveredOption("upload")}
            onMouseLeave={() => setHoveredOption(null)}
            className="group relative aspect-[4/3] rounded-xl border-2 border-gray-200 bg-gradient-to-br from-pink-50 to-rose-50 hover:border-pink-400 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
              <div className={`mb-4 transition-transform duration-300 ${hoveredOption === "upload" ? "scale-110" : ""}`}>
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg">
                  <UploadIcon />
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                Subir mi imagen
              </h3>
              <p className="text-sm md:text-base text-gray-600 text-center max-w-xs">
                Sube una imagen desde tu dispositivo para usarla como fondo
              </p>
            </div>
            <div className={`absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-600/10 transition-opacity duration-300 ${hoveredOption === "upload" ? "opacity-100" : "opacity-0"}`}></div>
          </button>

          {/* Opción 2: Seleccionar fondo predefinido */}
          <button
            onClick={() => setShowGallery(!showGallery)}
            onMouseEnter={() => setHoveredOption("gallery")}
            onMouseLeave={() => setHoveredOption(null)}
            className="group relative aspect-[4/3] rounded-xl border-2 border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
              <div className={`mb-4 transition-transform duration-300 ${hoveredOption === "gallery" ? "scale-110" : ""}`}>
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <GalleryIcon />
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                Elegir de galería
              </h3>
              <p className="text-sm md:text-base text-gray-600 text-center max-w-xs">
                Selecciona un fondo de nuestra colección predefinida
              </p>
            </div>
            <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 transition-opacity duration-300 ${hoveredOption === "gallery" ? "opacity-100" : "opacity-0"}`}></div>
          </button>
        </div>

        {/* Grid de fondos predefinidos (se muestra cuando se hace clic en "Elegir de galería") */}
        {showGallery && backgrounds.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 max-h-64 overflow-y-auto animate-fade-in">
            <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
              Selecciona un fondo:
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {backgrounds.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => handleSelectPredefined(bg)}
                  className="relative aspect-square rounded-lg border-2 border-gray-300 hover:border-indigo-500 hover:shadow-lg transition-all overflow-hidden group"
                >
                  <img
                    src={publicUrl(bg.image)}
                    alt={bg.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white font-medium text-center truncate">
                      {bg.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {showGallery && backgrounds.length === 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Cargando fondos disponibles...
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Omitir por ahora
          </button>
        </div>
      </div>
    </div>
  );
};

