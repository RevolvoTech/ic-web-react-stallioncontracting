// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { lazy, startTransition, useEffect, useState } from 'react';
import { Box, Grid, Alert, Button, Stack, Card, CardContent, Skeleton } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import Loadable from 'src/layouts/full/shared/loadable/Loadable';

import { useModernDashboardData } from './useModernDashboardData';

const TopCards = Loadable(lazy(() => import('src/components/dashboards/modern/TopCards')));
const RevenueUpdates = Loadable(lazy(() => import('src/components/dashboards/modern/RevenueUpdates')));
const YearlyBreakup = Loadable(lazy(() => import('src/components/dashboards/modern/YearlyBreakup')));
const MonthlyEarnings = Loadable(lazy(() => import('src/components/dashboards/modern/MonthlyEarnings')));
const EmployeeSalary = Loadable(lazy(() => import('src/components/dashboards/modern/EmployeeSalary')));
const Customers = Loadable(lazy(() => import('src/components/dashboards/modern/Customers')));
const Projects = Loadable(lazy(() => import('src/components/dashboards/modern/Projects')));
const Social = Loadable(lazy(() => import('src/components/dashboards/modern/Social')));
const SellingProducts = Loadable(lazy(() => import('src/components/dashboards/modern/SellingProducts')));
const WeeklyStats = Loadable(lazy(() => import('src/components/dashboards/modern/WeeklyStats')));
const TopPerformers = Loadable(lazy(() => import('src/components/dashboards/modern/TopPerformers')));

const DashboardPlaceholder = ({ height = 280 }: { height?: number }) => (
  <Card variant="outlined">
    <CardContent>
      <Skeleton variant="text" width="40%" height={32} />
      <Skeleton variant="rectangular" height={height} sx={{ mt: 2, borderRadius: 2 }} />
    </CardContent>
  </Card>
);

const scheduleDeferredWidgets = (callback: () => void) => {
  if (typeof window === 'undefined') {
    callback();
    return () => {};
  }

  if ('requestIdleCallback' in window) {
    const idleId = window.requestIdleCallback(() => callback(), { timeout: 500 });
    return () => {
      window.cancelIdleCallback(idleId);
    };
  }

  const timeoutId = globalThis.setTimeout(callback, 150);
  return () => {
    globalThis.clearTimeout(timeoutId);
  };
};

const Modern = () => {
  const dashboard = useModernDashboardData();
  const [showDeferredWidgets, setShowDeferredWidgets] = useState(false);

  useEffect(() => {
    setShowDeferredWidgets(false);
    return scheduleDeferredWidgets(() => {
      startTransition(() => {
        setShowDeferredWidgets(true);
      });
    });
  }, []);

  return (
    (<PageContainer title="Modern Dashboard" description="this is Modern Dashboard page">
      <Box>
        {dashboard.error ? (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => dashboard.reload()}>
                Retry
              </Button>
            }
          >
            {dashboard.error}
          </Alert>
        ) : null}
        {dashboard.loading ? (
          <Stack sx={{ mb: 3 }}>
            <Alert severity="info">Refreshing dashboard data...</Alert>
          </Stack>
        ) : null}
        <Grid container spacing={3}>
          {/* column */}
          <Grid
            size={{
              xs: 12,
              lg: 12
            }}>
            <TopCards cards={dashboard.topCards} />
          </Grid>
          {/* column */}
          <Grid
            size={{
              xs: 12,
              lg: 8
            }}>
            {showDeferredWidgets ? <RevenueUpdates data={dashboard.revenue} /> : <DashboardPlaceholder height={320} />}
          </Grid>
          {/* column */}
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <Grid container spacing={3}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 12
                }}>
                {showDeferredWidgets ? <YearlyBreakup data={dashboard.yearly} /> : <DashboardPlaceholder height={180} />}
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 12
                }}>
                {showDeferredWidgets ? <MonthlyEarnings data={dashboard.monthly} /> : <DashboardPlaceholder height={180} />}
              </Grid>
            </Grid>
          </Grid>
          {/* column */}
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            {showDeferredWidgets ? <EmployeeSalary data={dashboard.employeeSalary} /> : <DashboardPlaceholder height={360} />}
          </Grid>
          {/* column */}
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <Grid container spacing={3}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                {showDeferredWidgets ? <Customers data={dashboard.customersCard} /> : <DashboardPlaceholder height={180} />}
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                {showDeferredWidgets ? <Projects data={dashboard.projectsCard} /> : <DashboardPlaceholder height={180} />}
              </Grid>
              <Grid size={12}>
                {showDeferredWidgets ? <Social data={dashboard.social} /> : <DashboardPlaceholder height={180} />}
              </Grid>
            </Grid>
          </Grid>
          {/* column */}
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            {showDeferredWidgets ? <SellingProducts data={dashboard.selling} /> : <DashboardPlaceholder height={360} />}
          </Grid>
          {/* column */}
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            {showDeferredWidgets ? <WeeklyStats data={dashboard.weekly} /> : <DashboardPlaceholder height={360} />}
          </Grid>
          {/* column */}
          <Grid
            size={{
              xs: 12,
              lg: 8
            }}>
            {showDeferredWidgets ? <TopPerformers performers={dashboard.performers} /> : <DashboardPlaceholder height={360} />}
          </Grid>
        </Grid>
      </Box>
    </PageContainer>)
  );
};

export default Modern;
