
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadDefaultStatusIcons } from '@/utils/supabase/status/uploadDefaultIcons';
import { useAvailableStatuses } from '@/hooks/useAvailableStatuses';
import { StatusCode } from '@/types';
import { Loader2 } from 'lucide-react';

export function GenerateStatusIconsButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { statuses } = useAvailableStatuses();
  
  const handleGenerateIcons = async () => {
    try {
      setIsGenerating(true);
      toast.info('Génération des icônes de statut en cours...');
      
      const result = await uploadDefaultStatusIcons(statuses as StatusCode[]);
      
      if (result) {
        toast.success('Icônes de statut générées avec succès!');
      } else {
        toast.error('Erreur lors de la génération des icônes');
      }
    } catch (error) {
      console.error('Error generating status icons:', error);
      toast.error('Erreur lors de la génération des icônes');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      onClick={handleGenerateIcons}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Génération en cours...
        </>
      ) : (
        'Générer les icônes de statut'
      )}
    </Button>
  );
}
