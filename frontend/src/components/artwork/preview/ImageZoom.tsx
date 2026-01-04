import React, { useState, useRef, useEffect, memo } from 'react';

interface ImageZoomProps {
  src: string;
  alt: string;
  maxZoom?: number;
}

const ImageZoom: React.FC<ImageZoomProps> = ({ 
  src, 
  alt, 
  maxZoom = 2.5 
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerBounds, setContainerBounds] = useState({ width: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (containerRef.current && isLoaded) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setContainerBounds({ width, height });
    }
  }, [containerRef, isLoaded]);

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const { left, top } = containerRef.current.getBoundingClientRect();
    
    
    const x = (e.clientX - left) / containerBounds.width;
    const y = (e.clientY - top) / containerBounds.height;
    
    
    const boundedX = Math.max(0, Math.min(1, x));
    const boundedY = Math.max(0, Math.min(1, y));

    setPosition({ x: boundedX, y: boundedY });
  };

  
  const zoomStyle = {
    transform: isZoomed 
      ? `scale(${maxZoom}) translate(${-position.x * 100}%, ${-position.y * 100}%)` 
      : 'scale(1) translate(0%, 0%)',
    transformOrigin: `${position.x * 100}% ${position.y * 100}%`,
  };

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden w-full h-full cursor-zoom-in"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-150"
        style={zoomStyle}
        onLoad={() => setIsLoaded(true)}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
          <span className="text-gray-500">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default memo(ImageZoom);
