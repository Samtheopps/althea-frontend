'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirection automatique vers la nouvelle route
    router.replace('/register');
  }, [router]);

  return null;
}