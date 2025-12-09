'use client';

import Link from 'next/link';
import { useStore } from '@/store/use-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { projectStatusConfig, priorityConfig } from '@/types';
import { ArrowRight, FolderKanban, Calendar, AlertTriangle } from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { ko } from 'date-fns/locale';

export function ProjectList() {
  const { projects, members, issues } = useStore();

  // Sort by urgency: urgent first, then by due date
  const sortedProjects = [...projects]
    .filter((p) => p.status !== 'completed')
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);

  const getProjectProgress = (projectId: string) => {
    const projectIssues = issues.filter((i) => i.projectId === projectId);
    if (projectIssues.length === 0) return 0;
    const completed = projectIssues.filter((i) => i.status === 'completed').length;
    return Math.round((completed / projectIssues.length) * 100);
  };

  const getDueDateStatus = (dueDate: Date) => {
    const days = differenceInDays(new Date(dueDate), new Date());
    if (isPast(new Date(dueDate))) return { label: '마감 초과', urgent: true };
    if (days <= 3) return { label: `D-${days}`, urgent: true };
    if (days <= 7) return { label: `D-${days}`, urgent: false };
    return { label: format(new Date(dueDate), 'M월 d일', { locale: ko }), urgent: false };
  };

  return (
    <Card className="border-0 shadow-sm opacity-0 animate-fade-in stagger-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <FolderKanban className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-base font-semibold">진행중인 프로젝트</CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects" className="gap-1 text-muted-foreground hover:text-foreground">
            전체보기 <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {sortedProjects.map((project, index) => {
          const projectMembers = members.filter((m) => project.memberIds.includes(m.id));
          const progress = getProjectProgress(project.id);
          const dueDateStatus = getDueDateStatus(project.dueDate);
          const statusConfig = projectStatusConfig[project.status];
          const priorityConf = priorityConfig[project.priority];

          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className={cn(
                'group block rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-border hover:shadow-md',
                'opacity-0 animate-fade-in'
              )}
              style={{ animationDelay: `${(index + 1) * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {project.priority === 'urgent' && (
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                    {project.customer}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={cn('text-xs', statusConfig.color)}>
                      {statusConfig.labelJa}
                    </Badge>
                    <Badge variant="outline" className={cn('text-xs', priorityConf.color)}>
                      {priorityConf.labelJa}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex -space-x-2">
                    {projectMembers.slice(0, 3).map((member) => (
                      <Avatar key={member.id} className="h-7 w-7 border-2 border-background">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="text-[10px] bg-muted">
                          {member.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {projectMembers.length > 3 && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium">
                        +{projectMembers.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <Calendar className="h-3 w-3" />
                    <span className={cn(dueDateStatus.urgent && 'text-destructive font-medium')}>
                      {dueDateStatus.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Progress value={progress} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground w-8">{progress}%</span>
              </div>
            </Link>
          );
        })}

        {sortedProjects.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">진행중인 프로젝트가 없습니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
