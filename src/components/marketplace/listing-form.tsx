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
import { LocationSelector } from './location-selector';
import { conditionLabels } from './condition-badge';
import { createListing, updateListing } from '@/lib/api/listings';
import type {
  ListingCategory,
  ListingCondition,
  Listing,
  ListingType,
} from '@/types';
import {
  LISTING_TYPES,
  MOTORCYCLE_CATEGORIES,
  CUSTOMS_STATUSES,
  TRANSMISSIONS,
} from '@/types';

const listingSchema = z.object({
  title: z.string().min(3, 'სათაური მინიმუმ 3 სიმბოლო').max(100, 'მაქსიმუმ 100 სიმბოლო'),
  description: z.string().min(10, 'აღწერა მინიმუმ 10 სიმბოლო').max(2000, 'მაქსიმუმ 2000 სიმბოლო'),
  price: z.number().min(0, 'ფასი არ შეიძლება იყოს უარყოფითი'),
  type: z.enum(['MOTORCYCLE', 'PARTS', 'EQUIPMENT', 'ACCESSORIES']),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'PARTS']),
  categoryId: z.string().optional(),

  // Common fields
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),

  // Location
  locationType: z.enum(['ON_THE_WAY', 'GEORGIA', 'ABROAD']).optional(),
  locationCity: z.string().optional(),

  // Motorcycle-specific
  motorcycleCategory: z.enum(['MOPED', 'CITY', 'SPORT', 'TOURING', 'OFF_ROAD', 'CRUISER']).optional(),
  customsStatus: z.enum(['CLEARED', 'NOT_CLEARED']).optional(),
  engineCC: z.number().optional(),
  mileage: z.number().optional(),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']).optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface ListingFormProps {
  categories: ListingCategory[];
  listing?: Listing;
  mode?: 'create' | 'edit';
  defaultType?: ListingType;
}

const conditions: ListingCondition[] = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'PARTS'];

export function ListingForm({
  categories: _categories,
  listing,
  mode = 'create',
  defaultType = 'MOTORCYCLE',
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
      type: listing?.type || defaultType,
      condition: listing?.condition || 'GOOD',
      categoryId: listing?.category?.id || '',
      brand: listing?.brand || '',
      model: listing?.model || '',
      year: listing?.year || undefined,
      locationType: listing?.locationType || undefined,
      locationCity: listing?.locationCity || '',
      motorcycleCategory: listing?.motorcycleCategory || undefined,
      customsStatus: listing?.customsStatus || undefined,
      engineCC: listing?.engineCC || undefined,
      mileage: listing?.mileage || undefined,
      transmission: listing?.transmission || undefined,
    },
  });

  const selectedType = form.watch('type');
  const isMotorcycle = selectedType === 'MOTORCYCLE';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + images.length > 20) {
      toast.error('მაქსიმუმ 20 სურათი');
      return;
    }

    const invalidFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error('სურათი არ უნდა აღემატებოდეს 10MB-ს');
      return;
    }

    setImages((prev) => [...prev, ...files]);

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
        await createListing({ ...data, images } as any);
        toast.success('განცხადება დაემატა');
        router.push('/marketplace/my-listings');
      } else if (listing) {
        await updateListing(listing.id, data as any);
        toast.success('განცხადება განახლდა');
        router.push(`/marketplace/listing/${listing.id}`);
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>მწარმოებელი *</FormLabel>
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
                    <FormLabel>მოდელი *</FormLabel>
                    <FormControl>
                      <Input placeholder="მაგ: MT-07" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ტიპი *</FormLabel>
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
                        {LISTING_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ფასი ($) *</FormLabel>
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
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>მდებარეობა</CardTitle>
          </CardHeader>
          <CardContent>
            <LocationSelector
              locationType={form.watch('locationType')}
              locationCity={form.watch('locationCity')}
              onLocationTypeChange={(type) => form.setValue('locationType', type)}
              onLocationCityChange={(city) => form.setValue('locationCity', city)}
            />
          </CardContent>
        </Card>

        {/* Motorcycle-specific fields */}
        {isMotorcycle && (
          <Card>
            <CardHeader>
              <CardTitle>მოტოციკლის დეტალები</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="motorcycleCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>კატეგორია *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="აირჩიეთ კატეგორია" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOTORCYCLE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
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
                  name="customsStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>განბაჟება *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="აირჩიეთ სტატუსი" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CUSTOMS_STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>წელი *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="მაგ: 2021"
                          {...field}
                          value={field.value || ''}
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
                  name="engineCC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ძრავი (cc) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="მაგ: 689"
                          {...field}
                          value={field.value || ''}
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
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>გარბენი (კმ) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="მაგ: 15000"
                          {...field}
                          value={field.value || ''}
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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="transmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>გადაცემათა კოლოფი *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="აირჩიეთ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TRANSMISSIONS.map((trans) => (
                            <SelectItem key={trans.value} value={trans.value}>
                              {trans.label}
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
            </CardContent>
          </Card>
        )}

        {/* Non-motorcycle condition field */}
        {!isMotorcycle && (
          <Card>
            <CardHeader>
              <CardTitle>დეტალები</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
                          value={field.value || ''}
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
              </div>
            </CardContent>
          </Card>
        )}

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
