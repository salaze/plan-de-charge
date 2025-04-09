
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, AlertTriangle, ArrowRight, Database, Upload, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { migrateLocalDataToSupabase, clearSupabaseTables, resetSupabaseData } from '@/services/supabase';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const InitApp = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
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

  const handleClearData = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer TOUTES les données dans Supabase ? Cette action est irréversible.')) {
      return;
    }
    
    setIsClearing(true);
    try {
      const success = await clearSupabaseTables();
      
      if (success) {
        toast.success('Suppression des données réussie');
      } else {
        toast.error('Erreur lors de la suppression des données');
      }
    } catch (error) {
      console.error('Erreur non gérée:', error);
      toast.error('Une erreur est survenue lors de la suppression');
    } finally {
      setIsClearing(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser TOUTES les données ? Les données actuelles seront supprimées et remplacées par le contenu du localStorage. Cette action est irréversible.')) {
      return;
    }
    
    setIsResetting(true);
    try {
      const success = await resetSupabaseData();
      
      if (success) {
        setMigrationComplete(true);
      }
    } catch (error) {
      console.error('Erreur non gérée:', error);
      toast.error('Une erreur est survenue lors de la réinitialisation');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Initialisation de l'application</h1>
        
        <Tabs defaultValue="migration" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="migration">Migration</TabsTrigger>
            <TabsTrigger value="reset">Réinitialisation</TabsTrigger>
            <TabsTrigger value="clear">Suppression</TabsTrigger>
          </TabsList>

          <TabsContent value="migration" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="reset" className="space-y-4">
            <Card className="border-orange-400/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-500">
                  <RefreshCw className="h-6 w-6" />
                  <span>Réinitialisation complète</span>
                </CardTitle>
                <CardDescription>
                  Supprimer toutes les données dans Supabase et les remplacer par celles du stockage local
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="bg-warning/20 text-warning border-warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Action de réinitialisation</AlertTitle>
                  <AlertDescription>
                    Cette opération va d'abord supprimer TOUTES les données existantes dans Supabase,
                    puis migrer à nouveau les données depuis le localStorage.
                  </AlertDescription>
                </Alert>
                
                <Alert className="mt-4 bg-destructive/20 text-destructive border-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Attention : Action irréversible</AlertTitle>
                  <AlertDescription>
                    Toutes les données actuellement dans Supabase seront définitivement perdues.
                    Cette action ne peut pas être annulée.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Annuler
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReset} 
                  disabled={isResetting}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {isResetting ? 'Réinitialisation en cours...' : 'Réinitialiser les données'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="clear" className="space-y-4">
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-6 w-6" />
                  <span>Suppression des données</span>
                </CardTitle>
                <CardDescription>
                  Supprimer toutes les données dans Supabase sans rien importer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="bg-destructive/20 text-destructive border-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Zone de danger</AlertTitle>
                  <AlertDescription>
                    Cette opération supprimera TOUTES les données de l'application dans Supabase :
                    <ul className="list-disc list-inside mt-2">
                      <li>Tous les employés</li>
                      <li>Tous les statuts</li>
                      <li>Tous les plannings</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                
                <Separator className="my-4" />
                
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Utilisez cette option uniquement si vous souhaitez repartir de zéro ou
                    en cas de problème grave avec les données. Cette action est irréversible.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Annuler
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleClearData} 
                  disabled={isClearing}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {isClearing ? 'Suppression en cours...' : 'Tout supprimer'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default InitApp;
