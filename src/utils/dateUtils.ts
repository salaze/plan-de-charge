/**
 * Creates an array of dates for a given month
 */
export const generateDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  
  try {
    if (!Number.isInteger(year) || !Number.isInteger(month) || 
        year < 1900 || year > 2100 || month < 0 || month > 11) {
      console.error(`Invalid date parameters: year=${year}, month=${month}`);
      return [];
    }
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    console.log(`Month ${month+1}/${year} has ${daysInMonth} days`);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (isNaN(date.getTime())) {
        console.error(`Invalid date created: ${year}-${month+1}-${day}`);
        continue;
      }
      days.push(date);
    }
    
    return days;
  } catch (error) {
    console.error('Error in generateDaysInMonth:', error);
    return [];
  }
};

/**
 * Formats a date to YYYY-MM-DD string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Returns the French month name
 */
export const getMonthName = (month: number): string => {
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return monthNames[month];
};

/**
 * Returns the French day name
 */
export const getDayName = (date: Date, short: boolean = false): string => {
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const shortDayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  return short ? shortDayNames[date.getDay()] : dayNames[date.getDay()];
};
