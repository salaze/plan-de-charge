
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, AlertTriangle, ArrowRight, Database, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { migrateLocalDataToSupabase } from '@/services/supabaseServices';
import { useNavigate } from 'react-router-dom';

const InitApp = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const navigate = useNavigate();

  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      const success = await migrateLocalDataToSupabase();
      
      if (success) {
        toast.success('Migration des données réussie');
        setMigrationComplete(true);
      } else {
        toast.error('Erreur lors de la migration des données');
      }
    } catch (error) {
      console.error('Erreur non gérée:', error);
      toast.error('Une erreur est survenue lors de la migration');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Initialisation de l'application</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6" />
                <span>Migration vers Supabase</span>
              </CardTitle>
              <CardDescription>
                Migrez les données existantes du stockage local vers Supabase
              </CardDescription>
            </CardHeader>
            <CardContent>
              {migrationComplete ? (
                <Alert className="bg-success/20 text-success border-success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Migration terminée</AlertTitle>
                  <AlertDescription>
                    Toutes les données ont été migrées avec succès vers Supabase.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Migration des données</AlertTitle>
                  <AlertDescription>
                    Cette opération migrera vos données locales (statuts et employés) vers Supabase.
                    Les données existantes dans Supabase ne seront pas écrasées.
                  </AlertDescription>
                </Alert>
              )}
              
              <Alert className="mt-4 bg-warning/20 text-warning border-warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Assurez-vous d'avoir une connexion Internet stable avant de lancer la migration.
                  Cette opération peut prendre plusieurs minutes selon la quantité de données à migrer.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/')}>
                Retour
              </Button>
              {migrationComplete ? (
                <Button onClick={() => navigate('/')} className="gap-2">
                  <span>Aller à l'application</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleMigration} 
                  disabled={isMigrating}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {isMigrating ? 'Migration en cours...' : 'Lancer la migration'}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default InitApp;
