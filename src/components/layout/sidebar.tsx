'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/use-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const navigation = [
  { name: '대시보드', nameJa: 'ダッシュボード', href: '/', icon: LayoutDashboard },
  { name: '프로젝트', nameJa: 'プロジェクト', href: '/projects', icon: FolderKanban },
  { name: '이슈', nameJa: 'イシュー', href: '/issues', icon: ListTodo },
  { name: '멤버', nameJa: 'メンバー', href: '/members', icon: Users },
];

const bottomNavigation = [
  { name: '설정', nameJa: '設定', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, members, currentMemberId } = useStore();
  const currentUser = members.find((m) => m.id === currentMemberId);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r border-border/50 bg-sidebar transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-64' : 'w-[72px]'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              {sidebarOpen && (
                <span className="text-lg font-semibold tracking-tight animate-fade-in">
                  TeamBoard
                </span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Separator className="opacity-50" />

          {/* Main Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href));

                const NavLink = (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      'opacity-0 animate-fade-in',
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      !sidebarOpen && 'justify-center px-2'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    {sidebarOpen && <span>{item.name}</span>}
                  </Link>
                );

                return sidebarOpen ? (
                  NavLink
                ) : (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Bottom Navigation */}
          <div className="px-3 pb-2">
            <nav className="space-y-1">
              {bottomNavigation.map((item) => {
                const isActive = pathname === item.href;

                const NavLink = (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      !sidebarOpen && 'justify-center px-2'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 shrink-0',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    {sidebarOpen && <span>{item.name}</span>}
                  </Link>
                );

                return sidebarOpen ? (
                  NavLink
                ) : (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </div>

          <Separator className="opacity-50" />

          {/* User Profile */}
          <div className="p-3">
            <div
              className={cn(
                'flex items-center gap-3 rounded-lg bg-muted/50 p-2.5 transition-all',
                !sidebarOpen && 'justify-center p-2'
              )}
            >
              <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {currentUser?.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {sidebarOpen && currentUser && (
                <div className="flex-1 overflow-hidden animate-fade-in">
                  <p className="truncate text-sm font-medium">{currentUser.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {currentUser.role === 'admin' ? '관리자' : '멤버'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
