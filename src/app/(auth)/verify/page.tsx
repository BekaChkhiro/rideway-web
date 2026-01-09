import { Metadata } from 'next';
import { Suspense } from 'react';
import { OtpForm } from '@/components/auth/otp-form';

export const metadata: Metadata = {
  title: 'ელ-ფოსტის დადასტურება | Rideway',
  description: 'დაადასტურეთ თქვენი ელ-ფოსტა',
};

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-center">იტვირთება...</div>}>
      <OtpForm />
    </Suspense>
  );
}
