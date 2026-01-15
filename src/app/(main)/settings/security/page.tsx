'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, ShieldCheck, Smartphone, Key } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { changePassword } from '@/lib/api/auth';
import { toast } from '@/lib/toast';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'მიმდინარე პაროლი სავალდებულოა'),
    newPassword: z
      .string()
      .min(8, 'პაროლი მინიმუმ 8 სიმბოლო უნდა იყოს')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'პაროლი უნდა შეიცავდეს დიდ ასოს, პატარა ასოს და ციფრს'
      ),
    confirmPassword: z.string().min(1, 'გაიმეორე ახალი პაროლი'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'პაროლები არ ემთხვევა',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SecuritySettingsPage() {
  const { user, isLoading: authLoading, logout } = useAuth();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordFormData) =>
      changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast.success('პაროლი წარმატებით შეიცვალა. გთხოვთ შეხვიდეთ ხელახლა.');
      form.reset();
      // Password change revokes all tokens, so log out the user
      setTimeout(() => logout(), 1500);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'პაროლის შეცვლა ვერ მოხერხდა');
    },
  });

  const handlePasswordChange = (data: PasswordFormData) => {
    passwordMutation.mutate(data);
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

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            პაროლის შეცვლა
          </CardTitle>
          <CardDescription>
            განაახლე პაროლი ანგარიშის უსაფრთხოებისთვის.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handlePasswordChange)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>მიმდინარე პაროლი</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="შეიყვანე მიმდინარე პაროლი"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ახალი პაროლი</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="შეიყვანე ახალი პაროლი"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      მინიმუმ 8 სიმბოლო, დიდი და პატარა ასო, და ციფრი.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>გაიმეორე ახალი პაროლი</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="დაადასტურე ახალი პაროლი"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={passwordMutation.isPending}>
                  {passwordMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  პაროლის განახლება
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            ორფაქტორიანი ავტორიზაცია
          </CardTitle>
          <CardDescription>
            დაამატე უსაფრთხოების დამატებითი ფენა.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-muted">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">ავთენტიფიკატორი აპი</p>
                <p className="text-sm text-muted-foreground">
                  გამოიყენე აპი ვერიფიკაციის კოდების გენერაციისთვის.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">გამორთულია</Badge>
              <Button variant="outline">ჩართვა</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>აქტიური სესიები</CardTitle>
          <CardDescription>
            მართე აქტიური სესიები სხვადასხვა მოწყობილობებზე.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">მიმდინარე სესია</p>
                  <Badge className="bg-green-500">აქტიური</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  ეს მოწყობილობა - ბოლოს აქტიური ახლა
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive">
                გასვლა ყველა სხვა სესიიდან
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
