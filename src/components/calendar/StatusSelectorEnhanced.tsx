
import React, { useEffect, useState } from 'react';
import { StatusCode, DayPeriod } from '@/types';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { useStatusSelector } from '@/hooks/status/useStatusSelector';
import { StatusLoadingState } from './status/StatusLoadingState';
import { StatusErrorState } from './status/StatusErrorState';
import { StatusOptionsList } from './status/StatusOptionsList';
import { toast } from 'sonner';

interface StatusSelectorEnhancedProps {
  value: StatusCode;
  onChange: (status: StatusCode, isHighlighted?: boolean, projectCode?: string) => void;
  projects: { id: string; code: string; name: string; color: string }[];
  isHighlighted?: boolean;
  projectCode?: string;
  selectedPeriod: 'AM' | 'PM';
}

export function StatusSelectorEnhanced({ 
  value, 
  onChange, 
  projects, 
  isHighlighted = false,
  projectCode = '',
  selectedPeriod = 'AM'
}: StatusSelectorEnhancedProps) {
  // Utilisez un state local pour contrôler si nous avons déjà demandé un rafraîchissement
  const [hasRequestedRefresh, setHasRequestedRefresh] = useState(false);
  
  // Use our custom hooks with refreshStatuses
  const { statuses, isLoading, refreshStatuses } = useStatusOptions();
  const { 
    selectedStatus,
    highlightedStatus,
    selectedProject,
    handleStatusChange,
    handleProjectChange,
    handleHighlightChange,
    handleSubmit
  } = useStatusSelector({
    initialStatus: value || 'none',
    initialHighlighted: isHighlighted,
    initialProjectCode: projectCode || '',
    onComplete: onChange
  });
  
  // Forcer un rafraîchissement immédiat au montage
  useEffect(() => {
    console.log("StatusSelectorEnhanced: Premier montage");
    
    // Forcer un rafraîchissement immédiat
    const timeoutId = setTimeout(() => {
      console.log("StatusSelectorEnhanced: Rafraîchissement forcé des statuts");
      refreshStatuses();
      setHasRequestedRefresh(true);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Log des statuts disponibles à chaque changement
  useEffect(() => {
    console.log("StatusSelectorEnhanced: Statuts disponibles:", statuses);
    
    // Si aucun statut n'est chargé après un certain temps et que le chargement est terminé
    if (!isLoading && statuses.length === 0 && hasRequestedRefresh) {
      console.log("StatusSelectorEnhanced: Aucun statut disponible après chargement");
      toast.error("Impossible de charger les statuts. Veuillez réessayer.");
      
      // Tenter un nouveau rafraîchissement après un délai
      const timeoutId = setTimeout(() => {
        console.log("StatusSelectorEnhanced: Nouvelle tentative de chargement");
        refreshStatuses();
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [statuses, isLoading, hasRequestedRefresh]);
  
  // Determine if there's a loading error
  const loadingError = !isLoading && (!statuses || statuses.length === 0);
  
  console.log("StatusSelectorEnhanced: Rendu avec statuses =", statuses.length, "isLoading =", isLoading);
  
  // Show appropriate component based on state
  if (isLoading) {
    return <StatusLoadingState />;
  }
  
  if (loadingError) {
    return (
      <StatusErrorState
        selectedStatus={selectedStatus}
        selectedProject={selectedProject}
        highlightedStatus={highlightedStatus}
        projects={projects}
        onStatusChange={handleStatusChange}
        onProjectChange={handleProjectChange}
        onHighlightChange={handleHighlightChange}
        onSubmit={handleSubmit}
        onRefresh={refreshStatuses}
      />
    );
  }
  
  return (
    <StatusOptionsList
      statuses={statuses}
      selectedStatus={selectedStatus}
      selectedProject={selectedProject}
      highlightedStatus={highlightedStatus}
      projects={projects}
      onStatusChange={handleStatusChange}
      onProjectChange={handleProjectChange}
      onHighlightChange={handleHighlightChange}
      onSubmit={handleSubmit}
    />
  );
}
