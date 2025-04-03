
import React from 'react';
import { Laptop, Info, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';

interface AppExportCardProps {
  handleExportApplication: () => Promise<void>;
}

const AppExportCard: React.FC<AppExportCardProps> = ({ handleExportApplication }) => {
  return (
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
  );
};

export default AppExportCard;
