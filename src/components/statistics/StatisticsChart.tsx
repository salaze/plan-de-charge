
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface StatisticsChartProps {
  chartData: Array<{ name: string; [key: string]: number | string }>;
  statusCodes: StatusCode[];
  isLoading: boolean;
}

// Helper function to convert Tailwind CSS class to hex color
const getColorFromStatusCode = (statusCode: StatusCode): string => {
  const statusColor = STATUS_COLORS[statusCode] || '';
  
  // Extraire la couleur de la classe Tailwind
  if (statusColor.includes('bg-yellow-300')) return '#fde047';
  if (statusColor.includes('bg-red-500')) return '#ef4444';
  if (statusColor.includes('bg-blue-500')) return '#3b82f6';
  if (statusColor.includes('bg-green-500')) return '#22c55e';
  if (statusColor.includes('bg-amber-800')) return '#92400e';
  if (statusColor.includes('bg-purple-500')) return '#a855f7';
  if (statusColor.includes('bg-gray-400')) return '#9ca3af';
  if (statusColor.includes('bg-green-600')) return '#16a34a';
  if (statusColor.includes('bg-pink-300')) return '#f9a8d4';
  if (statusColor.includes('bg-blue-300')) return '#93c5fd';
  if (statusColor.includes('bg-indigo-500')) return '#6366f1';
  if (statusColor.includes('bg-pink-600')) return '#db2777';
  if (statusColor.includes('bg-teal-500')) return '#14b8a6';
  
  // Couleur par défaut
  return '#888888';
};

export const StatisticsChart = ({ chartData, statusCodes, isLoading }: StatisticsChartProps) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Chargement des statistiques...
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <p className="text-center mb-2">Aucune donnée disponible.</p>
        <p className="text-center text-sm">Assurez-vous que des employés sont présents dans le planning et que leurs statuts sont configurés.</p>
      </div>
    );
  }

  // Créer la configuration des couleurs pour le graphique
  const chartConfig = statusCodes.reduce((config, status) => {
    return {
      ...config,
      [status]: {
        label: STATUS_LABELS[status],
        color: getColorFromStatusCode(status)
      }
    };
  }, {});

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip
          content={<ChartTooltipContent />}
        />
        <Legend content={(props) => {
          return (
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {props.payload?.map((entry) => (
                <div key={entry.value} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs">{STATUS_LABELS[entry.value as StatusCode] || entry.value}</span>
                </div>
              ))}
            </div>
          );
        }} />
        {statusCodes.map(status => (
          <Bar
            key={status}
            dataKey={status}
            name={STATUS_LABELS[status]}
            fill={getColorFromStatusCode(status)}
            stroke={getColorFromStatusCode(status)}
            strokeWidth={1}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
};
