/**
 * Repository Layer
 * 각 엔티티에 대한 데이터 접근 로직을 캡슐화
 * DBIO 인터페이스를 통해 DB 종류와 무관하게 동작
 */

import { prisma } from './prisma';
import { createDBIO } from './dbio';

// Types
export interface MemberData {
  id: string;
  name: string;
  nameJa: string | null;
  email: string;
  avatar: string;
  role: string;
  department: string | null;
  createdAt: Date;
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: Date;
  dueDate: Date;
  customer: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueData {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  assigneeId: string | null;
  reporterId: string;
  dueDate: Date | null;
  tags: string;
  imsNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityData {
  id: string;
  type: string;
  description: string;
  memberId: string;
  projectId: string | null;
  issueId: string | null;
  createdAt: Date;
}

// DBIO instances
export const memberDBIO = createDBIO<MemberData>(prisma.member);
export const projectDBIO = createDBIO<ProjectData>(prisma.project);
export const issueDBIO = createDBIO<IssueData>(prisma.issue);
export const activityDBIO = createDBIO<ActivityData>(prisma.activity);

/**
 * Member Repository
 */
export const MemberRepository = {
  async findAll() {
    return memberDBIO.findMany({
      orderBy: { createdAt: 'asc' },
    });
  },

  async findById(id: string) {
    return memberDBIO.findUnique({
      where: { id },
    });
  },

  async findByEmail(email: string) {
    return memberDBIO.findFirst({
      where: { email },
    });
  },

  async create(data: Omit<MemberData, 'id' | 'createdAt'>) {
    return memberDBIO.create({ data });
  },

  async update(id: string, data: Partial<MemberData>) {
    return memberDBIO.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return memberDBIO.delete({
      where: { id },
    });
  },
};

/**
 * Project Repository
 */
export const ProjectRepository = {
  async findAll() {
    return projectDBIO.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  },

  async findById(id: string) {
    return projectDBIO.findUnique({
      where: { id },
    });
  },

  async findByStatus(status: string) {
    return projectDBIO.findMany({
      where: { status },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async create(data: Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt'>) {
    return projectDBIO.create({ data });
  },

  async update(id: string, data: Partial<ProjectData>) {
    return projectDBIO.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return projectDBIO.delete({
      where: { id },
    });
  },

  // Project-Member relations using Prisma directly for complex queries
  async getMembers(projectId: string) {
    const projectMembers = await prisma.projectMember.findMany({
      where: { projectId },
      include: { member: true },
    });
    return projectMembers.map(pm => pm.member);
  },

  async addMember(projectId: string, memberId: string) {
    return prisma.projectMember.create({
      data: { projectId, memberId },
    });
  },

  async removeMember(projectId: string, memberId: string) {
    return prisma.projectMember.delete({
      where: {
        projectId_memberId: { projectId, memberId },
      },
    });
  },

  async setMembers(projectId: string, memberIds: string[]) {
    // Delete existing members
    await prisma.projectMember.deleteMany({
      where: { projectId },
    });
    // Add new members
    if (memberIds.length > 0) {
      await prisma.projectMember.createMany({
        data: memberIds.map(memberId => ({ projectId, memberId })),
      });
    }
  },
};

/**
 * Issue Repository
 */
export const IssueRepository = {
  async findAll() {
    return issueDBIO.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  },

  async findById(id: string) {
    return issueDBIO.findUnique({
      where: { id },
    });
  },

  async findByProjectId(projectId: string) {
    return issueDBIO.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async findByAssigneeId(assigneeId: string) {
    return issueDBIO.findMany({
      where: { assigneeId },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async findByStatus(status: string) {
    return issueDBIO.findMany({
      where: { status },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async create(data: Omit<IssueData, 'id' | 'createdAt' | 'updatedAt'>) {
    return issueDBIO.create({ data });
  },

  async update(id: string, data: Partial<IssueData>) {
    return issueDBIO.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return issueDBIO.delete({
      where: { id },
    });
  },

  async updateStatus(id: string, status: string) {
    return issueDBIO.update({
      where: { id },
      data: { status },
    });
  },
};

/**
 * Activity Repository
 */
export const ActivityRepository = {
  async findAll(limit?: number) {
    return activityDBIO.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  async findByProjectId(projectId: string) {
    return activityDBIO.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findByMemberId(memberId: string) {
    return activityDBIO.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: Omit<ActivityData, 'id' | 'createdAt'>) {
    return activityDBIO.create({ data });
  },

  async delete(id: string) {
    return activityDBIO.delete({
      where: { id },
    });
  },
};
