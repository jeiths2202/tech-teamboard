'use client';

import { use } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { useStore } from '@/store/use-store';
import { projectStatusConfig, issueStatusConfig, issueTypeConfig, priorityConfig } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  ArrowLeft,
  Mail,
  Calendar,
  FolderKanban,
  ListTodo,
  Shield,
  User,
  Building2,
} from 'lucide-react';

export default function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { members, projects, issues } = useStore();

  const member = members.find((m) => m.id === id);

  if (!member) {
    return (
      <MainLayout title="멤버를 찾을 수 없습니다">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="mb-4 text-muted-foreground">요청한 멤버가 존재하지 않습니다.</p>
          <Button asChild>
            <Link href="/members">멤버 목록으로</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const memberProjects = projects.filter((p) => p.memberIds.includes(member.id));
  const memberIssues = issues.filter((i) => i.assigneeId === member.id);
  const completedIssues = memberIssues.filter((i) => i.status === 'completed');
  const openIssues = memberIssues.filter((i) => i.status !== 'completed');
  const progress = memberIssues.length > 0
    ? Math.round((completedIssues.length / memberIssues.length) * 100)
    : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-6">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 mt-2">
            <Link href="/members">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="flex items-start gap-6 flex-1">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {member.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold tracking-tight">{member.name}</h1>
                <Badge
                  variant="outline"
                  className={cn(
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
              {member.nameJa && (
                <p className="text-muted-foreground mb-2">{member.nameJa}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  <span>{member.email}</span>
                </div>
                {member.department && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    <span>{member.department}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FolderKanban className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold">{memberProjects.length}</p>
              <p className="text-xs text-muted-foreground">담당 프로젝트</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <ListTodo className="h-5 w-5 text-accent" />
                </div>
              </div>
              <p className="text-2xl font-bold">{memberIssues.length}</p>
              <p className="text-xs text-muted-foreground">전체 이슈</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                  <ListTodo className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-2xl font-bold">{openIssues.length}</p>
              <p className="text-xs text-muted-foreground">미해결 이슈</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                  <ListTodo className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-2xl font-bold">{completedIssues.length}</p>
              <p className="text-xs text-muted-foreground">완료 이슈</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Projects & Issues */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="projects">
              <TabsList>
                <TabsTrigger value="projects">프로젝트 ({memberProjects.length})</TabsTrigger>
                <TabsTrigger value="issues">이슈 ({memberIssues.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="projects" className="mt-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    {memberProjects.map((project) => {
                      const statusConfig = projectStatusConfig[project.status];
                      const priorityConf = priorityConfig[project.priority];
                      const projectIssues = issues.filter((i) => i.projectId === project.id);
                      const projectMemberIssues = projectIssues.filter((i) => i.assigneeId === member.id);

                      return (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate hover:text-primary transition-colors">
                              {project.name}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {project.customer}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className={cn('text-[10px]', statusConfig.color)}>
                                {statusConfig.labelJa}
                              </Badge>
                              <Badge variant="outline" className={cn('text-[10px]', priorityConf.color)}>
                                {priorityConf.labelJa}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{projectMemberIssues.length}</p>
                            <p className="text-xs text-muted-foreground">담당 이슈</p>
                          </div>
                        </Link>
                      );
                    })}

                    {memberProjects.length === 0 && (
                      <div className="py-8 text-center text-muted-foreground">
                        <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">담당 프로젝트가 없습니다</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="issues" className="mt-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    {memberIssues.slice(0, 10).map((issue) => {
                      const project = projects.find((p) => p.id === issue.projectId);
                      const typeConfig = issueTypeConfig[issue.type];
                      const statusConfig = issueStatusConfig[issue.status];
                      const priorityConf = priorityConfig[issue.priority];

                      return (
                        <Link
                          key={issue.id}
                          href={`/issues/${issue.id}`}
                          className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                        >
                          <span className="text-base">{typeConfig.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{issue.title}</h4>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {project?.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn('text-[10px]', statusConfig.color)}>
                              {statusConfig.labelJa}
                            </Badge>
                            <Badge variant="outline" className={cn('text-[10px]', priorityConf.color)}>
                              {priorityConf.labelJa}
                            </Badge>
                          </div>
                        </Link>
                      );
                    })}

                    {memberIssues.length === 0 && (
                      <div className="py-8 text-center text-muted-foreground">
                        <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">담당 이슈가 없습니다</p>
                      </div>
                    )}

                    {memberIssues.length > 10 && (
                      <div className="pt-2 text-center">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/issues?assignee=${member.id}`}>
                            모든 이슈 보기 ({memberIssues.length})
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Progress & Info */}
          <div className="space-y-6">
            {/* Progress */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">이슈 진행률</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Progress value={progress} className="h-3 flex-1" />
                  <span className="text-lg font-bold">{progress}%</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">완료</span>
                    <span className="font-medium text-emerald-600">{completedIssues.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">진행중</span>
                    <span className="font-medium text-blue-600">
                      {memberIssues.filter((i) => i.status === 'in_progress').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">신규</span>
                    <span className="font-medium">
                      {memberIssues.filter((i) => i.status === 'new').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">보류</span>
                    <span className="font-medium text-rose-600">
                      {memberIssues.filter((i) => i.status === 'on_hold').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Member Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">멤버 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">이메일</span>
                  <span className="truncate ml-4">{member.email}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">역할</span>
                  <span>{member.role === 'admin' ? '관리자' : '멤버'}</span>
                </div>
                {member.department && (
                  <>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">부서</span>
                      <span>{member.department}</span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">가입일</span>
                  <span>
                    {format(new Date(member.createdAt), 'yyyy년 M월 d일', { locale: ko })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
