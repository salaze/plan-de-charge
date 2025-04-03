
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Exporte l'application complète pour une utilisation locale
 */
export const exportApplicationForLocalUse = async (): Promise<void> => {
  try {
    // Créer un nouveau fichier ZIP
    const zip = new JSZip();
    
    // Récupérer le planningData depuis le localStorage
    const planningData = localStorage.getItem('planningData');
    
    // Créer un dossier data pour stocker les données
    const dataFolder = zip.folder('data');
    if (dataFolder && planningData) {
      dataFolder.file('planningData.json', planningData);
    }
    
    // Récupérer le code HTML de la page actuelle
    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application de Planning - Version Locale</title>
  <link rel="stylesheet" href="./css/styles.css">
  <link rel="icon" href="./favicon.ico" type="image/x-icon">
</head>
<body>
  <div id="app">
    <header class="bg-primary text-white p-4">
      <h1 class="text-2xl font-bold">Application de Planning</h1>
      <p>Version locale</p>
    </header>
    
    <main class="container mx-auto p-4">
      <div id="planning-container" class="mb-8">
        <h2 class="text-xl font-bold mb-4">Planning</h2>
        <div id="planning-data"></div>
      </div>
      
      <div id="controls" class="mb-4">
        <button id="export-excel" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Exporter en Excel</button>
        <button id="import-data" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-2">Importer des données</button>
      </div>
    </main>
    
    <footer class="bg-gray-200 p-4 text-center">
      <p>Application exportée le ${new Date().toLocaleDateString()}</p>
    </footer>
  </div>
  
  <script src="./js/xlsx.full.min.js"></script>
  <script src="./js/app.js"></script>
</body>
</html>`;
    
    // Créer le code JavaScript pour l'application locale
    const jsContent = `// Fonctions principales de l'application
document.addEventListener('DOMContentLoaded', function() {
  // Charger les données
  loadPlanningData();
  
  // Ajouter les écouteurs d'événements
  document.getElementById('export-excel').addEventListener('click', exportToExcel);
  document.getElementById('import-data').addEventListener('click', importData);
});

// Charger les données du planning
function loadPlanningData() {
  try {
    const planningDataJSON = localStorage.getItem('planningData');
    if (planningDataJSON) {
      const planningData = JSON.parse(planningDataJSON);
      renderPlanningData(planningData);
    } else {
      // Essayer de charger depuis le fichier
      fetch('./data/planningData.json')
        .then(response => response.json())
        .then(data => {
          localStorage.setItem('planningData', JSON.stringify(data));
          renderPlanningData(data);
        })
        .catch(error => {
          console.error('Erreur lors du chargement des données:', error);
          document.getElementById('planning-data').innerHTML = '<p class="text-red-500">Erreur lors du chargement des données</p>';
        });
    }
  } catch (error) {
    console.error('Erreur:', error);
    document.getElementById('planning-data').innerHTML = '<p class="text-red-500">Erreur lors du chargement des données</p>';
  }
}

// Afficher les données du planning
function renderPlanningData(data) {
  const container = document.getElementById('planning-data');
  
  if (!data || !data.employees || data.employees.length === 0) {
    container.innerHTML = '<p>Aucune donnée disponible</p>';
    return;
  }
  
  let html = '<div class="overflow-x-auto">';
  html += '<table class="border-collapse border w-full">';
  
  // En-tête du tableau
  html += '<thead class="bg-gray-200">';
  html += '<tr>';
  html += '<th class="border p-2">Employé</th>';
  html += '<th class="border p-2">Département</th>';
  html += '<th class="border p-2">Jours prévus</th>';
  html += '</tr>';
  html += '</thead>';
  
  // Corps du tableau
  html += '<tbody>';
  data.employees.forEach(employee => {
    html += '<tr>';
    html += \`<td class="border p-2">\${employee.name}</td>\`;
    html += \`<td class="border p-2">\${employee.department || '-'}</td>\`;
    html += \`<td class="border p-2">\${employee.schedule ? employee.schedule.length : 0} jours</td>\`;
    html += '</tr>';
  });
  html += '</tbody>';
  
  html += '</table>';
  html += '</div>';
  
  container.innerHTML = html;
}

// Exporter en Excel
function exportToExcel() {
  try {
    const planningDataJSON = localStorage.getItem('planningData');
    if (!planningDataJSON) {
      alert('Aucune donnée à exporter');
      return;
    }
    
    const planningData = JSON.parse(planningDataJSON);
    
    // Créer un tableau de données pour Excel
    const data = [['Employé', 'Département', 'Fonction', 'Jours prévus']];
    
    planningData.employees.forEach(employee => {
      data.push([
        employee.name,
        employee.department || '-',
        employee.position || '-',
        employee.schedule ? employee.schedule.length : 0
      ]);
    });
    
    // Créer un workbook et une worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Ajouter la worksheet au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Planning');
    
    // Générer le fichier Excel et le télécharger
    XLSX.writeFile(wb, \`planning_export_\${new Date().toISOString().slice(0, 10)}.xlsx\`);
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    alert('Erreur lors de l\'export Excel');
  }
}

// Importer des données
function importData() {
  alert('Fonctionnalité d\'importation non disponible dans la version locale.');
}`;
    
    // Créer le CSS pour l'application locale
    const cssContent = `/* Styles de base */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
  line-height: 1.5;
  color: #333;
  background-color: #f5f5f5;
}

/* Utilitaires */
.container { width: 100%; max-width: 1200px; margin-left: auto; margin-right: auto; }
.mx-auto { margin-left: auto; margin-right: auto; }
.p-4 { padding: 1rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-8 { margin-bottom: 2rem; }
.ml-2 { margin-left: 0.5rem; }
.text-center { text-align: center; }
.text-white { color: white; }
.text-2xl { font-size: 1.5rem; }
.text-xl { font-size: 1.25rem; }
.font-bold { font-weight: bold; }
.bg-primary { background-color: #1e3a8a; }
.bg-gray-200 { background-color: #e5e7eb; }
.bg-green-500 { background-color: #10b981; }
.bg-green-600 { background-color: #059669; }
.bg-blue-500 { background-color: #3b82f6; }
.bg-blue-600 { background-color: #2563eb; }
.text-red-500 { color: #ef4444; }
.rounded { border-radius: 0.25rem; }
.hover\:bg-green-600:hover { background-color: #059669; }
.hover\:bg-blue-600:hover { background-color: #2563eb; }
.overflow-x-auto { overflow-x: auto; }

/* Tableau */
.border-collapse { border-collapse: collapse; }
.border { border: 1px solid #e5e7eb; }
.w-full { width: 100%; }
.p-2 { padding: 0.5rem; }

/* Boutons */
button {
  cursor: pointer;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

/* Responsive */
@media (max-width: 640px) {
  .container { padding-left: 1rem; padding-right: 1rem; }
}`;

    // Ajouter les fichiers à l'archive
    zip.file('index.html', htmlContent);
    zip.folder('js')?.file('app.js', jsContent);
    zip.folder('css')?.file('styles.css', cssContent);
    
    // Ajouter le fichier XLSX.js pour l'export Excel
    const xlsxJs = await fetch('https://cdn.sheetjs.com/xlsx-0.18.5/package/dist/xlsx.full.min.js').then(r => r.text());
    zip.folder('js')?.file('xlsx.full.min.js', xlsxJs);
    
    // Ajouter un favicon basic
    const faviconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABO1BMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////l9Pff8Pj////////////////////////////////////////////////Z7fZ7wuJjt99Vs9tMr9lHrdhGrNhHrdhWs9tkuN97wuL9/v/////7/f/v+PzG5/XB5PP1+/3t9/vV7PbU7PbI5/XO6fbb7/f+//+h1Ow/qdc6p9Y7p9ai1Os1pNVFrNdYs9t/w+OW0Oms2+/2+/2y3fD3/P6p2e630+r9/v63zWI9wbM9wbM8wbI8wbI8wbI8wbI8wbI8wbI9wbI9wbM9wbM9wbNDs71qusl0v8x3wM12wMx2wMx2wMx2wMx2wMz6wXiV1eWs3OlinjiWAAAAaXRSTlMAQGCQsMDQ4PCgcEAwEIDAMNBQ8BAg4KBgwHBAEGCw0PAgMFCgwODwPY1nMpDEzUvZDlWTscnU89zwBlz2YOf8qAj+zgb6/gb8/v4G/AbSBlwl9FqaWEyuioyMiIiKi+YICAYIrFSqVKQvjrOiAAAAAWJLR0QCZgt8ZAAAAAd0SU1FB+QEGgoNHzJ5mSEAAAFVSURBVDjLY2AgHTAyMTOzMLAiA2YWVjZ2Dg4OTi5uHl4+fgFBIWEgEAFyRUlQHhOCLyYuIQkCUtIyDLJy8gqKYKCkrMKgqqauoQkCWto6DLp6+gaGIGBkbMJgamZuYWkFAtY2tgx29g6OTs5QwOLi6ubu4enFIOnt4wsFfv4BgUHBISEMoWEgZnh4BAJERkXHxMbFMzAkJCaBaJAqUGRySmpaekYmA9jSLCidzZCTm5dfUFhUXFIKVFJWXgEClVXVNbV19Q2NTc0MTS2t0lAgKNPWDlTY0QkGXd09DCDQCwR9/RMYQP6fOAnM75+cwzAl3xoKpkqBVE+fMXNWUfXsOXPnzV/AsJARBOYBwcJFweHh4UuAlC2Yv3TZ8hUTViYgrEPUjJWrVq9ZG45sHaN7ytp1CbqJyEGgm7QeGOh6yclbEzh50cMgJXUzWnpjYEjbkr4VKp/GAADz3mQ/G6BZqQAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMC0wNC0yNlQxMDoxMzozMSswMDowMJSH4ZQAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjAtMDQtMjZUMTA6MTM6MzErMDA6MDDl2lkoAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAABJRU5ErkJggg==';
    const faviconBytes = atob(faviconBase64);
    const faviconArray = new Uint8Array(faviconBytes.length);
    for (let i = 0; i < faviconBytes.length; i++) {
      faviconArray[i] = faviconBytes.charCodeAt(i);
    }
    zip.file('favicon.ico', faviconArray, { binary: true });
    
    // Générer le fichier ZIP et le télécharger
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `planning_app_export_${new Date().toISOString().slice(0, 10)}.zip`);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Erreur lors de l\'export de l\'application:', error);
    return Promise.reject(error);
  }
};
