'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { IssueForm } from '@/components/issues';
import { useStore } from '@/store/use-store';
import { issueStatusConfig, issueTypeConfig, priorityConfig, getImsUrl } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  FolderKanban,
  Clock,
  Tag,
  ExternalLink,
} from 'lucide-react';

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { issues, members, projects, deleteIssue, updateIssueStatus } = useStore();
  const [editFormOpen, setEditFormOpen] = useState(false);

  const issue = issues.find((i) => i.id === id);

  if (!issue) {
    return (
      <MainLayout title="이슈를 찾을 수 없습니다">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="mb-4 text-muted-foreground">요청한 이슈가 존재하지 않습니다.</p>
          <Button asChild>
            <Link href="/issues">이슈 목록으로</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const project = projects.find((p) => p.id === issue.projectId);
  const assignee = members.find((m) => m.id === issue.assigneeId);
  const reporter = members.find((m) => m.id === issue.reporterId);

  const statusConfig = issueStatusConfig[issue.status];
  const typeConfig = issueTypeConfig[issue.type];
  const priorityConf = priorityConfig[issue.priority];

  const handleDelete = () => {
    if (confirm('이슈를 삭제하시겠습니까?')) {
      deleteIssue(issue.id);
      router.push('/issues');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link href="/issues">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <span className="text-2xl">{typeConfig.icon}</span>
              <h1 className="text-2xl font-bold tracking-tight">{issue.title}</h1>
            </div>

            {project && (
              <Link
                href={`/projects/${project.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <FolderKanban className="h-4 w-4" />
                <span>{project.name}</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setEditFormOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              수정
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className={cn('text-sm', typeConfig.color)}>
            {typeConfig.labelJa}
          </Badge>
          <Badge variant="secondary" className={cn('text-sm', statusConfig.color)}>
            {statusConfig.labelJa}
          </Badge>
          <Badge variant="outline" className={cn('text-sm', priorityConf.color)}>
            {priorityConf.labelJa}
          </Badge>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Description */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">상세 설명</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {issue.description ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {issue.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">설명이 없습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {issue.tags.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Tag className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-base">태그</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {issue.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Status Change */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">상태 변경</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={issue.status}
                  onValueChange={(value) =>
                    updateIssueStatus(issue.id, value as typeof issue.status)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">신규</SelectItem>
                    <SelectItem value="in_progress">진행중</SelectItem>
                    <SelectItem value="review">검토중</SelectItem>
                    <SelectItem value="completed">완료</SelectItem>
                    <SelectItem value="on_hold">보류</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Assignee */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">담당자</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {assignee ? (
                  <Link
                    href={`/members/${assignee.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                  >
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={assignee.avatar} />
                      <AvatarFallback>{assignee.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{assignee.name}</p>
                      <p className="text-xs text-muted-foreground">{assignee.email}</p>
                    </div>
                  </Link>
                ) : (
                  <p className="text-sm text-muted-foreground">담당자가 지정되지 않았습니다.</p>
                )}
              </CardContent>
            </Card>

            {/* Reporter */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">보고자</CardTitle>
              </CardHeader>
              <CardContent>
                {reporter ? (
                  <Link
                    href={`/members/${reporter.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                  >
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={reporter.avatar} />
                      <AvatarFallback>{reporter.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{reporter.name}</p>
                      <p className="text-xs text-muted-foreground">{reporter.email}</p>
                    </div>
                  </Link>
                ) : (
                  <p className="text-sm text-muted-foreground">보고자 정보가 없습니다.</p>
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
                {issue.dueDate && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">마감일</span>
                      <span className="font-medium">
                        {format(new Date(issue.dueDate), 'yyyy년 M월 d일', { locale: ko })}
                      </span>
                    </div>
                    <Separator />
                  </>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">생성일</span>
                  <span>
                    {format(new Date(issue.createdAt), 'yyyy년 M월 d일', { locale: ko })}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">수정일</span>
                  <span>
                    {format(new Date(issue.updatedAt), 'yyyy년 M월 d일', { locale: ko })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* IMS Number */}
            {issue.imsNumber && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-base">IMS 연동</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 font-mono text-primary hover:text-primary hover:bg-primary/5"
                    onClick={() => window.open(getImsUrl(issue.imsNumber!), '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {issue.imsNumber}
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    클릭하면 TmaxSoft IMS 시스템에서 해당 이슈를 확인할 수 있습니다.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Edit Form Modal */}
        <IssueForm
          open={editFormOpen}
          onOpenChange={setEditFormOpen}
          issue={issue}
          mode="edit"
        />
      </div>
    </MainLayout>
  );
}
