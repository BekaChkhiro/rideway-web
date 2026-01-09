'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

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
import { CategorySelector } from './category-selector';
import { conditionLabels } from './condition-badge';
import { createListing, updateListing } from '@/lib/api/listings';
import type { ListingCategory, ListingCondition, Listing } from '@/types';

const listingSchema = z.object({
  title: z.string().min(3, 'სათაური მინიმუმ 3 სიმბოლო').max(100, 'მაქსიმუმ 100 სიმბოლო'),
  description: z.string().min(10, 'აღწერა მინიმუმ 10 სიმბოლო').max(2000, 'მაქსიმუმ 2000 სიმბოლო'),
  price: z.number().min(0, 'ფასი არ შეიძლება იყოს უარყოფითი'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'PARTS']),
  categoryId: z.string().min(1, 'აირჩიეთ კატეგორია'),
  location: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface ListingFormProps {
  categories: ListingCategory[];
  listing?: Listing;
  mode?: 'create' | 'edit';
}

const conditions: ListingCondition[] = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'PARTS'];

export function ListingForm({
  categories,
  listing,
  mode = 'create',
}: ListingFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(
    listing?.images.map((img) => img.url) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: listing?.title || '',
      description: listing?.description || '',
      price: listing?.price || 0,
      condition: listing?.condition || 'GOOD',
      categoryId: listing?.category.id || '',
      location: listing?.location || '',
      brand: listing?.brand || '',
      model: listing?.model || '',
      year: listing?.year || undefined,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + images.length > 20) {
      toast.error('მაქსიმუმ 20 სურათი');
      return;
    }

    // Validate file sizes
    const invalidFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error('სურათი არ უნდა აღემატებოდეს 10MB-ს');
      return;
    }

    setImages((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ListingFormData) => {
    if (mode === 'create' && images.length === 0) {
      toast.error('დაამატეთ მინიმუმ 1 სურათი');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createListing({ ...data, images });
        toast.success('განცხადება დაემატა');
        router.push('/marketplace/my-listings');
      } else if (listing) {
        await updateListing(listing.id, data);
        toast.success('განცხადება განახლდა');
        router.push(`/marketplace/${listing.id}`);
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
        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>სურათები</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-6">
              {previews.map((preview, index) => (
                <div
                  key={index}
                  className="group relative aspect-square overflow-hidden rounded-md border"
                >
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                      მთავარი
                    </span>
                  )}
                </div>
              ))}

              {images.length < 20 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="mt-2 text-xs text-muted-foreground">დამატება</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              მაქსიმუმ 20 სურათი, თითოეული 10MB-მდე
            </p>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>ძირითადი ინფორმაცია</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>სათაური *</FormLabel>
                  <FormControl>
                    <Input placeholder="მაგ: Yamaha MT-07 2021" {...field} />
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
                      placeholder="დეტალური აღწერა..."
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ფასი (₾) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>მდგომარეობა *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="აირჩიეთ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {conditionLabels[condition]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>კატეგორია *</FormLabel>
                  <FormControl>
                    <CategorySelector
                      categories={categories}
                      value={field.value}
                      onSelect={(id) => field.onChange(id)}
                      error={form.formState.errors.categoryId?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>დეტალები</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ბრენდი</FormLabel>
                    <FormControl>
                      <Input placeholder="მაგ: Yamaha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>მოდელი</FormLabel>
                    <FormControl>
                      <Input placeholder="მაგ: MT-07" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>წელი</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="მაგ: 2021"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
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
                    <FormLabel>ადგილმდებარეობა</FormLabel>
                    <FormControl>
                      <Input placeholder="მაგ: თბილისი" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
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
            {mode === 'create' ? 'განცხადების დამატება' : 'შენახვა'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
