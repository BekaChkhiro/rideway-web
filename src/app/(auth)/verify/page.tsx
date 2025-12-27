'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
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

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const RESEND_COOLDOWN = 60; // seconds

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleVerify = useCallback(async (code: string) => {
    if (!userId) {
      toast.error('User ID is required. Please go back and register again.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          code,
          type: 'email_verify'
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Invalid verification code');
      }

      setIsVerified(true);
      toast.success('Email verified successfully!');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Verification failed. Please try again.');
      }
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }, [userId, router]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-submit when all digits are entered
  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6 && otp.every((digit) => digit !== '')) {
      handleVerify(code);
    }
  }, [otp, handleVerify]);

  const handleChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtp(newOtp.slice(0, 6));
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  async function handleResend() {
    if (countdown > 0) return;

    // TODO: Backend needs to implement resend OTP endpoint
    // For now, show a message to check email or wait
    toast.info('Please check your email inbox and spam folder. If you still haven\'t received the code, please register again.');
    setCountdown(RESEND_COOLDOWN);
  }

  if (isVerified) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Email verified!</CardTitle>
          <CardDescription className="text-base">
            Your email has been verified successfully. Redirecting to login...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
        <CardDescription>
          We&apos;ve sent a 6-digit code to{' '}
          <span className="font-medium text-foreground">{email || 'your email'}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* OTP Input */}
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
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={isLoading}
              className="h-12 w-12 text-center text-lg font-semibold"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Verify Button */}
        <Button
          onClick={() => handleVerify(otp.join(''))}
          className="w-full"
          disabled={isLoading || otp.some((d) => d === '')}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify email
        </Button>

        {/* Resend */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Didn&apos;t receive the code? </span>
          {countdown > 0 ? (
            <span className="text-muted-foreground">
              Resend in {countdown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              className="text-primary hover:underline"
            >
              Resend code
            </button>
          )}
        </div>
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

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <Card className="border-0 shadow-lg">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}
