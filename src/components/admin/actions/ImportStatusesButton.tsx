
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { importStatusesFromBucket } from '@/utils/supabase/status/importOperations';

interface ImportStatusesButtonProps {
  onStatusesImported: (statuses: any[]) => void;
}

export function ImportStatusesButton({ onStatusesImported }: ImportStatusesButtonProps) {
  const { toast } = useToast();
  
  const handleImport = async () => {
    try {
      toast({
        title: "Import en cours",
        description: "Récupération des statuts depuis Supabase...",
      });
      
      const result = await importStatusesFromBucket();
      
      // Gérer les différents formats de retour possibles
      if (result) {
        if ('success' in result) {
          if (result.success && 'data' in result && result.data) {
            onStatusesImported(result.data);
            toast({
              title: "Succès",
              description: `${result.data.length} statuts ont été importés avec succès.`,
            });
          } else {
            // Gérer les différents types d'erreurs
            let errorMessage = "Impossible d'importer les statuts.";
            
            if ('error' in result && result.error) {
              switch(result.error) {
                case 'PERMISSION_DENIED':
                  errorMessage = result.message || "Problème d'accès ou de permission Supabase. Vérifiez les politiques du bucket.";
                  break;
                case 'BUCKET_NOT_FOUND':
                  errorMessage = result.message || "Le bucket de stockage n'existe pas. Exportez d'abord vos statuts.";
                  break;
                case 'LIST_ERROR':
                case 'DOWNLOAD_ERROR':
                  errorMessage = result.message || "Erreur lors de la récupération des fichiers. Vérifiez vos permissions.";
                  break;
                default:
                  errorMessage = result.message || "Erreur inattendue lors de l'importation des statuts.";
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
        } else if (Array.isArray(result)) {
          if (result.length === 0) {
            toast({
              title: "Attention",
              description: "Aucun statut trouvé à importer.",
              variant: "default",
            });
          } else {
            onStatusesImported(result);
            toast({
              title: "Succès",
              description: `${result.length} statuts ont été importés avec succès.`,
            });
          }
        }
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'importer les statuts. Vérifiez que le bucket existe et contient des données.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'importation des statuts:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite lors de l'importation des statuts.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleImport}
      className="flex items-center gap-2"
    >
      <Upload className="h-4 w-4" />
      Importer les statuts
    </Button>
  );
}
