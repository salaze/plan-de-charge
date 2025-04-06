
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { migrateFromLocalStorage } from '@/utils/dataMigrationUtils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const InitApp = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const performMigration = async () => {
      try {
        setStatus('Vérification des données...');
        setProgress(10);
        
        // Petite pause pour l'affichage de l'UI
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(30);
        
        setStatus('Migration des données...');
        const success = migrateFromLocalStorage();
        
        // Petite pause pour l'affichage de l'UI
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(70);
        
        setStatus('Finalisation...');
        
        // Petite pause pour l'affichage de l'UI
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(100);
        
        if (success) {
          setStatus('Migration terminée avec succès!');
          setMigrationComplete(true);
        } else {
          setStatus('Aucune donnée à migrer, initialisation terminée.');
          setMigrationComplete(true);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
        setStatus('Échec de la migration');
      }
    };
    
    performMigration();
  }, []);
  
  const handleContinue = () => {
    navigate('/');
  };
  
  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-6 animate-fade-in py-12">
        <Card>
          <CardHeader>
            <CardTitle>Initialisation de l'application</CardTitle>
            <CardDescription>
              Migration des données vers le nouveau format JSON
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Progress value={progress} className="w-full" />
            
            <div className="flex items-center space-x-2 text-sm">
              {migrationComplete ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : error ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              )}
              <span>{status}</span>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                {error}
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={handleContinue} 
              disabled={!migrationComplete}
              className="w-full"
            >
              Continuer vers l'application
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default InitApp;
