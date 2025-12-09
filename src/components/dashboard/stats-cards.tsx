'use client';

import { useStore } from '@/store/use-store';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  FolderKanban,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color: string;
  delay: number;
}

function StatCard({ title, value, subtitle, icon, trend, color, delay }: StatCardProps) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-0 bg-card shadow-sm transition-all duration-300 card-hover opacity-0 animate-fade-in'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient overlay */}
      <div
        className={cn(
          'absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.06]',
          color
        )}
      />

      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{value}</span>
              {trend && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                  )}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>

          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
              color
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const { projects, issues } = useStore();

  const stats = [
    {
      title: '전체 프로젝트',
      value: projects.length,
      subtitle: '총 등록된 프로젝트',
      icon: <FolderKanban className="h-6 w-6 text-indigo-600" />,
      color: 'bg-indigo-500',
      delay: 0,
    },
    {
      title: '진행중',
      value: projects.filter((p) => p.status === 'in_progress').length,
      subtitle: '현재 진행중인 프로젝트',
      icon: <PlayCircle className="h-6 w-6 text-blue-600" />,
      trend: { value: 12, isPositive: true },
      color: 'bg-blue-500',
      delay: 50,
    },
    {
      title: '완료',
      value: projects.filter((p) => p.status === 'completed').length,
      subtitle: '이번 달 완료된 프로젝트',
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
      color: 'bg-emerald-500',
      delay: 100,
    },
    {
      title: '미해결 이슈',
      value: issues.filter((i) => i.status !== 'completed').length,
      subtitle: '처리가 필요한 이슈',
      icon: <AlertCircle className="h-6 w-6 text-amber-600" />,
      color: 'bg-amber-500',
      delay: 150,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
