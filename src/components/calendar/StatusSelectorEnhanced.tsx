
import React from 'react';
import { Button } from '@/components/ui/button';
import { StatusCode, DayPeriod } from '@/types';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { ProjectSelector } from './ProjectSelector';
import { HighlightOption } from './HighlightOption';
import { StatusLoadingState } from './StatusLoadingState';
import { StatusErrorState } from './StatusErrorState';
import { StatusOptionsList } from './StatusOptionsList';
import { useStatusSelector } from '@/hooks/useStatusSelector';

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
  // Use our custom hook to get available statuses
  const { statuses, isLoading } = useStatusOptions();
  
  // Use our custom hook to handle status selection
  const {
    selectedStatus,
    highlightedStatus,
    selectedProject,
    handleStatusChange,
    handleProjectChange,
    handleHighlightChange,
    handleSubmit
  } = useStatusSelector({
    value,
    onChange,
    isHighlighted,
    projectCode,
    statuses: statuses || [],
    isLoading
  });
  
  console.log("StatusSelectorEnhanced: Rendu avec statuses =", statuses, "isLoading =", isLoading);
  
  if (isLoading) {
    return <StatusLoadingState />;
  }
  
  const loadingError = !statuses || statuses.length === 0;
  
  if (loadingError) {
    return (
      <StatusErrorState 
        selectedStatus={selectedStatus}
        handleStatusChange={handleStatusChange}
        selectedProject={selectedProject}
        handleProjectChange={handleProjectChange}
        highlightedStatus={highlightedStatus}
        handleHighlightChange={handleHighlightChange}
        handleSubmit={handleSubmit}
        projects={projects}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <StatusOptionsList 
        selectedStatus={selectedStatus}
        statuses={statuses}
        onStatusChange={handleStatusChange}
        isLoading={isLoading}
      />
      
      {selectedStatus === 'projet' && (
        <ProjectSelector
          projects={projects}
          selectedProject={selectedProject || "select-project"}
          onProjectChange={handleProjectChange}
        />
      )}
      
      <HighlightOption
        isHighlighted={highlightedStatus}
        onHighlightChange={handleHighlightChange}
      />
      
      <Button onClick={handleSubmit} className="w-full">
        Appliquer
      </Button>
    </div>
  );
}
