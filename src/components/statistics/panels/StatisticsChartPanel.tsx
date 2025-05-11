
import React, { useState, useEffect } from 'react';
import { StatisticsChart } from '../StatisticsChart';
import { StatisticsPieChart } from '../StatisticsPieChart';
import { StatusCode } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

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
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [filteredData, setFilteredData] = useState(chartData);
  
  // Liste des départements disponibles
  const departments = [
    { value: "all", label: "Tous les départements" },
    { value: "REC", label: "REC" },
    { value: "78", label: "78" },
    { value: "91", label: "91" },
    { value: "92", label: "92" },
    { value: "95", label: "95" },
  ];
  
  // Filtrer les données quand le département sélectionné change
  useEffect(() => {
    if (selectedDepartment === "all") {
      setFilteredData(chartData);
    } else {
      // Filtrer les employés par département
      // On suppose que le nom contient le département entre parenthèses: "Nom (Département)"
      const filtered = chartData.filter(employee => {
        const nameParts = employee.name.toString().split('(');
        if (nameParts.length > 1) {
          const deptPart = nameParts[1].replace(')', '').trim();
          return deptPart === selectedDepartment;
        }
        return false;
      });
      
      setFilteredData(filtered);
    }
  }, [selectedDepartment, chartData]);

  return (
    <div className="glass-panel p-4 animate-scale-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Graphique par employé</h2>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Département" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.value} value={dept.value}>
                  {dept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="bars" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="bars">Barres</TabsTrigger>
          <TabsTrigger value="pie">Camembert</TabsTrigger>
        </TabsList>

        <TabsContent value="bars" className="h-80">
          <StatisticsChart 
            chartData={filteredData}
            statusCodes={statusCodes}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="pie" className="h-80">
          <StatisticsPieChart 
            chartData={filteredData}
            statusCodes={statusCodes}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
