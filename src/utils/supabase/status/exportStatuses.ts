
import { supabase } from "@/integrations/supabase/client";
import { Status } from '@/components/admin/status/types';
import { toast } from 'sonner';

/**
 * Exporte les statuts vers le bucket Supabase
 * @param statuses Liste des statuts à exporter
 */
export async function exportStatusesToBucket(statuses: Status[]) {
  try {
    console.log('Exportation des statuts vers le bucket...');
    
    // Vérifier si le bucket existe, sinon le créer
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'status-icons');
    
    if (!bucketExists) {
      console.log('Création du bucket status-icons...');
      const { error } = await supabase.storage.createBucket('status-icons', {
        public: true,
        fileSizeLimit: 1024 * 1024, // 1MB
      });
      
      if (error) {
        console.error('Erreur lors de la création du bucket:', error);
        toast.error('Erreur lors de la création du bucket');
        return false;
      }
    }
    
    // Préparer les données des statuts pour l'exportation
    const statusesData = JSON.stringify(statuses, null, 2);
    const blob = new Blob([statusesData], { type: 'application/json' });
    
    // Nom du fichier avec timestamp pour éviter les doublons
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `statuses-${timestamp}.json`;
    
    // Télécharger les données vers le bucket
    const { data, error } = await supabase.storage
      .from('status-icons')
      .upload(fileName, blob, {
        contentType: 'application/json',
        upsert: true
      });
      
    if (error) {
      console.error('Erreur lors de l\'exportation des statuts:', error);
      toast.error('Erreur lors de l\'exportation des statuts');
      return false;
    }
    
    console.log('Statuts exportés avec succès:', data);
    toast.success('Statuts exportés avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'exportation des statuts:', error);
    toast.error('Erreur lors de l\'exportation des statuts');
    return false;
  }
}

/**
 * Récupère les statuts depuis le bucket Supabase
 */
export async function importStatusesFromBucket() {
  try {
    console.log('Importation des statuts depuis le bucket...');
    
    // Lister les fichiers dans le bucket
    const { data: files, error: listError } = await supabase.storage
      .from('status-icons')
      .list('', {
        sortBy: { column: 'name', order: 'desc' }
      });
      
    if (listError) {
      console.error('Erreur lors de la récupération des fichiers:', listError);
      toast.error('Erreur lors de la récupération des fichiers');
      return null;
    }
    
    // Trouver le fichier JSON le plus récent
    const jsonFiles = files?.filter(file => file.name.endsWith('.json')) || [];
    
    if (jsonFiles.length === 0) {
      console.log('Aucun fichier de statuts trouvé dans le bucket');
      toast.warning('Aucun fichier de statuts trouvé');
      return null;
    }
    
    // Récupérer le contenu du fichier le plus récent
    const latestFile = jsonFiles[0];
    const { data, error: downloadError } = await supabase.storage
      .from('status-icons')
      .download(latestFile.name);
      
    if (downloadError) {
      console.error('Erreur lors du téléchargement du fichier:', downloadError);
      toast.error('Erreur lors du téléchargement du fichier');
      return null;
    }
    
    // Parser le contenu JSON
    const textContent = await data.text();
    const statuses = JSON.parse(textContent) as Status[];
    
    console.log('Statuts importés avec succès:', statuses);
    toast.success('Statuts importés avec succès');
    return statuses;
  } catch (error) {
    console.error('Erreur lors de l\'importation des statuts:', error);
    toast.error('Erreur lors de l\'importation des statuts');
    return null;
  }
}
