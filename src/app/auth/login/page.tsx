'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirection automatique vers la nouvelle route
    router.replace('/login');
  }, [router]);

  return null;
}