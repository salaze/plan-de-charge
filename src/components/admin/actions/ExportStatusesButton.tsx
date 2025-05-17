
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
      
      const result = await exportStatusesToBucket(statuses);
      
      if (result.success) {
        toast({
          title: "Succès",
          description: "Les statuts ont été exportés avec succès dans le bucket.",
        });
      } else {
        // Gérer les différents types d'erreurs
        let errorMessage = "Impossible d'exporter les statuts.";
        
        switch(result.error) {
          case 'PERMISSION_DENIED':
            errorMessage = "Erreur de permissions Supabase. Vérifiez les politiques RLS du bucket.";
            break;
          case 'BUCKET_CREATE_ERROR':
            errorMessage = "Impossible de créer le bucket de stockage. Vérifiez vos permissions Supabase.";
            break;
          case 'BUCKET_LIST_ERROR':
            errorMessage = "Impossible de lister les buckets. Vérifiez vos permissions Supabase.";
            break;
          case 'UPLOAD_ERROR':
            errorMessage = "Erreur lors de l'upload du fichier. Vérifiez les permissions du bucket.";
            break;
          default:
            errorMessage = "Erreur inattendue lors de l'exportation des statuts.";
        }
        
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'exportation des statuts:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite lors de l'exportation des statuts.",
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
