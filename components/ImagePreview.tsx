import React from 'react';

interface ImagePreviewProps {
  src: string;
  alt: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt }) => {
  return (
    <div className="mt-4 p-2 bg-[rgba(0,0,0,0.15)] rounded-lg shadow"> {/* Subtle panel for preview */}
      <img 
        src={src} 
        alt={alt} 
        className="max-w-full max-h-96 h-auto mx-auto rounded-md object-contain" 
      />
    </div>
  );
};
