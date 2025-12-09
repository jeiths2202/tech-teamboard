import { NextRequest, NextResponse } from 'next/server';
import { MemberRepository } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/members/[id] - 특정 멤버 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const member = await MemberRepository.findById(id);

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Failed to fetch member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    );
  }
}

// PUT /api/members/[id] - 멤버 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const member = await MemberRepository.update(id, body);
    return NextResponse.json(member);
  } catch (error) {
    console.error('Failed to update member:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}

// DELETE /api/members/[id] - 멤버 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await MemberRepository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete member:', error);
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    );
  }
}
