
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, Calendar, Download, Database } from 'lucide-react';
import { exportToExcel } from '@/utils/dataUtils';
import { MonthData } from '@/types';

const Export = () => {
  const [data, setData] = useState<MonthData>(() => {
    const savedData = localStorage.getItem('planningData');
    return savedData ? JSON.parse(savedData) : { year: new Date().getFullYear(), month: new Date().getMonth(), employees: [] };
  });
  
  const handleExport = () => {
    exportToExcel(data);
    toast.success('Données exportées avec succès');
  };
  
  const handleBackup = () => {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planning_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Sauvegarde créée avec succès');
  };
  
  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const parsedData = JSON.parse(result);
        
        // Validation basique
        if (!parsedData.employees || !Array.isArray(parsedData.employees)) {
          throw new Error('Format de fichier invalide');
        }
        
        // Mise à jour des données
        localStorage.setItem('planningData', result);
        setData(parsedData);
        toast.success('Données restaurées avec succès');
      } catch (error) {
        toast.error('Erreur lors de la restauration des données');
        console.error(error);
      }
    };
    
    reader.readAsText(file);
    
    // Réinitialiser l'input
    event.target.value = '';
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Export et sauvegarde</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-panel hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
                <CardTitle>Export Excel</CardTitle>
              </div>
              <CardDescription>
                Exportez vos données de planning au format Excel pour les utiliser dans d'autres applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full flex items-center justify-center gap-2 transition-transform hover:scale-105"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                Exporter les données
              </Button>
            </CardContent>
          </Card>
          
          <Card className="glass-panel hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                <CardTitle>Sauvegarde</CardTitle>
              </div>
              <CardDescription>
                Créez une sauvegarde de vos données et restaurez-les à tout moment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full flex items-center justify-center gap-2 transition-transform hover:scale-105"
                onClick={handleBackup}
              >
                <Download className="h-4 w-4" />
                Créer une sauvegarde
              </Button>
              
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2 transition-all hover:bg-secondary"
                >
                  <Calendar className="h-4 w-4" />
                  Restaurer une sauvegarde
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Export;
