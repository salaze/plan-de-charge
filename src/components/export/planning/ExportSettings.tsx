
import React, { useState } from 'react';
import { FileDown, FileSpreadsheet, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';

interface ExportSettingsProps {
  handleExport: () => void;
}

const ExportSettings: React.FC<ExportSettingsProps> = ({ handleExport }) => {
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
      case "csv": return <Calendar className="h-4 w-4 mr-2" />;
      case "json": return <Calendar className="h-4 w-4 mr-2" />;
      default: return <FileDown className="h-4 w-4 mr-2" />;
    }
  };
  
  return (
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
  );
};

export default ExportSettings;
