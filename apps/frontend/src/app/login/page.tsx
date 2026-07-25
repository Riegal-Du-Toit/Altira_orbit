'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home } from 'lucide-react';
import { OrbitLoginCard } from '@/components/auth/orbit-login-card';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.href);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <div className="w-full max-w-xl">
        <div className="mb-4 flex justify-center">
          <Button variant="outline" onClick={() => router.push('/')} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Homepage
          </Button>
        </div>

        <OrbitLoginCard />
      </div>
    </div>
  );
}
