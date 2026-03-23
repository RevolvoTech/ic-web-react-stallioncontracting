// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';

import DashboardWidgetCard from '../../shared/DashboardWidgetCard';
import { Props } from 'react-apexcharts';
import { EmployeeSalaryWidgetData } from 'src/views/dashboard/useModernDashboardData';

type EmployeeSalaryProps = {
  data: EmployeeSalaryWidgetData;
};

const EmployeeSalary = ({ data }: EmployeeSalaryProps) => {
  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = theme.palette.grey[100];

  // chart
  const optionscolumnchart: Props = {
    chart: {
      type: 'bar',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 280,
    },
    colors: [primarylight, primarylight, primary, primarylight, primarylight, primarylight],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '45%',
        distributed: true,
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    grid: {
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    xaxis: {
      categories: data.labels.map((label) => [label]),
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
    },
  };
  const seriescolumnchart = [
    {
      name: '',
      data: data.series,
    },
  ];

  return (
    <DashboardWidgetCard
      title="Customer Growth"
      subtitle="Last 6 months"
      dataLabel1="Customers"
      dataItem1={`${data.totalCustomers}`}
      dataLabel2="Archived"
      dataItem2={`${data.archivedCustomers}`}
    >
      <>
        <Chart options={optionscolumnchart} series={seriescolumnchart} type="bar" height="280px" />
      </>
    </DashboardWidgetCard>
  );
};

export default EmployeeSalary;
