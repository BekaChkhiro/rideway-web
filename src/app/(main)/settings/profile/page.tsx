'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Camera } from 'lucide-react';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { updateProfile } from '@/lib/api/users';
import { uploadAvatar, uploadCover, deleteAvatar, deleteCover } from '@/lib/api/media';
import { toast } from '@/lib/toast';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  bio: z.string().max(160, 'Bio must be less than 160 characters').optional(),
  location: z.string().max(50, 'Location must be less than 50 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      username: user?.username || '',
      bio: user?.bio || '',
      location: user?.location || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (avatarFile) {
        await uploadAvatar(avatarFile);
      }
      if (coverFile) {
        await uploadCover(coverFile);
      }
      return updateProfile({
        fullName: data.fullName,
        username: data.username,
        bio: data.bio || undefined,
        location: data.location || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setAvatarFile(null);
      setCoverFile(null);
      setAvatarPreview(null);
      setCoverPreview(null);
      toast.success('პროფილი წარმატებით განახლდა');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'პროფილის განახლება ვერ მოხერხდა');
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: deleteAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('ავატარი წაიშალა');
    },
    onError: () => {
      toast.error('ავატარის წაშლა ვერ მოხერხდა');
    },
  });

  const deleteCoverMutation = useMutation({
    mutationFn: deleteCover,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('გარეკანის ფოტო წაიშალა');
    },
    onError: () => {
      toast.error('გარეკანის ფოტოს წაშლა ვერ მოხერხდა');
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  if (authLoading || !user) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const initials = (user.fullName || user.username || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <Card>
        <CardHeader>
          <CardTitle>გარეკანის ფოტო</CardTitle>
          <CardDescription>
            ეს სურათი გამოჩნდება პროფილის ზედა ნაწილში.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-32 sm:h-40 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg overflow-hidden">
            {(coverPreview || user.coverUrl) && (
              <img
                src={coverPreview || user.coverUrl || ''}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <label htmlFor="cover-upload">
              <Button type="button" variant="outline" asChild>
                <span>
                  <Camera className="h-4 w-4 mr-2" />
                  შეცვლა
                </span>
              </Button>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </label>
            {(user.coverUrl || coverPreview) && (
              <Button
                type="button"
                variant="outline"
                onClick={() => deleteCoverMutation.mutate()}
                disabled={deleteCoverMutation.isPending}
              >
                {deleteCoverMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'წაშლა'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>პროფილის ფოტო</CardTitle>
          <CardDescription>
            შენი პროფილის ფოტო გამოჩნდება პლატფორმის მასშტაბით.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={avatarPreview || user.avatarUrl || undefined}
                alt={user.fullName}
              />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              <label htmlFor="avatar-upload">
                <Button type="button" variant="outline" asChild>
                  <span>
                    <Camera className="h-4 w-4 mr-2" />
                    შეცვლა
                  </span>
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
              {(user.avatarUrl || avatarPreview) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => deleteAvatarMutation.mutate()}
                  disabled={deleteAvatarMutation.isPending}
                >
                  {deleteAvatarMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'წაშლა'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>პროფილის ინფორმაცია</CardTitle>
          <CardDescription>
            განაახლე პროფილის დეტალები რომელიც სხვა მომხმარებლებს ჩანს.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>სახელი და გვარი</FormLabel>
                    <FormControl>
                      <Input placeholder="შენი სახელი" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>მომხმარებლის სახელი</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormDescription>
                      შენი უნიკალური სახელი Rideway-ზე. ეს იქნება პროფილის URL-ის ნაწილი.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ბიო</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="მოგვიყევი შენს შესახებ..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/160 სიმბოლო
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>მდებარეობა</FormLabel>
                    <FormControl>
                      <Input placeholder="ქალაქი, ქვეყანა" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="flex justify-end">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  შენახვა
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
