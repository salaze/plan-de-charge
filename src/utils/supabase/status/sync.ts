
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { supabase } from "@/integrations/supabase/client";

/**
 * Vérifie et synchronise les statuts entre l'application et la base de données
 */
export const syncStatusesWithDatabase = async () => {
  try {
    console.log("Synchronisation des statuts avec la base de données...");
    
    // Récupérer les statuts depuis la base de données
    const { data: dbStatuses, error } = await supabase
      .from('statuts')
      .select('code, libelle, couleur');
      
    if (error) throw error;

    // Mise à jour des dictionnaires STATUS_LABELS et STATUS_COLORS
    if (dbStatuses && dbStatuses.length > 0) {
      let hasUpdates = false;
      
      dbStatuses.forEach(status => {
        if (status.code) {
          // On met à jour les labels et couleurs des statuts existants
          const statusCode = status.code as StatusCode;
          
          if (STATUS_LABELS[statusCode] !== status.libelle) {
            STATUS_LABELS[statusCode] = status.libelle || status.code;
            hasUpdates = true;
          }
          
          if (STATUS_COLORS[statusCode] !== status.couleur) {
            STATUS_COLORS[statusCode] = status.couleur || 'bg-gray-500 text-white';
            hasUpdates = true;
          }
        }
      });
      
      // Vérifier si le statut "parc" existe dans la base de données
      const parcStatusExists = dbStatuses.some(status => status.code === 'parc');
      
      if (!parcStatusExists) {
        console.log("Le statut 'parc' n'existe pas dans la base de données, ajout...");
        
        try {
          const { error: insertError } = await supabase
            .from('statuts')
            .insert({
              code: 'parc',
              libelle: 'Gestion de Parc',
              couleur: 'bg-teal-500 text-white',
              display_order: 50  // Ajouter en bas de la liste
            });
            
          if (insertError) {
            console.error("Erreur lors de l'ajout du statut 'parc':", insertError);
          } else {
            console.log("Statut 'parc' ajouté avec succès");
            hasUpdates = true;
          }
        } catch (insertError) {
          console.error("Exception lors de l'ajout du statut 'parc':", insertError);
        }
      }
      
      if (hasUpdates) {
        console.log("Mise à jour des statuts détectée, notification de l'application");
        
        // Modification: Ajouter un flag pour indiquer que cette notification vient
        // directement de la synchronisation pour éviter les boucles de rechargement
        const event = new CustomEvent('statusesUpdated', { 
          detail: { fromSync: true } 
        });
        window.dispatchEvent(event);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la synchronisation des statuts:', error);
    return false;
  }
};
