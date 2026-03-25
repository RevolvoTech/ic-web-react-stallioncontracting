// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import { Box, Grid, Alert, Button, Stack } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

import TopCards from 'src/components/dashboards/modern/TopCards';
import RevenueUpdates from 'src/components/dashboards/modern/RevenueUpdates';
import YearlyBreakup from 'src/components/dashboards/modern/YearlyBreakup';
import MonthlyEarnings from 'src/components/dashboards/modern/MonthlyEarnings';
import EmployeeSalary from 'src/components/dashboards/modern/EmployeeSalary';
import Customers from 'src/components/dashboards/modern/Customers';
import Projects from 'src/components/dashboards/modern/Projects';
import Social from 'src/components/dashboards/modern/Social';
import SellingProducts from 'src/components/dashboards/modern/SellingProducts';
import WeeklyStats from 'src/components/dashboards/modern/WeeklyStats';
import TopPerformers from 'src/components/dashboards/modern/TopPerformers';
import { useModernDashboardData } from './useModernDashboardData';

const Modern = () => {
  const dashboard = useModernDashboardData();

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
            <RevenueUpdates data={dashboard.revenue} />
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
                <YearlyBreakup data={dashboard.yearly} />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 12
                }}>
                <MonthlyEarnings data={dashboard.monthly} />
              </Grid>
            </Grid>
          </Grid>
          {/* column */}
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <EmployeeSalary data={dashboard.employeeSalary} />
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
                <Customers data={dashboard.customersCard} />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Projects data={dashboard.projectsCard} />
              </Grid>
              <Grid size={12}>
                <Social data={dashboard.social} />
              </Grid>
            </Grid>
          </Grid>
          {/* column */}
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <SellingProducts data={dashboard.selling} />
          </Grid>
          {/* column */}
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <WeeklyStats data={dashboard.weekly} />
          </Grid>
          {/* column */}
          <Grid
            size={{
              xs: 12,
              lg: 8
            }}>
            <TopPerformers performers={dashboard.performers} />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>)
  );
};

export default Modern;
