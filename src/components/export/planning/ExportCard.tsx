
import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ExportFormatSelector, getFormatLabel, getFormatIcon } from './ExportFormatSelector';
import { ExportScopeSelector } from './ExportScopeSelector';

interface ExportCardProps {
  handleExport: () => void;
}

export const ExportCard: React.FC<ExportCardProps> = ({ handleExport }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [exportFormat, setExportFormat] = useState<string>("excel");
  const [exportScope, setExportScope] = useState<string>("month");
  
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
        <ExportFormatSelector 
          value={exportFormat} 
          onValueChange={setExportFormat} 
        />
        
        <ExportScopeSelector 
          value={exportScope} 
          onValueChange={setExportScope} 
        />
        
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
