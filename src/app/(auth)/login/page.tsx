import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'შესვლა | Rideway',
  description: 'შედით თქვენს Rideway ანგარიშზე',
};

export default function LoginPage() {
  return <LoginForm />;
}
