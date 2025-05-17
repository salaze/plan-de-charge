
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { importStatusesFromBucket } from '@/utils/supabase/status/exportStatuses';

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
      
      if (result && 'success' in result) {
        if (result.success && result.data) {
          onStatusesImported(result.data);
          toast({
            title: "Succès",
            description: `${result.data.length} statuts ont été importés avec succès.`,
          });
        } else {
          // Gérer les différents types d'erreurs
          let errorMessage = "Impossible d'importer les statuts.";
          
          switch(result.error) {
            case 'PERMISSION_DENIED':
              errorMessage = "Erreur de permissions Supabase. Vérifiez les politiques RLS du bucket.";
              break;
            default:
              errorMessage = "Erreur inattendue lors de l'importation des statuts.";
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
            variant: "default", // Changed from "warning" to "default"
          });
        } else {
          onStatusesImported(result);
          toast({
            title: "Succès",
            description: `${result.length} statuts ont été importés avec succès.`,
          });
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
