
import React from 'react';

interface PrintableHeaderProps {
  year: number;
  month: number;
}

export const PrintableHeader = ({ year, month }: PrintableHeaderProps) => {
  // Obtenir le nom du mois en français
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  const monthName = monthNames[month];
  
  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold">Statistiques - {monthName} {year}</h1>
      <p className="text-sm text-gray-600">Date d'impression: {new Date().toLocaleDateString('fr-FR')}</p>
    </div>
  );
};
