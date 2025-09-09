
import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
  id: string;
  label: string;
  onImageUpload: (dataUrl: string) => void;
  previewUrl: string | null;
  icon: React.ReactNode;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onImageUpload, previewUrl, icon }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          onImageUpload(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };
  
  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">{label}</h2>
      <div 
        onClick={handleContainerClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`w-full aspect-square max-w-md bg-slate-50 dark:bg-slate-700/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-indigo-500 scale-105 bg-indigo-50 dark:bg-indigo-900/20' : 'hover:border-indigo-400'}`}
      >
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          onChange={(e) => handleFileChange(e.target.files)}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        {previewUrl ? (
          <img src={previewUrl} alt={label} className="w-full h-full object-contain rounded-xl p-2" />
        ) : (
          <div className="text-center text-slate-400 dark:text-slate-500">
            <div className="flex justify-center mb-2">{icon}</div>
            <p className="font-semibold">Click to upload or drag & drop</p>
            <p className="text-sm">PNG, JPG, or WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};
