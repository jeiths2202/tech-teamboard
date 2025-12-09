'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/use-store';
import { MainLayout } from '@/components/layout';
import {
  StatsCards,
  MemberOverview,
  ProjectList,
  RecentIssues,
  ActivityFeed,
} from '@/components/dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { isLoggedIn } = useStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <MainLayout
      title="대시보드"
      description="프로젝트 및 이슈 현황을 한눈에 확인하세요"
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Projects */}
          <div className="lg:col-span-2 space-y-6">
            <ProjectList />
            <RecentIssues />
          </div>

          {/* Right Column - Members & Activity */}
          <div className="space-y-6">
            <MemberOverview />
            <ActivityFeed />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
