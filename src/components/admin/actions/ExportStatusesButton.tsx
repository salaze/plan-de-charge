
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Status } from '../status/types';
import { exportStatusesToBucket } from '@/utils/supabase/status/exportStatuses';

interface ExportStatusesButtonProps {
  statuses: Status[];
}

export function ExportStatusesButton({ statuses }: ExportStatusesButtonProps) {
  const { toast } = useToast();
  
  const handleExport = async () => {
    try {
      toast({
        title: "Export en cours",
        description: "Exportation des statuts vers Supabase...",
      });
      
      const success = await exportStatusesToBucket(statuses);
      
      if (success) {
        toast({
          title: "Succès",
          description: "Les statuts ont été exportés avec succès dans le bucket.",
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'exportation des statuts:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les statuts. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExport}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Exporter les statuts
    </Button>
  );
}
