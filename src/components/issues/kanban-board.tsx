'use client';

import { useState } from 'react';
import { useStore } from '@/store/use-store';
import { Issue, IssueStatus, issueStatusConfig } from '@/types';
import { IssueCard } from './issue-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusColumns: IssueStatus[] = ['new', 'in_progress', 'review', 'completed'];

interface KanbanBoardProps {
  issues: Issue[];
  projectFilter?: string;
}

export function KanbanBoard({ issues, projectFilter }: KanbanBoardProps) {
  const { members, projects, updateIssueStatus } = useStore();
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<IssueStatus | null>(null);

  const filteredIssues = projectFilter
    ? issues.filter((i) => i.projectId === projectFilter)
    : issues;

  const getIssuesByStatus = (status: IssueStatus) => {
    return filteredIssues
      .filter((issue) => issue.status === status)
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  };

  const handleDragStart = (e: React.DragEvent, issue: Issue) => {
    setDraggedIssue(issue);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIssue(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: IssueStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: IssueStatus) => {
    e.preventDefault();
    if (draggedIssue && draggedIssue.status !== status) {
      updateIssueStatus(draggedIssue.id, status);
    }
    setDraggedIssue(null);
    setDragOverColumn(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {statusColumns.map((status) => {
        const statusIssues = getIssuesByStatus(status);
        const config = issueStatusConfig[status];
        const isDropTarget = dragOverColumn === status && draggedIssue?.status !== status;

        return (
          <div
            key={status}
            className="flex-shrink-0 w-72"
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={cn('font-medium', config.color)}>
                  {config.labelJa}
                </Badge>
                <span className="text-sm text-muted-foreground">{statusIssues.length}</span>
              </div>
            </div>

            {/* Column Content */}
            <div
              className={cn(
                'rounded-xl bg-muted/30 p-2 min-h-[calc(100vh-280px)] transition-colors',
                isDropTarget && 'bg-primary/5 ring-2 ring-primary/20 ring-dashed'
              )}
            >
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-2 p-1">
                  {statusIssues.map((issue, index) => {
                    const assignee = members.find((m) => m.id === issue.assigneeId);
                    const project = projects.find((p) => p.id === issue.projectId);

                    return (
                      <div
                        key={issue.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, issue)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          'cursor-grab active:cursor-grabbing opacity-0 animate-fade-in',
                          draggedIssue?.id === issue.id && 'opacity-50'
                        )}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <IssueCard
                          issue={issue}
                          assignee={assignee}
                          project={project}
                          isDragging={draggedIssue?.id === issue.id}
                        />
                      </div>
                    );
                  })}

                  {statusIssues.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                      이슈 없음
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      })}
    </div>
  );
}
