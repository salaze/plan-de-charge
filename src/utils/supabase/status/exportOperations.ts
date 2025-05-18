
import { supabase } from "@/integrations/supabase/client";
import { Status } from "@/components/admin/status/types";
import { ensureBucketExists } from "./bucketOperations";

const STATUS_BUCKET_NAME = 'status-icons';

/**
 * Exports statuses to a Supabase storage bucket
 * @param statuses List of statuses to export
 * @returns Result object with success/error information
 */
export async function exportStatusesToBucket(statuses: Status[]) {
  try {
    console.log('Exportation des statuts vers le bucket...');
    
    // Ensure the bucket exists
    const bucketResult = await ensureBucketExists(STATUS_BUCKET_NAME);
    if (!bucketResult.success) {
      return bucketResult;
    }
    
    // Prepare the status data for export
    const statusesData = JSON.stringify(statuses, null, 2);
    const blob = new Blob([statusesData], { type: 'application/json' });
    
    // Create a unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `statuses-${timestamp}.json`;
    
    try {
      // Upload data to the bucket
      const { data, error } = await supabase.storage
        .from(STATUS_BUCKET_NAME)
        .upload(fileName, blob, {
          contentType: 'application/json',
          upsert: true
        });
        
      if (error) {
        console.error('Erreur lors de l\'exportation des statuts:', error);
        if (error.message?.includes('Permission denied') || error.message?.includes('not allowed')) {
          return { 
            success: false, 
            error: 'PERMISSION_DENIED', 
            message: 'Vous n\'avez pas les permissions nécessaires pour uploader des fichiers.' 
          };
        }
        if (error.message?.includes('does not exist')) {
          return { 
            success: false, 
            error: 'BUCKET_NOT_FOUND',
            message: `Le bucket "${STATUS_BUCKET_NAME}" n'existe pas.` 
          };
        }
        return { 
          success: false, 
          error: 'UPLOAD_ERROR',
          message: 'Erreur lors du téléchargement du fichier. ' + error.message 
        };
      }
      
      console.log('Statuts exportés avec succès:', data);
      return { success: true };
    } catch (uploadError: any) {
      console.error('Exception lors de l\'upload des statuts:', uploadError);
      if (uploadError.message?.includes('Permission denied') || uploadError.message?.includes('not allowed')) {
        return { 
          success: false, 
          error: 'PERMISSION_DENIED',
          message: 'Vous n\'avez pas les permissions nécessaires pour uploader des fichiers.' 
        };
      }
      return { 
        success: false, 
        error: 'UPLOAD_ERROR',
        message: 'Erreur lors du téléchargement du fichier. ' + uploadError.message 
      };
    }
  } catch (error: any) {
    console.error('Erreur générale lors de l\'exportation des statuts:', error);
    return { 
      success: false, 
      error: 'GENERAL_ERROR',
      message: 'Erreur inattendue: ' + error.message 
    };
  }
}
