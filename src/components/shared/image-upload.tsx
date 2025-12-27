'use client';

import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  progress?: number;
  error?: string;
}

interface ImageUploadProps {
  value?: ImageFile[];
  onChange?: (files: ImageFile[]) => void;
  onUpload?: (files: File[]) => Promise<string[]>;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
  dropzoneClassName?: string;
  previewClassName?: string;
}

const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const DEFAULT_MAX_SIZE = 5; // 5MB

export function ImageUpload({
  value = [],
  onChange,
  onUpload,
  maxFiles = 5,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  disabled = false,
  className,
  dropzoneClassName,
  previewClassName,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<ImageFile[]>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`;
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File too large. Max size: ${maxSize}MB`;
    }
    return null;
  }, [acceptedTypes, maxSize]);

  const processFiles = useCallback(
    async (newFiles: File[]) => {
      const remainingSlots = maxFiles - files.length;
      const filesToProcess = newFiles.slice(0, remainingSlots);

      const processedFiles: ImageFile[] = filesToProcess.map((file) => {
        const error = validateFile(file);
        return {
          id: generateId(),
          file,
          preview: error ? '' : URL.createObjectURL(file),
          error: error || undefined,
        };
      });

      const updatedFiles = [...files, ...processedFiles];
      setFiles(updatedFiles);
      onChange?.(updatedFiles);

      // If onUpload is provided, upload valid files
      if (onUpload) {
        const validFiles = processedFiles.filter((f) => !f.error);
        if (validFiles.length > 0) {
          try {
            // Simulate upload progress
            for (const imageFile of validFiles) {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === imageFile.id ? { ...f, progress: 0 } : f
                )
              );

              // Simulate progress updates
              for (let i = 0; i <= 100; i += 10) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === imageFile.id ? { ...f, progress: i } : f
                  )
                );
              }
            }

            await onUpload(validFiles.map((f) => f.file));
          } catch {
            // Handle upload error
            setFiles((prev) =>
              prev.map((f) =>
                validFiles.some((vf) => vf.id === f.id)
                  ? { ...f, error: 'Upload failed', progress: undefined }
                  : f
              )
            );
          }
        }
      }
    },
    [files, maxFiles, onChange, onUpload, validateFile]
  );

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = (id: string) => {
    const fileToRemove = files.find((f) => f.id === id);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    const updatedFiles = files.filter((f) => f.id !== id);
    setFiles(updatedFiles);
    onChange?.(updatedFiles);
  };

  const openFilePicker = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const canAddMore = files.length < maxFiles;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      {canAddMore && (
        <div
          onClick={openFilePicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
            disabled && 'cursor-not-allowed opacity-50',
            dropzoneClassName
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            multiple={maxFiles > 1}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />

          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            Drop images here or click to upload
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {acceptedTypes.map((t) => (t.split('/')[1] ?? t).toUpperCase()).join(', ')} up to {maxSize}MB
          </p>
          {maxFiles > 1 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {files.length}/{maxFiles} files
            </p>
          )}
        </div>
      )}

      {/* Previews */}
      {files.length > 0 && (
        <div
          className={cn(
            'grid gap-4',
            files.length === 1
              ? 'grid-cols-1'
              : files.length === 2
              ? 'grid-cols-2'
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
            previewClassName
          )}
        >
          {files.map((imageFile) => (
            <div
              key={imageFile.id}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              {imageFile.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageFile.preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              {/* Progress overlay */}
              {typeof imageFile.progress === 'number' && imageFile.progress < 100 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                  <Progress value={imageFile.progress} className="w-3/4" />
                  <span className="mt-2 text-sm text-white">
                    {imageFile.progress}%
                  </span>
                </div>
              )}

              {/* Error overlay */}
              {imageFile.error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/90 p-2 text-center">
                  <AlertCircle className="mb-1 h-6 w-6 text-white" />
                  <span className="text-xs text-white">{imageFile.error}</span>
                </div>
              )}

              {/* Remove button */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleRemove(imageFile.id)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Single image upload (for avatar, cover, etc.)
interface SingleImageUploadProps {
  value?: string;
  onChange?: (url: string | null) => void;
  onUpload?: (file: File) => Promise<string>;
  aspectRatio?: 'square' | 'video' | 'banner';
  maxSize?: number;
  disabled?: boolean;
  className?: string;
  placeholder?: React.ReactNode;
}

export function SingleImageUpload({
  value,
  onChange,
  onUpload,
  aspectRatio = 'square',
  maxSize = DEFAULT_MAX_SIZE,
  disabled = false,
  className,
  placeholder,
}: SingleImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]',
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file) return;

    // Validate size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File too large. Max size: ${maxSize}MB`);
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Upload if handler provided
    if (onUpload) {
      try {
        setIsLoading(true);
        const url = await onUpload(file);
        onChange?.(url);
      } catch {
        setPreview(value || null);
        alert('Upload failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      onChange?.(previewUrl);
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    if (preview && preview !== value) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onChange?.(null);
  };

  return (
    <div className={cn('relative', aspectClasses[aspectRatio], className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={disabled || isLoading}
      />

      {preview ? (
        <div className="group relative h-full w-full overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover"
          />

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}

          {/* Actions overlay */}
          {!isLoading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
              >
                Change
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className={cn(
            'flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
            'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {placeholder || (
            <>
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Click to upload
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
