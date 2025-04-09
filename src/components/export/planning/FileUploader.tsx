
import React from 'react';
import { FileSpreadsheet, Upload, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleFileImport } from '@/utils/fileImportUtils';

interface FileUploaderProps {
  handleImportSuccess: (data: any) => void;
  importedData: any | null;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  handleImportSuccess,
  importedData
}) => {
  return (
    <>
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
    </>
  );
};
