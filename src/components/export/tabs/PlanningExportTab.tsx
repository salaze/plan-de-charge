
import React, { useState } from 'react';
import { FileDown, FileUp, FileSpreadsheet, Upload, Calendar, Info, Files, FileJson, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { handleFileImport } from '@/utils/fileImportUtils';
import { StatusCell } from '@/components/calendar/StatusCell';
import { StatusCode } from '@/types';

interface PlanningExportTabProps {
  handleExport: () => void;
  handleImportSuccess: (data: any) => void;
  importedData: any | null;
}

const PlanningExportTab: React.FC<PlanningExportTabProps> = ({
  handleExport,
  handleImportSuccess,
  importedData
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [exportFormat, setExportFormat] = useState<string>("excel");
  const [exportScope, setExportScope] = useState<string>("month");
  
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
    <div className="space-y-4">
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
              <CalendarComponent
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
      
      <StatusLegendCard statuses={statuses} />
    </div>
  );
};

type StatusLegendCardProps = {
  statuses: StatusCode[];
};

const StatusLegendCard: React.FC<StatusLegendCardProps> = ({ statuses }) => {
  return (
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
  );
};

export default PlanningExportTab;
