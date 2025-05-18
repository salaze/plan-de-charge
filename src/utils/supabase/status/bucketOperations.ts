
import { supabase } from "@/integrations/supabase/client";

// Define specific return types for bucket operations
export type BucketSuccessResult<T> = {
  success: true;
  data: T;
  message?: string;
};

export type BucketErrorResult = {
  success: false;
  error: string;
  message?: string;
};

export type BucketOperationResult<T> = BucketSuccessResult<T> | BucketErrorResult;

/**
 * Checks if a bucket exists and creates it if needed
 * @param bucketName Name of the bucket to check/create
 * @returns Object containing the operation result
 */
export async function ensureBucketExists(bucketName: string): Promise<BucketOperationResult<boolean>> {
  try {
    console.log(`Checking if bucket '${bucketName}' exists...`);
    
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      if (listError.message?.includes('Permission denied')) {
        return { 
          success: false, 
          error: 'PERMISSION_DENIED', 
          message: 'Vous n\'avez pas les permissions nécessaires pour lister les buckets.' 
        };
      }
      return { success: false, error: 'BUCKET_LIST_ERROR', message: 'Erreur lors de la récupération des buckets' };
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Bucket '${bucketName}' already exists.`);
      return { success: true, data: true };
    }
    
    // Create the bucket if it doesn't exist
    console.log(`Creating bucket '${bucketName}'...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 1024 * 1024, // 1MB
    });
    
    if (createError) {
      console.error('Error creating bucket:', createError);
      if (createError.message?.includes('Permission denied') || createError.message?.includes('not allowed')) {
        return { 
          success: false, 
          error: 'PERMISSION_DENIED', 
          message: 'Vous n\'avez pas les permissions nécessaires pour créer un bucket.'
        };
      }
      return { 
        success: false, 
        error: 'BUCKET_CREATE_ERROR', 
        message: 'Impossible de créer le bucket. Vérifiez les logs pour plus de détails.'
      };
    }
    
    console.log(`Bucket '${bucketName}' created successfully.`);
    return { success: true, data: true };
  } catch (error: any) {
    console.error('Error ensuring bucket exists:', error);
    if (error.message?.includes('Permission denied')) {
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

/**
 * Lists all files in a bucket, filtered by extension
 * @param bucketName Name of the bucket to list files from
 * @param extension Optional file extension to filter by (e.g. '.json')
 * @returns Array of files or error object
 */
export async function listFilesInBucket(bucketName: string, extension?: string): Promise<BucketOperationResult<any[]>> {
  try {
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        sortBy: { column: 'name', order: 'desc' }
      });
      
    if (error) {
      console.error('Error listing files in bucket:', error);
      if (error.message?.includes('Permission denied')) {
        return { 
          success: false, 
          error: 'PERMISSION_DENIED',
          message: 'Vous n\'avez pas les permissions nécessaires pour lister les fichiers.' 
        };
      }
      if (error.message?.includes('does not exist')) {
        return { 
          success: false, 
          error: 'BUCKET_NOT_FOUND',
          message: `Le bucket "${bucketName}" n'existe pas.` 
        };
      }
      return { 
        success: false, 
        error: 'LIST_ERROR',
        message: 'Erreur lors de la récupération des fichiers: ' + error.message
      };
    }
    
    if (!files || files.length === 0) {
      return { success: true, data: [] };
    }
    
    // Filter files by extension if provided
    const filteredFiles = extension 
      ? files.filter(file => file.name.endsWith(extension))
      : files;
      
    return { success: true, data: filteredFiles };
  } catch (error: any) {
    console.error('Error listing files:', error);
    return { 
      success: false, 
      error: 'GENERAL_ERROR',
      message: 'Erreur inattendue: ' + error.message 
    };
  }
}
