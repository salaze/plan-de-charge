
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StatusCode, STATUS_LABELS } from '@/types';

interface StatisticsChartProps {
  chartData: Array<{ name: string; [key: string]: number | string }>;
  statusCodes: StatusCode[];
  isLoading: boolean;
}

export const StatisticsChart = ({ chartData, statusCodes, isLoading }: StatisticsChartProps) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Chargement des statuts...
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {statusCodes.map(status => (
          <Bar
            key={status}
            dataKey={status}
            name={STATUS_LABELS[status]}
            stackId="a"
            fill={`var(--${status}-color, #888)`}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
