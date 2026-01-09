import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'პაროლის აღდგენა | Rideway',
  description: 'აღადგინეთ თქვენი პაროლი',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
