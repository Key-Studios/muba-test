import React, { useRef, useEffect, useState, forwardRef, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Group, Line } from 'react-konva';

const FurnitureItem = React.memo(({ item, onDelete, onSelect, isSelected, onUpdate, snapEnabled, gridSpacing }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const imageRef = useRef();
  const trRef = useRef();
  const itemDataRef = useRef(item);

  useEffect(() => { itemDataRef.current = item; }, [item]);

  useEffect(() => {
    const img = new window.Image();
    img.src = item.image;
    img.onload = () => { setImage(img); setLoading(false); };
    img.onerror = () => { console.error(`Failed to load image: ${item.image}`); setLoading(false); };
  }, [item.image]);

  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, item.width, item.height]);

  if (loading) return null;

  const handleDragEnd = (e) => {
    let newX = e.target.x();
    let newY = e.target.y();
    if (snapEnabled) {
      newX = Math.round(newX / gridSpacing) * gridSpacing;
      newY = Math.round(newY / gridSpacing) * gridSpacing;
      e.target.x(newX);
      e.target.y(newY);
    }
    itemDataRef.current.x = newX;
    itemDataRef.current.y = newY;
    onUpdate(itemDataRef.current);
  };

  const handleTransformEnd = () => {
    if (imageRef.current) {
      const node = imageRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const uniformScale = Math.max(scaleX, scaleY);
      const newWidth = Math.max(20, itemDataRef.current.width * uniformScale);
      const newHeight = Math.max(20, itemDataRef.current.height * uniformScale);
      node.scaleX(1);
      node.scaleY(1);
      itemDataRef.current.x = node.x();
      itemDataRef.current.y = node.y();
      itemDataRef.current.rotation = node.rotation();
      itemDataRef.current.width = newWidth;
      itemDataRef.current.height = newHeight;
      onUpdate(itemDataRef.current);
    }
  };

  return (
    <>
      <KonvaImage
        ref={imageRef}
        image={image}
        x={item.x}
        y={item.y}
        width={item.width}
        height={item.height}
        rotation={item.rotation}
        draggable
        onDragEnd={handleDragEnd}
        onClick={() => onSelect(item.id)}
        onTap={() => onSelect(item.id)}
        onContextMenu={(e) => { e.evt.preventDefault(); onDelete(item.id); }}
        stroke={isSelected ? '#CBB8F9' : undefined}
        strokeWidth={isSelected ? 2 : 0}
        shadowColor={isSelected ? '#A5CAFE' : undefined}
        shadowBlur={isSelected ? 8 : 0}
        shadowOpacity={isSelected ? 0.6 : 0}
        name="furniture-item"
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={true}
          enabledAnchors={['top-left','top-right','bottom-left','bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            const aspect = oldBox.width / oldBox.height;
            const targetAspect = newBox.width / newBox.height;
            if (Math.abs(aspect - targetAspect) > 0.0001) {
              newBox.height = newBox.width / aspect;
            }
            return newBox;
          }}
          rotationSnaps={[0, 90, 180, 270]}
          onTransformEnd={handleTransformEnd}
        />
      )}
    </>
  );
});

