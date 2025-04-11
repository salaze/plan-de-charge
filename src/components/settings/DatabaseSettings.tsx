
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, RefreshCw, Database, CloudUpload } from 'lucide-react';
import { migrateLocalStorageToSupabase } from '@/utils/dataImportUtils';

export function DatabaseSettings() {
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigration = async () => {
    try {
      setIsMigrating(true);
      const result = await migrateLocalStorageToSupabase();
      setIsMigrating(false);
      
      if (result) {
        toast.success('Migration des données vers Supabase terminée avec succès');
      }
    } catch (error) {
      setIsMigrating(false);
      toast.error('Erreur lors de la migration des données');
      console.error('Erreur de migration:', error);
    }
  };

  return (
    <Card className="glass-panel animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Base de données Supabase
        </CardTitle>
        <CardDescription>
          Gérez la synchronisation de vos données avec la base de données Supabase pour une persistance optimale.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-md bg-muted flex items-start gap-2">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Migrer vos données vers Supabase vous permet de les conserver de manière permanente et d'y accéder
            depuis n'importe quel appareil. Cette opération ne supprime pas vos données locales.
          </p>
        </div>
        
        <Button 
          variant="default" 
          className="flex items-center gap-2 w-full"
          onClick={handleMigration}
          disabled={isMigrating}
        >
          {isMigrating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Migration en cours...
            </>
          ) : (
            <>
              <CloudUpload className="h-4 w-4" />
              Migrer les données locales vers Supabase
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
