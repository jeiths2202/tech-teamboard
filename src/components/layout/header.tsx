'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/use-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  Plus,
  LogOut,
  User,
  Settings,
} from 'lucide-react';

interface HeaderProps {
  title?: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const router = useRouter();
  const { sidebarOpen, toggleSidebar, members, currentMemberId, activities, logout } = useStore();
  const [isDark, setIsDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const currentUser = members.find((m) => m.id === currentMemberId);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const recentActivities = activities.slice(0, 5);
  const unreadCount = 3;

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-md transition-all duration-300',
        sidebarOpen ? 'ml-64' : 'ml-[72px]'
      )}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {title && (
          <div className="animate-fade-in">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="검색..."
            className="w-64 bg-muted/50 pl-9 focus:bg-background"
          />
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(true)}>
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>알림</span>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary hover:bg-transparent">
                모두 읽음 표시
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {recentActivities.map((activity) => {
              const member = members.find((m) => m.id === activity.memberId);
              return (
                <DropdownMenuItem
                  key={activity.id}
                  className="flex items-start gap-3 p-3 cursor-pointer"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member?.avatar} />
                    <AvatarFallback className="text-xs">
                      {member?.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm leading-tight">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">
              모든 알림 보기
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* New Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="hidden gap-2 sm:flex">
              <Plus className="h-4 w-4" />
              <span>새로 만들기</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새로 만들기</DialogTitle>
              <DialogDescription>
                프로젝트 또는 이슈를 생성합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button variant="outline" className="h-24 flex-col gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <span>프로젝트</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Plus className="h-5 w-5 text-accent" />
                </div>
                <span>이슈</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                <AvatarFallback className="text-sm">
                  {currentUser?.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>프로필</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>설정</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>로그아웃</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
