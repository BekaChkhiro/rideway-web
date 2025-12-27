'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '@/lib/validations/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Step = 'email' | 'reset' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const emailForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Sync OTP with form
  const updateOtpInForm = (newOtp: string[]) => {
    resetForm.setValue('code', newOtp.join(''));
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    updateOtpInForm(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtp(newOtp.slice(0, 6));
      updateOtpInForm(newOtp.slice(0, 6));
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  async function onEmailSubmit(data: ForgotPasswordInput) {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to send reset email');
      }

      setSubmittedEmail(data.email);
      setStep('reset');
      toast.success('Reset code sent to your email!');

      // Focus first OTP input after transition
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function onResetSubmit(data: ResetPasswordInput) {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: submittedEmail,
          code: data.code,
          newPassword: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to reset password');
      }

      setStep('success');
      toast.success('Password reset successfully!');

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      updateOtpInForm(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }

  // Success state
  if (step === 'success') {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Password reset!</CardTitle>
          <CardDescription className="text-base">
            Your password has been reset successfully. Redirecting to login...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Reset password step (OTP + new password)
  if (step === 'reset') {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to{' '}
            <span className="font-medium text-foreground">{submittedEmail}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-6">
              {/* OTP Input */}
              <FormField
                control={resetForm.control}
                name="code"
                render={() => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                          <Input
                            key={index}
                            ref={(el) => {
                              inputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={index === 0 ? handleOtpPaste : undefined}
                            disabled={isLoading}
                            className="h-12 w-12 text-center text-lg font-semibold"
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Password */}
              <FormField
                control={resetForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Create a strong password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          className="pl-10 pr-10"
                          disabled={isLoading}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={resetForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Confirm your password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          className="pl-10 pr-10"
                          disabled={isLoading}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otp.some((d) => d === '')}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset password
              </Button>
            </form>
          </Form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Didn&apos;t receive the code?{' '}
            <button
              onClick={() => {
                setStep('email');
                setOtp(['', '', '', '', '', '']);
                resetForm.reset();
              }}
              className="text-primary hover:underline"
            >
              Try again
            </button>
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Email input step
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="name@example.com"
                        type="email"
                        autoComplete="email"
                        className="pl-10"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send reset code
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </CardFooter>
    </Card>
  );
}
