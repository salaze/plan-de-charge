
/**
 * Returns the name of the month for the given month index (0-11)
 */
export function getMonthName(monthIndex: number): string {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[monthIndex] || '';
}

/**
 * Formats a date as YYYY-MM-DD
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Gets the number of days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Creates an array of dates for a given month
 */
export function generateDaysInMonth(year: number, month: number): Date[] {
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
}

/**
 * Returns the French day name
 */
export function getDayName(date: Date, short: boolean = false): string {
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const shortDayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  return short ? shortDayNames[date.getDay()] : dayNames[date.getDay()];
}

/**
 * Checks if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Checks if a date is on a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
}

/**
 * Returns an array of all days in the specified month
 */
export function getDatesForMonth(year: number, month: number): Date[] {
  const dates: Date[] = [];
  const daysInMonth = getDaysInMonth(year, month);
  
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new Date(year, month, day));
  }
  
  return dates;
}

/**
 * Gets the number of days between two dates
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  
  return Math.round(Math.abs((start.getTime() - end.getTime()) / oneDay));
}
