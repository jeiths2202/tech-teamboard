'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { KanbanBoard, IssueForm } from '@/components/issues';
import { useStore } from '@/store/use-store';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Filter } from 'lucide-react';

function IssuesContent() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get('project');

  const { issues, projects, members } = useStore();
  const [projectFilter, setProjectFilter] = useState<string>(projectIdParam || 'all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);

  const filteredIssues = issues.filter((issue) => {
    if (projectFilter !== 'all' && issue.projectId !== projectFilter) return false;
    if (assigneeFilter !== 'all' && issue.assigneeId !== assigneeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>필터:</span>
          </div>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="프로젝트" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 프로젝트</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="담당자" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 담당자</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          새 이슈
        </Button>
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        issues={filteredIssues}
        projectFilter={projectFilter !== 'all' ? projectFilter : undefined}
      />

      {/* Issue Form Modal */}
      <IssueForm
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="create"
        defaultProjectId={projectFilter !== 'all' ? projectFilter : undefined}
      />
    </div>
  );
}

export default function IssuesPage() {
  return (
    <MainLayout title="이슈 관리" description="칸반 보드로 이슈를 관리하세요">
      <Suspense fallback={<div className="flex items-center justify-center py-12">로딩 중...</div>}>
        <IssuesContent />
      </Suspense>
    </MainLayout>
  );
}
