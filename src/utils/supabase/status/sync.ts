
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks and synchronizes statuses between the application and database
 */
export const syncStatusesWithDatabase = async () => {
  try {
    console.log("Synchronizing statuses with database...");
    
    // Get statuses from database
    const { data: dbStatuses, error } = await supabase
      .from('statuts')
      .select('code, libelle, couleur');
      
    if (error) throw error;

    // Update STATUS_LABELS and STATUS_COLORS dictionaries
    if (dbStatuses && dbStatuses.length > 0) {
      let hasUpdates = false;
      
      dbStatuses.forEach(status => {
        if (status.code) {
          // Update labels and colors of existing statuses
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
      
      // Check if "parc" status exists in database
      const parcStatusExists = dbStatuses.some(status => status.code === 'parc');
      
      if (!parcStatusExists) {
        console.log("'parc' status doesn't exist in database, adding...");
        
        try {
          const { error: insertError } = await supabase
            .from('statuts')
            .insert({
              code: 'parc',
              libelle: 'Gestion de Parc',
              couleur: 'bg-teal-500 text-white',
              display_order: 50  // Add to bottom of list
            });
            
          if (insertError) {
            console.error("Error adding 'parc' status:", insertError);
          } else {
            console.log("'parc' status added successfully");
            hasUpdates = true;
          }
        } catch (insertError) {
          console.error("Exception when adding 'parc' status:", insertError);
        }
      }
      
      if (hasUpdates) {
        console.log("Status updates detected, notifying application ONCE");
        
        // Ajouter un délai pour ne pas surcharger le système
        setTimeout(() => {
          // Ajouter les deux flags pour éviter les boucles infinies
          const event = new CustomEvent('statusesUpdated', { 
            detail: { 
              fromSync: true,
              noRefresh: true,
              timestamp: Date.now()
            } 
          });
          window.dispatchEvent(event);
        }, 1000);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error synchronizing statuses:', error);
    return false;
  }
};
