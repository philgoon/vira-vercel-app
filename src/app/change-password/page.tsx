// [R-CLERK-5]: Password management handled by Clerk - redirect to dashboard
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
