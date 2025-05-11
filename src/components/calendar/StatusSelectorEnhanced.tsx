
import React, { useEffect, useState } from 'react';
import { StatusCode, DayPeriod } from '@/types';
import { useStatusOptionsQuery } from '@/hooks/useStatusOptionsQuery';
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
  // Utiliser notre hook useStatusOptionsQuery amélioré
  const { data: statuses, isLoading, refetch: refreshStatuses, error } = useStatusOptionsQuery();
  
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
    console.log("StatusSelectorEnhanced: Premier montage, rafraîchissement des statuts");
    refreshStatuses();
  }, []);
  
  // Log des statuts disponibles à chaque changement
  useEffect(() => {
    if (statuses) {
      console.log("StatusSelectorEnhanced: Statuts disponibles:", statuses);
    }
  }, [statuses]);
  
  // Determine if there's a loading error
  const loadingError = !isLoading && (!statuses || statuses.length === 0 || error);
  
  console.log("StatusSelectorEnhanced: Rendu avec statuses =", statuses?.length || 0, "isLoading =", isLoading, "error =", !!error);
  
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
      statuses={statuses || []}
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
