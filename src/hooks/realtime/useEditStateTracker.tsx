
import { useRef, useEffect } from 'react';
import { toast } from 'sonner';

export interface EditState {
  isEditingRef: { current: boolean };
  pendingRefreshRef: { current: boolean };
}

export const useEditStateTracker = (onDataChange: () => void): EditState => {
  // Refs for tracking edit state and pending refreshes
  const isEditingRef = useRef<boolean>(false);
  const pendingRefreshRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Event handler for when editing starts
    const handleEditStart = () => {
      isEditingRef.current = true;
      console.log('Édition commencée, désactivation des actualisations automatiques');
    };

    // Event handler for when editing ends
    const handleEditEnd = () => {
      // Utiliser un délai pour éviter que des événements en file d'attente ne déclenchent un refresh immédiat
      setTimeout(() => {
        isEditingRef.current = false;
        console.log('Édition terminée, réactivation des actualisations automatiques');
        
        // Si un refresh est en attente, l'exécuter maintenant
        if (pendingRefreshRef.current) {
          console.log('Exécution du refresh en attente après la fin de l\'édition');
          pendingRefreshRef.current = false;
          setTimeout(() => {
            onDataChange();
            toast.success('Données actualisées après modification');
          }, 1000);
        }
      }, 1500);
    };

    // Add event listeners
    window.addEventListener('statusEditStart', handleEditStart);
    window.addEventListener('statusEditEnd', handleEditEnd);
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('statusEditStart', handleEditStart);
      window.removeEventListener('statusEditEnd', handleEditEnd);
    };
  }, [onDataChange]);
  
  return { isEditingRef, pendingRefreshRef };
};
