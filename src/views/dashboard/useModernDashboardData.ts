import { useCallback, useEffect, useMemo, useState } from 'react';
import { crmRequest } from 'src/api/crm/client';
import { useAuth } from 'src/context/AuthContext';

export type ModernTopCard = {
  title: string;
  digits: string;
  bgcolor: 'primary' | 'warning' | 'secondary' | 'error' | 'success' | 'info';
};

export type RevenueWidgetData = {
  labels: string[];
  createdSeries: number[];
  archivedSeries: number[];
  totalCustomers: number;
  activeCustomers: number;
  archivedCustomers: number;
};

export type YearlyWidgetData = {
  amount: number;
  changePercent: number;
  currentYearLabel: string;
  previousYearLabel: string;
  donutSeries: number[];
};

export type MonthlyWidgetData = {
  value: number;
  changePercent: number;
  sparkline: number[];
};

export type EmployeeSalaryWidgetData = {
  labels: string[];
  series: number[];
  totalCustomers: number;
  archivedCustomers: number;
};

export type CustomersWidgetData = {
  total: number;
  changePercent: number;
  sparkline: number[];
};

export type ProjectsWidgetData = {
  totalTasks: number;
  resolutionPercent: number;
  barSeries: number[];
};

export type SocialWidgetData = {
  title: string;
  dateLabel: string;
  participants: Array<{ name: string }>;
};

export type SellingWidgetItem = {
  product: string;
  price: string;
  percent: number;
  color: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
};

export type WeeklyWidgetStat = {
  title: string;
  subtitle: string;
  percent: string;
  color: 'primary' | 'success' | 'error';
};

export type WeeklyWidgetData = {
  sparkline: number[];
  stats: WeeklyWidgetStat[];
};

export type PerformerWidgetItem = {
  id: string;
  imgsrc: string;
  name: string;
  post: string;
  pname: string;
  status: string;
  budget: string;
};

type CustomerItem = {
  id: string;
  name: string;
  status: 'lead' | 'active' | 'inactive' | 'archived';
  createdBy: string;
  createdAt: string;
  archivedAt: string | null;
};

type CustomerListPayload = {
  items: CustomerItem[];
  total: number;
  page: number;
  pageSize: number;
};

type MemberItem = {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  orgRole: 'employer' | 'employee' | 'investor';
};

type TicketItem = {
  Status: 'Open' | 'Closed' | 'Pending';
  AgentName: string;
  Date: string;
  deleted?: boolean;
};

type NoteItem = {
  title: string;
  datef: string;
  deleted?: boolean;
};

type CalendarItem = {
  start: string;
};

type KanbanItem = {
  id: string;
  name: string;
  child: Array<{ id: string }>;
};

type ChatItem = {
  messages: Array<{ createdAt?: string }>;
};

type ProjectItem = {
  id: string;
  name: string;
  status: 'planned' | 'active' | 'on_hold' | 'completed' | 'archived';
  ownerUserId: string | null;
  members: Array<{
    userId: string;
    memberRole: 'owner' | 'member';
  }>;
};

