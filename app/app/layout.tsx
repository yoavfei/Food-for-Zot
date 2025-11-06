'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth'
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { Sidebar } from '@/components/layout/Sidebar';

export default function PrivateAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}