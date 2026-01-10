'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { verifyOtp, resendOtp } from '@/lib/api/auth';

export function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!userId) {
      router.push('/register');
    }
  }, [userId, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    const newCode = [...code];

    for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
      newCode[i] = pastedData[i] ?? '';
    }

    setCode(newCode);

    // Focus last filled input or last input
    const lastIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      toast.error('შეიყვანეთ 6-ნიშნა კოდი');
      return;
    }

    if (!userId) return;

    setIsLoading(true);

    try {
      const result = await verifyOtp({ userId, code: fullCode, type: 'EMAIL' });

      toast.success('ანგარიში წარმატებით დადასტურდა!');

      // Sign in with tokens
      const signInResult = await signIn('credentials', {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        userData: JSON.stringify(result.user),
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error('სესიის შექმნა ვერ მოხერხდა');
        return;
      }

      router.push('/');
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('არასწორი კოდი. სცადეთ თავიდან.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!userId || countdown > 0) return;

    setIsResending(true);

    try {
      await resendOtp(userId);
      toast.success('ახალი კოდი გამოგზავნილია!');
      setCountdown(60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('კოდის გაგზავნა ვერ მოხერხდა.');
      }
    } finally {
      setIsResending(false);
    }
  }

  if (!userId) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          ელ-ფოსტის დადასტურება
        </CardTitle>
        <CardDescription className="text-center">
          შეიყვანეთ 6-ნიშნა კოდი რომელიც გამოგზავნილია თქვენს ელ-ფოსტაზე
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
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
                onPaste={handlePaste}
                disabled={isLoading}
                className="w-12 h-12 text-center text-xl font-semibold"
              />
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            დადასტურება
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              ვერ მიიღეთ კოდი?
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
              disabled={isResending || countdown > 0}
              className="text-primary"
            >
              {isResending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {countdown > 0 ? `თავიდან გაგზავნა (${countdown}წ)` : 'თავიდან გაგზავნა'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
