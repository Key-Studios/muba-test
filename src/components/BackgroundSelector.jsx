import React, { useState, useEffect, useRef } from 'react';

export const BackgroundSelector = ({ onSelectBackground, currentBackground }) => {
  const [backgrounds, setBackgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadedBgs, setUploadedBgs] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch('/backgrounds.json')
      .then((res) => res.json())
      .then((data) => {
        setBackgrounds(data.backgrounds);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading backgrounds:', error);
        setLoading(false);
      });

    // Load uploaded backgrounds from localStorage
    const savedBgs = localStorage.getItem('uploadedBackgrounds');
    if (savedBgs) {
      setUploadedBgs(JSON.parse(savedBgs));
    }
  }, []);

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        alert('Por favor sube solo archivos de imagen');
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        const img = new Image();
        img.onload = () => {
          const newBg = {
            id: `uploaded-${Date.now()}-${Math.random()}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            image: dataUrl,
            width: img.width,
            height: img.height,
            isUploaded: true,
          };

          const updated = [...uploadedBgs, newBg];
          setUploadedBgs(updated);
          localStorage.setItem('uploadedBackgrounds', JSON.stringify(updated));
          onSelectBackground(newBg);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteUploaded = (id) => {
    const updated = uploadedBgs.filter((bg) => bg.id !== id);
    setUploadedBgs(updated);
    localStorage.setItem('uploadedBackgrounds', JSON.stringify(updated));
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
    window.addEventListener('mousemove', handleGlobalMove);
    return () => window.removeEventListener('mousemove', handleGlobalMove);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
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

    const wrapperClasses = `bg-gray-100 border border-border rounded-xl px-6 py-4 shadow-md transition-all duration-500 ease-out ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`;

  return (
    <div ref={containerRef} className={wrapperClasses}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text">Fondos</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-text rounded-md transition-colors border border-border"
          title="Sube tus propias imágenes"
        >
          + Subir
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {/* Sin fondo */}
        <button
          onClick={() => onSelectBackground(null)}
          className={`px-3 py-1.5 text-sm rounded-md transition-all border ${
            currentBackground === null
              ? 'bg-gray-300 text-text border-border shadow-inner'
              : 'bg-surface text-text border-border hover:bg-gray-200'
          }`}
        >
          Sin fondo
        </button>

        {/* Fondos predefinidos */}
        {backgrounds.map((bg) => (
          <button
            key={bg.id}
            onClick={() => onSelectBackground(bg)}
            className={`px-3 py-1.5 text-sm rounded-md transition-all border ${
              currentBackground?.id === bg.id
                ? 'bg-gray-300 text-text border-border shadow-inner'
                : 'bg-surface text-text border-border hover:bg-gray-200'
            }`}
            title={bg.name}
          >
            {bg.name}
          </button>
        ))}

        {/* Fondos subidos */}
        {uploadedBgs.map((bg) => (
          <div
            key={bg.id}
            className="relative group"
            title={bg.name}
          >
            <button
              onClick={() => onSelectBackground(bg)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all border ${
                currentBackground?.id === bg.id
                  ? 'bg-gray-300 text-text border-border shadow-inner'
                  : 'bg-surface text-text border-border hover:bg-gray-200'
              }`}
            >
              {bg.name.length > 10 ? bg.name.substring(0, 10) + '...' : bg.name}
            </button>
            <button
              onClick={() => handleDeleteUploaded(bg.id)}
              className="absolute -top-2 -right-2 bg-danger text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow"
              title="Eliminar"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {uploadedBgs.length > 0 && (
        <div className="text-xs text-text-subtle mt-3">
          {uploadedBgs.length} fondo(s) subido(s)
        </div>
      )}
    </div>
  );
};
