import React, { useState, useMemo } from "react";
import { publicUrl } from "../utils/publicUrl";

export const FurnitureCatalog = ({
  categories,
  onAddFurniture,
  existingFurniture,
  hidden,
  onToggle,
  isEmbedded = false,
}) => {
  const [expandedCategory, setExpandedCategory] = useState(
    categories[0]?.id || null
  );
  const [search, setSearch] = useState("");

  const handleDragStart = (e, furnitureItem) => {
    const data = {
      name: furnitureItem.name,
      // ensure images coming from public are resolved through VITE_PUBLIC_URL
      image: publicUrl(furnitureItem.image),
      width: furnitureItem.width,
      height: furnitureItem.height,
    };
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/json", JSON.stringify(data));
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const term = search.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        furniture: cat.furniture.filter((item) =>
          item.name.toLowerCase().includes(term)
        ),
      }))
      .filter((cat) => cat.furniture.length > 0);
  }, [categories, search]);

  if (hidden) {
    return (
      <button
        onClick={onToggle}
        className='absolute top-4 left-4 z-50 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-text text-xs shadow transition-colors'
      >
        Mostrar catálogo
      </button>
    );
  }

  const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  return (
    <div className={`${isEmbedded ? 'h-full' : 'w-80 max-h-[85vh]'} flex flex-col overflow-hidden relative ${!isEmbedded ? 'glass border border-border rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
      {!isEmbedded && (
        <button
          onClick={onToggle}
          className='absolute -right-3 top-4 bg-white border-2 border-border rounded-full w-9 h-9 flex items-center justify-center text-base font-bold shadow-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 active:scale-95 transition-all text-text z-10'
          title='Ocultar catálogo'
        >
          <CloseIcon />
        </button>
      )}
      {isEmbedded && (
        <div className='flex-shrink-0 px-6 py-4 border-b border-border bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between'>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>Catálogo</h1>
              <p className='text-xs text-gray-600 mt-0.5'>Arrastra muebles al canvas</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className='w-8 h-8 rounded-lg bg-white border border-border hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all flex items-center justify-center'
            title='Ocultar catálogo'
          >
            <CloseIcon />
          </button>
        </div>
      )}
      {/* Header */}
      {!isEmbedded && (
        <div className='px-6 py-5 border-b border-border bg-gradient-to-r from-indigo-50 to-purple-50'>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>Catálogo</h1>
              <p className='text-xs text-gray-600 mt-0.5'>Arrastra muebles al canvas</p>
            </div>
          </div>
          <div className="relative mt-4">
            <SearchIcon />
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar muebles...'
              className='w-full text-sm px-4 pl-10 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all'
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>
        </div>
      )}
      {isEmbedded && (
        <div className='flex-shrink-0 px-6 py-4 border-b border-border bg-gradient-to-r from-indigo-50 to-purple-50'>
          <div className="relative">
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar muebles...'
              className='w-full text-sm px-4 pl-10 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all'
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>
        </div>
      )}

      {/* Catalog list */}
      <div className='flex-1 overflow-y-auto px-5 py-4 bg-gradient-to-b from-white to-indigo-50/30'>
        {filteredCategories.map((category) => (
          <div key={category.id} className='mb-4'>
            {/* Category header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className='w-full text-left px-4 py-3 hover:bg-indigo-50 rounded-xl font-semibold text-sm text-gray-800 transition-all flex items-center justify-between border border-border bg-white shadow-sm hover:shadow-md group'
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                {category.name}
              </span>
              <span className='text-lg text-indigo-500 font-bold transition-transform group-hover:scale-110'>
                {expandedCategory === category.id ? "−" : "+"}
              </span>
            </button>

            {/* Furniture items */}
            {expandedCategory === category.id && (
              <div className='mt-3 grid grid-cols-2 gap-3'>
                {category.furniture.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    className='p-3 bg-white border border-border rounded-xl hover:border-indigo-300 hover:shadow-lg cursor-move transition-all group hover:-translate-y-1'
                  >
                    {/* Thumbnail */}
                    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 mb-2 aspect-square flex items-center justify-center">
                      <img
                        src={publicUrl(item.image)}
                        alt={item.name}
                        className='w-full h-full object-contain p-2 group-hover:scale-105 transition-transform'
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    {/* Name */}
                    <p className='text-xs font-medium text-gray-700 text-center truncate group-hover:text-indigo-600 transition-colors'>
                      {item.name}
                    </p>
                  </div>
                ))}
                {category.furniture.length === 0 && (
                  <p className='col-span-2 text-xs text-gray-400 px-2 text-center py-4'>Sin resultados</p>
                )}
              </div>
            )}
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <SearchIcon />
            </div>
            <p className='text-sm text-gray-500 font-medium'>No hay coincidencias</p>
            <p className='text-xs text-gray-400 mt-1'>Intenta con otro término de búsqueda</p>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className='border-t border-border bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <span className="text-sm font-medium text-gray-700">Muebles en canvas:</span>
          <span className='font-bold text-lg text-indigo-600 bg-white px-3 py-1 rounded-lg border border-indigo-200 shadow-sm'>
            {existingFurniture}
          </span>
        </div>
      </div>
    </div>
  );
};
