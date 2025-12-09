'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { ProjectForm } from '@/components/projects';
import { useStore } from '@/store/use-store';
import { projectStatusConfig, priorityConfig, issueStatusConfig, issueTypeConfig } from '@/types';
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
  Edit,
  Trash2,
  Calendar,
  Building2,
  Users,
  ListTodo,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { projects, members, issues, deleteProject } = useStore();
  const [editFormOpen, setEditFormOpen] = useState(false);

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <MainLayout title="프로젝트를 찾을 수 없습니다">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="mb-4 text-muted-foreground">요청한 프로젝트가 존재하지 않습니다.</p>
          <Button asChild>
            <Link href="/projects">프로젝트 목록으로</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const projectMembers = members.filter((m) => project.memberIds.includes(m.id));
  const projectIssues = issues.filter((i) => i.projectId === project.id);
  const completedIssues = projectIssues.filter((i) => i.status === 'completed');
  const progress = projectIssues.length > 0
    ? Math.round((completedIssues.length / projectIssues.length) * 100)
    : 0;

  const statusConfig = projectStatusConfig[project.status];
  const priorityConf = priorityConfig[project.priority];

  const handleDelete = () => {
    if (confirm('프로젝트를 삭제하시겠습니까? 관련된 모든 이슈도 함께 삭제됩니다.')) {
      deleteProject(project.id);
      router.push('/projects');
    }
  };

  const issuesByStatus = {
    new: projectIssues.filter((i) => i.status === 'new'),
    in_progress: projectIssues.filter((i) => i.status === 'in_progress'),
    review: projectIssues.filter((i) => i.status === 'review'),
    completed: projectIssues.filter((i) => i.status === 'completed'),
    on_hold: projectIssues.filter((i) => i.status === 'on_hold'),
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link href="/projects">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              {project.priority === 'urgent' && (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                <span>{project.customer}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(project.startDate), 'yyyy.MM.dd', { locale: ko })} -{' '}
                  {format(new Date(project.dueDate), 'yyyy.MM.dd', { locale: ko })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setEditFormOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              수정
            </Button>
            <Button variant="outline" onClick={handleDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className={cn('text-sm', statusConfig.color)}>
            {statusConfig.labelJa}
          </Badge>
          <Badge variant="outline" className={cn('text-sm', priorityConf.color)}>
            {priorityConf.labelJa}
          </Badge>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">프로젝트 설명</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {project.description || '설명이 없습니다.'}
                </p>
              </CardContent>
            </Card>

            {/* Issues */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <ListTodo className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">이슈 목록</CardTitle>
                </div>
                <Button size="sm" asChild>
                  <Link href={`/issues?project=${project.id}`}>전체보기</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">전체 ({projectIssues.length})</TabsTrigger>
                    <TabsTrigger value="in_progress">진행중 ({issuesByStatus.in_progress.length})</TabsTrigger>
                    <TabsTrigger value="new">신규 ({issuesByStatus.new.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-2">
                    {projectIssues.slice(0, 5).map((issue) => {
                      const assignee = members.find((m) => m.id === issue.assigneeId);
                      const typeConfig = issueTypeConfig[issue.type];
                      const issueStatusConf = issueStatusConfig[issue.status];

                      return (
                        <Link
                          key={issue.id}
                          href={`/issues/${issue.id}`}
                          className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                        >
                          <span className="text-lg">{typeConfig.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{issue.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={cn('text-[10px] px-1.5', issueStatusConf.color)}>
                                {issueStatusConf.labelJa}
                              </Badge>
                            </div>
                          </div>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={assignee?.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {assignee?.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                      );
                    })}

                    {projectIssues.length === 0 && (
                      <div className="py-8 text-center text-muted-foreground">
                        <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">등록된 이슈가 없습니다</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="in_progress" className="space-y-2">
                    {issuesByStatus.in_progress.map((issue) => {
                      const assignee = members.find((m) => m.id === issue.assigneeId);
                      const typeConfig = issueTypeConfig[issue.type];

                      return (
                        <Link
                          key={issue.id}
                          href={`/issues/${issue.id}`}
                          className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                        >
                          <span className="text-lg">{typeConfig.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{issue.title}</p>
                          </div>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={assignee?.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {assignee?.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                      );
                    })}
                    {issuesByStatus.in_progress.length === 0 && (
                      <p className="py-4 text-center text-sm text-muted-foreground">진행중인 이슈가 없습니다</p>
                    )}
                  </TabsContent>

                  <TabsContent value="new" className="space-y-2">
                    {issuesByStatus.new.map((issue) => {
                      const assignee = members.find((m) => m.id === issue.assigneeId);
                      const typeConfig = issueTypeConfig[issue.type];

                      return (
                        <Link
                          key={issue.id}
                          href={`/issues/${issue.id}`}
                          className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                        >
                          <span className="text-lg">{typeConfig.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{issue.title}</p>
                          </div>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={assignee?.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {assignee?.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                      );
                    })}
                    {issuesByStatus.new.length === 0 && (
                      <p className="py-4 text-center text-sm text-muted-foreground">신규 이슈가 없습니다</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Progress */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">진행률</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Progress value={progress} className="h-2 flex-1" />
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{completedIssues.length}</p>
                    <p className="text-xs text-muted-foreground">완료</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-2xl font-bold">{projectIssues.length - completedIssues.length}</p>
                    <p className="text-xs text-muted-foreground">진행중</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">담당 멤버</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {projectMembers.map((member) => {
                  const memberIssues = projectIssues.filter((i) => i.assigneeId === member.id);
                  const memberCompleted = memberIssues.filter((i) => i.status === 'completed').length;

                  return (
                    <Link
                      key={member.id}
                      href={`/members/${member.id}`}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                    >
                      <Avatar className="h-9 w-9 border">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-sm">{member.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {memberIssues.length > 0
                            ? `${memberCompleted}/${memberIssues.length} 이슈 완료`
                            : '배정된 이슈 없음'}
                        </p>
                      </div>
                    </Link>
                  );
                })}

                {projectMembers.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">배정된 멤버가 없습니다</p>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">일정</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">시작일</span>
                  <span>{format(new Date(project.startDate), 'yyyy년 M월 d일', { locale: ko })}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">마감일</span>
                  <span className="font-medium">{format(new Date(project.dueDate), 'yyyy년 M월 d일', { locale: ko })}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">생성일</span>
                  <span>{format(new Date(project.createdAt), 'yyyy년 M월 d일', { locale: ko })}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Form Modal */}
        <ProjectForm
          open={editFormOpen}
          onOpenChange={setEditFormOpen}
          project={project}
          mode="edit"
        />
      </div>
    </MainLayout>
  );
}
