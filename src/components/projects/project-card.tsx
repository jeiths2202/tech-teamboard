'use client';

import Link from 'next/link';
import { Project, Member, projectStatusConfig, priorityConfig } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format, differenceInDays, isPast } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Building2,
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  members: Member[];
  issueCount: number;
  completedIssueCount: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ProjectCard({
  project,
  members,
  issueCount,
  completedIssueCount,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const progress = issueCount > 0 ? Math.round((completedIssueCount / issueCount) * 100) : 0;
  const statusConfig = projectStatusConfig[project.status];
  const priorityConf = priorityConfig[project.priority];

  const getDueDateStatus = () => {
    const days = differenceInDays(new Date(project.dueDate), new Date());
    if (isPast(new Date(project.dueDate))) return { label: '마감 초과', urgent: true, days: 0 };
    if (days <= 3) return { label: `D-${days}`, urgent: true, days };
    if (days <= 7) return { label: `D-${days}`, urgent: false, days };
    return {
      label: format(new Date(project.dueDate), 'M월 d일', { locale: ko }),
      urgent: false,
      days,
    };
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <Card className="group relative overflow-hidden border border-border/50 bg-card transition-all duration-300 hover:border-border hover:shadow-lg card-hover">
      {/* Priority indicator */}
      {project.priority === 'urgent' && (
        <div className="absolute left-0 top-0 h-full w-1 bg-destructive" />
      )}

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              {project.priority === 'urgent' && (
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              )}
              <Link
                href={`/projects/${project.id}`}
                className="font-semibold text-base truncate hover:text-primary transition-colors"
              >
                {project.name}
              </Link>
            </div>

            {/* Customer */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
              <Building2 className="h-3.5 w-3.5" />
              <span className="truncate">{project.customer}</span>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {project.description}
            </p>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Badge variant="secondary" className={cn('text-xs', statusConfig.color)}>
                {statusConfig.labelJa}
              </Badge>
              <Badge variant="outline" className={cn('text-xs', priorityConf.color)}>
                {priorityConf.labelJa}
              </Badge>
              {issueCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  이슈 {completedIssueCount}/{issueCount}
                </Badge>
              )}
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 mb-4">
              <Progress value={progress} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground w-8">{progress}%</span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              {/* Members */}
              <div className="flex -space-x-2">
                {members.slice(0, 4).map((member) => (
                  <Avatar
                    key={member.id}
                    className="h-7 w-7 border-2 border-background ring-0"
                  >
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-[10px] bg-muted">
                      {member.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {members.length > 4 && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium">
                    +{members.length - 4}
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div
                className={cn(
                  'flex items-center gap-1.5 text-xs',
                  dueDateStatus.urgent ? 'text-destructive font-medium' : 'text-muted-foreground'
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>{dueDateStatus.label}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  상세보기
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
