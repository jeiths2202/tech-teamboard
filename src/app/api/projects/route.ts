import { NextRequest, NextResponse } from 'next/server';
import { ProjectRepository, ActivityRepository, prisma } from '@/lib/db';

// GET /api/projects - 전체 프로젝트 조회
export async function GET() {
  try {
    const projects = await ProjectRepository.findAll();

    // 각 프로젝트의 멤버 ID 목록 조회
    const projectsWithMembers = await Promise.all(
      projects.map(async (project) => {
        const members = await ProjectRepository.getMembers(project.id);
        return {
          ...project,
          memberIds: members.map(m => m.id),
        };
      })
    );

    return NextResponse.json(projectsWithMembers);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - 프로젝트 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, status, priority, startDate, dueDate, customer, memberIds, currentMemberId } = body;

    if (!name || !description || !startDate || !dueDate || !customer) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Transaction으로 프로젝트와 멤버 관계를 함께 생성
    const result = await prisma.$transaction(async (tx) => {
      // 프로젝트 생성
      const project = await tx.project.create({
        data: {
          name,
          description,
          status: status || 'backlog',
          priority: priority || 'medium',
          startDate: new Date(startDate),
          dueDate: new Date(dueDate),
          customer,
        },
      });

      // 멤버 관계 생성
      if (memberIds && memberIds.length > 0) {
        await tx.projectMember.createMany({
          data: memberIds.map((memberId: string) => ({
            projectId: project.id,
            memberId,
          })),
        });
      }

      // Activity 생성
      if (currentMemberId) {
        await tx.activity.create({
          data: {
            type: 'project_created',
            description: `새 프로젝트 "${name}"이 생성되었습니다.`,
            memberId: currentMemberId,
            projectId: project.id,
          },
        });
      }

      return { ...project, memberIds: memberIds || [] };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
