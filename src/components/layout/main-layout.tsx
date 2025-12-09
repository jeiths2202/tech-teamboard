'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useStore } from '@/store/use-store';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function MainLayout({ children, title, description }: MainLayoutProps) {
  const { sidebarOpen } = useStore();

  return (
    <div className="min-h-screen bg-background grain-overlay">
      <Sidebar />
      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-[72px]'
        )}
      >
        <Header title={title} description={description} />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
