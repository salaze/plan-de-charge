
import React from 'react';
import { FileDown, FileUp, FileSpreadsheet, Upload, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Employee } from '@/types';

interface EmployeesExportTabProps {
  handleExportEmployees: () => void;
  handleImportEmployees: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importedEmployees: Employee[] | null;
  selectedDepartment: string;
}

const EmployeesExportTab: React.FC<EmployeesExportTabProps> = ({
  handleExportEmployees,
  handleImportEmployees,
  importedEmployees,
  selectedDepartment
}) => {
  return (
    <div className="space-y-4">
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
              Cette opération exportera tous les employés {selectedDepartment !== "all" ? `du département ${selectedDepartment}` : ""} 
              avec leurs informations (nom, UID, fonction, département).
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
                Format attendu: colonnes "Nom", "UID", "Fonction", "Département"
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
    </div>
  );
};

export default EmployeesExportTab;
