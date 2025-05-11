
import React from 'react';
import { StatisticsChart } from '../StatisticsChart';
import { StatisticsPieChart } from '../StatisticsPieChart';
import { StatusCode } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StatisticsChartPanelProps {
  chartData: Array<{ name: string; [key: string]: number | string }>;
  statusCodes: StatusCode[];
  isLoading: boolean;
  currentYear: number;
  currentMonth: number;
}

export const StatisticsChartPanel = ({ 
  chartData, 
  statusCodes, 
  isLoading
}: StatisticsChartPanelProps) => {
  return (
    <div className="glass-panel p-4 animate-scale-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Graphique par employé</h2>
      </div>

      <Tabs defaultValue="bars" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="bars">Barres</TabsTrigger>
          <TabsTrigger value="pie">Camembert</TabsTrigger>
        </TabsList>

        <TabsContent value="bars" className="h-80">
          <StatisticsChart 
            chartData={chartData}
            statusCodes={statusCodes}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="pie" className="h-80">
          <StatisticsPieChart 
            chartData={chartData}
            statusCodes={statusCodes}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
