'use client';

import { useState } from 'react';
import { useStore } from '@/store/use-store';
import { Issue, IssueStatus, IssueType, Priority } from '@/types';
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
import { CalendarIcon, X, ExternalLink } from 'lucide-react';

interface IssueFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue?: Issue;
  mode: 'create' | 'edit';
  defaultProjectId?: string;
}

export function IssueForm({ open, onOpenChange, issue, mode, defaultProjectId }: IssueFormProps) {
  const { members, projects, addIssue, updateIssue, currentMemberId } = useStore();

  const [formData, setFormData] = useState({
    projectId: issue?.projectId || defaultProjectId || '',
    title: issue?.title || '',
    description: issue?.description || '',
    type: issue?.type || 'task' as IssueType,
    status: issue?.status || 'new' as IssueStatus,
    priority: issue?.priority || 'medium' as Priority,
    assigneeId: issue?.assigneeId || '',
    reporterId: issue?.reporterId || currentMemberId,
    dueDate: issue?.dueDate,
    tags: issue?.tags || [] as string[],
    imsNumber: issue?.imsNumber || '',
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'create') {
      addIssue(formData);
    } else if (issue) {
      updateIssue(issue.id, formData);
    }

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      projectId: defaultProjectId || '',
      title: '',
      description: '',
      type: 'task',
      status: 'new',
      priority: 'medium',
      assigneeId: '',
      reporterId: currentMemberId,
      dueDate: undefined,
      tags: [],
      imsNumber: '',
    });
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? '새 이슈 등록' : '이슈 수정'}
          </DialogTitle>
          <DialogDescription>
            이슈의 세부 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label>프로젝트 *</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) => setFormData({ ...formData, projectId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="프로젝트를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="이슈 제목을 입력하세요"
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
              placeholder="이슈에 대한 상세 설명을 입력하세요"
              rows={4}
            />
          </div>

          {/* Type, Status, Priority */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>유형</Label>
              <Select
                value={formData.type}
                onValueChange={(value: IssueType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">🐛 버그</SelectItem>
                  <SelectItem value="feature">✨ 기능요청</SelectItem>
                  <SelectItem value="inquiry">❓ 문의</SelectItem>
                  <SelectItem value="task">📋 작업</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>상태</Label>
              <Select
                value={formData.status}
                onValueChange={(value: IssueStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">신규</SelectItem>
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
                onValueChange={(value: Priority) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">🔴 긴급</SelectItem>
                  <SelectItem value="high">🟠 높음</SelectItem>
                  <SelectItem value="medium">🟡 중간</SelectItem>
                  <SelectItem value="low">🟢 낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>담당자</Label>
              <Select
                value={formData.assigneeId}
                onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="담당자 선택" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-[8px]">
                            {member.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>태그</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="태그 입력 후 추가"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                추가
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="pr-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* IMS Number */}
          <div className="space-y-2">
            <Label htmlFor="imsNumber" className="flex items-center gap-2">
              IMS 번호
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </Label>
            <Input
              id="imsNumber"
              value={formData.imsNumber}
              onChange={(e) => setFormData({ ...formData, imsNumber: e.target.value })}
              placeholder="예: IMS-2024-001234"
            />
            <p className="text-xs text-muted-foreground">
              TmaxSoft IMS 시스템의 이슈 번호를 입력하세요
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!formData.projectId || !formData.title}>
              {mode === 'create' ? '등록' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
