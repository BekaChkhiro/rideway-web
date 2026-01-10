'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertTriangle } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/lib/toast';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  currentPassword: z.string().min(1, 'Password is required'),
});

const phoneSchema = z.object({
  phone: z.string().min(9, 'Please enter a valid phone number'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type PhoneFormData = z.infer<typeof phoneSchema>;

export default function AccountSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || '',
      currentPassword: '',
    },
  });

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: user?.phone || '',
    },
  });

  const handleEmailSubmit = (data: EmailFormData) => {
    // TODO: Implement email change
    toast.info('ელ-ფოსტის შეცვლა მალე დაემატება');
    console.log('Email change:', data);
  };

  const handlePhoneSubmit = (data: PhoneFormData) => {
    // TODO: Implement phone change
    toast.info('ტელეფონის შეცვლა მალე დაემატება');
    console.log('Phone change:', data);
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    toast.info('ანგარიშის წაშლა მალე დაემატება');
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
      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle>ელ-ფოსტა</CardTitle>
          <CardDescription>
            ელ-ფოსტა გამოიყენება ავტორიზაციისა და შეტყობინებებისთვის.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
              className="space-y-4"
            >
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ელ-ფოსტა</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={emailForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>მიმდინარე პაროლი</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="შეიყვანე პაროლი დასადასტურებლად"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      საჭიროა ელ-ფოსტის შესაცვლელად.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">განახლება</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Phone */}
      <Card>
        <CardHeader>
          <CardTitle>ტელეფონის ნომერი</CardTitle>
          <CardDescription>
            ტელეფონის ნომერი ანგარიშის აღდგენისა და შეტყობინებებისთვის.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...phoneForm}>
            <form
              onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}
              className="space-y-4"
            >
              <FormField
                control={phoneForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ტელეფონის ნომერი</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+995 5XX XXX XXX"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">განახლება</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>ანგარიშის ინფორმაცია</CardTitle>
          <CardDescription>
            ინფორმაცია ანგარიშის სტატუსის შესახებ.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <div>
              <p className="font-medium">ანგარიშის სტატუსი</p>
              <p className="text-sm text-muted-foreground">
                შენი ანგარიში აქტიურია
              </p>
            </div>
            <span className="text-sm text-green-600 font-medium">აქტიური</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <div>
              <p className="font-medium">ანგარიშის ტიპი</p>
              <p className="text-sm text-muted-foreground">
                {user.role === 'ADMIN' ? 'ადმინისტრატორი' :
                 user.role === 'MODERATOR' ? 'მოდერატორი' : 'მომხმარებელი'}
              </p>
            </div>
            <span className="text-sm text-muted-foreground capitalize">
              {(user.role || 'user').toLowerCase()}
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-medium">რეგისტრაციის თარიღი</p>
              <p className="text-sm text-muted-foreground">
                როდის შეუერთდი Rideway-ს
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(user.createdAt).toLocaleDateString('ka-GE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            საშიში ზონა
          </CardTitle>
          <CardDescription>
            შეუქცევადი და დესტრუქციული მოქმედებები.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/30 bg-destructive/5">
            <div>
              <p className="font-medium">ანგარიშის წაშლა</p>
              <p className="text-sm text-muted-foreground">
                სამუდამოდ წაშალე ანგარიში და მასთან დაკავშირებული მონაცემები.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">წაშლა</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>დარწმუნებული ხარ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ეს მოქმედება შეუქცევადია. ანგარიში და მასთან დაკავშირებული
                    ყველა მონაცემი, მათ შორის პოსტები, კომენტარები და შეტყობინებები,
                    სამუდამოდ წაიშლება.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>გაუქმება</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    წაშლა
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
