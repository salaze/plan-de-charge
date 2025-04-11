
import React from 'react';
import { Button } from '@/components/ui/button';
import { StatusCode, DayPeriod } from '@/types';
import { toast } from 'sonner';

interface FormActionsProps {
  onSubmit: () => void;
  selectedStatus: StatusCode;
  selectedProject: string;
  selectedPeriod: DayPeriod;
}

export function FormActions({ 
  onSubmit, 
  selectedStatus, 
  selectedProject,
  selectedPeriod 
}: FormActionsProps) {
  
  const handleSubmit = () => {
    if (selectedStatus === 'projet' && (!selectedProject || selectedProject === 'no-project')) {
      toast.error("Veuillez sélectionner un projet");
      return;
    }
    
    onSubmit();
    toast.success(`Statut ${selectedPeriod === 'AM' ? 'matin' : 'après-midi'} enregistré avec succès`);
  };
  
  return (
    <Button onClick={handleSubmit} className="w-full">
      Appliquer
    </Button>
  );
}
