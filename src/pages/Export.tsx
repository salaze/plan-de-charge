
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { exportToExcel } from '@/utils/exportUtils';
import { exportEmployeesToExcel, importEmployeesFromExcel } from '@/utils/employeeExportUtils';
import { exportStatsToExcel } from '@/utils/statsExportUtils';
import { MonthData, Employee } from '@/types';
import { calculateEmployeeStats } from '@/utils/statsUtils';

// Import our new components
import SupabaseAlert from '@/components/export/SupabaseAlert';
import DepartmentFilter from '@/components/export/DepartmentFilter';
import ExportTabs from '@/components/export/ExportTabs';

const Export = () => {
  const [activeTab, setActiveTab] = useState("planning");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [importedData, setImportedData] = useState<MonthData | null>(null);
  const [importedEmployees, setImportedEmployees] = useState<Employee[] | null>(null);
  const [planningData, setPlanningData] = useState<MonthData | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  useEffect(() => {
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      setPlanningData(JSON.parse(savedData));
    }
  }, []);
  
  const handleExport = () => {
    try {
      const savedData = localStorage.getItem('planningData');
      let data: MonthData;
      
      if (savedData) {
        data = JSON.parse(savedData);
        
        // Filter by department if needed
        if (selectedDepartment !== "all") {
          data = {
            ...data,
            employees: data.employees.filter(emp => emp.department === selectedDepartment)
          };
        }
      } else {
        data = {
          year: date?.getFullYear() || new Date().getFullYear(),
          month: date?.getMonth() || new Date().getMonth(),
          employees: [],
          projects: []
        };
      }
      
      exportToExcel(data);
      toast.success(`Données du planning exportées au format Excel (.xlsx)`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Une erreur est survenue lors de l\'export');
    }
  };
  
  const handleExportEmployees = () => {
    try {
      const savedData = localStorage.getItem('planningData');
      let employees: Employee[] = [];
      
      if (savedData) {
        const data = JSON.parse(savedData);
        employees = data.employees || [];
        
        // Filter by department if needed
        if (selectedDepartment !== "all") {
          employees = employees.filter(emp => emp.department === selectedDepartment);
        }
      }
      
      if (employees.length === 0) {
        toast.error('Aucun employé à exporter');
        return;
      }
      
      exportEmployeesToExcel(employees);
      toast.success('Employés exportés avec succès au format Excel');
    } catch (error) {
      console.error('Erreur lors de l\'export des employés:', error);
      toast.error('Une erreur est survenue lors de l\'export des employés');
    }
  };
  
  const handleExportStats = () => {
    try {
      const savedData = localStorage.getItem('planningData');
      if (!savedData) {
        toast.error('Aucune donnée disponible');
        return;
      }
      
      const data = JSON.parse(savedData);
      let employees = data.employees || [];
      
      // Filter by department if needed
      if (selectedDepartment !== "all") {
        employees = employees.filter(emp => emp.department === selectedDepartment);
      }
      
      const year = currentYear || new Date().getFullYear();
      const month = currentMonth || new Date().getMonth();
      
      if (employees.length === 0) {
        toast.error('Aucun employé pour calculer les statistiques');
        return;
      }
      
      const stats = employees.map(employee => calculateEmployeeStats(employee, year, month));
      
      exportStatsToExcel(stats);
      toast.success('Statistiques exportées avec succès au format Excel');
    } catch (error) {
      console.error('Erreur lors de l\'export des statistiques:', error);
      toast.error('Une erreur est survenue lors de l\'export des statistiques');
    }
  };
  
  const handleImportSuccess = (data: MonthData) => {
    setImportedData(data);
    toast.success('Données du planning importées avec succès! Les données ont été sauvegardées.');
  };
  
  const handleImportEmployees = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const result = event.target?.result;
        if (result instanceof ArrayBuffer) {
          const employees = await importEmployeesFromExcel(result);
          
          if (employees && employees.length > 0) {
            setImportedEmployees(employees);
            
            const savedData = localStorage.getItem('planningData');
            if (savedData) {
              const data = JSON.parse(savedData);
              
              const existingEmployees = data.employees || [];
              const employeeMap = new Map();
              
              existingEmployees.forEach(emp => employeeMap.set(emp.id, emp));
              employees.forEach(emp => {
                const existing = employeeMap.get(emp.id);
                if (existing) {
                  emp.schedule = existing.schedule || [];
                }
                employeeMap.set(emp.id, emp);
              });
              
              data.employees = Array.from(employeeMap.values());
              localStorage.setItem('planningData', JSON.stringify(data));
            } else {
              localStorage.setItem('planningData', JSON.stringify({ 
                year: new Date().getFullYear(),
                month: new Date().getMonth(),
                employees,
                projects: []
              }));
            }
            
            toast.success(`${employees.length} employés importés avec succès`);
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'import des employés:', error);
        toast.error('Erreur lors de l\'import du fichier');
      }
      
      // Reset the input
      if (e.target) {
        e.target.value = '';
      }
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold">Exporter les données</h1>
        
        <SupabaseAlert />
        
        <DepartmentFilter 
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
        />
        
        <ExportTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedDepartment={selectedDepartment}
          currentYear={currentYear}
          currentMonth={currentMonth}
          setCurrentYear={setCurrentYear}
          setCurrentMonth={setCurrentMonth}
          importedData={importedData}
          importedEmployees={importedEmployees}
          handleImportSuccess={handleImportSuccess}
          handleImportEmployees={handleImportEmployees}
          handleExport={handleExport}
          handleExportEmployees={handleExportEmployees}
          handleExportStats={handleExportStats}
        />
      </div>
    </Layout>
  );
};

export default Export;
