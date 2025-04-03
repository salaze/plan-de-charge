
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
    
    // Ajouter un fichier HTML basique pour charger les données
    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planning Application</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; }
    h1 { color: #333; }
    ul { padding-left: 20px; }
    .btn { display: inline-block; background: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Planning Application - Export Local</h1>
    <p>Voici les données exportées de votre application de planning.</p>
    
    <h2>Données sauvegardées</h2>
    <div id="data-container">
      <p>Chargement des données...</p>
    </div>
    
    <a href="#" class="btn" id="download-btn">Télécharger les données (JSON)</a>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Charger les données depuis le fichier JSON
      fetch('./data/planningData.json')
        .then(response => response.json())
        .then(data => {
          const container = document.getElementById('data-container');
          
          // Afficher un résumé des données
          const summary = {
            année: data.year,
            mois: data.month + 1,
            nombreEmployés: data.employees ? data.employees.length : 0,
            nombreProjets: data.projects ? data.projects.length : 0
          };
          
          container.innerHTML = '<pre>' + JSON.stringify(summary, null, 2) + '</pre>';
          
          // Configurer le bouton de téléchargement
          const downloadBtn = document.getElementById('download-btn');
          downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            
            const a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', 'planningData.json');
            a.click();
          });
        })
        .catch(error => {
          document.getElementById('data-container').innerHTML = 
            '<p style="color: red;">Erreur lors du chargement des données: ' + error.message + '</p>';
        });
    });
  </script>
</body>
</html>`;
    
    zip.file('index.html', htmlContent);
    
    // Générer le fichier README avec les instructions
    const readmeContent = `# Planning Application

## Utilisation locale

Cette application a été exportée pour une utilisation locale. Voici comment l'utiliser:

1. Décompressez tous les fichiers dans un dossier.
2. Ouvrez le fichier index.html dans un navigateur moderne (Chrome, Firefox, Edge, etc.).
3. Vous pourrez visualiser et télécharger les données de votre planning.
4. Pour une utilisation complète, réimportez ces données dans l'application principale.

## Données

Toutes vos données sont incluses dans le fichier data/planningData.json.

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
