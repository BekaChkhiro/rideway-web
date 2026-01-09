'use client';

import { useState, useRef } from 'react';
import { Image as ImageIcon, Video, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createStory } from '@/lib/api';

interface StoryCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export function StoryCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: StoryCreateDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const isValidImage = ACCEPTED_IMAGE_TYPES.includes(selectedFile.type);
    const isValidVideo = ACCEPTED_VIDEO_TYPES.includes(selectedFile.type);

    if (!isValidImage && !isValidVideo) {
      toast.error('მხარდაუჭერელი ფაილის ტიპი');
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('ფაილი ძალიან დიდია (მაქსიმუმ 50MB)');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setIsVideo(isValidVideo);
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setIsVideo(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!file || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createStory({ media: file });
      toast.success('Story გამოქვეყნდა');
      handleRemove();
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('ვერ მოხერხდა Story-ს გამოქვეყნება');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    handleRemove();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ახალი Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {preview ? (
            <div className="relative aspect-[9/16] max-h-[400px] rounded-lg overflow-hidden bg-muted mx-auto">
              {isVideo ? (
                <video
                  src={preview}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  muted
                  loop
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              )}

              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemove}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="aspect-[9/16] max-h-[400px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors mx-auto"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">ფოტო</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">ვიდეო</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                აირჩიე ფოტო ან ვიდეო
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              გაუქმება
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!file || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  იტვირთება...
                </>
              ) : (
                'გამოქვეყნება'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
