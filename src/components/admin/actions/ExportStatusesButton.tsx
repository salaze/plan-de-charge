
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
        
        // Safely check if error property exists
        if ('error' in result) {
          switch(result.error) {
            case 'PERMISSION_DENIED':
              errorMessage = result.message || "Problème d'accès ou de permission Supabase. Vérifiez les politiques du bucket.";
              break;
            case 'BUCKET_NOT_FOUND':
              errorMessage = result.message || "Le bucket de stockage n'existe pas. Vérifiez la configuration Supabase.";
              break;
            case 'BUCKET_CREATE_ERROR':
              errorMessage = result.message || "Impossible de créer le bucket de stockage. Vérifiez vos permissions Supabase.";
              break;
            case 'BUCKET_LIST_ERROR':
              errorMessage = result.message || "Impossible de lister les buckets. Vérifiez vos permissions Supabase.";
              break;
            case 'UPLOAD_ERROR':
              errorMessage = result.message || "Erreur lors de l'upload du fichier. Vérifiez les permissions du bucket.";
              break;
            default:
              errorMessage = result.message || "Erreur inattendue lors de l'exportation des statuts.";
          }
        } else if ('message' in result && result.message) {
          errorMessage = result.message;
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
