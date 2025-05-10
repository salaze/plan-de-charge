
import React, { useRef } from 'react';
import { StatisticsChart } from '../StatisticsChart';
import { StatisticsPieChart } from '../StatisticsPieChart';
import { StatisticsPrintableView } from '../StatisticsPrintableView';
import { StatusCode } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';
import { Print } from 'lucide-react';
import { toast } from 'sonner';

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
  isLoading, 
  currentYear, 
  currentMonth 
}: StatisticsChartPanelProps) => {
  const printableRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printableRef.current,
    documentTitle: `Statistiques_${currentMonth + 1}_${currentYear}`,
    onBeforeGetContent: () => {
      toast.info("Préparation de l'impression...");
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
    },
    onAfterPrint: () => {
      toast.success("Document prêt pour impression");
    },
    removeAfterPrint: true
  });

  return (
    <div className="glass-panel p-4 animate-scale-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Graphique par employé</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrint}
          disabled={isLoading || !chartData || chartData.length === 0}
          className="flex items-center gap-1"
        >
          <Print className="h-4 w-4" />
          <span>Imprimer</span>
        </Button>
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

      {/* Vue imprimable cachée */}
      <div className="hidden">
        <StatisticsPrintableView
          ref={printableRef}
          chartData={chartData}
          statusCodes={statusCodes}
          year={currentYear}
          month={currentMonth}
        />
      </div>
    </div>
  );
};