const toValidDate = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const formatDayLabel = (date: Date) => {
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${day}/${month}`;
};

const formatShortMonth = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
  });

const percentChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
};

const ensureSeriesLength = (series: number[], minLength: number) => {
  if (series.length >= minLength) {
    return series;
  }
  return [...Array.from({ length: minLength - series.length }).map(() => 0), ...series];
};

const avatarForName = (name: string) =>
  `https://ui-avatars.com/api/?background=1976d2&color=fff&name=${encodeURIComponent(name)}`;

const fullName = (member: MemberItem) => {
  const combined = `${member.firstName || ''} ${member.lastName || ''}`.trim();
  return combined || member.email;
};

const getRolePriority = (role: MemberItem['orgRole']) => {
  if (role === 'employer') {
    return 'High';
  }
  if (role === 'employee') {
    return 'Medium';
  }
  return 'Low';
};

const getRoleLabel = (role: MemberItem['orgRole']) => {
  if (role === 'employer') {
    return 'Employer';
  }
  if (role === 'employee') {
    return 'Employee';
  }
  return 'Investor';
};

const buildLastNDays = (days: number) => {
  const today = startOfDay(new Date());
  return Array.from({ length: days }).map((_, index) => {
    const value = new Date(today);
    value.setDate(today.getDate() - (days - 1 - index));
    return value;
  });
};

const buildLastNMonths = (months: number) => {
  const current = new Date();
  return Array.from({ length: months }).map((_, index) => {
    const value = new Date(current.getFullYear(), current.getMonth() - (months - 1 - index), 1);
    return value;
  });
};

const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

export const useModernDashboardData = () => {
  const { activeOrgId, getAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [topCards, setTopCards] = useState<ModernTopCard[]>([
    { title: 'Team Members', digits: '0', bgcolor: 'primary' },
    { title: 'Customers', digits: '0', bgcolor: 'warning' },
    { title: 'Open Tickets', digits: '0', bgcolor: 'secondary' },
    { title: 'Events', digits: '0', bgcolor: 'error' },
    { title: 'Notes', digits: '0', bgcolor: 'success' },
    { title: 'Kanban Tasks', digits: '0', bgcolor: 'info' },
  ]);
  const [revenue, setRevenue] = useState<RevenueWidgetData>({
    labels: [],
    createdSeries: [],
    archivedSeries: [],
    totalCustomers: 0,
    activeCustomers: 0,
    archivedCustomers: 0,
  });
  const [yearly, setYearly] = useState<YearlyWidgetData>({
    amount: 0,
    changePercent: 0,
    currentYearLabel: `${new Date().getFullYear()}`,
    previousYearLabel: `${new Date().getFullYear() - 1}`,
    donutSeries: [0, 0, 0],
  });
  const [monthly, setMonthly] = useState<MonthlyWidgetData>({
    value: 0,
    changePercent: 0,
    sparkline: [0, 0, 0, 0, 0, 0, 0],
  });
  const [employeeSalary, setEmployeeSalary] = useState<EmployeeSalaryWidgetData>({
    labels: [],
    series: [],
    totalCustomers: 0,
    archivedCustomers: 0,
  });
  const [customersCard, setCustomersCard] = useState<CustomersWidgetData>({
    total: 0,
    changePercent: 0,
    sparkline: [0, 0, 0, 0, 0, 0],
  });
  const [projectsCard, setProjectsCard] = useState<ProjectsWidgetData>({
    totalTasks: 0,
    resolutionPercent: 0,
    barSeries: [0, 0, 0, 0, 0, 0],
  });
  const [social, setSocial] = useState<SocialWidgetData>({
    title: 'No workspace activity yet',
    dateLabel: 'Create your first note to see activity here.',
    participants: [],
  });
  const [selling, setSelling] = useState<SellingWidgetItem[]>([]);
  const [weekly, setWeekly] = useState<WeeklyWidgetData>({
    sparkline: [0, 0, 0, 0, 0],
    stats: [],
  });
  const [performers, setPerformers] = useState<PerformerWidgetItem[]>([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const requestErrors: string[] = [];
      const request = <T,>(path: string, fallback: T): Promise<T> =>
        crmRequest(path, { token, orgId: activeOrgId })
          .then((value) => value as T)
          .catch((requestError: any) => {
            requestErrors.push(`${path}: ${requestError?.message || 'Request failed'}`);
            return fallback;
          });

      const firstPage = await request<CustomerListPayload>(
        '/api/customers?page=1&pageSize=100',
        {
          items: [],
          total: 0,
          page: 1,
          pageSize: 100,
        },
      );

      const totalPages = Math.max(1, Math.ceil((firstPage.total || 0) / 100));
      let allCustomers = [...firstPage.items];
      if (totalPages > 1) {
        const pageRequests = Array.from({ length: totalPages - 1 }).map((_, index) =>
          request<CustomerListPayload>(`/api/customers?page=${index + 2}&pageSize=100`, {
            items: [],
            total: firstPage.total,
            page: index + 2,
            pageSize: 100,
          }),
        );
        const remainingPages = await Promise.all(pageRequests);
        for (const page of remainingPages) {
          allCustomers = allCustomers.concat(page.items);
        }
      }

      const membersPath = activeOrgId
        ? `/api/users/members?orgId=${encodeURIComponent(activeOrgId)}`
        : '/api/users/members';

      const [members, tickets, notes, calendar, kanban, chats, projects] = await Promise.all([
        request<MemberItem[]>(membersPath, []),
        request<TicketItem[]>('/api/data/ticket/TicketData', []),
        request<NoteItem[]>('/api/data/notes/NotesData', []),
        request<CalendarItem[]>('/api/data/calendar/CalendarEvents', []),
        request<KanbanItem[]>('/api/kanban', []),
        request<ChatItem[]>('/api/data/chat/ChatData', []),
        request<ProjectItem[]>('/api/projects', []),
      ]);

      const totalCustomers = firstPage.total || allCustomers.length;
      const activeCustomers = allCustomers.filter((customer) => customer.status === 'active').length;
      const archivedCustomers = allCustomers.filter((customer) => customer.status === 'archived').length;

      const totalTasks = kanban.reduce((acc, list) => acc + (list.child?.length || 0), 0);
      const totalNotes = notes.filter((note) => !note.deleted).length;

      const openTickets = tickets.filter((ticket) => ticket.Status === 'Open' && !ticket.deleted).length;
      const pendingTickets = tickets.filter(
        (ticket) => ticket.Status === 'Pending' && !ticket.deleted,
      ).length;
      const closedTickets = tickets.filter((ticket) => ticket.Status === 'Closed' && !ticket.deleted).length;
      const totalTickets = openTickets + pendingTickets + closedTickets;
      const totalMessages = chats.reduce(
        (sum, chat) => sum + (Array.isArray(chat.messages) ? chat.messages.length : 0),
        0,
      );

      const totalProjects = projects.length;
      const completedProjects = projects.filter((project) => project.status === 'completed').length;
      const plannedProjects = projects.filter((project) => project.status === 'planned').length;
      const activeProjects = projects.filter((project) => project.status === 'active').length;
      const onHoldProjects = projects.filter((project) => project.status === 'on_hold').length;
      const archivedProjects = projects.filter((project) => project.status === 'archived').length;

      setTopCards([
        { title: 'Team Members', digits: `${members.length}`, bgcolor: 'primary' },
        { title: 'Customers', digits: `${totalCustomers}`, bgcolor: 'warning' },
        { title: 'Projects', digits: `${totalProjects}`, bgcolor: 'secondary' },
        { title: 'Open Tickets', digits: `${openTickets}`, bgcolor: 'error' },
        { title: 'Notes', digits: `${totalNotes}`, bgcolor: 'success' },
        { title: 'Kanban Tasks', digits: `${totalTasks}`, bgcolor: 'info' },
      ]);

      const last7Days = buildLastNDays(7);
      const createdPerDay = new Map(last7Days.map((day) => [formatDayLabel(day), 0]));
      const archivedPerDay = new Map(last7Days.map((day) => [formatDayLabel(day), 0]));

      for (const customer of allCustomers) {
        const createdAt = toValidDate(customer.createdAt);
        if (createdAt) {
          const key = formatDayLabel(startOfDay(createdAt));
          if (createdPerDay.has(key)) {
            createdPerDay.set(key, (createdPerDay.get(key) || 0) + 1);
          }
        }

        const archivedAt = toValidDate(customer.archivedAt || undefined);
        if (archivedAt) {
          const key = formatDayLabel(startOfDay(archivedAt));
          if (archivedPerDay.has(key)) {
            archivedPerDay.set(key, (archivedPerDay.get(key) || 0) + 1);
          }
        }
      }

      setRevenue({
        labels: last7Days.map(formatDayLabel),
        createdSeries: last7Days.map((day) => createdPerDay.get(formatDayLabel(day)) || 0),
        archivedSeries: last7Days.map((day) => archivedPerDay.get(formatDayLabel(day)) || 0),
        totalCustomers,
        activeCustomers,
        archivedCustomers,
      });

      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;
      const currentYearCustomers = allCustomers.filter((customer) => {
        const created = toValidDate(customer.createdAt);
        return created ? created.getFullYear() === currentYear : false;
      }).length;
      const previousYearCustomers = allCustomers.filter((customer) => {
        const created = toValidDate(customer.createdAt);
        return created ? created.getFullYear() === previousYear : false;
      }).length;

      const leadCustomers = allCustomers.filter((customer) => customer.status === 'lead').length;
      const inactiveCustomers = allCustomers.filter((customer) => customer.status === 'inactive').length;

      setYearly({
        amount: currentYearCustomers,
        changePercent: percentChange(currentYearCustomers, previousYearCustomers),
        currentYearLabel: `${currentYear}`,
        previousYearLabel: `${previousYear}`,
        donutSeries: [activeCustomers, leadCustomers, inactiveCustomers + archivedCustomers],
      });

      const last7Months = buildLastNMonths(7);
      const ticketsByMonth = new Map(last7Months.map((month) => [monthKey(month), 0]));
      for (const ticket of tickets) {
        if (ticket.deleted) {
          continue;
        }
        const date = toValidDate(ticket.Date);
        if (!date) {
          continue;
        }
        const key = monthKey(new Date(date.getFullYear(), date.getMonth(), 1));
        if (ticketsByMonth.has(key)) {
          ticketsByMonth.set(key, (ticketsByMonth.get(key) || 0) + 1);
        }
      }
      const ticketSeries = last7Months.map((month) => ticketsByMonth.get(monthKey(month)) || 0);
      const currentMonthTickets = ticketSeries[ticketSeries.length - 1] || 0;
      const previousMonthTickets = ticketSeries[ticketSeries.length - 2] || 0;
      setMonthly({
        value: currentMonthTickets,
        changePercent: percentChange(currentMonthTickets, previousMonthTickets),
        sparkline: ensureSeriesLength(ticketSeries, 7),
      });

      const last6Months = buildLastNMonths(6);
      const customersByMonth = new Map(last6Months.map((month) => [monthKey(month), 0]));
      for (const customer of allCustomers) {
        const created = toValidDate(customer.createdAt);
        if (!created) {
          continue;
        }
        const key = monthKey(new Date(created.getFullYear(), created.getMonth(), 1));
        if (customersByMonth.has(key)) {
          customersByMonth.set(key, (customersByMonth.get(key) || 0) + 1);
        }
      }
      const customerMonthSeries = last6Months.map((month) => customersByMonth.get(monthKey(month)) || 0);
      const customerCurrentMonth = customerMonthSeries[customerMonthSeries.length - 1] || 0;
      const customerPrevMonth = customerMonthSeries[customerMonthSeries.length - 2] || 0;

      setEmployeeSalary({
        labels: last6Months.map(formatShortMonth),
        series: ensureSeriesLength(customerMonthSeries, 6),
        totalCustomers,
        archivedCustomers,
      });

      setCustomersCard({
        total: totalCustomers,
        changePercent: percentChange(customerCurrentMonth, customerPrevMonth),
        sparkline: ensureSeriesLength(customerMonthSeries, 6),
      });

      setProjectsCard({
        totalTasks: totalProjects,
        resolutionPercent: totalProjects ? Math.round((completedProjects / totalProjects) * 100) : 0,
        barSeries: [
          plannedProjects,
          activeProjects,
          onHoldProjects,
          completedProjects,
          archivedProjects,
          totalProjects,
        ],
      });

      const latestNote = notes
        .filter((note) => !note.deleted)
        .sort((a, b) => {
          const dateA = toValidDate(a.datef)?.getTime() || 0;
          const dateB = toValidDate(b.datef)?.getTime() || 0;
          return dateB - dateA;
        })[0];

      setSocial({
        title: latestNote?.title || 'No internal notes added yet',
        dateLabel: latestNote?.datef
          ? new Date(latestNote.datef).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })
          : 'Add a note in the Notes app to see activity',
        participants: members.slice(0, 5).map((member) => ({ name: fullName(member) })),
      });

      const sellingItems: SellingWidgetItem[] = [
        {
          product: 'Open Tickets',
          price: `${openTickets}`,
          percent: totalTickets ? Math.round((openTickets / totalTickets) * 100) : 0,
          color: 'error',
        },
        {
          product: 'Pending Tickets',
          price: `${pendingTickets}`,
          percent: totalTickets ? Math.round((pendingTickets / totalTickets) * 100) : 0,
          color: 'warning',
        },
        {
          product: 'Closed Tickets',
          price: `${closedTickets}`,
          percent: totalTickets ? Math.round((closedTickets / totalTickets) * 100) : 0,
          color: 'success',
        },
      ];
      setSelling(sellingItems);

      const last5Days = buildLastNDays(5);
      const customersLast5 = new Map(last5Days.map((day) => [formatDayLabel(day), 0]));
      for (const customer of allCustomers) {
        const created = toValidDate(customer.createdAt);
        if (!created) {
          continue;
        }
        const key = formatDayLabel(startOfDay(created));
        if (customersLast5.has(key)) {
          customersLast5.set(key, (customersLast5.get(key) || 0) + 1);
        }
      }
      const monthlyWindowStart = new Date();
      monthlyWindowStart.setDate(monthlyWindowStart.getDate() - 30);
      const upcomingWindowEnd = new Date();
      upcomingWindowEnd.setDate(upcomingWindowEnd.getDate() + 30);
      const newCustomersLast30 = allCustomers.filter((customer) => {
        const created = toValidDate(customer.createdAt);
        return created ? created >= monthlyWindowStart : false;
      }).length;
      const upcomingEvents = calendar.filter((event) => {
        const start = toValidDate(event.start);
        return start ? start >= new Date() && start <= upcomingWindowEnd : false;
      }).length;

      setWeekly({
        sparkline: last5Days.map((day) => customersLast5.get(formatDayLabel(day)) || 0),
        stats: [
          {
            title: 'New Customers',
            subtitle: 'Last 30 days',
            percent: `${newCustomersLast30}`,
            color: 'primary',
          },
          {
            title: 'Upcoming Events',
            subtitle: 'Next 30 days',
            percent: `${upcomingEvents}`,
            color: 'success',
          },
          {
            title: 'Chat Messages',
            subtitle: 'Total internal messages',
            percent: `${totalMessages}`,
            color: 'error',
          },
        ],
      });

      const ticketsByAgent = new Map<string, number>();
      for (const ticket of tickets) {
        if (ticket.deleted) {
          continue;
        }
        const agent = String(ticket.AgentName || '').trim();
        if (!agent) {
          continue;
        }
        ticketsByAgent.set(agent, (ticketsByAgent.get(agent) || 0) + 1);
      }

      const customersByCreator = new Map<string, number>();
      for (const customer of allCustomers) {
        customersByCreator.set(customer.createdBy, (customersByCreator.get(customer.createdBy) || 0) + 1);
      }

      const projectCountByUser = new Map<string, number>();
      const projectNamesByUser = new Map<string, string[]>();
      for (const project of projects) {
        const participants = new Set<string>();

        if (project.ownerUserId) {
          participants.add(project.ownerUserId);
        }
        for (const member of project.members || []) {
          participants.add(member.userId);
        }

        for (const userId of participants) {
          projectCountByUser.set(userId, (projectCountByUser.get(userId) || 0) + 1);
          const userProjects = projectNamesByUser.get(userId) || [];
          userProjects.push(project.name);
          projectNamesByUser.set(userId, userProjects);
        }
      }

      const performerRows = members
        .map((member) => {
          const name = fullName(member);
          const ticketsAssigned =
            ticketsByAgent.get(name) || ticketsByAgent.get(member.email) || 0;
          const customersCreated = customersByCreator.get(member.userId) || 0;
          const projectWorkload = projectCountByUser.get(member.userId) || 0;
          const workload = ticketsAssigned + customersCreated + projectWorkload;
          const assignedProjects = projectNamesByUser.get(member.userId) || [];
          return {
            id: member.userId,
            imgsrc: avatarForName(name),
            name,
            post: getRoleLabel(member.orgRole),
            pname: assignedProjects[0] || 'No Project',
            status: getRolePriority(member.orgRole),
            budget: `${workload}`,
            workload,
          };
        })
        .sort((a, b) => b.workload - a.workload)
        .slice(0, 6)
        .map(({ workload, ...row }) => row);

      setPerformers(performerRows);
      if (requestErrors.length > 0) {
        setError(`Some dashboard sources failed to load. ${requestErrors[0]}`);
      }
    } catch (loadError: any) {
      setError(loadError?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [activeOrgId, getAccessToken]);

  useEffect(() => {
    loadDashboard().catch(() => {
      setLoading(false);
    });
  }, [loadDashboard]);

  return useMemo(
    () => ({
      loading,
      error,
      topCards,
      revenue,
      yearly,
      monthly,
      employeeSalary,
      customersCard,
      projectsCard,
      social,
      selling,
      weekly,
      performers,
      reload: loadDashboard,
    }),
    [
      loading,
      error,
      topCards,
      revenue,
      yearly,
      monthly,
      employeeSalary,
      customersCard,
      projectsCard,
      social,
      selling,
      weekly,
      performers,
      loadDashboard,
    ],
  );
};
