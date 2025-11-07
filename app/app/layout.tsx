'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth'
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { Sidebar } from '@/components/layout/Sidebar';
import { useEffect } from 'react';

export default function PrivateAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}