import React, { useState, useEffect, memo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import ImageZoom from './ImageZoom';

interface ArtworkPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialImageIndex?: number;
  title: string;
  artist: string;
}

const ArtworkPreviewModal: React.FC<ArtworkPreviewModalProps> = ({
  isOpen,
  onClose,
  images,
  initialImageIndex = 0,
  title,
  artist
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);

  
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(initialImageIndex);
      
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
          handlePreviousImage();
        } else if (e.key === 'ArrowRight') {
          handleNextImage();
        } else if (e.key === 'Escape') {
          onClose();
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      
      
      document.body.style.overflow = 'hidden';
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, initialImageIndex, onClose]);
  
  
  if (!isOpen) return null;
  
  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
      {}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-opacity"
        aria-label="Close preview"
      >
        <X size={24} />
      </button>
      
      {}
      {images.length > 1 && (
        <button 
          onClick={handlePreviousImage}
          className="absolute left-4 p-3 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-opacity"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      
      {}
      {images.length > 1 && (
        <button 
          onClick={handleNextImage}
          className="absolute right-4 p-3 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-opacity"
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>
      )}
      
      {}
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col">
        {}
        <div className="flex-1 relative aspect-square sm:aspect-auto">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full max-h-[70vh] md:max-h-[75vh]">
              <ImageZoom
                src={images[currentImageIndex]}
                alt={`${title} - Image ${currentImageIndex + 1}`}
              />
            </div>
          </div>
        </div>
        
        {}
        <div className="p-4 text-white bg-black bg-opacity-30 mt-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-gray-300">by {artist}</p>
          {images.length > 1 && (
            <p className="text-sm text-gray-400 mt-1">
              Image {currentImageIndex + 1} of {images.length}
            </p>
          )}
        </div>
        
        {}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-3 overflow-x-auto px-4 py-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-16 h-16 border-2 rounded overflow-hidden transition-all ${
                  idx === currentImageIndex 
                    ? 'border-blue-500 opacity-100 scale-110' 
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <img 
                  src={img} 
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ArtworkPreviewModal);
