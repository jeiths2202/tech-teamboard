import { NextRequest, NextResponse } from 'next/server';
import { ActivityRepository } from '@/lib/db';

// GET /api/activities - Activity 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const memberId = searchParams.get('memberId');
    const limit = searchParams.get('limit');

    let activities;
    if (projectId) {
      activities = await ActivityRepository.findByProjectId(projectId);
    } else if (memberId) {
      activities = await ActivityRepository.findByMemberId(memberId);
    } else {
      activities = await ActivityRepository.findAll(limit ? parseInt(limit) : undefined);
    }

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST /api/activities - Activity 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, description, memberId, projectId, issueId } = body;

    if (!type || !description || !memberId) {
      return NextResponse.json(
        { error: 'type, description, memberId are required' },
        { status: 400 }
      );
    }

    const activity = await ActivityRepository.create({
      type,
      description,
      memberId,
      projectId: projectId || null,
      issueId: issueId || null,
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Failed to create activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
