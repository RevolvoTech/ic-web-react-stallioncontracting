import { ProjectTypeOption } from './projectTypes';

export type TimelineStatus = 'planned' | 'active' | 'blocked' | 'done';
export type TimelineItemKind = 'phase' | 'milestone' | 'update';
export type TimelineLinkKind = 'ticket' | 'calendar_event' | 'kanban_task' | 'file';
export type TimelineGroupBy = 'project' | 'projectType' | 'team';

export type TimelineMember = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
};

export type TimelineTeam = {
  id: string;
  name: string;
  description: string;
  color: string;
};

export type TimelinePoint = {
  id: string;
  title: string;
  detail: string;
  sortOrder: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TimelineLinkedRecord = {
  linkedKind: TimelineLinkKind;
  linkedId: string;
  title: string;
  subtitle: string | null;
  detail: string | null;
  url: string | null;
  missing: boolean;
};

export type TimelineLink = {
  id: string;
  linkedKind: TimelineLinkKind;
  linkedId: string;
  createdBy: string | null;
  createdAt: string;
  record: TimelineLinkedRecord;
};

export type TimelineItem = {
  id: string;
  itemKind: TimelineItemKind;
  title: string;
  summary: string;
  startDate: string | null;
  endDate: string | null;
  status: TimelineStatus;
  sortOrder: number;
  categoryProjectTypeId: string | null;
  category: ProjectTypeOption | null;
  assignedTeamId: string | null;
  assignedTeam: Pick<TimelineTeam, 'id' | 'name' | 'color'> | null;
  assignedUserId: string | null;
  assignedUser: TimelineMember | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  points: TimelinePoint[];
  links: TimelineLink[];
};

export type TimelineMilestoneCard = {
  id: string;
  title: string;
  summary: string;
  date: string | null;
  status: TimelineStatus;
  category: ProjectTypeOption | null;
};

export type TimelineProjectSummary = {
  id: string;
  name: string;
  code: string;
  description: string;
  status: string;
  priority: string;
  startDate: string | null;
  dueDate: string | null;
  ownerUserId: string | null;
  ownerName: string | null;
  projectType: ProjectTypeOption | null;
};

export type TimelineWindow = {
  startDate: string;
  endDate: string;
};

export type TimelineLinkOption = {
  linkedKind: TimelineLinkKind;
  linkedId: string;
  title: string;
  subtitle: string | null;
  detail: string | null;
};

export type TimelineLinkOptions = {
  tickets: TimelineLinkOption[];
  calendarEvents: TimelineLinkOption[];
  kanbanTasks: TimelineLinkOption[];
  files: TimelineLinkOption[];
};

export type ProjectTimelineResponse = {
  project: TimelineProjectSummary;
  timeline: {
    id: string;
    defaultZoom: 'month' | 'quarter' | 'detail';
    initializationSource: string;
  };
  permissions: {
    canRead: boolean;
    canContribute: boolean;
    canManage: boolean;
  };
  window: TimelineWindow;
  categories: ProjectTypeOption[];
  members: TimelineMember[];
  teams: TimelineTeam[];
  items: TimelineItem[];
  milestones: TimelineMilestoneCard[];
  availableLinks: TimelineLinkOptions;
};

export type PortfolioTimelineItem = {
  id: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  itemKind: TimelineItemKind;
  title: string;
  summary: string;
  startDate: string | null;
  endDate: string | null;
  status: TimelineStatus;
  sortOrder: number;
  category: ProjectTypeOption | null;
  assignedTeam: Pick<TimelineTeam, 'id' | 'name' | 'color'> | null;
};

export type PortfolioTimelineLane = {
  id: string;
  title: string;
  subtitle: string;
  color: string | null;
  itemCount: number;
  items: PortfolioTimelineItem[];
};

export type PortfolioTimelineResponse = {
  groupBy: TimelineGroupBy;
  window: TimelineWindow;
  filters: {
    status: TimelineStatus | null;
    projectTypeId: string | null;
    teamId: string | null;
  };
  lanes: PortfolioTimelineLane[];
  categories: ProjectTypeOption[];
};
