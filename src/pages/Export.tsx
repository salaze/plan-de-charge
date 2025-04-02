import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileSpreadsheet, Files, FileJson, Upload, FileUp, FileDown, Info, UserSearch, BarChartIcon, Laptop, Package } from 'lucide-react';
import { exportToExcel } from '@/utils/exportUtils';
import { handleFileImport } from '@/utils/fileImportUtils';
import { exportEmployeesToExcel, importEmployeesFromExcel } from '@/utils/employeeExportUtils';
import { exportStatsToExcel } from '@/utils/statsExportUtils';
import { exportApplicationForLocalUse } from '@/utils/appExportUtils';
import { StatusCell } from '@/components/calendar/StatusCell';
import { MonthData, StatusCode, Employee } from '@/types';
import { calculateEmployeeStats } from '@/utils/statsUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Export = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [exportFormat, setExportFormat] = useState<string>("excel");
  const [exportScope, setExportScope] = useState<string>("month");
  const [importedData, setImportedData] = useState<MonthData | null>(null);
  const [importedEmployees, setImportedEmployees] = useState<Employee[] | null>(null);
  const [activeTab, setActiveTab] = useState("planning");
  const [planningData, setPlanningData] = useState<MonthData | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  
  useEffect(() => {
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      setPlanningData(JSON.parse(savedData));
    }
  }, []);
  
  const handleExport = () => {
    try {
      const savedData = localStorage.getItem('planningData');
      let data: MonthData;
      
      if (savedData) {
        data = JSON.parse(savedData);
      } else {
        data = {
          year: date?.getFullYear() || new Date().getFullYear(),
          month: date?.getMonth() || new Date().getMonth(),
          employees: [],
          projects: []
        };
      }
      
      exportToExcel(data);
      toast.success(`Données du planning exportées au format ${getFormatLabel(exportFormat)}`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Une erreur est survenue lors de l\'export');
    }
  };
  
  const handleExportEmployees = () => {
    try {
      const savedData = localStorage.getItem('planningData');
      let employees: Employee[] = [];
      
      if (savedData) {
        const data = JSON.parse(savedData);
        employees = data.employees || [];
      }
      
      if (employees.length === 0) {
        toast.error('Aucun employé à exporter');
        return;
      }
      
      exportEmployeesToExcel(employees);
      toast.success('Employés exportés avec succès au format Excel');
    } catch (error) {
      console.error('Erreur lors de l\'export des employés:', error);
      toast.error('Une erreur est survenue lors de l\'export des employés');
    }
  };
  
  const handleExportStats = () => {
    try {
      const savedData = localStorage.getItem('planningData');
      if (!savedData) {
        toast.error('Aucune donnée disponible');
        return;
      }
      
      const data = JSON.parse(savedData);
      const employees = data.employees || [];
      const year = currentYear || new Date().getFullYear();
      const month = currentMonth || new Date().getMonth();
      
      if (employees.length === 0) {
        toast.error('Aucun employé pour calculer les statistiques');
        return;
      }
      
      const stats = employees.map(employee => calculateEmployeeStats(employee, year, month));
      
      exportStatsToExcel(stats);
      toast.success('Statistiques exportées avec succès au format Excel');
    } catch (error) {
      console.error('Erreur lors de l\'export des statistiques:', error);
      toast.error('Une erreur est survenue lors de l\'export des statistiques');
    }
  };
  
  const handleImportSuccess = (data: MonthData) => {
    setImportedData(data);
    toast.success('Données du planning importées avec succès! Les données ont été sauvegardées.');
  };
  
  const handleImportEmployees = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const result = e.target?.result;
        if (result instanceof ArrayBuffer) {
          const employees = await importEmployeesFromExcel(result);
          
          if (employees && employees.length > 0) {
            setImportedEmployees(employees);
            
            const savedData = localStorage.getItem('planningData');
            if (savedData) {
              const data = JSON.parse(savedData);
              
              const existingEmployees = data.employees || [];
              const employeeMap = new Map();
              
              existingEmployees.forEach(emp => employeeMap.set(emp.id, emp));
              employees.forEach(emp => {
                const existing = employeeMap.get(emp.id);
                if (existing) {
                  emp.schedule = existing.schedule || [];
                }
                employeeMap.set(emp.id, emp);
              });
              
              data.employees = Array.from(employeeMap.values());
              localStorage.setItem('planningData', JSON.stringify(data));
            } else {
              localStorage.setItem('planningData', JSON.stringify({ 
                year: new Date().getFullYear(),
                month: new Date().getMonth(),
                employees,
                projects: []
              }));
            }
            
            toast.success(`${employees.length} employés importés avec succès`);
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'import des employés:', error);
        toast.error('Erreur lors de l\'import du fichier');
      }
      
      if (e.target) {
        e.target.value = '';
      }
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  const handleExportApplication = async () => {
    try {
      await exportApplicationForLocalUse();
    } catch (error) {
      console.error('Erreur lors de l\'export de l\'application:', error);
      toast.error('Une erreur est survenue lors de l\'export de l\'application');
    }
  };
  
  const getFormatLabel = (format: string) => {
    switch (format) {
      case "excel": return "Excel (.xlsx)";
      case "csv": return "CSV (.csv)";
      case "json": return "JSON (.json)";
      default: return format;
    }
  };
  
  const getFormatIcon = (format: string) => {
    switch (format) {
      case "excel": return <FileSpreadsheet className="h-4 w-4 mr-2" />;
      case "csv": return <Files className="h-4 w-4 mr-2" />;
      case "json": return <FileJson className="h-4 w-4 mr-2" />;
      default: return <Download className="h-4 w-4 mr-2" />;
    }
  };
  
  const statuses: StatusCode[] = ['assistance', 'absence', 'conges', 'formation', 'permanence'];
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold">Exporter les données</h1>
        
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4" />
          <AlertTitle>Connexion Supabase</AlertTitle>
          <AlertDescription>
            Votre application est connectée à Supabase. Vous pouvez maintenant stocker et récupérer des données dans votre base de données.
          </AlertDescription>
        </Alert>
        
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Laptop className="h-5 w-5" />
              <span>Exporter l'application pour utilisation locale</span>
            </CardTitle>
            <CardDescription>
              Téléchargez l'application pour l'utiliser hors ligne sur votre PC
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Cette option vous permet d'installer l'application sur votre PC pour l'utiliser hors ligne. 
              L'application sera téléchargée sous forme de fichier ZIP contenant tous les fichiers nécessaires.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Info className="h-4 w-4 mr-2" />
                  Comment ça marche ?
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Utilisation locale de l'application</DialogTitle>
                  <DialogDescription>
                    Guide d'installation et d'utilisation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Installation comme PWA</h4>
                    <p className="text-sm text-muted-foreground">
                      Cette application est une PWA (Progressive Web App). Vous pouvez l'installer sur votre PC en cliquant sur l'icône d'installation dans la barre d'adresse de votre navigateur.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Export des données</h4>
                    <p className="text-sm text-muted-foreground">
                      L'application fonctionne en mode hors ligne. Toutes vos données sont stockées localement dans le navigateur.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Utilisation en mode local</h4>
                    <ol className="text-sm text-muted-foreground list-decimal list-inside pl-2 space-y-1">
                      <li>Cliquez sur "Exporter pour utilisation locale"</li>
                      <li>Décompressez le fichier ZIP téléchargé</li>
                      <li>Ouvrez le fichier index.html dans un navigateur moderne</li>
                      <li>Utilisez l'application comme d'habitude, sans connexion internet</li>
                    </ol>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={handleExportApplication}>
              <Package className="h-4 w-4 mr-2" />
              Exporter pour utilisation locale
            </Button>
          </CardFooter>
        </Card>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="planning">
              <Calendar className="h-4 w-4 mr-2" />
              Planning
            </TabsTrigger>
            <TabsTrigger value="employees">
              <UserSearch className="h-4 w-4 mr-2" />
              Employés
            </TabsTrigger>
            <TabsTrigger value="statistics">
              <BarChartIcon className="h-4 w-4 mr-2" />
              Statistiques
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="planning" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileDown className="h-5 w-5" />
                    <span>Exporter le planning</span>
                  </CardTitle>
                  <CardDescription>
                    Exportez votre planning avec les employés et leurs statuts au format Excel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <Select
                      value={exportFormat}
                      onValueChange={setExportFormat}
                      defaultValue="excel"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                        <SelectItem value="csv" disabled>CSV (.csv)</SelectItem>
                        <SelectItem value="json" disabled>JSON (.json)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Période</label>
                    <Select
                      value={exportScope}
                      onValueChange={setExportScope}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une période" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Jour</SelectItem>
                        <SelectItem value="week">Semaine</SelectItem>
                        <SelectItem value="month">Mois</SelectItem>
                        <SelectItem value="custom">Personnalisée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sélectionnez une date</label>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleExport} className="w-full">
                    {getFormatIcon(exportFormat)}
                    Exporter le planning au format {getFormatLabel(exportFormat)}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileUp className="h-5 w-5" />
                    <span>Importer des données de planning</span>
                  </CardTitle>
                  <CardDescription>
                    Importez un fichier Excel pour mettre à jour votre planning
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-8 border-2 border-dashed rounded-lg text-center">
                    <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Glissez-déposez un fichier Excel (.xlsx) ici, ou cliquez pour sélectionner un fichier
                    </p>
                    <div className="relative">
                      <input
                        type="file"
                        id="file-upload"
                        accept=".xlsx"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileImport(e, handleImportSuccess)}
                      />
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Importer un fichier Excel
                      </Button>
                    </div>
                  </div>
                  
                  {importedData && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        Importation réussie
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                        {importedData.employees.length} employés importés pour {importedData.month + 1}/{importedData.year}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Légende des statuts</CardTitle>
                <CardDescription>
                  Référence des codes utilisés dans le planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statuses.map((status) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusCell status={status} isBadge={true} />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Code: {status.toUpperCase()}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusCell status="assistance" isHighlighted={true} isBadge={true} />
                      <span className="text-sm">Entouré (Permanence)</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Statut avec permanence
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="employees" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileDown className="h-5 w-5" />
                    <span>Exporter les employés</span>
                  </CardTitle>
                  <CardDescription>
                    Exportez la liste des employés au format Excel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cette opération exportera tous les employés avec leurs informations (nom, email, fonction, département).
                    Les données de planning ne seront pas incluses.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleExportEmployees} className="w-full">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exporter les employés au format Excel
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileUp className="h-5 w-5" />
                    <span>Importer des employés</span>
                  </CardTitle>
                  <CardDescription>
                    Importez un fichier Excel contenant des employés
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-8 border-2 border-dashed rounded-lg text-center">
                    <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Format attendu: colonnes "Nom", "Email", "Fonction", "Département"
                    </p>
                    <div className="relative">
                      <input
                        type="file"
                        id="employee-file-upload"
                        accept=".xlsx"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleImportEmployees}
                      />
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Importer des employés
                      </Button>
                    </div>
                  </div>
                  
                  {importedEmployees && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        Importation réussie
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                        {importedEmployees.length} employés importés
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="statistics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChartIcon className="h-5 w-5" />
                  <span>Exporter les statistiques</span>
                </CardTitle>
                <CardDescription>
                  Exportez les statistiques de présence au format Excel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Cette opération exportera les statistiques de tous les employés pour le mois actuel,
                  incluant les jours de présence, congés, formation, etc.
                </p>
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">Année et mois</label>
                  <div className="flex gap-2">
                    <Select 
                      value={currentYear.toString()} 
                      onValueChange={(value) => setCurrentYear(parseInt(value))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Année" />
                      </SelectTrigger>
                      <SelectContent>
                        {[2023, 2024, 2025].map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={currentMonth.toString()} 
                      onValueChange={(value) => setCurrentMonth(parseInt(value))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Mois" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { value: '0', label: 'Janvier' },
                          { value: '1', label: 'Février' },
                          { value: '2', label: 'Mars' },
                          { value: '3', label: 'Avril' },
                          { value: '4', label: 'Mai' },
                          { value: '5', label: 'Juin' },
                          { value: '6', label: 'Juillet' },
                          { value: '7', label: 'Août' },
                          { value: '8', label: 'Septembre' },
                          { value: '9', label: 'Octobre' },
                          { value: '10', label: 'Novembre' },
                          { value: '11', label: 'Décembre' }
                        ].map(month => (
                          <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleExportStats} className="w-full">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exporter les statistiques au format Excel
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Export;
