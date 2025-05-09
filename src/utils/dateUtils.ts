
/**
 * Creates an array of dates for a given month
 */
export const generateDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }
  
  return days;
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

/**
 * Calcule le jour de Pâques pour une année donnée (algorithme de Meeus/Jones/Butcher)
 */
export const getEasterDate = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = Math.floor((h + l - 7 * m + 114) / 31);
  const p = (h + l - 7 * m + 114) % 31;
  
  return new Date(year, n - 1, p + 1);
};

/**
 * Ajoute des jours à une date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Vérifie si deux dates sont le même jour
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

/**
 * Formate une date en string YYYY-MM-DD
 */
export const formatYYYYMMDD = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Génère la liste des jours fériés pour une année donnée
 */
export const getFrenchHolidays = (year: number): Date[] => {
  const holidays: Date[] = [];
  
  // Jours fériés fixes
  holidays.push(new Date(year, 0, 1));  // Jour de l'an (1er janvier)
  holidays.push(new Date(year, 4, 1));  // Fête du travail (1er mai)
  holidays.push(new Date(year, 4, 8));  // Victoire 1945 (8 mai)
  holidays.push(new Date(year, 6, 14)); // Fête nationale (14 juillet)
  holidays.push(new Date(year, 7, 15)); // Assomption (15 août)
  holidays.push(new Date(year, 10, 1)); // Toussaint (1er novembre)
  holidays.push(new Date(year, 10, 11)); // Armistice (11 novembre)
  holidays.push(new Date(year, 11, 25)); // Noël (25 décembre)
  
  // Jours fériés basés sur Pâques
  const easterDate = getEasterDate(year);
  holidays.push(easterDate); // Pâques
  holidays.push(addDays(easterDate, 1)); // Lundi de Pâques
  holidays.push(addDays(easterDate, 39)); // Ascension (Jeudi, 39 jours après Pâques)
  holidays.push(addDays(easterDate, 50)); // Pentecôte (50 jours après Pâques)
  holidays.push(addDays(easterDate, 51)); // Lundi de Pentecôte
  
  return holidays;
};

/**
 * Vérifie si une date est un jour férié en France
 */
export const isFrenchHoliday = (date: Date): boolean => {
  const holidays = getFrenchHolidays(date.getFullYear());
  return holidays.some(holiday => isSameDay(holiday, date));
};

/**
 * Renvoie le nom du jour férié ou null si ce n'est pas un jour férié
 */
export const getFrenchHolidayName = (date: Date): string | null => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Jours fériés fixes
  if (month === 0 && day === 1) return "Jour de l'An";
  if (month === 4 && day === 1) return "Fête du Travail";
  if (month === 4 && day === 8) return "Victoire 1945";
  if (month === 6 && day === 14) return "Fête Nationale";
  if (month === 7 && day === 15) return "Assomption";
  if (month === 10 && day === 1) return "Toussaint";
  if (month === 10 && day === 11) return "Armistice";
  if (month === 11 && day === 25) return "Noël";
  
  // Jours fériés basés sur Pâques
  const easterDate = getEasterDate(year);
  if (isSameDay(date, easterDate)) return "Pâques";
  if (isSameDay(date, addDays(easterDate, 1))) return "Lundi de Pâques";
  if (isSameDay(date, addDays(easterDate, 39))) return "Ascension";
  if (isSameDay(date, addDays(easterDate, 50))) return "Pentecôte";
  if (isSameDay(date, addDays(easterDate, 51))) return "Lundi de Pentecôte";
  
  return null;
};
