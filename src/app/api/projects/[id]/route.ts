import { NextRequest, NextResponse } from 'next/server';
import { ProjectRepository, prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id] - 특정 프로젝트 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const project = await ProjectRepository.findById(id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const members = await ProjectRepository.getMembers(id);
    return NextResponse.json({
      ...project,
      memberIds: members.map(m => m.id),
    });
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - 프로젝트 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { memberIds, currentMemberId, ...projectData } = body;

    // Date 필드 변환
    if (projectData.startDate) {
      projectData.startDate = new Date(projectData.startDate);
    }
    if (projectData.dueDate) {
      projectData.dueDate = new Date(projectData.dueDate);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 프로젝트 업데이트
      const project = await tx.project.update({
        where: { id },
        data: projectData,
      });

      // 멤버 관계 업데이트
      if (memberIds !== undefined) {
        await tx.projectMember.deleteMany({
          where: { projectId: id },
        });

        if (memberIds.length > 0) {
          await tx.projectMember.createMany({
            data: memberIds.map((memberId: string) => ({
              projectId: id,
              memberId,
            })),
          });
        }
      }

      return { ...project, memberIds: memberIds || [] };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - 프로젝트 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await ProjectRepository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
