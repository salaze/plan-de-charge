
import React from 'react';
import { FileSpreadsheet, Files, FileJson } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExportFormatSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const ExportFormatSelector: React.FC<ExportFormatSelectorProps> = ({ 
  value, 
  onValueChange 
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Format</label>
      <Select
        value={value}
        onValueChange={onValueChange}
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
  );
};

export const getFormatLabel = (format: string): string => {
  switch (format) {
    case "excel": return "Excel (.xlsx)";
    case "csv": return "CSV (.csv)";
    case "json": return "JSON (.json)";
    default: return format;
  }
};

export const getFormatIcon = (format: string) => {
  switch (format) {
    case "excel": return <FileSpreadsheet className="h-4 w-4 mr-2" />;
    case "csv": return <Files className="h-4 w-4 mr-2" />;
    case "json": return <FileJson className="h-4 w-4 mr-2" />;
    default: return <FileSpreadsheet className="h-4 w-4 mr-2" />;
  }
};
