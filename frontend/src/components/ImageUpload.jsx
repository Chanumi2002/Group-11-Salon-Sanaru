import React, { useRef, useState } from 'react';
import { Upload, X, Loader } from 'lucide-react';

export default function ImageUpload({
  onFileSelect,
  previewUrl,
  onRemove,
  isLoading = false,
  maxSize = 2,
  acceptedTypes = ['image/jpeg', 'image/png'],
}) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (file) => {
    if (!acceptedTypes.includes(file.type)) {
      setError(`Invalid file type. Only ${acceptedTypes.map((t) => t.split('/')[1]).join(', ')} allowed.`);
      return false;
    }

    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      setError(`File size must be less than ${maxSize}MB.`);
      return false;
    }

    setError('');
    return true;
  };

  const handleFile = (file) => {
    if (!validateFile(file)) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onFileSelect(file, event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
            : error
              ? 'border-red-300 bg-red-50 dark:bg-red-950'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleChange}
          accept={acceptedTypes.join(',')}
          disabled={isLoading}
          className="hidden"
          aria-label="Upload image"
        />

        {previewUrl ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              {!isLoading && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove?.();
                  }}
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 p-1 rounded-full text-white transition-colors"
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click or drag to replace image
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {isLoading ? (
              <>
                <Loader size={32} className="text-blue-500 animate-spin" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
              </>
            ) : (
              <>
                <Upload size={32} className="text-gray-400" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Click or drag image here
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {acceptedTypes.map((t) => t.split('/')[1]).join(', ').toUpperCase()} - Max {maxSize}MB
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <span>Warning:</span>
          {error}
        </div>
      )}
    </div>
  );
}
