
import { DayStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { isFrenchHoliday } from './dateUtils';

/**
 * Checks if a date is a weekend day or holiday
 * @param date Date to check
 * @returns boolean
 */
export const isWeekendOrHoliday = async (date: Date): Promise<boolean> => {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  if (isWeekend) return true;
  
  // Vérifier si c'est un jour férié français
  if (isFrenchHoliday(date)) return true;
  
  const dateString = date.toISOString().split('T')[0];
  return await isHoliday(dateString);
};

/**
 * Checks if a date is a French holiday
 * @param date Date to check in format YYYY-MM-DD
 * @returns Promise<boolean>
 */
export const isHoliday = async (date: string): Promise<boolean> => {
  try {
    // Convertir la date string en objet Date
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    
    // Vérifier si c'est un jour férié français
    if (isFrenchHoliday(dateObj)) return true;
    
    // Si ce n'est pas un jour férié français, vérifier les jours fériés personnalisés
    // Fall back to hardcoded holidays since 'holidays' table doesn't exist yet
    // This is a simplified approach - in reality, we should calculate these dynamically
    const holidays2024 = [
      "2024-01-01", // Jour de l'an
      "2024-04-01", // Lundi de Pâques
      "2024-05-01", // Fête du Travail
      "2024-05-08", // Victoire 1945
      "2024-05-09", // Jeudi de l'Ascension
      "2024-05-20", // Lundi de Pentecôte
      "2024-07-14", // Fête Nationale
      "2024-08-15", // Assomption
      "2024-11-01", // Toussaint
      "2024-11-11", // Armistice
      "2024-12-25"  // Noël
    ];
    
    const holidays2025 = [
      "2025-01-01", // Jour de l'an
      "2025-04-21", // Lundi de Pâques
      "2025-05-01", // Fête du Travail
      "2025-05-08", // Victoire 1945
      "2025-05-29", // Jeudi de l'Ascension
      "2025-06-09", // Lundi de Pentecôte
      "2025-07-14", // Fête Nationale
      "2025-08-15", // Assomption
      "2025-11-01", // Toussaint
      "2025-11-11", // Armistice
      "2025-12-25"  // Noël
    ];
    
    return holidays2024.includes(date) || holidays2025.includes(date);
  } catch (error) {
    console.error('Error checking holiday status:', error);
    return false;
  }
};

/**
 * Returns true if the employee has a vacation entry on the given date
 */
export const isEmployeeOnVacation = (schedule: DayStatus[], date: string): boolean => {
  return schedule.some(day => 
    day.date === date && 
    day.status === 'conges' && 
    (day.period === 'FULL' || day.period === 'AM')
  );
};

/**
 * Returns true if the employee has a vacation entry in the afternoon of the given date
 */
export const isEmployeeOnVacationAfternoon = (schedule: DayStatus[], date: string): boolean => {
  return schedule.some(day => 
    day.date === date && 
    day.status === 'conges' && 
    (day.period === 'FULL' || day.period === 'PM')
  );
};

/**
 * Returns true if the employee has an absence entry on the given date
 */
export const isEmployeeAbsent = (schedule: DayStatus[], date: string): boolean => {
  return schedule.some(day => 
    day.date === date && 
    day.status === 'absence' && 
    (day.period === 'FULL' || day.period === 'AM')
  );
};

/**
 * Returns true if the employee has an absence entry in the afternoon of the given date
 */
export const isEmployeeAbsentAfternoon = (schedule: DayStatus[], date: string): boolean => {
  return schedule.some(day => 
    day.date === date && 
    day.status === 'absence' && 
    (day.period === 'FULL' || day.period === 'PM')
  );
};
