
import { supabase } from "@/integrations/supabase/client";
import { Status } from '@/components/admin/status/types';
import { useToast } from "@/components/ui/use-toast";

/**
 * Exporte les statuts vers le bucket Supabase
 * @param statuses Liste des statuts à exporter
 */
export async function exportStatusesToBucket(statuses: Status[]) {
  try {
    console.log('Exportation des statuts vers le bucket...');
    
    // Vérifier si le bucket existe avant d'essayer de le créer
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erreur lors de la vérification des buckets:', listError);
      if (listError.message?.includes('Permission denied')) {
        console.error('Erreur de permissions:', listError);
        return { success: false, error: 'PERMISSION_DENIED' };
      }
      return { success: false, error: 'BUCKET_LIST_ERROR' };
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'status-icons');
    
    if (!bucketExists) {
      console.log('Le bucket status-icons n\'existe pas, tentative de création...');
      try {
        const { error } = await supabase.storage.createBucket('status-icons', {
          public: true,
          fileSizeLimit: 1024 * 1024, // 1MB
        });
        
        if (error) {
          console.error('Erreur lors de la création du bucket:', error);
          if (error.message?.includes('Permission denied')) {
            return { success: false, error: 'PERMISSION_DENIED' };
          }
          return { success: false, error: 'BUCKET_CREATE_ERROR' };
        }
      } catch (bucketError: any) {
        console.error('Exception lors de la création du bucket:', bucketError);
        
        // Si nous ne pouvons pas créer le bucket, on vérifie qu'il n'a pas été créé entre-temps
        const { data: checkBuckets } = await supabase.storage.listBuckets();
        if (!checkBuckets?.some(bucket => bucket.name === 'status-icons')) {
          if (bucketError.message?.includes('Permission denied')) {
            return { success: false, error: 'PERMISSION_DENIED' };
          }
          return { success: false, error: 'BUCKET_CREATE_ERROR' };
        }
      }
    }
    
    // Préparer les données des statuts pour l'exportation
    const statusesData = JSON.stringify(statuses, null, 2);
    const blob = new Blob([statusesData], { type: 'application/json' });
    
    // Nom du fichier avec timestamp pour éviter les doublons
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `statuses-${timestamp}.json`;
    
    try {
      // Télécharger les données vers le bucket
      const { data, error } = await supabase.storage
        .from('status-icons')
        .upload(fileName, blob, {
          contentType: 'application/json',
          upsert: true
        });
        
      if (error) {
        console.error('Erreur lors de l\'exportation des statuts:', error);
        if (error.message?.includes('Permission denied')) {
          return { success: false, error: 'PERMISSION_DENIED' };
        }
        return { success: false, error: 'UPLOAD_ERROR' };
      }
      
      console.log('Statuts exportés avec succès:', data);
      return { success: true };
    } catch (uploadError: any) {
      console.error('Exception lors de l\'upload des statuts:', uploadError);
      if (uploadError.message?.includes('Permission denied')) {
        return { success: false, error: 'PERMISSION_DENIED' };
      }
      return { success: false, error: 'UPLOAD_ERROR' };
    }
  } catch (error: any) {
    console.error('Erreur générale lors de l\'exportation des statuts:', error);
    if (error.message?.includes('Permission denied')) {
      return { success: false, error: 'PERMISSION_DENIED' };
    }
    return { success: false, error: 'GENERAL_ERROR' };
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
      if (listError.message?.includes('Permission denied')) {
        console.error('Erreur de permissions:', listError);
        return { success: false, error: 'PERMISSION_DENIED' };
      }
      return null;
    }
    
    // Trouver le fichier JSON le plus récent
    const jsonFiles = files?.filter(file => file.name.endsWith('.json')) || [];
    
    if (jsonFiles.length === 0) {
      console.log('Aucun fichier de statuts trouvé dans le bucket');
      return [];
    }
    
    // Récupérer le contenu du fichier le plus récent
    const latestFile = jsonFiles[0];
    const { data, error: downloadError } = await supabase.storage
      .from('status-icons')
      .download(latestFile.name);
      
    if (downloadError) {
      console.error('Erreur lors du téléchargement du fichier:', downloadError);
      if (downloadError.message?.includes('Permission denied')) {
        return { success: false, error: 'PERMISSION_DENIED' };
      }
      return null;
    }
    
    // Parser le contenu JSON
    const textContent = await data.text();
    const statuses = JSON.parse(textContent) as Status[];
    
    console.log('Statuts importés avec succès:', statuses);
    return { success: true, data: statuses };
  } catch (error: any) {
    console.error('Erreur lors de l\'importation des statuts:', error);
    if (error.message?.includes('Permission denied')) {
      return { success: false, error: 'PERMISSION_DENIED' };
    }
    return { success: false, error: 'GENERAL_ERROR' };
  }
}
