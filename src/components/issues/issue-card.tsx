'use client';

import Link from 'next/link';
import { Issue, Member, Project, issueTypeConfig, priorityConfig, getImsUrl } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, ExternalLink } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  assignee?: Member;
  project?: Project;
  isDragging?: boolean;
}

export function IssueCard({ issue, assignee, project, isDragging }: IssueCardProps) {
  const typeConfig = issueTypeConfig[issue.type];
  const priorityConf = priorityConfig[issue.priority];

  const handleImsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (issue.imsNumber) {
      window.open(getImsUrl(issue.imsNumber), '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Link
      href={`/issues/${issue.id}`}
      className={cn(
        'block rounded-lg border border-border/50 bg-card p-3 transition-all',
        'hover:border-border hover:shadow-md',
        isDragging && 'shadow-lg ring-2 ring-primary/20 rotate-2'
      )}
    >
      {/* Header with type icon and priority */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{typeConfig.icon}</span>
          <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', priorityConf.color)}>
            {priorityConf.labelJa}
          </Badge>
        </div>
        {issue.priority === 'urgent' && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="font-medium text-sm leading-snug mb-2 line-clamp-2">
        {issue.title}
      </h4>

      {/* Project name */}
      {project && (
        <p className="text-xs text-muted-foreground mb-2 truncate">
          {project.name}
        </p>
      )}

      {/* IMS Number */}
      {issue.imsNumber && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImsClick}
          className="h-auto p-1 mb-2 text-[10px] font-mono text-primary hover:text-primary hover:bg-primary/10 gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          {issue.imsNumber}
        </Button>
      )}

      {/* Tags */}
      {issue.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {issue.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {issue.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{issue.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {issue.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(issue.dueDate), 'M/d', { locale: ko })}</span>
            </div>
          )}
        </div>

        {assignee && (
          <Avatar className="h-6 w-6 border border-background">
            <AvatarImage src={assignee.avatar} alt={assignee.name} />
            <AvatarFallback className="text-[10px] bg-muted">
              {assignee.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </Link>
  );
}
