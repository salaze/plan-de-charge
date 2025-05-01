
import { useRef, useEffect } from 'react';

export function useStatusDialogTracker(refreshData: () => void) {
  // État pour savoir si un dialogue de statut est actuellement ouvert
  const isStatusDialogOpenRef = useRef(false);
  const forceRefreshPendingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Écouter les événements de mise à jour des statuts
  useEffect(() => {
    const handleStatusesUpdated = (event: Event) => {
      console.log("Index: Événement statusesUpdated reçu");
      
      // Vérifier si on doit éviter le rafraîchissement automatique
      const customEvent = event as CustomEvent;
      const noRefresh = customEvent.detail?.noRefresh === true;
      
      // Si un dialogue est ouvert, on reporte l'actualisation
      if (isStatusDialogOpenRef.current) {
        console.log("Dialogue de statut ouvert, actualisation reportée");
        // On marque qu'une actualisation sera nécessaire à la fermeture
        forceRefreshPendingRef.current = true;
        return;
      }
      
      // Si l'événement ne demande pas d'éviter le rafraîchissement, on actualise
      if (!noRefresh) {
        console.log("Actualisation des données");
        // Utiliser un délai pour éviter les actualisations trop fréquentes
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = window.setTimeout(() => {
          refreshData();
          timeoutRef.current = null;
        }, 1500) as unknown as number;
      }
    };
    
    // Gérer les événements d'ouverture et fermeture du dialogue
    const handleStatusEditStart = () => {
      console.log("Index: Dialogue de statut ouvert - désactivation des actualisations automatiques");
      isStatusDialogOpenRef.current = true;
      
      // Annuler tout timeout d'actualisation en cours
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    
    const handleStatusEditEnd = () => {
      console.log("Index: Dialogue de statut fermé - réactivation des actualisations automatiques");
      
      // Utiliser un délai pour s'assurer que tout est bien terminé
      setTimeout(() => {
        isStatusDialogOpenRef.current = false;
        
        // Si une actualisation était en attente, on l'exécute maintenant
        if (forceRefreshPendingRef.current) {
          console.log("Exécution de l'actualisation reportée");
          forceRefreshPendingRef.current = false;
          
          // Attendre un peu plus pour s'assurer que les mises à jour sont bien terminées
          setTimeout(() => {
            refreshData();
          }, 1500);
        }
      }, 1000);
    };
    
    window.addEventListener('statusesUpdated', handleStatusesUpdated);
    window.addEventListener('statusEditStart', handleStatusEditStart);
    window.addEventListener('statusEditEnd', handleStatusEditEnd);
    
    return () => {
      window.removeEventListener('statusesUpdated', handleStatusesUpdated);
      window.removeEventListener('statusEditStart', handleStatusEditStart);
      window.removeEventListener('statusEditEnd', handleStatusEditEnd);
      
      // Nettoyer tout timeout en cours
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [refreshData]);

  return {
    isStatusDialogOpenRef,
    handleStatusDialogChange: (isOpen: boolean) => {
      isStatusDialogOpenRef.current = isOpen;
      
      // Émettre les événements appropriés
      if (isOpen) {
        window.dispatchEvent(new CustomEvent('statusEditStart'));
      } else {
        // Ajouter un délai pour s'assurer que toutes les opérations sont terminées
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('statusEditEnd'));
        }, 500);
      }
    }
  };
}
