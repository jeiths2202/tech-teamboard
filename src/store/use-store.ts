import { create } from 'zustand';
import { Member, Project, Issue, Activity, ProjectStatus, IssueStatus } from '@/types';

interface AppState {
  // Data
  members: Member[];
  projects: Project[];
  issues: Issue[];
  activities: Activity[];

  // Loading states
  isLoading: boolean;
  isInitialized: boolean;

  // UI State
  sidebarOpen: boolean;
  currentMemberId: string;
  isLoggedIn: boolean;

  // Actions
  initialize: () => Promise<void>;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCurrentMember: (memberId: string) => void;
  logout: () => void;

  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateProjectStatus: (id: string, status: ProjectStatus) => Promise<void>;

  // Issue Actions
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIssue: (id: string, updates: Partial<Issue>) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  updateIssueStatus: (id: string, status: IssueStatus) => Promise<void>;

  // Helpers
  getProjectById: (id: string) => Project | undefined;
  getIssueById: (id: string) => Issue | undefined;
  getMemberById: (id: string) => Member | undefined;
  getProjectMembers: (projectId: string) => Member[];
  getProjectIssues: (projectId: string) => Issue[];
  getMemberProjects: (memberId: string) => Project[];
  getMemberIssues: (memberId: string) => Issue[];

  // Data refresh
  refreshData: () => Promise<void>;
}

// API Helper functions
const api = {
  async get<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },

  async post<T>(url: string, data: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },

  async put<T>(url: string, data: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },

  async patch<T>(url: string, data: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },

  async delete(url: string): Promise<void> {
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
  },
};

// Transform DB data to app types
function transformMember(data: Record<string, unknown>): Member {
  return {
    id: data.id as string,
    name: data.name as string,
    nameJa: data.nameJa as string | undefined,
    email: data.email as string,
    avatar: data.avatar as string,
    role: data.role as 'admin' | 'member',
    department: data.department as string | undefined,
    createdAt: new Date(data.createdAt as string),
  };
}

function transformProject(data: Record<string, unknown>): Project {
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string,
    status: data.status as ProjectStatus,
    priority: data.priority as 'urgent' | 'high' | 'medium' | 'low',
    startDate: new Date(data.startDate as string),
    dueDate: new Date(data.dueDate as string),
    customer: data.customer as string,
    memberIds: (data.memberIds as string[]) || [],
    createdAt: new Date(data.createdAt as string),
    updatedAt: new Date(data.updatedAt as string),
  };
}

function transformIssue(data: Record<string, unknown>): Issue {
  return {
    id: data.id as string,
    projectId: data.projectId as string,
    title: data.title as string,
    description: data.description as string,
    type: data.type as 'bug' | 'feature' | 'inquiry' | 'task',
    status: data.status as IssueStatus,
    priority: data.priority as 'urgent' | 'high' | 'medium' | 'low',
    assigneeId: data.assigneeId as string,
    reporterId: data.reporterId as string,
    dueDate: data.dueDate ? new Date(data.dueDate as string) : undefined,
    tags: (data.tags as string[]) || [],
    imsNumber: data.imsNumber as string | undefined,
    createdAt: new Date(data.createdAt as string),
    updatedAt: new Date(data.updatedAt as string),
  };
}

function transformActivity(data: Record<string, unknown>): Activity {
  return {
    id: data.id as string,
    type: data.type as Activity['type'],
    description: data.description as string,
    memberId: data.memberId as string,
    projectId: data.projectId as string | undefined,
    issueId: data.issueId as string | undefined,
    createdAt: new Date(data.createdAt as string),
  };
}