export const CanvasEditor = forwardRef(({ furniture, onUpdateFurniture, stageRef, background, scale = 1, showGrid = false, isPanning = false, snapEnabled = false }, ref) => {
  const internalStageRef = useRef();
  const [selectedId, setSelectedId] = useState(null);
  const containerRef = useRef();
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  // We no longer mutate furniture coordinates when container/background resizes.
  // Furniture coordinates are kept in the logical background space.
  const backgroundScaleRef = useRef(1);

  const recomputeSizes = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    const padding = 40;
    const availableWidth = containerWidth - padding * 2;
    const availableHeight = containerHeight - padding * 2;
    if (backgroundImage) {
      const bgW = background.width;
      const bgH = background.height;
      const scaleFactor = Math.min(availableWidth / bgW, availableHeight / bgH);
      backgroundScaleRef.current = scaleFactor; // store display scale only
      setCanvasSize({ width: bgW, height: bgH }); // keep logical size
    } else {
      backgroundScaleRef.current = 1;
      setCanvasSize({ width: availableWidth, height: availableHeight });
    }
  }, [backgroundImage, background]);

  // Load background image
  useEffect(() => {
    if (background) {
      const img = new window.Image();
      img.src = background.image;
      img.onload = () => {
        setBackgroundImage(img);
      };
      img.onerror = () => {
        console.error(`Failed to load background: ${background.image}`);
      };
    } else {
      setBackgroundImage(null);
      backgroundScaleRef.current = 1;
    }
  }, [background]);

  // After background loads or changes size, recompute stage size
  useEffect(() => {
    recomputeSizes();
  }, [recomputeSizes]);

  // Removed cumulative scaling effect to preserve original furniture coordinates across scene changes.

  // Expose stageRef to parent
  useEffect(() => {
    if (stageRef && internalStageRef.current) {
      stageRef.current = internalStageRef.current;
    }
  }, [stageRef]);

  useEffect(() => {
    const handleResize = () => {
      recomputeSizes();
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [recomputeSizes]);

  const handleDelete = (id) => {
    const updatedFurniture = furniture.filter((item) => item.id !== id);
    onUpdateFurniture(updatedFurniture);
    setSelectedId(null);
  };

  const handlePointerDown = (e) => {
    const target = e.target;
    // If click/tap not on a furniture item or its transformer handles, clear selection
    const isFurniture = target?.hasName?.('furniture-item');
    const isTransformer = target?.getParent?.() && target.getParent().getClassName() === 'Transformer';
    if (!isFurniture && !isTransformer) {
      setSelectedId(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Delete' && selectedId) {
      handleDelete(selectedId);
    } else if (e.key === 'r' || e.key === 'R') {
      if (selectedId) {
        const item = furniture.find((f) => f.id === selectedId);
        if (item) {
          item.rotation = (item.rotation + 45) % 360;
          onUpdateFurniture([...furniture]);
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, furniture]);

  // Generate grid lines if enabled
  const baseSpacing = 50; // tamaño visual deseado de cada celda de la grilla (px)
  // Ajuste: antes solo se dividía por 'scale'. Al cambiar el fondo cambia backgroundScaleRef.current
  // provocando que las celdas se vieran más pequeñas (Stage se escalaba adicionalmente).
  // Queremos que el tamaño visual permanezca estable, así que dividimos por el producto de ambos escalados.
  const effectiveScale = scale * backgroundScaleRef.current;
  const gridSpacing = effectiveScale > 0 ? baseSpacing / effectiveScale : baseSpacing;
  const gridLines = [];
  if (showGrid) {
    for (let x = 0; x <= canvasSize.width; x += gridSpacing) {
      gridLines.push({ points: [x, 0, x, canvasSize.height] });
    }
    for (let y = 0; y <= canvasSize.height; y += gridSpacing) {
      gridLines.push({ points: [0, y, canvasSize.width, y] });
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gray-50 relative overflow-hidden flex items-center justify-center"
    >
      {/* Instructions overlay */}
      <div className="absolute top-6 left-6 text-xs text-gray-500 pointer-events-none z-10 bg-white px-3 py-2 rounded border border-gray-200">
        <p>Arrastra muebles • R = rotar • Supr = eliminar</p>
      </div>

      {/* Konva Stage */}
      <Stage
        ref={internalStageRef}
        // Evitar doble escalado: mantenemos tamaño lógico y aplicamos backgroundScale en scale
        width={canvasSize.width}
        height={canvasSize.height}
        scaleX={scale * backgroundScaleRef.current}
        scaleY={scale * backgroundScaleRef.current}
        draggable={isPanning}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        style={{ background: backgroundImage ? 'transparent' : '#ffffff', cursor: isPanning ? 'grab' : 'default' }}
      >
        <Layer>
          {/* Background image */}
          {backgroundImage && (
            <KonvaImage
              image={backgroundImage}
              x={0}
              y={0}
              width={canvasSize.width}
              height={canvasSize.height}
            />
          )}

          {/* Grid overlay */}
          {showGrid && (
            <Group listening={false}>
              {gridLines.map((l, i) => (
                <Line
                  key={i}
                  points={l.points}
                  stroke="#e2e8f0"
                  strokeWidth={1}
                  perfectDrawEnabled={false}
                />
              ))}
            </Group>
          )}

          {/* Furniture items */}
          {furniture.map((item) => (
            <FurnitureItem
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onSelect={setSelectedId}
              isSelected={selectedId === item.id}
              snapEnabled={snapEnabled}
              gridSpacing={gridSpacing}
              onUpdate={(updatedItem) => {
                const updatedFurniture = furniture.map((f) =>
                  f.id === updatedItem.id ? updatedItem : f
                );
                onUpdateFurniture(updatedFurniture);
              }}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
});

CanvasEditor.displayName = 'CanvasEditor';
