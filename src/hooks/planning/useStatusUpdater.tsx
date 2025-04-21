
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
      if (status === '') {
        await deleteScheduleEntry(employeeId, date, period);
      } else {
        await saveScheduleEntry(employeeId, {
          date,
          status,
          period,
          isHighlighted,
          projectCode: status === 'projet' ? projectCode : undefined
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour du statut dans Supabase');
    }
  };

  return { handleStatusChange };
};
