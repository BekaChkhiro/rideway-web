'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createService, updateService } from '@/lib/api/services';
import { cn } from '@/lib/utils';
import type { ServiceCategory, Service } from '@/types';

const serviceSchema = z.object({
  name: z.string().min(3, 'სახელი მინიმუმ 3 სიმბოლო').max(100, 'მაქსიმუმ 100 სიმბოლო'),
  description: z.string().min(20, 'აღწერა მინიმუმ 20 სიმბოლო').max(2000, 'მაქსიმუმ 2000 სიმბოლო'),
  categoryId: z.string().min(1, 'აირჩიეთ კატეგორია'),
  location: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url('არასწორი URL ფორმატი').optional().or(z.literal('')),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  categories: ServiceCategory[];
  service?: Service;
  defaultCategoryId?: string;
  mode?: 'create' | 'edit';
}

interface ImagePreview {
  file?: File;
  url: string;
  isExisting?: boolean;
}

export function ServiceForm({
  categories,
  service,
  defaultCategoryId,
  mode = 'create',
}: ServiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ImagePreview[]>(
    service?.images.map((img) => ({ url: img.url, isExisting: true })) || []
  );

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      categoryId: service?.category.id || defaultCategoryId || '',
      location: service?.location || '',
      phone: service?.phone || '',
      website: service?.website || '',
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
    }));

    setImages((prev) => {
      // Limit to 10 images
      const combined = [...prev, ...newImages];
      if (combined.length > 10) {
        toast.error('მაქსიმუმ 10 სურათი');
        return prev;
      }
      return combined;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
  });

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const removed = newImages.splice(index, 1)[0];
      if (removed && !removed.isExisting) {
        URL.revokeObjectURL(removed.url);
      }
      return newImages;
    });
  };

  const onSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        const newImages = images
          .filter((img) => !img.isExisting && img.file)
          .map((img) => img.file!);

        const newService = await createService({
          ...data,
          images: newImages.length > 0 ? newImages : undefined,
        });
        toast.success('სერვისი შეიქმნა');
        router.push(`/services/${newService.id}`);
      } else if (service) {
        await updateService(service.id, {
          name: data.name,
          description: data.description,
          location: data.location,
          phone: data.phone,
          website: data.website,
        });
        toast.success('სერვისი განახლდა');
        router.push(`/services/${service.id}`);
      }
    } catch {
      toast.error('შეცდომა');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === 'create' ? 'ახალი სერვისი' : 'სერვისის რედაქტირება'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>კატეგორია *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={mode === 'edit'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="აირჩიეთ კატეგორია" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>სახელი *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="სერვისის სახელი..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>აღწერა *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="სერვისის აღწერა..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>მისამართი</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="თბილისი, საქართველო"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ტელეფონი</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+995 555 123456"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ვებსაიტი</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Images */}
        {mode === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle>სურათები</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary'
                )}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  ჩააგდეთ სურათები აქ ან დააწკაპუნეთ ასარჩევად
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  მაქს. 10 სურათი, თითო 10MB
                </p>
              </div>

              {/* Image previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden bg-muted group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded bg-primary text-primary-foreground text-xs">
                          მთავარი
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {images.length === 0 && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-sm">სურათები არ არის დამატებული</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            გაუქმება
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'სერვისის შექმნა' : 'შენახვა'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
