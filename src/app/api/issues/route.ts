import { NextRequest, NextResponse } from 'next/server';
import { IssueRepository, prisma } from '@/lib/db';

// GET /api/issues - 전체 이슈 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const assigneeId = searchParams.get('assigneeId');
    const status = searchParams.get('status');

    let issues;
    if (projectId) {
      issues = await IssueRepository.findByProjectId(projectId);
    } else if (assigneeId) {
      issues = await IssueRepository.findByAssigneeId(assigneeId);
    } else if (status) {
      issues = await IssueRepository.findByStatus(status);
    } else {
      issues = await IssueRepository.findAll();
    }

    // tags를 JSON 파싱하여 배열로 변환
    const issuesWithTags = issues.map(issue => ({
      ...issue,
      tags: JSON.parse(issue.tags || '[]'),
    }));

    return NextResponse.json(issuesWithTags);
  } catch (error) {
    console.error('Failed to fetch issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}

// POST /api/issues - 이슈 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId, title, description, type, status, priority,
      assigneeId, reporterId, dueDate, tags, imsNumber, currentMemberId
    } = body;

    if (!projectId || !title || !reporterId) {
      return NextResponse.json(
        { error: 'projectId, title, reporterId are required' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 이슈 생성
      const issue = await tx.issue.create({
        data: {
          projectId,
          title,
          description: description || '',
          type: type || 'task',
          status: status || 'new',
          priority: priority || 'medium',
          assigneeId: assigneeId || null,
          reporterId,
          dueDate: dueDate ? new Date(dueDate) : null,
          tags: JSON.stringify(tags || []),
          imsNumber: imsNumber || null,
        },
      });

      // Activity 생성
      const activityMemberId = currentMemberId || reporterId;
      await tx.activity.create({
        data: {
          type: 'issue_created',
          description: `새 이슈 "${title}"이 생성되었습니다.`,
          memberId: activityMemberId,
          projectId,
          issueId: issue.id,
        },
      });

      return issue;
    });

    return NextResponse.json({
      ...result,
      tags: JSON.parse(result.tags || '[]'),
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create issue:', error);
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    );
  }
}
