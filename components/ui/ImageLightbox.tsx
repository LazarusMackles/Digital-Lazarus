import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../icons/index';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface ImageLightboxProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageUrl, onClose }) => {
  // Use custom hook to lock body scroll.
  useBodyScrollLock();

  // Effect for handling the Escape key press to close the lightbox.
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
       if (event.key === 'Escape') {
        onClose();
       }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 modal-overlay-fade-in" 
      aria-modal="true" 
      role="dialog"
      onClick={onClose}
    >
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full bg-black/30 hover:bg-black/50 transition-colors z-10"
        aria-label="Close image view"
      >
        <Icon name="x-mark" className="w-8 h-8" />
      </button>

      <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <img 
            src={imageUrl} 
            alt="Enlarged evidence view" 
            className="max-w-full max-h-full object-contain animate-fade-in-up"
          />
      </div>
    </div>,
    modalRoot
  );
};
