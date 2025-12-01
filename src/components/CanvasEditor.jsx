import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useCallback,
} from "react";
import { publicUrl } from "../utils/publicUrl";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Transformer,
  Group,
  Line,
} from "react-konva";

const FurnitureItem = React.memo(function FurnitureItem({
  item,
  onDelete,
  onSelect,
  isSelected,
  onUpdate,
  snapEnabled,
  gridSpacing,
}) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const imageRef = useRef();
  const trRef = useRef();
  const itemDataRef = useRef(item);

  useEffect(() => {
    itemDataRef.current = item;
  }, [item]);

  useEffect(() => {
    const img = new window.Image();
    img.src = publicUrl(item.image);
    img.onload = () => {
      setImage(img);
      setLoading(false);
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${item.image}`);
      setLoading(false);
    };
  }, [item.image]);

  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

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
        onContextMenu={(e) => {
          e.evt.preventDefault();
          onDelete(item.id);
        }}
        stroke={isSelected ? "#CBB8F9" : undefined}
        strokeWidth={isSelected ? 2 : 0}
        shadowColor={isSelected ? "#A5CAFE" : undefined}
        shadowBlur={isSelected ? 8 : 0}
        shadowOpacity={isSelected ? 0.6 : 0}
        name='furniture-item'
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={true}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
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

export const CanvasEditor = forwardRef(function CanvasEditor(
  {
    furniture,
    onUpdateFurniture,
    stageRef,
    background,
    scale = 1,
    showGrid = false,
    isPanning = false,
    snapEnabled = false,
  },
  forwardedRef
) {
  const internalStageRef = useRef();
  const [selectedId, setSelectedId] = useState(null);
  const containerRef = useRef();
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const [displayScale, setDisplayScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  // Default a 'cover' para que el fondo ocupe el mayor espacio posible
  const [fitMode, setFitMode] = useState("cover");

  const recomputeSizes = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    
    if (backgroundImage && background) {
      const bgW = background.width;
      const bgH = background.height;
      
      // Para "cover": escalar para que cubra todo el contenedor (puede recortar)
      // Para "contain": escalar para que quepa sin recortar
      const scaleFactor =
        fitMode === "cover"
          ? Math.max(containerWidth / bgW, containerHeight / bgH)
          : Math.min(containerWidth / bgW, containerHeight / bgH);
      
      setDisplayScale(scaleFactor);
      // Mantener el tamaño lógico del canvas como el tamaño original de la imagen
      setCanvasSize({ width: bgW, height: bgH });
      
      // Para "cover": posicionar en (0,0) para que cubra desde la esquina
      // Para "contain": centrar
      if (fitMode === "cover") {
        setStagePosition({ x: 0, y: 0 });
      } else {
        const scaledWidth = bgW * scaleFactor;
        const scaledHeight = bgH * scaleFactor;
        setStagePosition({
          x: (containerWidth - scaledWidth) / 2,
          y: (containerHeight - scaledHeight) / 2,
        });
      }
    } else {
      // Sin fondo, usar todo el espacio disponible
      setDisplayScale(1);
      setCanvasSize({ width: containerWidth, height: containerHeight });
      setStagePosition({ x: 0, y: 0 });
    }
  }, [backgroundImage, background, fitMode]);

  useEffect(() => {
    if (background) {
      const img = new window.Image();
      img.src = publicUrl(background.image);
      img.onload = () => setBackgroundImage(img);
      img.onerror = () => {
        console.error(`Failed to load background: ${background.image}`);
        setBackgroundImage(null);
      };
    } else {
      setBackgroundImage(null);
      setDisplayScale(1);
    }
  }, [background]);

  useEffect(() => {
    recomputeSizes();
  }, [recomputeSizes]);

  useEffect(() => {
    if (stageRef && internalStageRef.current)
      stageRef.current = internalStageRef.current;
    if (forwardedRef && internalStageRef.current)
      forwardedRef.current = internalStageRef.current;
  }, [stageRef, forwardedRef]);

  useEffect(() => {
    const handleResize = () => recomputeSizes();
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [recomputeSizes]);

  const handleDelete = useCallback(
    (id) => {
      const updatedFurniture = furniture.filter((item) => item.id !== id);
      onUpdateFurniture(updatedFurniture);
      setSelectedId(null);
    },
    [furniture, onUpdateFurniture]
  );

  const handlePointerDown = (e) => {
    const target = e.target;
    const isFurniture =
      typeof target?.hasName === "function" && target.hasName("furniture-item");
    const isTransformer =
      target?.getParent?.() &&
      target.getParent().getClassName() === "Transformer";
    if (!isFurniture && !isTransformer) setSelectedId(null);
  };
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Delete" && selectedId) handleDelete(selectedId);
      else if ((e.key === "r" || e.key === "R") && selectedId) {
        const item = furniture.find((f) => f.id === selectedId);
        if (item) {
          item.rotation = (item.rotation + 45) % 360;
          onUpdateFurniture([...furniture]);
        }
      }
    },
    [selectedId, furniture, handleDelete, onUpdateFurniture]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const baseSpacing = 50;
  const effectiveScale = scale * displayScale;
  const gridSpacing =
    effectiveScale > 0 ? baseSpacing / effectiveScale : baseSpacing;
  const gridLines = [];
  if (showGrid) {
    for (let x = 0; x <= canvasSize.width; x += gridSpacing)
      gridLines.push({ points: [x, 0, x, canvasSize.height] });
    for (let y = 0; y <= canvasSize.height; y += gridSpacing)
      gridLines.push({ points: [0, y, canvasSize.width, y] });
  }

  return (
    <div
      ref={containerRef}
      className='flex-1 bg-gray-50 relative overflow-hidden w-full h-full'
    >
      <div className='absolute top-2 left-2 z-10 pointer-events-none glass px-2 py-1 rounded-md'>
        Arrastra muebles • R = rotar • Supr = eliminar
      </div>

      <div className='absolute top-2 right-2 z-20'>
        <button
          onClick={() =>
            setFitMode((f) => (f === "contain" ? "cover" : "contain"))
          }
          className='px-3 py-1 rounded-md border border-border bg-white shadow-sm text-xs'
        >
          {fitMode === "contain" ? "Contain" : "Cover"}
        </button>
      </div>

      <Stage
        ref={internalStageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        scaleX={scale * displayScale}
        scaleY={scale * displayScale}
        x={stagePosition.x}
        y={stagePosition.y}
        draggable={isPanning}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        style={{
          background: backgroundImage ? "transparent" : "#fff",
          cursor: isPanning ? "grab" : "default",
        }}
      >
        <Layer>
          {backgroundImage && background && (
            <KonvaImage
              image={backgroundImage}
              x={0}
              y={0}
              width={background.width}
              height={background.height}
            />
          )}

          {showGrid && (
            <Group listening={false}>
              {gridLines.map((l, i) => (
                <Line
                  key={i}
                  points={l.points}
                  stroke='#e2e8f0'
                  strokeWidth={1}
                  perfectDrawEnabled={false}
                />
              ))}
            </Group>
          )}

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

CanvasEditor.displayName = "CanvasEditor";

