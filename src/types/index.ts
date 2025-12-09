export type ProjectStatus = 'backlog' | 'in_progress' | 'review' | 'completed' | 'on_hold';
export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type IssueType = 'bug' | 'feature' | 'inquiry' | 'task';
export type IssueStatus = 'new' | 'in_progress' | 'review' | 'completed' | 'on_hold';
export type MemberRole = 'admin' | 'member';

export interface Member {
  id: string;
  name: string;
  nameJa?: string;
  email: string;
  avatar: string;
  role: MemberRole;
  department?: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: Date;
  dueDate: Date;
  customer: string;
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  priority: Priority;
  assigneeId: string;
  reporterId: string;
  dueDate?: Date;
  tags: string[];
  imsNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

// IMS URL helper
export const getImsUrl = (imsNumber: string) =>
  `https://ims.tmaxsoft.com/tody/ims/issue/issueView.do?issueId=${imsNumber}&menuCode=issue_list`;

export interface Activity {
  id: string;
  type: 'project_created' | 'issue_created' | 'status_changed' | 'comment_added' | 'member_assigned';
  description: string;
  memberId: string;
  projectId?: string;
  issueId?: string;
  createdAt: Date;
}

// Status & Priority display helpers
export const projectStatusConfig: Record<ProjectStatus, { label: string; labelJa: string; color: string }> = {
  backlog: { label: 'Backlog', labelJa: '대기', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  in_progress: { label: 'In Progress', labelJa: '진행중', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  review: { label: 'Review', labelJa: '검토중', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  completed: { label: 'Completed', labelJa: '완료', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  on_hold: { label: 'On Hold', labelJa: '보류', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300' },
};

export const issueStatusConfig: Record<IssueStatus, { label: string; labelJa: string; color: string }> = {
  new: { label: 'New', labelJa: '신규', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  in_progress: { label: 'In Progress', labelJa: '진행중', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  review: { label: 'Review', labelJa: '검토중', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  completed: { label: 'Completed', labelJa: '완료', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  on_hold: { label: 'On Hold', labelJa: '보류', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300' },
};

export const priorityConfig: Record<Priority, { label: string; labelJa: string; color: string; icon: string }> = {
  urgent: { label: 'Urgent', labelJa: '긴급', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: '🔴' },
  high: { label: 'High', labelJa: '높음', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', icon: '🟠' },
  medium: { label: 'Medium', labelJa: '중간', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', icon: '🟡' },
  low: { label: 'Low', labelJa: '낮음', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: '🟢' },
};

export const issueTypeConfig: Record<IssueType, { label: string; labelJa: string; color: string; icon: string }> = {
  bug: { label: 'Bug', labelJa: '버그', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: '🐛' },
  feature: { label: 'Feature', labelJa: '기능요청', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', icon: '✨' },
  inquiry: { label: 'Inquiry', labelJa: '문의', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300', icon: '❓' },
  task: { label: 'Task', labelJa: '작업', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300', icon: '📋' },
};
