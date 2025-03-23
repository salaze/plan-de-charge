
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { MonthSelector } from '@/components/calendar/MonthSelector';
import { PlanningGrid } from '@/components/calendar/PlanningGrid';
import { Button } from '@/components/ui/button';
import { Filter, Download } from 'lucide-react';
import { 
  createSampleData, 
  setEmployeeStatus,
  exportToExcel
} from '@/utils/dataUtils';
import { DayPeriod, StatusCode, MonthData } from '@/types';

const Index = () => {
  const [data, setData] = useState<MonthData>(() => {
    // Récupérer les données depuis le localStorage ou créer des données de démo
    const savedData = localStorage.getItem('planningData');
    return savedData ? JSON.parse(savedData) : createSampleData();
  });
  
  const [currentYear, setCurrentYear] = useState(data.year);
  const [currentMonth, setCurrentMonth] = useState(data.month);
  
  // Sauvegarde automatique des données
  useEffect(() => {
    localStorage.setItem('planningData', JSON.stringify(data));
  }, [data]);
  
  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };
  
  const handleStatusChange = (
    employeeId: string,
    date: string,
    status: StatusCode,
    period: DayPeriod
  ) => {
    setData((prevData) => {
      const updatedEmployees = prevData.employees.map((employee) => {
        if (employee.id === employeeId) {
          return setEmployeeStatus(employee, date, status, period);
        }
        return employee;
      });
      
      return {
        ...prevData,
        employees: updatedEmployees
      };
    });
    
    const periodLabel = period === 'AM' ? 'matin' : period === 'PM' ? 'après-midi' : 'journée';
    toast.success(`Statut ${periodLabel} modifié avec succès`);
  };
  
  const handleExport = () => {
    exportToExcel(data);
    toast.success('Données exportées avec succès');
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <MonthSelector 
            year={currentYear} 
            month={currentMonth} 
            onChange={handleMonthChange} 
          />
          
          <div className="flex gap-2">
            <Button variant="outline" className="transition-all hover:bg-secondary">
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="transition-all hover:bg-secondary"
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>
        
        <div className="glass-panel p-1 md:p-4 animate-scale-in">
          <PlanningGrid 
            year={currentYear} 
            month={currentMonth} 
            employees={data.employees}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
