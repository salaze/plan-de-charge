
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

/**
 * Exporte l'application pour une utilisation locale
 * Crée un fichier ZIP contenant l'application
 */
export const exportApplicationForLocalUse = async (): Promise<void> => {
  try {
    toast.info("Préparation de l'export de l'application...");
    
    // Créer un nouvel objet ZIP
    const zip = new JSZip();
    
    // Récupérer les données de l'application depuis localStorage
    const appData = localStorage.getItem('planningData');
    
    // Créer un répertoire data et y ajouter les données
    const dataFolder = zip.folder('data');
    if (dataFolder && appData) {
      dataFolder.file('planningData.json', appData);
    }
    
    // Générer le fichier README avec les instructions
    const readmeContent = `# Planning Application

## Utilisation locale

Cette application a été exportée pour une utilisation locale. Voici comment l'utiliser:

1. Décompressez tous les fichiers dans un dossier.
2. Ouvrez le fichier index.html dans un navigateur moderne (Chrome, Firefox, Edge, etc.).
3. L'application fonctionnera en mode hors-ligne, utilisant la technologie PWA.
4. Pour installer l'application sur votre bureau, utilisez l'option "Installer" disponible dans votre navigateur.

## Données

Toutes vos données sont stockées localement dans le navigateur. Aucune connexion internet n'est requise.

## Support

Pour toute assistance, veuillez contacter votre administrateur système.
`;
    
    zip.file('README.txt', readmeContent);
    
    // Générer le fichier ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Télécharger le fichier ZIP
    saveAs(content, 'planning-application-export.zip');
    
    toast.success('Export réussi! Vous pouvez maintenant utiliser l\'application en local.');
  } catch (error) {
    console.error('Erreur lors de l\'export de l\'application:', error);
    toast.error('Une erreur est survenue lors de l\'export de l\'application');
  }
};
