
import { MonthData, StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { toast } from 'sonner';
import { saveEmployee } from './employees';
import { saveScheduleEntry, deleteScheduleEntry } from './schedule';
import { supabase } from '@/integrations/supabase/client';

/**
 * Vérifie et synchronise les statuts entre l'application et la base de données
 */
export const syncStatusesWithDatabase = async () => {
  try {
    console.log("Synchronisation des statuts avec la base de données...");
    
    // Récupérer les statuts depuis l'application
    const localStatuses: { code: StatusCode; label: string; color: string }[] = [];
    for (const [code, label] of Object.entries(STATUS_LABELS)) {
      if (code && code !== 'none' && code !== '') {
        localStatuses.push({
          code: code as StatusCode,
          label: label,
          color: STATUS_COLORS[code as StatusCode] || 'bg-gray-500 text-white'
        });
      }
    }
    
    // Récupérer les statuts depuis la base de données
    const { data: dbStatuses, error } = await supabase
      .from('statuts')
      .select('code, libelle, couleur');
      
    if (error) throw error;
    
    // Vérifier si le statut "parc" existe dans la base de données
    const parcStatusExists = dbStatuses?.some(status => status.code === 'parc');
    
    if (!parcStatusExists) {
      console.log("Le statut 'parc' n'existe pas dans la base de données, ajout...");
      
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
        toast.error("Erreur lors de l'ajout du statut 'Gestion de Parc'");
      } else {
        console.log("Statut 'parc' ajouté avec succès");
        toast.success("Statut 'Gestion de Parc' ajouté à la base de données");
        
        // Déclencher un événement pour informer l'application
        const event = new CustomEvent('statusesUpdated');
        window.dispatchEvent(event);
      }
    } else {
      console.log("Le statut 'parc' existe déjà dans la base de données");
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la synchronisation des statuts:', error);
    return false;
  }
};

export const syncWithSupabase = async (data: MonthData) => {
  try {
    // Synchroniser les statuts d'abord
    await syncStatusesWithDatabase();
    
    // First, synchronize employees
    for (const employee of data.employees) {
      await saveEmployee(employee);
      
      // Then sync their schedule
      for (const scheduleItem of employee.schedule) {
        if (scheduleItem.status === '') {
          await deleteScheduleEntry(employee.id, scheduleItem.date, scheduleItem.period);
        } else {
          await saveScheduleEntry(employee.id, scheduleItem);
        }
      }
    }
    
    toast.success('Données synchronisées avec Supabase');
    return true;
  } catch (error) {
    console.error('Error synchronizing with Supabase:', error);
    toast.error('Erreur lors de la synchronisation avec Supabase');
    throw error;
  }
};
