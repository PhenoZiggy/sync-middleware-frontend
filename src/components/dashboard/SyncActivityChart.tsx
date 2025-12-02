'use client';

import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

interface SyncActivityChartProps {
  data?: {
    dates: string[];
    successCount: number[];
    failedCount: number[];
    ignoredCount: number[];
  };
  loading?: boolean;
}

export default function SyncActivityChart({ data, loading = false }: SyncActivityChartProps) {
  const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d'>('7d');

  const options: ApexOptions = {
    colors: ['#10B981', '#EF4444', '#F59E0B'],
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'area',
      height: 350,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    xaxis: {
      categories: data?.dates || [],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#64748B',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Number of Records',
        style: {
          color: '#64748B',
          fontSize: '12px',
        },
      },
      labels: {
        style: {
          colors: '#64748B',
          fontSize: '12px',
        },
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      fontFamily: 'Outfit',
      markers: {
        radius: 12,
      },
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    tooltip: {
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => `${val} records`,
      },
    },
  };

  const series = [
    {
      name: 'Successful',
      data: data?.successCount || [],
    },
    {
      name: 'Failed',
      data: data?.failedCount || [],
    },
    {
      name: 'Ignored',
      data: data?.ignoredCount || [],
    },
  ];

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Sync Activity Overview
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Attendance sync trends over time
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimePeriod('7d')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              timePeriod === '7d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimePeriod('30d')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              timePeriod === '30d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimePeriod('90d')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              timePeriod === '90d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>
      <div className="-ml-4">
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={350}
        />
      </div>
    </div>
  );
}
