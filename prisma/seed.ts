import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 기존 데이터 삭제
  await prisma.activity.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.member.deleteMany();

  // Members 생성
  const members = await Promise.all([
    prisma.member.create({
      data: {
        id: '1',
        name: '김철수',
        nameJa: 'キム・チョルス',
        email: 'kim.cs@company.co.jp',
        avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=kim',
        role: 'admin',
        department: 'Technical Support',
      },
    }),
    prisma.member.create({
      data: {
        id: '2',
        name: '田中太郎',
        nameJa: 'タナカ・タロウ',
        email: 'tanaka@company.co.jp',
        avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=tanaka',
        role: 'member',
        department: 'Technical Support',
      },
    }),
    prisma.member.create({
      data: {
        id: '3',
        name: '이영희',
        nameJa: 'イ・ヨンヒ',
        email: 'lee.yh@company.co.jp',
        avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=lee',
        role: 'member',
        department: 'Technical Support',
      },
    }),
    prisma.member.create({
      data: {
        id: '4',
        name: '佐藤花子',
        nameJa: 'サトウ・ハナコ',
        email: 'sato@company.co.jp',
        avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=sato',
        role: 'member',
        department: 'Technical Support',
      },
    }),
    prisma.member.create({
      data: {
        id: '5',
        name: '박민수',
        nameJa: 'パク・ミンス',
        email: 'park.ms@company.co.jp',
        avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=park',
        role: 'member',
        department: 'Technical Support',
      },
    }),
  ]);

  console.log(`Created ${members.length} members`);

  // Projects 생성
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        id: 'p1',
        name: 'ABC Corp 시스템 마이그레이션',
        description: 'ABC Corp의 레거시 시스템을 클라우드로 마이그레이션하는 프로젝트입니다.',
        status: 'in_progress',
        priority: 'high',
        startDate: new Date('2024-10-01'),
        dueDate: new Date('2025-01-31'),
        customer: 'ABC Corporation',
      },
    }),
    prisma.project.create({
      data: {
        id: 'p2',
        name: 'XYZ Inc API 연동',
        description: 'XYZ Inc와의 API 연동 및 데이터 동기화 시스템 구축',
        status: 'in_progress',
        priority: 'urgent',
        startDate: new Date('2024-11-01'),
        dueDate: new Date('2024-12-20'),
        customer: 'XYZ Inc',
      },
    }),
    prisma.project.create({
      data: {
        id: 'p3',
        name: 'DEF Ltd 보안 감사',
        description: 'DEF Ltd 시스템에 대한 보안 감사 및 취약점 분석',
        status: 'review',
        priority: 'medium',
        startDate: new Date('2024-09-01'),
        dueDate: new Date('2024-12-15'),
        customer: 'DEF Limited',
      },
    }),
    prisma.project.create({
      data: {
        id: 'p4',
        name: 'GHI Corp 인프라 구축',
        description: 'GHI Corp의 신규 서비스를 위한 인프라 설계 및 구축',
        status: 'backlog',
        priority: 'medium',
        startDate: new Date('2025-01-15'),
        dueDate: new Date('2025-03-31'),
        customer: 'GHI Corporation',
      },
    }),
    prisma.project.create({
      data: {
        id: 'p5',
        name: 'JKL Inc 성능 최적화',
        description: 'JKL Inc 웹 애플리케이션의 성능 최적화 및 튜닝',
        status: 'completed',
        priority: 'low',
        startDate: new Date('2024-08-01'),
        dueDate: new Date('2024-11-30'),
        customer: 'JKL Inc',
      },
    }),
    prisma.project.create({
      data: {
        id: 'p6',
        name: 'MNO Corp 데이터 분석',
        description: 'MNO Corp 고객 데이터 분석 및 리포트 시스템 개발',
        status: 'in_progress',
        priority: 'high',
        startDate: new Date('2024-11-15'),
        dueDate: new Date('2025-02-28'),
        customer: 'MNO Corporation',
      },
    }),
    prisma.project.create({
      data: {
        id: 'p7',
        name: 'PQR Ltd 모바일 앱 지원',
        description: 'PQR Ltd 모바일 애플리케이션 기술 지원 및 버그 수정',
        status: 'on_hold',
        priority: 'low',
        startDate: new Date('2024-10-01'),
        dueDate: new Date('2024-12-31'),
        customer: 'PQR Limited',
      },
    }),
  ]);

  console.log(`Created ${projects.length} projects`);

  // Project-Member relations
  await Promise.all([
    prisma.projectMember.createMany({
      data: [
        { projectId: 'p1', memberId: '1' },
        { projectId: 'p1', memberId: '2' },
        { projectId: 'p2', memberId: '1' },
        { projectId: 'p2', memberId: '3' },
        { projectId: 'p3', memberId: '2' },
        { projectId: 'p3', memberId: '4' },
        { projectId: 'p4', memberId: '3' },
        { projectId: 'p4', memberId: '5' },
        { projectId: 'p5', memberId: '4' },
        { projectId: 'p5', memberId: '5' },
        { projectId: 'p6', memberId: '1' },
        { projectId: 'p6', memberId: '4' },
        { projectId: 'p6', memberId: '5' },
        { projectId: 'p7', memberId: '2' },
      ],
    }),
  ]);

  console.log('Created project-member relations');

  // Issues 생성
  const issues = await Promise.all([
    prisma.issue.create({
      data: {
        id: 'i1',
        projectId: 'p1',
        title: '데이터베이스 연결 오류',
        description: '마이그레이션 중 데이터베이스 연결이 간헐적으로 끊어지는 문제가 발생합니다.',
        type: 'bug',
        status: 'in_progress',
        priority: 'urgent',
        assigneeId: '1',
        reporterId: '2',
        dueDate: new Date('2024-12-10'),
        tags: JSON.stringify(['database', 'critical']),
        imsNumber: 'IMS-2024-001234',
      },
    }),
    prisma.issue.create({
      data: {
        id: 'i2',
        projectId: 'p1',
        title: '마이그레이션 스크립트 검토',
        description: '데이터 마이그레이션 스크립트의 코드 리뷰가 필요합니다.',
        type: 'task',
        status: 'review',
        priority: 'high',
        assigneeId: '2',
        reporterId: '1',
        dueDate: new Date('2024-12-12'),
        tags: JSON.stringify(['review', 'migration']),
        imsNumber: 'IMS-2024-001235',
      },
    }),
    prisma.issue.create({
      data: {
        id: 'i3',
        projectId: 'p2',
        title: 'API 인증 토큰 만료 처리',
        description: 'API 인증 토큰이 만료될 때 자동 갱신 기능을 구현해야 합니다.',
        type: 'feature',
        status: 'new',
        priority: 'high',
        assigneeId: '3',
        reporterId: '1',
        dueDate: new Date('2024-12-15'),
        tags: JSON.stringify(['api', 'authentication']),
        imsNumber: 'IMS-2024-001240',
      },
    }),
    prisma.issue.create({
      data: {
        id: 'i4',
        projectId: 'p2',
        title: 'Rate Limiting 구현',
        description: 'API 호출에 대한 Rate Limiting 로직을 구현해야 합니다.',
        type: 'task',
        status: 'in_progress',
        priority: 'medium',
        assigneeId: '1',
        reporterId: '3',
        dueDate: new Date('2024-12-18'),
        tags: JSON.stringify(['api', 'performance']),
        imsNumber: 'IMS-2024-001238',
      },
    }),
    prisma.issue.create({
      data: {
        id: 'i5',
        projectId: 'p3',
        title: '취약점 보고서 작성',
        description: '발견된 보안 취약점에 대한 상세 보고서를 작성합니다.',
        type: 'task',
        status: 'review',
        priority: 'medium',
        assigneeId: '4',
        reporterId: '2',
        dueDate: new Date('2024-12-14'),
        tags: JSON.stringify(['security', 'documentation']),
        imsNumber: 'IMS-2024-001230',
      },
    }),
    prisma.issue.create({
      data: {
        id: 'i6',
        projectId: 'p3',
        title: 'SSL 인증서 갱신 문의',
        description: '고객사에서 SSL 인증서 갱신 절차에 대해 문의가 들어왔습니다.',
        type: 'inquiry',
        status: 'completed',
        priority: 'low',
        assigneeId: '2',
        reporterId: '4',
        dueDate: null,
        tags: JSON.stringify(['ssl', 'customer-support']),
        imsNumber: null,
      },
    }),
    prisma.issue.create({
      data: {
        id: 'i7',
        projectId: 'p6',
        title: '대시보드 차트 버그',
        description: '데이터 분석 대시보드에서 차트가 제대로 렌더링되지 않는 문제',
        type: 'bug',
        status: 'new',
        priority: 'high',
        assigneeId: '5',
        reporterId: '4',
        dueDate: new Date('2024-12-11'),
        tags: JSON.stringify(['ui', 'chart']),
        imsNumber: 'IMS-2024-001245',
      },
    }),
    prisma.issue.create({
      data: {
        id: 'i8',
        projectId: 'p6',
        title: '리포트 자동 생성 기능',
        description: '주간/월간 리포트를 자동으로 생성하는 기능을 추가해야 합니다.',
        type: 'feature',
        status: 'in_progress',
        priority: 'medium',
        assigneeId: '1',
        reporterId: '5',
        dueDate: new Date('2024-12-25'),
        tags: JSON.stringify(['automation', 'report']),
        imsNumber: 'IMS-2024-001232',
      },
    }),
    prisma.issue.create({
      data: {
        id: 'i9',
        projectId: 'p5',
        title: '캐시 최적화 완료',
        description: 'Redis 캐시 레이어 최적화 작업이 완료되었습니다.',
        type: 'task',
        status: 'completed',
        priority: 'high',
        assigneeId: '4',
        reporterId: '5',
        dueDate: null,
        tags: JSON.stringify(['cache', 'optimization']),
        imsNumber: 'IMS-2024-001220',
      },
    }),
    prisma.issue.create({
      data: {
        id: 'i10',
        projectId: 'p7',
        title: '앱 크래시 이슈 (보류)',
        description: '특정 기기에서 앱이 크래시되는 문제 - 고객사 확인 대기 중',
        type: 'bug',
        status: 'on_hold',
        priority: 'medium',
        assigneeId: '2',
        reporterId: '2',
        dueDate: null,
        tags: JSON.stringify(['mobile', 'crash']),
        imsNumber: 'IMS-2024-001215',
      },
    }),
  ]);

  console.log(`Created ${issues.length} issues`);

  // Activities 생성
  await Promise.all([
    prisma.activity.create({
      data: {
        id: 'a1',
        type: 'issue_created',
        description: '새 이슈 "대시보드 차트 버그"가 생성되었습니다.',
        memberId: '4',
        projectId: 'p6',
        issueId: 'i7',
        createdAt: new Date('2024-12-07T14:30:00'),
      },
    }),
    prisma.activity.create({
      data: {
        id: 'a2',
        type: 'status_changed',
        description: '"API 인증 토큰 만료 처리" 이슈가 신규로 변경되었습니다.',
        memberId: '3',
        projectId: 'p2',
        issueId: 'i3',
        createdAt: new Date('2024-12-06T16:00:00'),
      },
    }),
    prisma.activity.create({
      data: {
        id: 'a3',
        type: 'member_assigned',
        description: '김철수님이 "리포트 자동 생성 기능" 이슈에 배정되었습니다.',
        memberId: '1',
        projectId: 'p6',
        issueId: 'i8',
        createdAt: new Date('2024-12-06T10:15:00'),
      },
    }),
    prisma.activity.create({
      data: {
        id: 'a4',
        type: 'status_changed',
        description: '"데이터베이스 연결 오류" 이슈가 진행중으로 변경되었습니다.',
        memberId: '1',
        projectId: 'p1',
        issueId: 'i1',
        createdAt: new Date('2024-12-05T09:00:00'),
      },
    }),
    prisma.activity.create({
      data: {
        id: 'a5',
        type: 'comment_added',
        description: '田中太郎님이 "마이그레이션 스크립트 검토"에 코멘트를 추가했습니다.',
        memberId: '2',
        projectId: 'p1',
        issueId: 'i2',
        createdAt: new Date('2024-12-04T15:45:00'),
      },
    }),
    prisma.activity.create({
      data: {
        id: 'a6',
        type: 'project_created',
        description: '새 프로젝트 "GHI Corp 인프라 구축"이 생성되었습니다.',
        memberId: '1',
        projectId: 'p4',
        issueId: null,
        createdAt: new Date('2024-12-01T11:00:00'),
      },
    }),
  ]);

  console.log('Created activities');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
