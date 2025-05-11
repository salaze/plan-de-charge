
import React from 'react';
import { StatusCode, STATUS_LABELS } from '@/types';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface PrintableEmployeeChartsProps {
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

export const PrintableEmployeeCharts = ({ chartData, statusCodes }: PrintableEmployeeChartsProps) => {
  // Transformer les données pour les graphiques
  const prepareChartData = (employee: any) => {
    return statusCodes
      .map(status => ({
        name: STATUS_LABELS[status],
        value: employee[status] as number || 0,
        status
      }))
      .filter(item => item.value > 0);
  };
  
  // Limiter le nombre d'employés affichés pour améliorer les performances
  const displayLimit = 12;
  const limitedChartData = chartData.length > displayLimit 
    ? chartData.slice(0, displayLimit) 
    : chartData;

  return (
    <div className="page-break-before">
      <h2 className="text-xl font-semibold mb-4">Répartition détaillée par employé</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {limitedChartData.map((employee, index) => {
          const pieData = prepareChartData(employee);
          
          if (pieData.length === 0) return null;
          
          return (
            <div key={index} className="border p-4 rounded-lg bg-white mb-10 print-chart">
              <h3 className="text-lg font-medium mb-4">{employee.name as string}</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <PieChart width={400} height={300}>
                  <Pie
                    data={pieData}
                    cx={200}
                    cy={150}
                    labelLine={true}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    isAnimationActive={false} // Désactiver les animations pour l'impression
                  >
                    {pieData.map((entry, i) => (
                      <Cell 
                        key={`cell-${i}`} 
                        fill={STATUS_COLORS[entry.status] || `hsl(${i * 45}, 70%, 50%)`} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            </div>
          );
        })}
        
        {chartData.length > displayLimit && (
          <div className="col-span-2 text-center mt-4 text-gray-500">
            <p>Seuls les {displayLimit} premiers employés sont affichés pour optimiser les performances.</p>
          </div>
        )}
      </div>
    </div>
  );
};
