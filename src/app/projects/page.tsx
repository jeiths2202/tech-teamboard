'use client';

import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { ProjectCard, ProjectForm } from '@/components/projects';
import { useStore } from '@/store/use-store';
import { ProjectStatus, Priority, projectStatusConfig, priorityConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from 'lucide-react';

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'dueDate' | 'createdAt' | 'priority';

export default function ProjectsPage() {
  const { projects, members, issues, deleteProject } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<typeof projects[0] | undefined>();

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.customer.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter((p) => p.priority === priorityFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        default:
          return 0;
      }
    });

    return result;
  }, [projects, searchQuery, statusFilter, priorityFilter, sortBy]);

  const getProjectMembers = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return [];
    return members.filter((m) => project.memberIds.includes(m.id));
  };

  const getProjectIssues = (projectId: string) => {
    return issues.filter((i) => i.projectId === projectId);
  };

  const handleEdit = (project: typeof projects[0]) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const handleDelete = (projectId: string) => {
    if (confirm('프로젝트를 삭제하시겠습니까? 관련된 모든 이슈도 함께 삭제됩니다.')) {
      deleteProject(projectId);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingProject(undefined);
  };

  return (
    <MainLayout title="프로젝트" description="전체 프로젝트를 관리하세요">
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="프로젝트 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ProjectStatus | 'all')}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                {Object.entries(projectStatusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.labelJa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value as Priority | 'all')}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="우선순위" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 우선순위</SelectItem>
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.labelJa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortBy)}
            >
              <SelectTrigger className="w-32">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">마감일순</SelectItem>
                <SelectItem value="createdAt">최신순</SelectItem>
                <SelectItem value="name">이름순</SelectItem>
                <SelectItem value="priority">우선순위순</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="h-9">
                <TabsTrigger value="grid" className="px-3">
                  <LayoutGrid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="px-3">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* New Project Button */}
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              새 프로젝트
            </Button>
          </div>
        </div>

        {/* Project Grid/List */}
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'
              : 'space-y-3'
          )}
        >
          {filteredProjects.map((project, index) => {
            const projectMembers = getProjectMembers(project.id);
            const projectIssues = getProjectIssues(project.id);
            const completedIssues = projectIssues.filter(
              (i) => i.status === 'completed'
            ).length;

            return (
              <div
                key={project.id}
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProjectCard
                  project={project}
                  members={projectMembers}
                  issueCount={projectIssues.length}
                  completedIssueCount={completedIssues}
                  onEdit={() => handleEdit(project)}
                  onDelete={() => handleDelete(project.id)}
                />
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">프로젝트가 없습니다</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? '검색 조건에 맞는 프로젝트가 없습니다.'
                : '새 프로젝트를 생성해보세요.'}
            </p>
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              새 프로젝트 생성
            </Button>
          </div>
        )}

        {/* Project Form Modal */}
        <ProjectForm
          open={formOpen}
          onOpenChange={handleFormClose}
          project={editingProject}
          mode={editingProject ? 'edit' : 'create'}
        />
      </div>
    </MainLayout>
  );
}
