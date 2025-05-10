
import React, { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StatusCode, STATUS_LABELS } from '@/types';

interface StatisticsChartProps {
  chartData: Array<{ name: string; [key: string]: number | string }>;
  statusCodes: StatusCode[];
  isLoading: boolean;
}

// Utilisation de memo pour éviter les re-rendus inutiles
export const StatisticsChart = memo(({ chartData, statusCodes, isLoading }: StatisticsChartProps) => {
  // Optimisation du rendu avec useMemo
  const renderContent = useMemo(() => {
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
    
    // Optimization: Process only needed data
    const optimizedData = chartData.map(item => {
      const newItem: {name: string; [key: string]: number | string} = { name: item.name };
      statusCodes.forEach(code => {
        newItem[code] = item[code] || 0;
      });
      return newItem;
    });
  
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={optimizedData}
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
              animationDuration={300}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }, [chartData, statusCodes, isLoading]); // Dépendances minimales

  return renderContent;
});

StatisticsChart.displayName = 'StatisticsChart';
