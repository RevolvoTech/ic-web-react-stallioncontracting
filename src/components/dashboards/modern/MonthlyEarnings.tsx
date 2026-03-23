// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Fab } from '@mui/material';
import { IconArrowDownRight, IconCurrencyDollar } from '@tabler/icons-react';

import DashboardCard from '../../shared/DashboardCard';
import { Props } from 'react-apexcharts';
import { MonthlyWidgetData } from 'src/views/dashboard/useModernDashboardData';

type MonthlyEarningsProps = {
  data?: MonthlyWidgetData;
};

const defaultData: MonthlyWidgetData = {
  value: 0,
  changePercent: 0,
  sparkline: [0, 0, 0, 0, 0, 0, 0],
};

const MonthlyEarnings = ({ data = defaultData }: MonthlyEarningsProps) => {
  // chart color
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const secondarylight = theme.palette.secondary.light;
  const errorlight = theme.palette.error.light;

  // chart
  const optionscolumnchart: Props = {
    chart: {
      type: 'area',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 60,
      sparkline: {
        enabled: true,
      },
      group: 'sparklines',
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      colors: [secondarylight],
      type: 'solid',
      opacity: 0.05,
    },
    markers: {
      size: 0,
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      x: {
        show: false
      }
    },
  };
  const seriescolumnchart = [
    {
      name: '',
      color: secondary,
      data: data.sparkline,
    },
  ];

  return (
    <DashboardCard
      title="Monthly Tickets"
      action={
        <Fab color="secondary" size="medium">
          <IconCurrencyDollar width={24} />
        </Fab>
      }
      footer={
        <Chart options={optionscolumnchart} series={seriescolumnchart} type="area" height="60px" />
      }
    >
      <>
        <Typography variant="h3" fontWeight="700" mt="-20px">
          {data.value}
        </Typography>
        <Stack direction="row" spacing={1} my={1} alignItems="center">
          <Avatar sx={{ bgcolor: errorlight, width: 27, height: 27 }}>
            <IconArrowDownRight width={20} color="#FA896B" />
          </Avatar>
          <Typography variant="subtitle2" fontWeight="600">
            {data.changePercent >= 0 ? '+' : ''}
            {data.changePercent}%
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            vs previous month
          </Typography>
        </Stack>
      </>
    </DashboardCard>
  );
};

export default MonthlyEarnings;
