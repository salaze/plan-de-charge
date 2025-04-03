
import React from 'react';
import { FileSpreadsheet, BarChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StatisticsExportTabProps {
  currentYear: number;
  currentMonth: number;
  setCurrentYear: (year: number) => void;
  setCurrentMonth: (month: number) => void;
  handleExportStats: () => void;
  selectedDepartment: string;
}

const StatisticsExportTab: React.FC<StatisticsExportTabProps> = ({
  currentYear,
  currentMonth,
  setCurrentYear,
  setCurrentMonth,
  handleExportStats,
  selectedDepartment
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChartIcon className="h-5 w-5" />
          <span>Exporter les statistiques</span>
        </CardTitle>
        <CardDescription>
          Exportez les statistiques de présence au format Excel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Cette opération exportera les statistiques de tous les employés 
          {selectedDepartment !== "all" ? ` du département ${selectedDepartment}` : ""} pour le mois sélectionné,
          incluant les jours de présence, congés, formation, etc.
        </p>
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium">Année et mois</label>
          <div className="flex gap-2">
            <Select 
              value={currentYear.toString()} 
              onValueChange={(value) => setCurrentYear(parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025].map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={currentMonth.toString()} 
              onValueChange={(value) => setCurrentMonth(parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Mois" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: '0', label: 'Janvier' },
                  { value: '1', label: 'Février' },
                  { value: '2', label: 'Mars' },
                  { value: '3', label: 'Avril' },
                  { value: '4', label: 'Mai' },
                  { value: '5', label: 'Juin' },
                  { value: '6', label: 'Juillet' },
                  { value: '7', label: 'Août' },
                  { value: '8', label: 'Septembre' },
                  { value: '9', label: 'Octobre' },
                  { value: '10', label: 'Novembre' },
                  { value: '11', label: 'Décembre' }
                ].map(month => (
                  <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleExportStats} className="w-full">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exporter les statistiques au format Excel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StatisticsExportTab;
