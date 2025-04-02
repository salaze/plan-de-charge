
/**
 * Vérifie si une date donnée est un jour férié en France
 * @param date La date à vérifier
 * @returns true si c'est un jour férié, false sinon
 */
export const isHoliday = (date: Date): boolean => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Jours fériés fixes
  if (
    (month === 0 && day === 1) || // Jour de l'an (1er janvier)
    (month === 4 && day === 1) || // Fête du travail (1er mai)
    (month === 4 && day === 8) || // Victoire 1945 (8 mai)
    (month === 6 && day === 14) || // Fête nationale (14 juillet)
    (month === 7 && day === 15) || // Assomption (15 août)
    (month === 10 && day === 1) || // Toussaint (1er novembre)
    (month === 10 && day === 11) || // Armistice (11 novembre)
    (month === 11 && day === 25)    // Noël (25 décembre)
  ) {
    return true;
  }
  
  // Calcul de Pâques (algorithme de Oudin)
  const g = year % 19;
  const c = Math.floor(year / 100);
  const h = (c - Math.floor(c / 4) - Math.floor((8 * c + 13) / 25) + 19 * g + 15) % 30;
  const i = h - Math.floor(h / 28) * (1 - Math.floor(29 / (h + 1)) * Math.floor((21 - g) / 11));
  const j = (year + Math.floor(year / 4) + i + 2 - c + Math.floor(c / 4)) % 7;
  const l = i - j;
  const easterMonth = 3 + Math.floor((l + 40) / 44);
  const easterDay = l + 28 - 31 * Math.floor(easterMonth / 4);
  
  const easterDate = new Date(year, easterMonth - 1, easterDay);
  
  // Lundi de Pâques (1 jour après Pâques)
  const easterMonday = new Date(easterDate);
  easterMonday.setDate(easterDate.getDate() + 1);
  
  // Jeudi de l'Ascension (39 jours après Pâques)
  const ascensionThursday = new Date(easterDate);
  ascensionThursday.setDate(easterDate.getDate() + 39);
  
  // Lundi de Pentecôte (50 jours après Pâques)
  const pentecostMonday = new Date(easterDate);
  pentecostMonday.setDate(easterDate.getDate() + 50);
  
  // Vérifier si la date correspond à un jour férié lié à Pâques
  const isSameDate = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };
  
  if (
    isSameDate(date, easterMonday) ||
    isSameDate(date, ascensionThursday) ||
    isSameDate(date, pentecostMonday)
  ) {
    return true;
  }
  
  return false;
};

/**
 * Vérifie si une date donnée est un weekend ou un jour férié
 * @param date La date à vérifier
 * @returns true si c'est un weekend ou jour férié, false sinon
 */
export const isWeekendOrHoliday = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6 || isHoliday(date); // 0 = Dimanche, 6 = Samedi
};
