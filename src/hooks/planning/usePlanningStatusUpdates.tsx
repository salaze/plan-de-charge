
import { useState } from 'react';
import { toast } from 'sonner';
import { MonthData, StatusCode, DayPeriod } from '@/types';
import { useSupabaseSchedule } from '../useSupabaseSchedule';
import { usePlanningPersistence } from './usePlanningPersistence';
import { generateId } from '@/utils';

export const usePlanningStatusUpdates = (
  data: MonthData,
  setData: React.Dispatch<React.SetStateAction<MonthData>>,
  isAdmin: boolean
) => {
  const { updateScheduleEntry } = useSupabaseSchedule();
  const { saveDataToLocalStorage } = usePlanningPersistence();
  
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
    
    try {
      // Vérifier si l'employeeId est un UUID valide
      // Si ce n'est pas un UUID valide, nous devons générer un nouvel ID
      const validEmployeeId = employeeId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) 
        ? employeeId 
        : generateId();
      
      // Mettre à jour dans Supabase avec un ID valide
      await updateScheduleEntry(
        validEmployeeId,
        date, 
        status, 
        period, 
        isHighlighted, 
        status === 'projet' ? projectCode : undefined
      );

      // Mettre à jour l'état local également
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
        
        const updatedData = {
          ...prevData,
          employees: updatedEmployees
        };
        
        // Sauvegarder immédiatement les données mises à jour pour rétrocompatibilité
        saveDataToLocalStorage(updatedData);
        
        return updatedData;
      });
      
      toast.success(`Statut ${period === 'AM' ? 'matin' : 'après-midi'} mis à jour et synchronisé`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Impossible de mettre à jour le statut dans Supabase");
    }
  };
  
  return {
    handleStatusChange
  };
};
