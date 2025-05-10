
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { StatusCode, STATUS_LABELS } from '@/types';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';

// Définition des couleurs associées aux statuts
const STATUS_COLORS: Record<string, string> = {
  'assistance': 'var(--attendance-present)',
  'vigi': '#8B5CF6',
  'formation': 'var(--attendance-training)',
  'projet': '#0EA5E9',
  'conges': 'var(--attendance-vacation)',
  'management': '#F97316',
  'tp': '#D946EF',
  'coordinateur': '#10B981',
  'absence': 'var(--attendance-absent)',
  'regisseur': '#6366F1',
  'demenagement': '#F59E0B',
  'permanence': '#EC4899',
  'parc': '#14B8A6'
};

interface StatisticsPieChartProps {
  chartData: Array<{ name: string; [key: string]: number | string }>;
  statusCodes: StatusCode[];
  isLoading: boolean;
  className?: string;
}

export const StatisticsPieChart = React.forwardRef<HTMLDivElement, StatisticsPieChartProps>(({ 
  chartData, 
  statusCodes, 
  isLoading,
  className 
}, ref) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  
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

  // Si aucun employé n'est sélectionné, prendre le premier de la liste
  const currentEmployee = selectedEmployee || chartData[0].name;
  
  // Obtenir les données de l'employé sélectionné
  const employeeData = chartData.find(employee => employee.name === currentEmployee);
  
  if (!employeeData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <p className="text-center">Aucune donnée disponible pour cet employé.</p>
      </div>
    );
  }

  // Transformer les données pour le camembert
  const pieData = statusCodes
    .map(status => ({
      name: STATUS_LABELS[status],
      value: employeeData[status] as number,
      status
    }))
    .filter(item => item.value > 0); // Filtrer les statuts avec une valeur de 0

  return (
    <div ref={ref} className={`w-full h-full ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h3 className="font-medium">Répartition par statut pour:</h3>
          <select 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white focus:border-primary focus:ring-1 focus:ring-primary"
            value={currentEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            {chartData.map(employee => (
              <option key={employee.name as string} value={employee.name as string}>
                {employee.name as string}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={STATUS_COLORS[entry.status] || `hsl(${index * 45}, 70%, 50%)`} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value} jours`, name]}
            labelFormatter={() => currentEmployee}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

StatisticsPieChart.displayName = 'StatisticsPieChart';
