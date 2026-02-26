'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useApp();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 
        Note: The shared Sidebar component uses react-router-dom hooks.
        In a pure Next.js environment, you would need a separate Sidebar component 
        that uses next/link and next/navigation.
      */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}