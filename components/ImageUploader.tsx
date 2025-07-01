import React, { useCallback, useState } from 'react';
import type { UploadedImage } from '../types';
import { UploadIcon } from './icons'; 

interface ImageUploaderProps {
  onImageUpload: (image: UploadedImage) => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, disabled }) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptedMimeTypes = ['image/jpeg', 'image/png', 'application/dicom'];
  const acceptedFileExtensions = ".jpg, .jpeg, .png, .dcm";

  const handleFileChange = useCallback((files: FileList | null) => {
    setError(null);
    if (files && files[0]) {
      const file = files[0];
      let isValidType = acceptedMimeTypes.includes(file.type);
      if (!isValidType && file.name.toLowerCase().endsWith('.dcm')) {
        Object.defineProperty(file, 'type', { value: 'application/dicom', writable: false });
        isValidType = true;
      }

      if (!isValidType) {
        setError('Invalid file type. Please upload a JPG, PNG, or DICOM (.dcm) image.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { 
        setError('File is too large. Maximum size is 10MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onImageUpload({
          file,
          previewUrl: URL.createObjectURL(file), 
          base64: base64String,
        });
      };
      reader.onerror = () => {
        setError('Failed to read file.');
      }
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const onDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (!disabled) setDragOver(true);
  }, [disabled]);

  const onDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const onDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (!disabled) {
      handleFileChange(event.dataTransfer.files);
    }
  }, [handleFileChange, disabled]);


  return (
    <div className="space-y-2">
      <label
        htmlFor="image-upload"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          flex flex-col items-center justify-center w-full h-48 px-4 
          border-2 border-dashed rounded-lg cursor-pointer 
          transition-colors duration-200 ease-in-out
          ${disabled ? 'bg-[rgba(0,0,0,0.1)] border-slate-700 cursor-not-allowed' : 
            dragOver ? 'bg-[rgba(255,223,0,0.2)] border-[var(--hnai-primary-color)]' : 'bg-[rgba(0,0,0,0.1)] hover:bg-[rgba(0,0,0,0.15)] border-slate-600 hover:border-[var(--hnai-primary-color)]'}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <UploadIcon className={`w-10 h-10 mb-3 ${dragOver ? 'text-[var(--hnai-primary-color)]' : 'text-slate-400'}`} />
          <p className={`mb-2 text-sm ${dragOver ? 'text-[var(--hnai-primary-color)]' : 'text-slate-300'}`}>
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className={`text-xs ${dragOver ? 'text-yellow-200' : 'text-slate-500'}`}>
            JPG, PNG, DICOM (MAX. 10MB)
          </p>
        </div>
        <input 
          id="image-upload" 
          type="file" 
          className="hidden" 
          accept={acceptedFileExtensions}
          onChange={(e) => handleFileChange(e.target.files)}
          disabled={disabled}
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <p className="text-xs text-slate-500 mt-1">Note: DICOM image preview may not be available in the browser.</p>
    </div>
  );
};
