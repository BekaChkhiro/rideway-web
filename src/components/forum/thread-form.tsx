'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
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
import { createThread, updateThread } from '@/lib/api/forum';
import type { ForumCategory, ForumThread } from '@/types';

const threadSchema = z.object({
  title: z.string().min(5, 'სათაური მინიმუმ 5 სიმბოლო').max(200, 'მაქსიმუმ 200 სიმბოლო'),
  content: z.string().min(20, 'შინაარსი მინიმუმ 20 სიმბოლო').max(10000, 'მაქსიმუმ 10000 სიმბოლო'),
  categoryId: z.string().min(1, 'აირჩიეთ კატეგორია'),
});

type ThreadFormData = z.infer<typeof threadSchema>;

interface ThreadFormProps {
  categories: ForumCategory[];
  thread?: ForumThread;
  defaultCategoryId?: string;
  mode?: 'create' | 'edit';
}

export function ThreadForm({
  categories,
  thread,
  defaultCategoryId,
  mode = 'create',
}: ThreadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ThreadFormData>({
    resolver: zodResolver(threadSchema),
    defaultValues: {
      title: thread?.title || '',
      content: thread?.content || '',
      categoryId: thread?.category.id || defaultCategoryId || '',
    },
  });

  const onSubmit = async (data: ThreadFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        const newThread = await createThread(data);
        toast.success('თემა შეიქმნა');
        router.push(`/forum/thread/${newThread.id}`);
      } else if (thread) {
        await updateThread(thread.id, {
          title: data.title,
          content: data.content,
        });
        toast.success('თემა განახლდა');
        router.push(`/forum/thread/${thread.id}`);
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
              {mode === 'create' ? 'ახალი თემა' : 'თემის რედაქტირება'}
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>სათაური *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="თემის სათაური..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>შინაარსი *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="დაწერეთ თქვენი თემის შინაარსი..."
                      rows={10}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

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
            {mode === 'create' ? 'თემის შექმნა' : 'შენახვა'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
