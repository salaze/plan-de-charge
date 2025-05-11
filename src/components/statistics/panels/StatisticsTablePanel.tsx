
import React, { useState, useEffect } from 'react';
import { StatisticsTable } from '../StatisticsTable';
import { StatusCode } from '@/types';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Filter } from 'lucide-react';
import { exportTableToExcel } from '@/utils/tableExportUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { groupEmployeesByDepartment } from '@/utils/departmentUtils';

interface StatisticsTablePanelProps {
  chartData: Array<{ name: string; [key: string]: number | string }>;
  statusCodes: StatusCode[];
  isLoading: boolean;
}

export const StatisticsTablePanel = ({ chartData, statusCodes, isLoading }: StatisticsTablePanelProps) => {
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

  const handleExportTable = () => {
    exportTableToExcel(filteredData, statusCodes, `statistiques_${selectedDepartment}`);
  };

  return (
    <div className="glass-panel p-6 animate-scale-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Répartition des statuts par employé</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportTable}
            disabled={isLoading || !filteredData || filteredData.length === 0}
            className="flex items-center gap-1"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Exporter</span>
          </Button>
        </div>
      </div>
      <StatisticsTable 
        chartData={filteredData}
        statusCodes={statusCodes}
        isLoading={isLoading}
      />
    </div>
  );
};
