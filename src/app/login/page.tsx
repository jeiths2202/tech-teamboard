'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/use-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Sparkles, Shield, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { members, setCurrentMember, initialize, isInitialized, isLoading: storeLoading } = useStore();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLogin = async () => {
    if (!selectedMemberId) return;

    setIsLoading(true);

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    setCurrentMember(selectedMemberId);
    router.push('/');
  };

  // Show loading while initializing
  if (!isInitialized || storeLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <Card className="relative w-full max-w-lg border-0 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">TeamBoard</CardTitle>
          <CardDescription className="text-base">
            일본법인 기술지원팀 프로젝트 관리 시스템
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center mb-4">
              로그인할 멤버를 선택하세요
            </p>

            <div className="grid gap-2">
              {members.map((member, index) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={cn(
                    'flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-200 border-2',
                    'opacity-0 animate-fade-in',
                    selectedMemberId === member.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-transparent bg-muted/50 hover:bg-muted hover:border-border'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Avatar className="h-12 w-12 border-2 border-background shadow">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {member.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{member.name}</span>
                      {member.role === 'admin' && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-200 bg-amber-50 text-amber-700">
                          <Shield className="mr-0.5 h-2.5 w-2.5" />
                          관리자
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                  </div>

                  <div className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
                    selectedMemberId === member.id
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/30'
                  )}>
                    {selectedMemberId === member.id && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <Button
              className="w-full mt-6 h-12 text-base gap-2"
              disabled={!selectedMemberId || isLoading}
              onClick={handleLogin}
            >
              {isLoading ? (
                '로그인 중...'
              ) : (
                <>
                  로그인
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
