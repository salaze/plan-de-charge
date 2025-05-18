
import { supabase } from "@/integrations/supabase/client";
import { Status } from "@/components/admin/status/types";
import { listFilesInBucket } from "./bucketOperations";

const STATUS_BUCKET_NAME = 'status-icons';

/**
 * Type definitions for the function return values
 */
type ImportSuccessResult = {
  success: true;
  data: Status[];
  message?: string;
};

type ImportErrorResult = {
  success: false;
  error: string;
  message?: string;
};

export type ImportResult = ImportSuccessResult | ImportErrorResult | Status[];

/**
 * Imports statuses from a Supabase storage bucket
 * @returns Object containing statuses or error information
 */
export async function importStatusesFromBucket(): Promise<ImportResult> {
  try {
    console.log('Importation des statuts depuis le bucket...');
    
    // List JSON files in the bucket
    const filesResult = await listFilesInBucket(STATUS_BUCKET_NAME, '.json');
    
    if (!filesResult.success) {
      return filesResult;
    }
    
    const jsonFiles = filesResult.data || [];
    
    if (jsonFiles.length === 0) {
      console.log('Aucun fichier de statuts trouvé dans le bucket');
      return { 
        success: true, 
        data: [],
        message: 'Aucun fichier de statuts trouvé. Exportez d\'abord vos statuts.' 
      };
    }
    
    // Get the most recent file
    const latestFile = jsonFiles[0];
    const { data, error: downloadError } = await supabase.storage
      .from(STATUS_BUCKET_NAME)
      .download(latestFile.name);
      
    if (downloadError) {
      console.error('Erreur lors du téléchargement du fichier:', downloadError);
      if (downloadError.message?.includes('Permission denied') || downloadError.message?.includes('not allowed')) {
        return { 
          success: false, 
          error: 'PERMISSION_DENIED',
          message: 'Vous n\'avez pas les permissions nécessaires pour télécharger les fichiers.' 
        };
      }
      return { 
        success: false, 
        error: 'DOWNLOAD_ERROR',
        message: 'Erreur lors du téléchargement du fichier: ' + downloadError.message
      };
    }
    
    // Parse the JSON content
    const textContent = await data.text();
    const statuses = JSON.parse(textContent) as Status[];
    
    console.log('Statuts importés avec succès:', statuses);
    return { success: true, data: statuses };
  } catch (error: any) {
    console.error('Erreur lors de l\'importation des statuts:', error);
    if (error.message?.includes('Permission denied') || error.message?.includes('not allowed')) {
      return { 
        success: false, 
        error: 'PERMISSION_DENIED',
        message: 'Erreur d\'accès: ' + error.message 
      };
    }
    return { 
      success: false, 
      error: 'GENERAL_ERROR',
      message: 'Erreur inattendue: ' + error.message 
    };
  }
}
