import { useCallback, useEffect, useMemo, useState } from 'react';
import { crmRequest } from 'src/api/crm/client';
import { useAuth } from 'src/context/AuthContext';
import { isAbortError } from 'src/lib/fetchWithTimeout';

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

type ModernDashboardPayload = {
  topCards: ModernTopCard[];
  revenue: RevenueWidgetData;
  yearly: YearlyWidgetData;
  monthly: MonthlyWidgetData;
  employeeSalary: EmployeeSalaryWidgetData;
  customersCard: CustomersWidgetData;
  projectsCard: ProjectsWidgetData;
  social: SocialWidgetData;
  selling: SellingWidgetItem[];
  weekly: WeeklyWidgetData;
  performers: PerformerWidgetItem[];
};

const DEFAULT_DASHBOARD_DATA: ModernDashboardPayload = {
  topCards: [
    { title: 'Team Members', digits: '0', bgcolor: 'primary' },
    { title: 'Customers', digits: '0', bgcolor: 'warning' },
    { title: 'Open Tickets', digits: '0', bgcolor: 'secondary' },
    { title: 'Events', digits: '0', bgcolor: 'error' },
    { title: 'Notes', digits: '0', bgcolor: 'success' },
    { title: 'Kanban Tasks', digits: '0', bgcolor: 'info' },
  ],
  revenue: {
    labels: [],
    createdSeries: [],
    archivedSeries: [],
    totalCustomers: 0,
    activeCustomers: 0,
    archivedCustomers: 0,
  },
  yearly: {
    amount: 0,
    changePercent: 0,
    currentYearLabel: `${new Date().getFullYear()}`,
    previousYearLabel: `${new Date().getFullYear() - 1}`,
    donutSeries: [0, 0, 0],
  },
  monthly: {
    value: 0,
    changePercent: 0,
    sparkline: [0, 0, 0, 0, 0, 0, 0],
  },
  employeeSalary: {
    labels: [],
    series: [],
    totalCustomers: 0,
    archivedCustomers: 0,
  },
  customersCard: {
    total: 0,
    changePercent: 0,
    sparkline: [0, 0, 0, 0, 0, 0],
  },
  projectsCard: {
    totalTasks: 0,
    resolutionPercent: 0,
    barSeries: [0, 0, 0, 0, 0, 0],
  },
  social: {
    title: 'No workspace activity yet',
    dateLabel: 'Create your first note to see activity here.',
    participants: [],
  },
  selling: [],
  weekly: {
    sparkline: [0, 0, 0, 0, 0],
    stats: [],
  },
  performers: [],
};

export const useModernDashboardData = () => {
  const { activeOrgId, getAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState<ModernDashboardPayload>(DEFAULT_DASHBOARD_DATA);

  const loadDashboard = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const payload = (await crmRequest('/api/dashboard/modern', {
        token,
        orgId: activeOrgId,
        signal,
      })) as ModernDashboardPayload;

      setDashboardData({
        topCards: payload.topCards || DEFAULT_DASHBOARD_DATA.topCards,
        revenue: payload.revenue || DEFAULT_DASHBOARD_DATA.revenue,
        yearly: payload.yearly || DEFAULT_DASHBOARD_DATA.yearly,
        monthly: payload.monthly || DEFAULT_DASHBOARD_DATA.monthly,
        employeeSalary: payload.employeeSalary || DEFAULT_DASHBOARD_DATA.employeeSalary,
        customersCard: payload.customersCard || DEFAULT_DASHBOARD_DATA.customersCard,
        projectsCard: payload.projectsCard || DEFAULT_DASHBOARD_DATA.projectsCard,
        social: payload.social || DEFAULT_DASHBOARD_DATA.social,
        selling: payload.selling || DEFAULT_DASHBOARD_DATA.selling,
        weekly: payload.weekly || DEFAULT_DASHBOARD_DATA.weekly,
        performers: payload.performers || DEFAULT_DASHBOARD_DATA.performers,
      });
    } catch (loadError: any) {
      if (isAbortError(loadError)) {
        return;
      }

      setError(loadError?.message || 'Failed to load dashboard data');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [activeOrgId, getAccessToken]);

  useEffect(() => {
    const controller = new AbortController();

    loadDashboard(controller.signal).catch(() => {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    });

    return () => {
      controller.abort();
    };
  }, [loadDashboard]);

  return useMemo(
    () => ({
      loading,
      error,
      topCards: dashboardData.topCards,
      revenue: dashboardData.revenue,
      yearly: dashboardData.yearly,
      monthly: dashboardData.monthly,
      employeeSalary: dashboardData.employeeSalary,
      customersCard: dashboardData.customersCard,
      projectsCard: dashboardData.projectsCard,
      social: dashboardData.social,
      selling: dashboardData.selling,
      weekly: dashboardData.weekly,
      performers: dashboardData.performers,
      reload: loadDashboard,
    }),
    [dashboardData, error, loadDashboard, loading],
  );
};
