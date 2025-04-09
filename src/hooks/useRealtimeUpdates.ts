
import { useEffect } from 'react';
import { toast } from 'sonner';

interface UseRealtimeUpdatesProps {
  tables: string[];
  onDataChange: () => void;
  showToasts?: boolean;
}

export function useRealtimeUpdates({ 
  tables, 
  onDataChange,
  showToasts = true
}: UseRealtimeUpdatesProps) {
  useEffect(() => {
    console.log('Setting up localStorage listener for tables:', tables);
    
    // Lorsque les données changent dans localStorage (dans d'autres onglets)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'planningData') {
        console.log('LocalStorage data changed');
        
        // Show toast notification if enabled
        if (showToasts) {
          toast.info('Données mises à jour', {
            description: 'Les données ont été rafraîchies automatiquement',
            duration: 3000
          });
        }
        
        // Call the callback function to refresh data
        onDataChange();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup subscription on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      console.log('Cleaned up localStorage listener');
    };
  }, [tables, onDataChange, showToasts]);
  
  // Retourner une fonction qui permet de déclencher manuellement la mise à jour
  return {
    triggerUpdate: () => {
      // Dispatch a custom event to notify that data has changed
      window.dispatchEvent(new Event('storage'));
    }
  };
}
