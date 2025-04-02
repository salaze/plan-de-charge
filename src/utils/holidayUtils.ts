
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
    (month === 0 && day === 1) || // Jour de l'an
    (month === 4 && day === 1) || // Fête du travail
    (month === 4 && day === 8) || // Victoire 1945
    (month === 6 && day === 14) || // Fête nationale
    (month === 7 && day === 15) || // Assomption
    (month === 10 && day === 1) || // Toussaint
    (month === 10 && day === 11) || // Armistice
    (month === 11 && day === 25) // Noël
  ) {
    return true;
  }
  
  // Pâques (calcul approximatif pour les jours fériés liés à Pâques)
  // Pour une implémentation complète, il faudrait un algorithme spécifique
  // Cette implémentation simplifiée sera à remplacer par un calcul précis
  
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
