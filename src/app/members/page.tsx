'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { useStore } from '@/store/use-store';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { FolderKanban, ListTodo, Mail, Shield, User } from 'lucide-react';

export default function MembersPage() {
  const { members, projects, issues } = useStore();

  const memberStats = members.map((member) => {
    const memberProjects = projects.filter((p) => p.memberIds.includes(member.id));
    const memberIssues = issues.filter((i) => i.assigneeId === member.id);
    const completedIssues = memberIssues.filter((i) => i.status === 'completed').length;
    const openIssues = memberIssues.filter((i) => i.status !== 'completed').length;
    const progress = memberIssues.length > 0
      ? Math.round((completedIssues / memberIssues.length) * 100)
      : 0;

    return {
      ...member,
      projectCount: memberProjects.length,
      totalIssues: memberIssues.length,
      completedIssues,
      openIssues,
      progress,
    };
  });

  return (
    <MainLayout title="멤버" description="팀 멤버를 관리하세요">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {memberStats.map((member, index) => (
          <Link
            key={member.id}
            href={`/members/${member.id}`}
            className={cn(
              'group opacity-0 animate-fade-in'
            )}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <Card className="border border-border/50 bg-card transition-all duration-300 hover:border-border hover:shadow-lg card-hover h-full">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-14 w-14 border-2 border-background shadow-md">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {member.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    {member.nameJa && (
                      <p className="text-sm text-muted-foreground truncate">
                        {member.nameJa}
                      </p>
                    )}
                    <Badge
                      variant="outline"
                      className={cn(
                        'mt-1.5 text-xs',
                        member.role === 'admin'
                          ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400'
                          : ''
                      )}
                    >
                      {member.role === 'admin' ? (
                        <>
                          <Shield className="mr-1 h-3 w-3" />
                          관리자
                        </>
                      ) : (
                        <>
                          <User className="mr-1 h-3 w-3" />
                          멤버
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{member.email}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FolderKanban className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-lg font-bold">{member.projectCount}</p>
                    <p className="text-xs text-muted-foreground">프로젝트</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <ListTodo className="h-4 w-4 text-accent" />
                    </div>
                    <p className="text-lg font-bold">{member.openIssues}</p>
                    <p className="text-xs text-muted-foreground">미해결 이슈</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">이슈 완료율</span>
                    <span className="font-medium">{member.progress}%</span>
                  </div>
                  <Progress value={member.progress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground text-right">
                    {member.completedIssues}/{member.totalIssues} 완료
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {members.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium">등록된 멤버가 없습니다</h3>
          <p className="text-sm text-muted-foreground">
            멤버를 추가하여 팀을 구성하세요.
          </p>
        </div>
      )}
    </MainLayout>
  );
}
