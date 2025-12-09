'use client';

import { useState } from 'react';
import { useStore } from '@/store/use-store';
import { Project, ProjectStatus, Priority } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, X } from 'lucide-react';

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  mode: 'create' | 'edit';
}

export function ProjectForm({ open, onOpenChange, project, mode }: ProjectFormProps) {
  const { members, addProject, updateProject } = useStore();

  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    customer: project?.customer || '',
    status: project?.status || 'backlog' as ProjectStatus,
    priority: project?.priority || 'medium' as Priority,
    startDate: project?.startDate || new Date(),
    dueDate: project?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    memberIds: project?.memberIds || [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'create') {
      addProject(formData);
    } else if (project) {
      updateProject(project.id, formData);
    }

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      customer: '',
      status: 'backlog',
      priority: 'medium',
      startDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      memberIds: [],
    });
  };

  const toggleMember = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter((id) => id !== memberId)
        : [...prev.memberIds, memberId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? '새 프로젝트 생성' : '프로젝트 수정'}
          </DialogTitle>
          <DialogDescription>
            프로젝트의 기본 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">프로젝트명 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="프로젝트 이름을 입력하세요"
              required
            />
          </div>

          {/* Customer */}
          <div className="space-y-2">
            <Label htmlFor="customer">고객사 *</Label>
            <Input
              id="customer"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              placeholder="고객사명을 입력하세요"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="프로젝트에 대한 설명을 입력하세요"
              rows={3}
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>상태</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ProjectStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">대기</SelectItem>
                  <SelectItem value="in_progress">진행중</SelectItem>
                  <SelectItem value="review">검토중</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="on_hold">보류</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>우선순위</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Priority) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">긴급</SelectItem>
                  <SelectItem value="high">높음</SelectItem>
                  <SelectItem value="medium">중간</SelectItem>
                  <SelectItem value="low">낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>시작일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate
                      ? format(formData.startDate, 'PPP', { locale: ko })
                      : '날짜 선택'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, startDate: date })
                    }
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>마감일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate
                      ? format(formData.dueDate, 'PPP', { locale: ko })
                      : '날짜 선택'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, dueDate: date })
                    }
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Members */}
          <div className="space-y-2">
            <Label>담당자</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.memberIds.map((memberId) => {
                const member = members.find((m) => m.id === memberId);
                if (!member) return null;
                return (
                  <Badge
                    key={member.id}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-[8px]">
                        {member.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {member.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => toggleMember(member.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg border bg-muted/30">
              {members.map((member) => (
                <Button
                  key={member.id}
                  type="button"
                  variant={formData.memberIds.includes(member.id) ? 'secondary' : 'ghost'}
                  className="justify-start h-auto py-2"
                  onClick={() => toggleMember(member.id)}
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-[10px]">
                      {member.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{member.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit">
              {mode === 'create' ? '생성' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
