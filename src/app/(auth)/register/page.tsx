import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'რეგისტრაცია | Rideway',
  description: 'შექმენით ახალი ანგარიში Rideway-ზე',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
