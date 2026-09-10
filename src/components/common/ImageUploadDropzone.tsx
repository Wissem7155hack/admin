import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Check } from 'lucide-react';
import { uploadToBucket, handleImageError } from '../../hooks/useSupabaseData';

interface ImageUploadDropzoneProps {
  label?: string;
  helperText?: string;
  currentImage?: string;
  onImageChange?: (imageUrl: string) => void;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  className?: string;
  storageFolder?: string;
  bucketName?: 'clinic-assets' | 'merchant-assets' | 'offer-media' | 'treatment-media' | 'membership-media' | 'team-and-blog';
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  label,
  helperText = 'PNG, JPG or WebP (max. 5MB)',
  currentImage,
  onImageChange,
  aspectRatio = 'auto',
  className = '',
  storageFolder = 'clinic-assets',
  bucketName = 'clinic-assets',
}) => {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentImage !== undefined) {
      setPreview(currentImage);
    }
  }, [currentImage]);

  const handleFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    // Show instant local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      setUploadError(null);
      // Upload to target Supabase storage bucket and obtain public CDN URL
      const publicUrl = await uploadToBucket(bucketName, file, storageFolder);
      setPreview(publicUrl);
      setUploaded(true);
      if (onImageChange) onImageChange(publicUrl);
      setTimeout(() => setUploaded(false), 2000);
    } catch (err: any) {
      console.error(`Supabase storage upload failed on bucket '${bucketName}':`, err);
      setUploadError(err?.message || 'Storage upload failed. Please verify file type and size.');
      // Never persist ephemeral local blob URLs to database
      setPreview(currentImage || '');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview('');
    if (onImageChange) onImageChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square max-w-[140px]';
      case 'banner':
        return 'aspect-[16/7] w-full';
      case 'video':
        return 'aspect-video w-full';
      default:
        return 'h-36 w-full';
    }
  };

  return (
    <div className={className}>
      {label && <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>}
      {uploadError && <p className="text-[11px] font-semibold text-rose-600 mb-1.5">{uploadError}</p>}

      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-4 text-center group ${getAspectClass()} ${
          isDragging
            ? 'border-pink-500 bg-pink-50/50'
            : 'border-slate-200 hover:border-pink-300 hover:bg-slate-50/70 bg-slate-50/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
          disabled={uploading}
        />

        {preview ? (
          <div className="absolute inset-0 w-full h-full group">
            <img src={preview} alt="Upload preview" onError={handleImageError} className="w-full h-full object-cover" />
            
            {uploading && (
              <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white gap-2 backdrop-blur-xs">
                <Loader2 size={24} className="animate-spin text-pink-400" />
                <span className="text-xs font-medium">Uploading to Supabase...</span>
              </div>
            )}

            {uploaded && !uploading && (
              <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                <Check size={14} />
              </div>
            )}

            {!uploading && (
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <span className="text-white text-xs font-semibold bg-slate-900/60 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                  Change Image
                </span>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                  title="Remove"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-slate-400 group-hover:text-pink-500 group-hover:border-pink-200 transition-colors">
              {uploading ? <Loader2 size={18} className="animate-spin text-pink-500" /> : <Upload size={18} />}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 group-hover:text-pink-600 transition-colors">
                {uploading ? 'Uploading to cloud...' : 'Click to upload'} <span className="font-normal text-slate-400">or drag & drop</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{helperText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadDropzone;
