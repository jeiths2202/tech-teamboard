'use client';

import Link from 'next/link';
import { useStore } from '@/store/use-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, Users } from 'lucide-react';

export function MemberOverview() {
  const { members, projects, issues } = useStore();

  const memberStats = members.map((member) => {
    const memberProjects = projects.filter((p) => p.memberIds.includes(member.id));
    const memberIssues = issues.filter((i) => i.assigneeId === member.id);
    const completedIssues = memberIssues.filter((i) => i.status === 'completed').length;
    const totalIssues = memberIssues.length;
    const progress = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

    return {
      ...member,
      projectCount: memberProjects.length,
      issueCount: totalIssues,
      openIssues: totalIssues - completedIssues,
      progress,
    };
  });

  return (
    <Card className="border-0 shadow-sm opacity-0 animate-fade-in stagger-3">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-base font-semibold">멤버별 현황</CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/members" className="gap-1 text-muted-foreground hover:text-foreground">
            전체보기 <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {memberStats.map((member, index) => (
          <Link
            key={member.id}
            href={`/members/${member.id}`}
            className={cn(
              'group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50',
              'opacity-0 animate-fade-in'
            )}
            style={{ animationDelay: `${(index + 1) * 80}ms` }}
          >
            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {member.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {member.name}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-normal">
                    {member.projectCount} 프로젝트
                  </Badge>
                  {member.openIssues > 0 && (
                    <Badge variant="outline" className="text-xs font-normal text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                      {member.openIssues} 이슈
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={member.progress} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground w-8">{member.progress}%</span>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