export const useStore = create<AppState>((set, get) => ({
  // Initial Data
  members: [],
  projects: [],
  issues: [],
  activities: [],

  // Loading states
  isLoading: false,
  isInitialized: false,

  // UI State
  sidebarOpen: true,
  currentMemberId: '',
  isLoggedIn: false,

  // Initialize - fetch all data from API
  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true });
    try {
      const [membersData, projectsData, issuesData, activitiesData] = await Promise.all([
        api.get<Record<string, unknown>[]>('/api/members'),
        api.get<Record<string, unknown>[]>('/api/projects'),
        api.get<Record<string, unknown>[]>('/api/issues'),
        api.get<Record<string, unknown>[]>('/api/activities?limit=50'),
      ]);

      set({
        members: membersData.map(transformMember),
        projects: projectsData.map(transformProject),
        issues: issuesData.map(transformIssue),
        activities: activitiesData.map(transformActivity),
        isInitialized: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to initialize:', error);
      set({ isLoading: false });
    }
  },

  // Refresh data
  refreshData: async () => {
    set({ isLoading: true });
    try {
      const [membersData, projectsData, issuesData, activitiesData] = await Promise.all([
        api.get<Record<string, unknown>[]>('/api/members'),
        api.get<Record<string, unknown>[]>('/api/projects'),
        api.get<Record<string, unknown>[]>('/api/issues'),
        api.get<Record<string, unknown>[]>('/api/activities?limit=50'),
      ]);

      set({
        members: membersData.map(transformMember),
        projects: projectsData.map(transformProject),
        issues: issuesData.map(transformIssue),
        activities: activitiesData.map(transformActivity),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      set({ isLoading: false });
    }
  },

  // UI Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setCurrentMember: (memberId) => set({ currentMemberId: memberId, isLoggedIn: true }),
  logout: () => set({ currentMemberId: '', isLoggedIn: false }),

  // Project Actions
  addProject: async (projectData) => {
    const { currentMemberId } = get();
    try {
      const newProject = await api.post<Record<string, unknown>>('/api/projects', {
        ...projectData,
        currentMemberId,
      });

      set((state) => ({
        projects: [...state.projects, transformProject(newProject)],
      }));

      // Refresh activities
      const activities = await api.get<Record<string, unknown>[]>('/api/activities?limit=50');
      set({ activities: activities.map(transformActivity) });
    } catch (error) {
      console.error('Failed to add project:', error);
      throw error;
    }
  },

  updateProject: async (id, updates) => {
    try {
      const updated = await api.put<Record<string, unknown>>(`/api/projects/${id}`, updates);

      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? transformProject(updated) : p
        ),
      }));
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      await api.delete(`/api/projects/${id}`);

      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        issues: state.issues.filter((i) => i.projectId !== id),
      }));
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  },

  updateProjectStatus: async (id, status) => {
    const { currentMemberId } = get();
    try {
      const updated = await api.put<Record<string, unknown>>(`/api/projects/${id}`, {
        status,
        currentMemberId,
      });

      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? transformProject(updated) : p
        ),
      }));

      // Refresh activities
      const activities = await api.get<Record<string, unknown>[]>('/api/activities?limit=50');
      set({ activities: activities.map(transformActivity) });
    } catch (error) {
      console.error('Failed to update project status:', error);
      throw error;
    }
  },

  // Issue Actions
  addIssue: async (issueData) => {
    const { currentMemberId } = get();
    try {
      const newIssue = await api.post<Record<string, unknown>>('/api/issues', {
        ...issueData,
        currentMemberId,
      });

      set((state) => ({
        issues: [...state.issues, transformIssue(newIssue)],
      }));

      // Refresh activities
      const activities = await api.get<Record<string, unknown>[]>('/api/activities?limit=50');
      set({ activities: activities.map(transformActivity) });
    } catch (error) {
      console.error('Failed to add issue:', error);
      throw error;
    }
  },

  updateIssue: async (id, updates) => {
    try {
      const updated = await api.put<Record<string, unknown>>(`/api/issues/${id}`, updates);

      set((state) => ({
        issues: state.issues.map((i) =>
          i.id === id ? transformIssue(updated) : i
        ),
      }));
    } catch (error) {
      console.error('Failed to update issue:', error);
      throw error;
    }
  },

  deleteIssue: async (id) => {
    try {
      await api.delete(`/api/issues/${id}`);

      set((state) => ({
        issues: state.issues.filter((i) => i.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete issue:', error);
      throw error;
    }
  },

  updateIssueStatus: async (id, status) => {
    const { currentMemberId } = get();
    try {
      const updated = await api.patch<Record<string, unknown>>(`/api/issues/${id}`, {
        status,
        currentMemberId,
      });

      set((state) => ({
        issues: state.issues.map((i) =>
          i.id === id ? transformIssue(updated) : i
        ),
      }));

      // Refresh activities
      const activities = await api.get<Record<string, unknown>[]>('/api/activities?limit=50');
      set({ activities: activities.map(transformActivity) });
    } catch (error) {
      console.error('Failed to update issue status:', error);
      throw error;
    }
  },

  // Helpers
  getProjectById: (id) => get().projects.find((p) => p.id === id),
  getIssueById: (id) => get().issues.find((i) => i.id === id),
  getMemberById: (id) => get().members.find((m) => m.id === id),

  getProjectMembers: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return [];
    return get().members.filter((m) => project.memberIds.includes(m.id));
  },

  getProjectIssues: (projectId) => {
    return get().issues.filter((i) => i.projectId === projectId);
  },

  getMemberProjects: (memberId) => {
    return get().projects.filter((p) => p.memberIds.includes(memberId));
  },

  getMemberIssues: (memberId) => {
    return get().issues.filter((i) => i.assigneeId === memberId);
  },
}));
