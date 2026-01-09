import { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'ახალი პაროლი | Rideway',
  description: 'დააყენეთ ახალი პაროლი',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center">იტვირთება...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
