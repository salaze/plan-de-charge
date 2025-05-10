
import React from 'react';
import { StatusCode, STATUS_LABELS } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PrintableOverviewChartProps {
  chartData: Array<{ name: string; [key: string]: number | string }>;
  statusCodes: StatusCode[];
}

// Définition des couleurs associées aux statuts
const STATUS_COLORS: Record<string, string> = {
  'assistance': '#4CAF50',
  'vigi': '#8B5CF6',
  'formation': '#FFA726',
  'projet': '#0EA5E9',
  'conges': '#EF4444',
  'management': '#F97316',
  'tp': '#D946EF',
  'coordinateur': '#10B981',
  'absence': '#6B7280',
  'regisseur': '#6366F1',
  'demenagement': '#F59E0B',
  'permanence': '#EC4899',
  'parc': '#14B8A6'
};

export const PrintableOverviewChart = ({ chartData, statusCodes }: PrintableOverviewChartProps) => {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold mb-4">Vue d'ensemble par employé</h2>
      <div className="h-80 border p-4 rounded-lg bg-white print-chart">
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
                fill={STATUS_COLORS[status] || '#888'}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
