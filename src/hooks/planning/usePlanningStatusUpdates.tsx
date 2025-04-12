
import { toast } from 'sonner';
import { MonthData, StatusCode, DayPeriod } from '@/types';
import { useSupabaseSchedule } from '../useSupabaseSchedule';
import { usePlanningPersistence } from './usePlanningPersistence';
import { isValidUuid } from '@/utils/idUtils';

export const usePlanningStatusUpdates = (
  data: MonthData,
  setData: React.Dispatch<React.SetStateAction<MonthData>>,
  isAdmin: boolean
) => {
  const { updateScheduleEntry, testConnection } = useSupabaseSchedule();
  const { saveDataToLocalStorage } = usePlanningPersistence();
  
  // Fonction pour tester la connexion à Supabase
  const checkSupabaseConnection = async () => {
    try {
      const result = await testConnection();
      if (result.connected) {
        toast.success("Connexion à Supabase établie avec succès");
        return true;
      } else {
        toast.error("Impossible de se connecter à Supabase");
        console.error("Erreur de connexion Supabase:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Erreur lors du test de connexion Supabase:", error);
      toast.error("Erreur lors du test de connexion à Supabase");
      return false;
    }
  };
  
  const handleStatusChange = async (
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
    
    // Check if the employee ID is a valid UUID before proceeding
    if (!isValidUuid(employeeId)) {
      toast.error(`ID d'employé invalide: ${employeeId}`);
      return;
    }

    if (!date) {
      toast.error("Date invalide");
      return;
    }
    
    try {
      // Log the status update attempt
      console.log(`MISE À JOUR: employé=${employeeId}, date=${date}, statut=${status}, période=${period}`);
      
      // Update the UI optimistically first
      setData((prevData) => {
        const updatedEmployees = prevData.employees.map((employee) => {
          if (employee.id === employeeId) {
            // Check if a status already exists for this date and period
            const existingStatusIndex = employee.schedule.findIndex(
              (day) => day.date === date && day.period === period
            );
            
            if (existingStatusIndex >= 0) {
              // Update existing status
              if (status === '') {
                // If new status is empty, remove the entry
                const newSchedule = [...employee.schedule];
                newSchedule.splice(existingStatusIndex, 1);
                return { ...employee, schedule: newSchedule };
              } else {
                // Update existing entry
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
              // Add new status
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
        
        const updatedData = {
          ...prevData,
          employees: updatedEmployees
        };
        
        // Save updated data immediately for backwards compatibility
        saveDataToLocalStorage(updatedData);
        
        return updatedData;
      });
      
      // Multiple save attempts with retry logic
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`SUPABASE: Tentative ${attempt} de sauvegarde dans Supabase`);
          const result = await updateScheduleEntry(
            employeeId,
            date, 
            status, 
            period, 
            isHighlighted, 
            status === 'projet' ? projectCode : undefined
          );
          
          // Vérification du succès selon le format de retour
          const isSuccess = typeof result === 'boolean' ? result : result.success;
          
          if (isSuccess) {
            console.log("Statut mis à jour avec succès dans Supabase");
            toast.success(`Statut ${period === 'AM' ? 'matin' : 'après-midi'} mis à jour et synchronisé`);
            return;  // Sortie de la fonction si réussite
          } else {
            throw new Error("Échec de la mise à jour");
          }
        } catch (error) {
          // Si c'est la dernière tentative, propager l'erreur
          if (attempt === 3) throw error;
          
          // Sinon, attendre avant de réessayer
          console.warn(`Échec de la tentative ${attempt}, nouvelle tentative dans 1s...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error("Erreur détaillée lors de la mise à jour du statut:", error);
      toast.error("Impossible de mettre à jour le statut dans Supabase. Les changements sont enregistrés localement.");
      
      // Test the connection to see if that's the issue
      checkSupabaseConnection();
    }
  };
  
  return {
    handleStatusChange,
    checkSupabaseConnection
  };
};
