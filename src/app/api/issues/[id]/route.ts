import { NextRequest, NextResponse } from 'next/server';
import { IssueRepository, prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/issues/[id] - 특정 이슈 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const issue = await IssueRepository.findById(id);

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...issue,
      tags: JSON.parse(issue.tags || '[]'),
    });
  } catch (error) {
    console.error('Failed to fetch issue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 }
    );
  }
}

// PUT /api/issues/[id] - 이슈 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { currentMemberId, ...issueData } = body;

    // tags 배열을 JSON 문자열로 변환
    if (issueData.tags) {
      issueData.tags = JSON.stringify(issueData.tags);
    }

    // Date 필드 변환
    if (issueData.dueDate) {
      issueData.dueDate = new Date(issueData.dueDate);
    }

    const issue = await IssueRepository.update(id, issueData);

    return NextResponse.json({
      ...issue,
      tags: JSON.parse(issue.tags || '[]'),
    });
  } catch (error) {
    console.error('Failed to update issue:', error);
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    );
  }
}

// PATCH /api/issues/[id] - 이슈 상태 변경
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, currentMemberId } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const issue = await tx.issue.update({
        where: { id },
        data: { status },
      });

      // Activity 생성
      if (currentMemberId) {
        await tx.activity.create({
          data: {
            type: 'status_changed',
            description: `이슈 "${issue.title}"의 상태가 변경되었습니다.`,
            memberId: currentMemberId,
            projectId: issue.projectId,
            issueId: issue.id,
          },
        });
      }

      return issue;
    });

    return NextResponse.json({
      ...result,
      tags: JSON.parse(result.tags || '[]'),
    });
  } catch (error) {
    console.error('Failed to update issue status:', error);
    return NextResponse.json(
      { error: 'Failed to update issue status' },
      { status: 500 }
    );
  }
}

// DELETE /api/issues/[id] - 이슈 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await IssueRepository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete issue:', error);
    return NextResponse.json(
      { error: 'Failed to delete issue' },
      { status: 500 }
    );
  }
}
