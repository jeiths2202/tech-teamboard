'use client';

import { useStore } from '@/store/use-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Activity,
  FolderPlus,
  FileText,
  RefreshCw,
  MessageSquare,
  UserPlus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const activityIcons = {
  project_created: FolderPlus,
  issue_created: FileText,
  status_changed: RefreshCw,
  comment_added: MessageSquare,
  member_assigned: UserPlus,
};

const activityColors = {
  project_created: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400',
  issue_created: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  status_changed: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400',
  comment_added: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  member_assigned: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400',
};

export function ActivityFeed() {
  const { activities, members } = useStore();

  return (
    <Card className="border-0 shadow-sm opacity-0 animate-fade-in stagger-5">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-base font-semibold">최근 활동</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="h-[320px] pr-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-6">
              {activities.slice(0, 10).map((activity, index) => {
                const member = members.find((m) => m.id === activity.memberId);
                const Icon = activityIcons[activity.type];
                const colorClass = activityColors[activity.type];

                return (
                  <div
                    key={activity.id}
                    className={cn(
                      'relative flex gap-4 pl-10 opacity-0 animate-fade-in'
                    )}
                    style={{ animationDelay: `${(index + 1) * 80}ms` }}
                  >
                    {/* Icon indicator */}
                    <div
                      className={cn(
                        'absolute left-0 flex h-8 w-8 items-center justify-center rounded-full',
                        colorClass
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarImage src={member?.avatar} alt={member?.name} />
                          <AvatarFallback className="text-[10px]">
                            {member?.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-relaxed">
                            <span className="font-medium">{member?.name}</span>
                            <span className="text-muted-foreground">님이 </span>
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {activity.description}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground/70">
                            {formatDistanceToNow(new Date(activity.createdAt), {
                              addSuffix: true,
                              locale: ko,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
