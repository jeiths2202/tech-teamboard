'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/use-store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileSpreadsheet, Upload, Loader2, ExternalLink, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { issueStatusConfig, priorityConfig, issueTypeConfig, getImsUrl } from '@/types';

interface ExcelFile {
  name: string;
  memberId: string | null;
  timestamp: string | null;
  size: number;
  modifiedAt: string;
}

interface ParsedIssue {
  imsNumber: string;
  title: string;
  description: string;
  type: 'bug' | 'feature' | 'inquiry' | 'task';
  status: 'new' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  tags: string[];
  customer: string;
  product: string;
  issuedDate?: string;
  imsStatus: string;
}

interface ExcelImportProps {
  projectId: string;
  onImportComplete: () => void;
}

export function ExcelImport({ projectId, onImportComplete }: ExcelImportProps) {
  const { addIssue, currentMemberId, members, issues } = useStore();

  const [files, setFiles] = useState<ExcelFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [parsedIssues, setParsedIssues] = useState<ParsedIssue[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  // 현재 로그인한 멤버 정보
  const currentMember = members.find(m => m.id === currentMemberId);

  // 파일 목록 불러오기
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/excel');
      const data = await res.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('파일 목록 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // Excel 파일 파싱
  const handleParse = async () => {
    if (!selectedFile) return;

    setParsing(true);
    setParsedIssues([]);
    setSelectedIssues(new Set());

    try {
      const res = await fetch('/api/excel/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: selectedFile }),
      });

      const data = await res.json();
      if (data.success) {
        setParsedIssues(data.issues);
        // 기본적으로 모든 이슈 선택
        setSelectedIssues(new Set(data.issues.map((i: ParsedIssue) => i.imsNumber)));
      }
    } catch (error) {
      console.error('파일 파싱 실패:', error);
    } finally {
      setParsing(false);
    }
  };

  // 이미 등록된 IMS 번호 확인
  const isAlreadyImported = (imsNumber: string) => {
    return issues.some(issue => issue.imsNumber === imsNumber);
  };

  // 선택된 이슈들 임포트
  const handleImport = async () => {
    if (!projectId || selectedIssues.size === 0) return;

    setImporting(true);
    setImportedCount(0);

    const issuesToImport = parsedIssues.filter(
      issue => selectedIssues.has(issue.imsNumber) && !isAlreadyImported(issue.imsNumber)
    );

    for (const issue of issuesToImport) {
      addIssue({
        projectId,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        priority: issue.priority,
        assigneeId: currentMemberId,
        reporterId: currentMemberId,
        tags: issue.tags,
        imsNumber: issue.imsNumber,
      });
      setImportedCount(prev => prev + 1);
    }

    setImporting(false);
    onImportComplete();
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedIssues.size === parsedIssues.length) {
      setSelectedIssues(new Set());
    } else {
      setSelectedIssues(new Set(parsedIssues.map(i => i.imsNumber)));
    }
  };

  // 개별 선택
  const toggleSelect = (imsNumber: string) => {
    const newSelected = new Set(selectedIssues);
    if (newSelected.has(imsNumber)) {
      newSelected.delete(imsNumber);
    } else {
      newSelected.add(imsNumber);
    }
    setSelectedIssues(newSelected);
  };

  // 파일 크기 포맷
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 현재 사용자의 파일만 필터링 옵션
  const myFiles = files.filter(f => f.memberId === currentMember?.email?.split('@')[0]);

  return (
    <div className="space-y-6">
      {/* 파일 선택 */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Excel 파일 선택
        </Label>

        <Select value={selectedFile} onValueChange={setSelectedFile}>
          <SelectTrigger>
            <SelectValue placeholder="불러올 Excel 파일을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {files.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                excels 폴더에 Excel 파일이 없습니다
              </div>
            ) : (
              files.map((file) => (
                <SelectItem key={file.name} value={file.name}>
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    <span>{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatSize(file.size)})
                    </span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Button
          onClick={handleParse}
          disabled={!selectedFile || parsing}
          className="w-full"
          variant="outline"
        >
          {parsing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              파싱 중...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              파일 불러오기
            </>
          )}
        </Button>
      </div>

      {/* 파싱된 이슈 목록 */}
      {parsedIssues.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>불러온 이슈 ({parsedIssues.length}건)</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedIssues.size === parsedIssues.length}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">전체 선택</span>
            </div>
          </div>

          <ScrollArea className="h-[300px] border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="w-24">IMS</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead className="w-20">유형</TableHead>
                  <TableHead className="w-20">상태</TableHead>
                  <TableHead className="w-20">우선순위</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedIssues.map((issue) => {
                  const alreadyImported = isAlreadyImported(issue.imsNumber);

                  return (
                    <TableRow
                      key={issue.imsNumber}
                      className={cn(
                        alreadyImported && 'opacity-50 bg-muted'
                      )}
                    >
                      <TableCell>
                        {alreadyImported ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Checkbox
                            checked={selectedIssues.has(issue.imsNumber)}
                            onCheckedChange={() => toggleSelect(issue.imsNumber)}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <a
                          href={getImsUrl(issue.imsNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          {issue.imsNumber}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={issue.title}>
                        {issue.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn('text-xs', issueTypeConfig[issue.type].color)}
                        >
                          {issueTypeConfig[issue.type].labelJa}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn('text-xs', issueStatusConfig[issue.status].color)}
                        >
                          {issueStatusConfig[issue.status].labelJa}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn('text-xs', priorityConfig[issue.priority].color)}
                        >
                          {priorityConfig[issue.priority].labelJa}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* 임포트 버튼 */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">
              {selectedIssues.size}건 선택됨
              {parsedIssues.filter(i => isAlreadyImported(i.imsNumber)).length > 0 && (
                <span className="ml-2 text-emerald-600">
                  ({parsedIssues.filter(i => isAlreadyImported(i.imsNumber)).length}건 이미 등록됨)
                </span>
              )}
            </span>
            <Button
              onClick={handleImport}
              disabled={!projectId || selectedIssues.size === 0 || importing}
            >
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  임포트 중... ({importedCount}건)
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  선택 이슈 임포트
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* 프로젝트 미선택 경고 */}
      {!projectId && parsedIssues.length > 0 && (
        <p className="text-sm text-amber-600">
          이슈를 임포트하려면 먼저 프로젝트를 선택해주세요.
        </p>
      )}
    </div>
  );
}
