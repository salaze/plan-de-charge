
import React, { useEffect, useState } from 'react';
import { RadioGroup } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { StatusCode, STATUS_LABELS } from '@/types';
import { StatusOption } from '../StatusOption';
import { ProjectSelector } from '../ProjectSelector';
import { HighlightOption } from '../HighlightOption';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useStatusOptions } from '@/hooks/useStatusOptions';

interface StatusOptionsListProps {
  statuses: StatusCode[];
  selectedStatus: StatusCode;
  selectedProject: string;
  highlightedStatus: boolean;
  projects: { id: string; code: string; name: string; color: string }[];
  onStatusChange: (status: StatusCode) => void;
  onProjectChange: (projectCode: string) => void;
  onHighlightChange: (checked: boolean) => void;
  onSubmit: () => void;
  isValidating?: boolean;
}

export function StatusOptionsList({
  statuses,
  selectedStatus,
  selectedProject,
  highlightedStatus,
  projects,
  onStatusChange,
  onProjectChange,
  onHighlightChange,
  onSubmit,
  isValidating = false
}: StatusOptionsListProps) {
  const { refreshStatuses } = useStatusOptions();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTimeoutId, setRefreshTimeoutId] = useState<number | null>(null);
  
  // Check if projects are available
  const hasProjects = projects && projects.length > 0;
  
  // Check if submit button should be disabled
  const isSubmitDisabled = 
    isValidating || 
    (selectedStatus === 'projet' && (!selectedProject || selectedProject === 'no-project' || !hasProjects));

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutId) {
        clearTimeout(refreshTimeoutId);
      }
    };
  }, [refreshTimeoutId]);

  // Function to refresh statuses
  const handleRefreshStatuses = () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    toast.info("Refreshing statuses...");
    
    // Call refresh function
    refreshStatuses();
    
    // Enable button after delay
    const timeoutId = window.setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
    
    setRefreshTimeoutId(timeoutId);
  };

  // Check project selection on render or status change
  useEffect(() => {
    if (selectedStatus === 'projet') {
      console.log('StatusOptionsList: Project status selected', { 
        selectedProject, 
        projectsAvailable: projects.length
      });
      
      // If no project is selected and projects are available, select the first project
      if ((!selectedProject || selectedProject === 'no-project' || selectedProject === 'select-project') && hasProjects) {
        console.log('No project selected but projects are available. Selecting first project.');
        onProjectChange(projects[0].code);
      }
    }
  }, [selectedStatus, selectedProject, projects, hasProjects, onProjectChange]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-base">Select a status</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={handleRefreshStatuses} 
            title="Refresh statuses"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <RadioGroup 
          value={selectedStatus} 
          onValueChange={(value) => onStatusChange(value as StatusCode)}
          className="grid grid-cols-2 gap-2"
        >
          {statuses.map((status) => (
            <StatusOption 
              key={status} 
              value={status} 
              label={STATUS_LABELS[status] || status}
            />
          ))}
        </RadioGroup>
      </div>
      
      {selectedStatus === 'projet' && (
        <div className="space-y-2">
          <ProjectSelector
            projects={projects}
            selectedProject={selectedProject || "select-project"}
            onProjectChange={onProjectChange}
          />
          
          {!hasProjects && (
            <div className="text-xs text-amber-500">
              No projects available. Please create one in administration.
            </div>
          )}
        </div>
      )}
      
      <HighlightOption
        isHighlighted={highlightedStatus}
        onHighlightChange={onHighlightChange}
      />
      
      <Button 
        onClick={() => {
          // Additional validation before calling onSubmit
          if (selectedStatus === 'projet' && (!selectedProject || selectedProject === 'no-project' || selectedProject === 'select-project')) {
            toast.error("Please select a project");
            return;
          }
          onSubmit();
        }} 
        className="w-full"
        disabled={isSubmitDisabled}
      >
        {isValidating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Validating...
          </>
        ) : (
          'Apply'
        )}
      </Button>
    </div>
  );
}
