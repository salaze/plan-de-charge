
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { MonthSelector } from '@/components/calendar/MonthSelector';
import { PlanningGrid } from '@/components/calendar/PlanningGrid';
import { Button } from '@/components/ui/button';
import { LegendModal } from '@/components/calendar/LegendModal';
import { Filter, Info } from 'lucide-react';
import { 
  createSampleData,
  handleFileImport
} from '@/utils';
import { DayPeriod, StatusCode, MonthData, FilterOptions } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAdmin } = useAuth();

  const [data, setData] = useState<MonthData>(() => {
    // Récupérer les données depuis le localStorage ou créer des données de démo
    const savedData = localStorage.getItem('planningData');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        // Assurer que les données ont la structure correcte
        if (!parsedData.year) parsedData.year = new Date().getFullYear();
        if (!parsedData.month && parsedData.month !== 0) parsedData.month = new Date().getMonth();
        if (!Array.isArray(parsedData.employees)) parsedData.employees = [];
        
        // Assurer que la structure contient des projets
        if (!parsedData.projects) {
          parsedData.projects = [
            { id: '1', code: 'P001', name: 'Développement interne', color: '#4CAF50' },
            { id: '2', code: 'P002', name: 'Client A', color: '#2196F3' },
            { id: '3', code: 'P003', name: 'Client B', color: '#FF9800' },
            { id: '4', code: 'P004', name: 'Maintenance préventive', color: '#9C27B0' },
            { id: '5', code: 'P005', name: 'Mission externe', color: '#00BCD4' },
          ];
        }
        
        return parsedData;
      } catch (error) {
        console.error("Erreur lors de la lecture des données:", error);
        return createDefaultData();
      }
    } else {
      return createDefaultData();
    }
  });
  
  function createDefaultData() {
    const sampleData = createSampleData();
    
    // Ajouter des projets aux données de démo
    sampleData.projects = [
      { id: '1', code: 'P001', name: 'Développement interne', color: '#4CAF50' },
      { id: '2', code: 'P002', name: 'Client A', color: '#2196F3' },
      { id: '3', code: 'P003', name: 'Client B', color: '#FF9800' },
      { id: '4', code: 'P004', name: 'Maintenance préventive', color: '#9C27B0' },
      { id: '5', code: 'P005', name: 'Mission externe', color: '#00BCD4' },
    ];
    
    return sampleData;
  }
  
  const [currentYear, setCurrentYear] = useState(data.year || new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(typeof data.month === 'number' ? data.month : new Date().getMonth());
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  
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
    period: DayPeriod,
    isHighlighted?: boolean,
    projectCode?: string
  ) => {
    if (!isAdmin) {
      toast.error("Vous n'avez pas les droits pour modifier le planning");
      return;
    }
    
    setData((prevData) => {
      const updatedEmployees = prevData.employees.map((employee) => {
        if (employee.id === employeeId) {
          // Trouver si un statut existe déjà pour cette date et période
          const existingStatusIndex = employee.schedule.findIndex(
            (day) => day.date === date && day.period === period
          );
          
          if (existingStatusIndex >= 0) {
            // Mise à jour d'un statut existant
            if (status === '') {
              // Si le nouveau statut est vide, supprimer l'entrée
              const newSchedule = [...employee.schedule];
              newSchedule.splice(existingStatusIndex, 1);
              return { ...employee, schedule: newSchedule };
            } else {
              // Sinon, mettre à jour l'entrée existante
              const newSchedule = [...employee.schedule];
              newSchedule[existingStatusIndex] = {
                date,
                status,
                period,
                isHighlighted,
                projectCode: status === 'projet' ? projectCode : undefined
              };
              return { ...employee, schedule: newSchedule };
            }
          } else if (status !== '') {
            // Ajout d'un nouveau statut
            return {
              ...employee,
              schedule: [
                ...employee.schedule,
                {
                  date,
                  status,
                  period,
                  isHighlighted,
                  projectCode: status === 'projet' ? projectCode : undefined
                }
              ]
            };
          }
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
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <MonthSelector 
            year={currentYear} 
            month={currentMonth} 
            onChange={handleMonthChange} 
          />
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsLegendOpen(true)}
              className="transition-all hover:bg-secondary"
            >
              <Info className="mr-2 h-4 w-4" />
              Légende
            </Button>
            
            {isAdmin && (
              <Button variant="outline" className="transition-all hover:bg-secondary">
                <Filter className="mr-2 h-4 w-4" />
                Filtres
              </Button>
            )}
          </div>
        </div>
        
        <div className="glass-panel p-1 md:p-4 animate-scale-in overflow-x-auto">
          <PlanningGrid 
            year={currentYear} 
            month={currentMonth} 
            employees={data.employees || []}
            projects={data.projects || []}
            onStatusChange={handleStatusChange}
            isAdmin={isAdmin}
          />
        </div>
        
        <LegendModal 
          isOpen={isLegendOpen}
          onClose={() => setIsLegendOpen(false)}
          projects={data.projects || []}
        />
      </div>
    </Layout>
  );
};

export default Index;
