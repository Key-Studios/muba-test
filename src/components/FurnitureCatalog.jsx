import React, { useState, useMemo } from 'react';

export const FurnitureCatalog = ({ categories, onAddFurniture, existingFurniture, hidden, onToggle }) => {
  const [expandedCategory, setExpandedCategory] = useState(categories[0]?.id || null);
  const [search, setSearch] = useState('');

  const handleDragStart = (e, furnitureItem) => {
    const data = {
      name: furnitureItem.name,
      image: furnitureItem.image,
      width: furnitureItem.width,
      height: furnitureItem.height,
    };
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(data));
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const term = search.toLowerCase();
    return categories
      .map(cat => ({
        ...cat,
        furniture: cat.furniture.filter(item => item.name.toLowerCase().includes(term))
      }))
      .filter(cat => cat.furniture.length > 0);
  }, [categories, search]);

  if (hidden) {
    return (
      <button
        onClick={onToggle}
        className="absolute top-4 left-4 z-50 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-text text-xs shadow transition-colors"
      >
        Mostrar catálogo
      </button>
    );
  }

  return (
    <div className="w-72 max-h-[80vh] bg-gray-100 border border-border rounded-xl flex flex-col overflow-hidden relative shadow-md">
      <button
        onClick={onToggle}
        className="absolute -right-4 top-6 bg-gray-200 border border-border rounded-full w-10 h-10 flex items-center justify-center text-base font-bold shadow-lg hover:bg-gray-300 active:scale-95 transition-all text-text"
        title="Ocultar catálogo"
      >
        <span className="drop-shadow-sm">×</span>
      </button>
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">Catálogo</h1>
        <p className="text-xs text-gray-500 mt-1">Arrastra muebles al canvas</p>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="mt-3 w-full text-xs px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 bg-surface"
        />
      </div>

      {/* Catalog list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-100">
        {filteredCategories.map((category) => (
          <div key={category.id} className="mb-5">
            {/* Category header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full text-left px-3 py-2.5 hover:bg-gray-200 rounded-lg font-medium text-sm text-text transition-colors flex items-center justify-between border border-border bg-surface"
            >
              <span>{category.name}</span>
              <span className="text-xs text-gray-400">
                {expandedCategory === category.id ? '−' : '+'}
              </span>
            </button>

            {/* Furniture items */}
            {expandedCategory === category.id && (
              <div className="mt-3 space-y-2">
                {category.furniture.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    className="p-3 bg-surface-alt border border-border rounded-lg hover:border-gray-400 hover:shadow cursor-move transition-all"
                  >
                    {/* Thumbnail */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-20 object-contain bg-surface rounded mb-2"
                      draggable={false}
                    />
                    {/* Name */}
                    <p className="text-xs font-medium text-gray-700 text-center truncate">
                      {item.name}
                    </p>
                  </div>
                ))}
                {category.furniture.length === 0 && (
                  <p className="text-xs text-gray-400 px-2">Sin resultados</p>
                )}
              </div>
            )}
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <p className="text-xs text-gray-400 px-3">No hay coincidencias</p>
        )}
      </div>

      {/* Footer info */}
      <div className="border-t border-border bg-gray-200 px-6 py-4 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span>Muebles:</span>
          <span className="font-semibold text-gray-900">{existingFurniture}</span>
        </div>
      </div>
    </div>
  );
};
