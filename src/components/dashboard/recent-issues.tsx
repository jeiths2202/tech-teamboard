'use client';

import Link from 'next/link';
import { useStore } from '@/store/use-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { issueStatusConfig, priorityConfig, issueTypeConfig } from '@/types';
import { ArrowRight, ListTodo, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export function RecentIssues() {
  const { issues, members, projects } = useStore();

  // Get recent open issues sorted by creation date
  const recentIssues = [...issues]
    .filter((i) => i.status !== 'completed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <Card className="border-0 shadow-sm opacity-0 animate-fade-in stagger-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
            <ListTodo className="h-5 w-5 text-accent" />
          </div>
          <CardTitle className="text-base font-semibold">최근 이슈</CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/issues" className="gap-1 text-muted-foreground hover:text-foreground">
            전체보기 <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 pt-4">
        {recentIssues.map((issue, index) => {
          const assignee = members.find((m) => m.id === issue.assigneeId);
          const project = projects.find((p) => p.id === issue.projectId);
          const statusConfig = issueStatusConfig[issue.status];
          const typeConfig = issueTypeConfig[issue.type];
          const priorityConf = priorityConfig[issue.priority];

          return (
            <Link
              key={issue.id}
              href={`/issues/${issue.id}`}
              className={cn(
                'group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50',
                'opacity-0 animate-fade-in'
              )}
              style={{ animationDelay: `${(index + 1) * 50}ms` }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm">
                {typeConfig.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {issue.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{project?.name}</span>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(issue.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', priorityConf.color)}>
                  {priorityConf.labelJa}
                </Badge>
                <Avatar className="h-6 w-6 border border-background">
                  <AvatarImage src={assignee?.avatar} alt={assignee?.name} />
                  <AvatarFallback className="text-[10px] bg-muted">
                    {assignee?.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Link>
          );
        })}

        {recentIssues.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">처리할 이슈가 없습니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
