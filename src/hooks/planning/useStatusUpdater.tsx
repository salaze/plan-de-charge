
import { useState } from 'react';
import { StatusCode, DayPeriod, MonthData } from '@/types';
import { toast } from 'sonner';
import { saveScheduleEntry, deleteScheduleEntry } from '@/utils/supabase/schedule';
import { useAuth } from '@/contexts/AuthContext';

export const useStatusUpdater = (
  data: MonthData,
  setData: React.Dispatch<React.SetStateAction<MonthData>>,
  isOnline: boolean
) => {
  const { isAdmin } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

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
    
    if (!isOnline) {
      toast.error("Impossible de mettre à jour le statut : connexion à Supabase indisponible");
      return;
    }
    
    try {
      setIsUpdating(true);
      
      // Émettre un événement d'édition pour prévenir les actualisations automatiques
      window.dispatchEvent(new CustomEvent('statusEditStart'));
      
      // Mise à jour de l'état local (UI)
      setData((prevData) => {
        const updatedEmployees = prevData.employees.map((employee) => {
          if (employee.id === employeeId) {
            const existingStatusIndex = employee.schedule.findIndex(
              (day) => day.date === date && day.period === period
            );
            
            if (existingStatusIndex >= 0) {
              if (status === '') {
                const newSchedule = [...employee.schedule];
                newSchedule.splice(existingStatusIndex, 1);
                return { ...employee, schedule: newSchedule };
              } else {
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

      // Synchronisation avec Supabase
      let success = false;
      if (status === '') {
        success = await deleteScheduleEntry(employeeId, date, period);
        console.log(`Statut supprimé pour ${employeeId} à la date ${date}, période ${period}`);
      } else {
        success = await saveScheduleEntry(employeeId, {
          date,
          status,
          period,
          isHighlighted,
          projectCode: status === 'projet' ? projectCode : undefined
        });
        console.log(`Statut ${status} enregistré pour ${employeeId} à la date ${date}, période ${period}`);
        if (status === 'projet') {
          console.log(`Projet associé: ${projectCode}`);
        }
      }
      
      if (!success) {
        toast.error('Erreur lors de la mise à jour du statut dans Supabase');
        return;
      }
      
      // Informer l'application qu'une mise à jour a eu lieu
      const statusesUpdatedEvent = new CustomEvent('statusesUpdated', { 
        detail: { 
          employeeId,
          date,
          status,
          period,
          isHighlighted,
          projectCode
        } 
      });
      window.dispatchEvent(statusesUpdatedEvent);
      
      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour du statut dans Supabase');
    } finally {
      setIsUpdating(false);
      
      // Émettre l'événement de fin d'édition après un délai
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('statusEditEnd'));
      }, 500);
    }
  };

  return { handleStatusChange, isUpdating };
};
