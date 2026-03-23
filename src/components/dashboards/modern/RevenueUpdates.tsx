// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { MenuItem, Grid, Stack, Typography, Button, Avatar, Box } from '@mui/material';
import { IconGridDots } from '@tabler/icons-react';
import DashboardCard from '../../shared/DashboardCard';
import CustomSelect from '../../forms/theme-elements/CustomSelect';
import { Props } from 'react-apexcharts';
import { RevenueWidgetData } from 'src/views/dashboard/useModernDashboardData';

type RevenueUpdatesProps = {
  data?: RevenueWidgetData;
};

const defaultData: RevenueWidgetData = {
  labels: ['-', '-', '-', '-', '-', '-', '-'],
  createdSeries: [0, 0, 0, 0, 0, 0, 0],
  archivedSeries: [0, 0, 0, 0, 0, 0, 0],
  totalCustomers: 0,
  activeCustomers: 0,
  archivedCustomers: 0,
};

const RevenueUpdates = ({ data = defaultData }: RevenueUpdatesProps) => {
  const [month, setMonth] = React.useState('1');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMonth(event.target.value);
  };

  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  // chart
  const optionscolumnchart: Props = {
    chart: {
      type: 'bar',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: true,
      },
      height: 370,
      stacked: true,
    },
    colors: [primary, secondary],
    plotOptions: {
      bar: {
        horizontal: false,
        barHeight: '60%',
        columnWidth: '20%',
        borderRadius: [6],
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'all',
      },
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
    grid: {
      borderColor: 'rgba(0,0,0,0.1)',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    yaxis: {
      min: -5,
      max: 5,
      tickAmount: 4,
    },
    xaxis: {
      categories: data.labels,
      axisBorder: {
        show: false,
      },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      fillSeriesColor: false,
    },
  };
  const seriescolumnchart = [
    {
      name: 'Created',
      data: data.createdSeries,
    },
    {
      name: 'Archived',
      data: data.archivedSeries.map((value) => value * -1),
    },
  ];

  return (
    (<DashboardCard
      title="Customer Updates"
      subtitle="Last 7 days"
      action={
        <CustomSelect
          labelId="month-dd"
          id="month-dd"
          size="small"
          value={month}
          onChange={handleChange}
        >
          <MenuItem value={1}>Current view</MenuItem>
          <MenuItem value={2}>Last 30 days</MenuItem>
          <MenuItem value={3}>Last 90 days</MenuItem>
        </CustomSelect>
      }
    >
      <Grid container spacing={3}>
        {/* column */}
        <Grid
          size={{
            xs: 12,
            sm: 8
          }}>
          <Box className="rounded-bars">
            <Chart
              options={optionscolumnchart}
              series={seriescolumnchart}
              type="bar"
              height="370px"
            />
          </Box>
        </Grid>
        {/* column */}
        <Grid
          size={{
            xs: 12,
            sm: 4
          }}>
          <Stack spacing={3} mt={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                width={40}
                height={40}
                bgcolor="primary.light"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography color="primary" variant="h6" display="flex">
                  <IconGridDots width={21} />
                </Typography>
              </Box>
              <Box>
                <Typography variant="h3" fontWeight="700">
                  {data.totalCustomers}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Customers
                </Typography>
              </Box>
            </Stack>
          </Stack>
          <Stack spacing={3} my={5}>
            <Stack direction="row" spacing={2}>
              <Avatar
                sx={{ width: 9, mt: 1, height: 9, bgcolor: primary, svg: { display: 'none' } }}
              ></Avatar>
              <Box>
                <Typography variant="subtitle1" color="textSecondary">
                  Active customers
                </Typography>
                <Typography variant="h5">{data.activeCustomers}</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Avatar
                sx={{ width: 9, mt: 1, height: 9, bgcolor: secondary, svg: { display: 'none' } }}
              ></Avatar>
              <Box>
                <Typography variant="subtitle1" color="textSecondary">
                  Archived customers
                </Typography>
                <Typography variant="h5">{data.archivedCustomers}</Typography>
              </Box>
            </Stack>
          </Stack>
          <Button color="primary" variant="contained" fullWidth>
            View Customer List
          </Button>
        </Grid>
      </Grid>
    </DashboardCard>)
  );
};

export default RevenueUpdates;
