// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Grid, Stack, Typography, Avatar } from '@mui/material';
import { IconArrowUpLeft } from '@tabler/icons-react';

import DashboardCard from '../../shared/DashboardCard';
import { Props } from 'react-apexcharts';
import { YearlyWidgetData } from 'src/views/dashboard/useModernDashboardData';

type YearlyBreakupProps = {
  data?: YearlyWidgetData;
};

const defaultData: YearlyWidgetData = {
  amount: 0,
  changePercent: 0,
  currentYearLabel: `${new Date().getFullYear()}`,
  previousYearLabel: `${new Date().getFullYear() - 1}`,
  donutSeries: [0, 0, 0],
};

const YearlyBreakup = ({ data = defaultData }: YearlyBreakupProps) => {
  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = theme.palette.primary.light;
  const successlight = theme.palette.success.light;

  // chart
  const optionscolumnchart: Props = {
    chart: {
      type: 'donut',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 155,
    },
    colors: [primary, primarylight, '#F9F9FD'],
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        donut: {
          size: '75%',
          background: 'transparent',
        },
      },
    },
    tooltip: {
      enabled: false,
    },
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 991,
        options: {
          chart: {
            width: 120,
          },
        },
      },
    ],
  };
  const seriescolumnchart = data.donutSeries;

  return (
    (<DashboardCard title="Yearly Breakup">
      <Grid container spacing={3}>
        {/* column */}
        <Grid
          size={{
            xs: 7,
            sm: 7
          }}>
          <Typography variant="h3" fontWeight="700">
            {data.amount}
          </Typography>
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Avatar sx={{ bgcolor: successlight, width: 27, height: 27 }}>
              <IconArrowUpLeft width={20} color="#39B69A" />
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              {data.changePercent >= 0 ? '+' : ''}
              {data.changePercent}%
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              vs last year
            </Typography>
          </Stack>
          <Stack spacing={3} mt={5} direction="row">
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{ width: 9, height: 9, bgcolor: primary, svg: { display: 'none' } }}
              ></Avatar>
              <Typography variant="subtitle2" color="textSecondary">
                {data.previousYearLabel}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{ width: 9, height: 9, bgcolor: primarylight, svg: { display: 'none' } }}
              ></Avatar>
              <Typography variant="subtitle2" color="textSecondary">
                {data.currentYearLabel}
              </Typography>
            </Stack>
          </Stack>
        </Grid>
        {/* column */}
        <Grid
          size={{
            xs: 5,
            sm: 5
          }}>
          <Chart
            options={optionscolumnchart}
            series={seriescolumnchart}
            type="donut"
            height="130px"
          />
        </Grid>
      </Grid>
    </DashboardCard>)
  );
};

export default YearlyBreakup;
