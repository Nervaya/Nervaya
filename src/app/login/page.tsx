'use client';

import { useSearchParams } from 'next/navigation';
import AnimatedAuthForm from '@/components/auth/AnimatedAuthForm/AnimatedAuthForm';
import { validateReturnUrl } from '@/utils/returnUrl';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const returnUrlParam = searchParams.get('returnUrl');
  const returnUrl = validateReturnUrl(returnUrlParam) ?? undefined;

  return <AnimatedAuthForm initialMode="login" returnUrl={returnUrl} />;
}
