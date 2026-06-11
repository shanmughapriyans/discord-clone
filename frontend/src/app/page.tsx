'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      router.push('/app');
    } else {
      router.push('/login');
    }
  }, [user, router]);

  return <div className="min-h-screen flex items-center justify-center bg-[#36393f] text-white">Loading...</div>;
}
