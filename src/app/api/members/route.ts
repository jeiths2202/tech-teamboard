import { NextRequest, NextResponse } from 'next/server';
import { MemberRepository } from '@/lib/db';

// GET /api/members - 전체 멤버 조회
export async function GET() {
  try {
    const members = await MemberRepository.findAll();
    return NextResponse.json(members);
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

// POST /api/members - 멤버 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameJa, email, avatar, role, department } = body;

    if (!name || !email || !avatar) {
      return NextResponse.json(
        { error: 'name, email, avatar are required' },
        { status: 400 }
      );
    }

    const member = await MemberRepository.create({
      name,
      nameJa: nameJa || null,
      email,
      avatar,
      role: role || 'member',
      department: department || null,
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Failed to create member:', error);
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    );
  }
}
