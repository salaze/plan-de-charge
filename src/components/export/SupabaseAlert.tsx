
import React from 'react';
import { Info } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const SupabaseAlert: React.FC = () => {
  return (
    <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <Info className="h-4 w-4" />
      <AlertTitle>Connexion Supabase</AlertTitle>
      <AlertDescription>
        Votre application est connectée à Supabase. Vous pouvez maintenant stocker et récupérer des données dans votre base de données.
      </AlertDescription>
    </Alert>
  );
};

export default SupabaseAlert;
