
import React from 'react';
import { FileUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FileUploader } from './FileUploader';

interface ImportCardProps {
  handleImportSuccess: (data: any) => void;
  importedData: any | null;
}

export const ImportCard: React.FC<ImportCardProps> = ({ 
  handleImportSuccess, 
  importedData 
}) => {
  return (
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
        <FileUploader 
          handleImportSuccess={handleImportSuccess}
          importedData={importedData}
        />
      </CardContent>
    </Card>
  );
};
