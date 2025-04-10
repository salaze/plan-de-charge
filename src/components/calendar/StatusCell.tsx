
import React from 'react';
import { cn } from '@/lib/utils';
import { StatusCode, STATUS_COLORS, STATUS_LABELS } from '@/types';

interface StatusCellProps {
  status: StatusCode;
  isBadge?: boolean;
  className?: string;
  period?: 'AM' | 'PM' | 'FULL';
  isHighlighted?: boolean;
  projectCode?: string;
}

export function StatusCell({ 
  status, 
  isBadge = false, 
  className, 
  period,
  isHighlighted = false,
  projectCode
}: StatusCellProps) {
  if (!status) return <span className="text-muted-foreground">-</span>;
  
  // Ajout du texte de la période si spécifié (AM/PM), mais pas pour FULL
  let displayText = STATUS_LABELS[status];
  
  if (period && period !== 'FULL') {
    displayText = `${displayText} (${period})`;
  }
    
  // Ajout du code projet si c'est un projet
  if (status === 'projet' && projectCode) {
    // Pour les projets, on affiche uniquement le code projet suivi de la période si ce n'est pas FULL
    displayText = period && period !== 'FULL' 
      ? `${projectCode} (${period})` 
      : projectCode; // On n'ajoute plus (FULL) pour les projets
  }
  
  const highlightClass = isHighlighted ? 'border-2 border-black' : '';
  
  if (isBadge) {
    return (
      <span 
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          STATUS_COLORS[status],
          highlightClass,
          className
        )}
      >
        {displayText}
      </span>
    );
  }
  
  return (
    <span 
      className={cn(
        "inline-block w-full text-center py-1 rounded",
        STATUS_COLORS[status],
        highlightClass,
        className
      )}
    >
      {displayText}
    </span>
  );
}
