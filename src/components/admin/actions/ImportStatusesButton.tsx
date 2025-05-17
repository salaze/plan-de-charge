
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
      
      const importedStatuses = await importStatusesFromBucket();
      
      if (importedStatuses && Array.isArray(importedStatuses) && importedStatuses.length > 0) {
        onStatusesImported(importedStatuses);
        toast({
          title: "Succès",
          description: `${importedStatuses.length} statuts ont été importés avec succès.`,
        });
      } else if (importedStatuses && Array.isArray(importedStatuses) && importedStatuses.length === 0) {
        toast({
          title: "Attention",
          description: "Aucun statut trouvé à importer.",
          variant: "default", // Changed from "warning" to "default"
        });
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
