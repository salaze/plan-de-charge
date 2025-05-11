
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { useStatisticsData } from '@/hooks/statistics';
import { StatisticsLayout } from '@/components/statistics/StatisticsLayout';
import { StatisticsHeader } from '@/components/statistics/StatisticsHeader';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Chargement paresseux des composants lourds
const StatisticsTablePanel = lazy(() => 
  import('@/components/statistics/panels/StatisticsTablePanel')
    .then(module => ({ default: module.StatisticsTablePanel }))
);
const StatisticsChartPanel = lazy(() => 
  import('@/components/statistics/panels/StatisticsChartPanel')
    .then(module => ({ default: module.StatisticsChartPanel }))
);

const Statistics = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  
  const { statuses: availableStatusCodes, isLoading: statusesLoading } = useStatusOptions();
  const { chartData, isLoading: statsLoading, refreshData, loadingDetails } = useStatisticsData(
    currentYear, 
    currentMonth, 
    availableStatusCodes,
    selectedDepartment
  );
  
  // Liste des départements disponibles
  const departments = [
    { value: "all", label: "Tous les départements" },
    { value: "REC", label: "REC" },
    { value: "78", label: "78" },
    { value: "91", label: "91" },
    { value: "92", label: "92" },
    { value: "95", label: "95" },
  ];
  
  // Ajouter un timeout global pour afficher un message si le chargement est trop long
  useEffect(() => {
    if (statsLoading) {
      const timer = setTimeout(() => {
        if (statsLoading) {
          setLoadTimeout(true);
        }
      }, 20000); // 20 secondes
      
      return () => clearTimeout(timer);
    } else {
      setLoadTimeout(false);
    }
  }, [statsLoading]);
  
  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleRefresh = () => {
    toast.info("Actualisation des statistiques en cours...");
    console.log("Demande d'actualisation des statistiques");
    setLoadTimeout(false);
    
    // Log des détails de chargement pour le débogage
    console.log("État du chargement:", loadingDetails);
    
    refreshData();
  };

  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartment(dept);
    toast.info(`Chargement des statistiques pour le département: ${dept === 'all' ? 'Tous' : dept}`);
    refreshData();
  };

  // Filter out the 'none' status
  const filteredStatusCodes = availableStatusCodes.filter(code => code !== 'none');
  
  const isLoading = statusesLoading || statsLoading;
  
  return (
    <StatisticsLayout>
      <div className="flex justify-between items-center">
        <StatisticsHeader 
          year={currentYear}
          month={currentMonth}
          onMonthChange={handleMonthChange}
        />
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select
              value={selectedDepartment}
              onValueChange={handleDepartmentChange}
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
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Chargement...' : 'Actualiser'}</span>
          </Button>
        </div>
      </div>
      
      {loadTimeout && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>Le chargement des données prend plus de temps que prévu. Vous pouvez continuer à attendre ou actualiser la page.</p>
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="mt-2"
          >
            Réessayer
          </Button>
        </div>
      )}
      
      <Suspense fallback={<div className="text-center p-6">Chargement du tableau...</div>}>
        <StatisticsTablePanel 
          chartData={chartData}
          statusCodes={filteredStatusCodes}
          isLoading={isLoading}
        />
      </Suspense>
      
      <Suspense fallback={<div className="text-center p-6">Chargement des graphiques...</div>}>
        <StatisticsChartPanel 
          chartData={chartData}
          statusCodes={filteredStatusCodes}
          isLoading={isLoading}
          currentYear={currentYear}
          currentMonth={currentMonth}
        />
      </Suspense>
    </StatisticsLayout>
  );
};

export default Statistics;
