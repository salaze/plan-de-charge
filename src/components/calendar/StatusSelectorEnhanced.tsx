
import React from 'react';
import { StatusCode, DayPeriod } from '@/types';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { useStatusSelector } from '@/hooks/status/useStatusSelector';
import { StatusLoadingState } from './status/StatusLoadingState';
import { StatusErrorState } from './status/StatusErrorState';
import { StatusOptionsList } from './status/StatusOptionsList';

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
  // Use our custom hooks
  const { statuses, isLoading } = useStatusOptions();
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
  
  // Determine if there's a loading error
  const loadingError = !isLoading && (!statuses || statuses.length === 0);
  
  console.log("StatusSelectorEnhanced: Rendu avec statuses =", statuses, "isLoading =", isLoading);
  
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
