
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
    
    // Créer un répertoire css pour les styles
    const cssFolder = zip.folder('css');
    if (cssFolder) {
      // Ajouter un fichier CSS basique pour le style
      cssFolder.file('style.css', `
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px 0; border-bottom: 1px solid #e9ecef; }
        .header h1 { margin: 0; color: #343a40; }
        .footer { background-color: #f8f9fa; padding: 20px 0; border-top: 1px solid #e9ecef; text-align: center; margin-top: 30px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; background-color: #fff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .card-header { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; }
        .card-title { font-size: 1.25rem; margin: 0; color: #343a40; }
        .btn { display: inline-block; background: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; border: none; cursor: pointer; }
        .btn:hover { background: #45a049; }
        .btn-primary { background: #007bff; }
        .btn-primary:hover { background: #0069d9; }
        .btn-secondary { background: #6c757d; }
        .btn-secondary:hover { background: #5a6268; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }
        .table th { background-color: #f8f9fa; font-weight: bold; }
        .badge { display: inline-block; padding: 3px 7px; font-size: 12px; font-weight: 700; line-height: 1; text-align: center; white-space: nowrap; vertical-align: baseline; border-radius: 10px; }
        .badge-success { background-color: #28a745; color: white; }
        .badge-warning { background-color: #ffc107; color: #212529; }
        .badge-danger { background-color: #dc3545; color: white; }
        .badge-info { background-color: #17a2b8; color: white; }
        .badge-primary { background-color: #007bff; color: white; }
        .text-center { text-align: center; }
        .mb-3 { margin-bottom: 1rem; }
        .mt-3 { margin-top: 1rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
      `);
    }
    
    // Créer un répertoire js pour les scripts
    const jsFolder = zip.folder('js');
    if (jsFolder) {
      // Ajouter un fichier js pour les fonctionnalités
      jsFolder.file('app.js', `
        // Application principale
        class PlanningApp {
          constructor() {
            this.data = null;
            this.init();
          }
          
          init() {
            this.loadData()
              .then(() => {
                this.renderEmployeeList();
                this.renderStatistics();
                this.renderCalendar();
                this.setupEventListeners();
              })
              .catch(error => {
                console.error('Erreur lors du chargement des données:', error);
                document.getElementById('error-container').innerHTML = 
                  '<div class="card"><div class="card-header"><h3 class="card-title">Erreur</h3></div><div class="card-body"><p>Impossible de charger les données. Veuillez vérifier le fichier planningData.json.</p></div></div>';
              });
          }
          
          async loadData() {
            try {
              const response = await fetch('./data/planningData.json');
              if (!response.ok) {
                throw new Error('Impossible de charger les données');
              }
              this.data = await response.json();
              console.log('Données chargées:', this.data);
              
              // Mettre à jour l'info sur la période
              const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
              document.getElementById('period-info').textContent = \`\${monthNames[this.data.month]} \${this.data.year}\`;
              
              return this.data;
            } catch (error) {
              console.error('Erreur lors du chargement des données:', error);
              throw error;
            }
          }
          
          renderEmployeeList() {
            if (!this.data || !this.data.employees) return;
            
            const employeeList = document.getElementById('employee-list');
            if (!employeeList) return;
            
            let html = '';
            this.data.employees.forEach(employee => {
              html += \`
                <div class="card">
                  <div class="card-header">
                    <h3 class="card-title">\${employee.name}</h3>
                  </div>
                  <div class="card-body">
                    <p><strong>Email:</strong> \${employee.email || 'Non défini'}</p>
                    <p><strong>Fonction:</strong> \${employee.position || 'Non défini'}</p>
                    <p><strong>Département:</strong> \${employee.department || 'Non défini'}</p>
                    <button class="btn btn-primary" onclick="app.showEmployeeDetails('\${employee.id}')">Voir détails</button>
                  </div>
                </div>
              \`;
            });
            
            employeeList.innerHTML = html;
          }
          
          renderStatistics() {
            if (!this.data || !this.data.employees) return;
            
            const statsContainer = document.getElementById('statistics-container');
            if (!statsContainer) return;
            
            let totalEmployees = this.data.employees.length;
            let departmentCount = {};
            
            // Calculer les statistiques
            this.data.employees.forEach(employee => {
              // Compter par département
              if (employee.department) {
                departmentCount[employee.department] = (departmentCount[employee.department] || 0) + 1;
              } else {
                departmentCount['Non défini'] = (departmentCount['Non défini'] || 0) + 1;
              }
            });
            
            // Générer HTML pour les stats par département
            let departmentHtml = '<h4>Répartition par département</h4><ul>';
            for (let dept in departmentCount) {
              departmentHtml += \`<li>\${dept}: \${departmentCount[dept]} employés</li>\`;
            }
            departmentHtml += '</ul>';
            
            statsContainer.innerHTML = \`
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Statistiques</h3>
                </div>
                <div class="card-body">
                  <p><strong>Nombre total d'employés:</strong> \${totalEmployees}</p>
                  \${departmentHtml}
                </div>
              </div>
            \`;
          }
          
          renderCalendar() {
            if (!this.data || !this.data.employees.length === 0) return;
            
            const calendarContainer = document.getElementById('calendar-container');
            if (!calendarContainer) return;
            
            const year = this.data.year;
            const month = this.data.month;
            
            // Calculer le nombre de jours dans le mois
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            // Générer l'en-tête du tableau
            let tableHtml = \`
              <table class="table">
                <thead>
                  <tr>
                    <th>Employé</th>
            \`;
            
            // Ajouter les colonnes pour chaque jour
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, month, day);
              const dayOfWeek = date.toLocaleDateString('fr-FR', { weekday: 'short' });
              tableHtml += \`<th>\${day}<br>\${dayOfWeek}</th>\`;
            }
            
            tableHtml += \`
                  </tr>
                </thead>
                <tbody>
            \`;
            
            // Ajouter une ligne pour chaque employé
            this.data.employees.forEach(employee => {
              tableHtml += \`<tr><td>\${employee.name}</td>\`;
              
              // Ajouter les cellules pour chaque jour
              for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
                let cellContent = '';
                
                if (employee.schedule) {
                  // Trouver les statuts pour AM et PM
                  const amStatus = employee.schedule.find(
                    s => s.date === dateStr && (s.period === 'AM' || s.period === 'FULL')
                  );
                  
                  const pmStatus = employee.schedule.find(
                    s => s.date === dateStr && (s.period === 'PM' || s.period === 'FULL')
                  );
                  
                  if (amStatus && amStatus.status) {
                    cellContent += \`<span class="badge badge-\${this.getStatusClass(amStatus.status)}" title="Matin">\${this.getStatusShort(amStatus.status)}</span>\`;
                  }
                  
                  if (pmStatus && pmStatus.status) {
                    if (cellContent) cellContent += '<br>';
                    cellContent += \`<span class="badge badge-\${this.getStatusClass(pmStatus.status)}" title="Après-midi">\${this.getStatusShort(pmStatus.status)}</span>\`;
                  }
                }
                
                if (!cellContent) cellContent = '-';
                
                tableHtml += \`<td>\${cellContent}</td>\`;
              }
              
              tableHtml += '</tr>';
            });
            
            tableHtml += \`
                </tbody>
              </table>
            \`;
            
            calendarContainer.innerHTML = \`
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Calendrier</h3>
                </div>
                <div class="card-body" style="overflow-x: auto;">
                  \${tableHtml}
                </div>
              </div>
            \`;
          }
          
          getStatusClass(status) {
            switch(status) {
              case 'conges': return 'success';
              case 'formation': return 'info';
              case 'assistance': return 'primary';
              case 'absence': return 'danger';
              case 'permanence': return 'warning';
              case 'vigi': return 'danger';
              case 'projet': return 'success';
              case 'management': return 'info';
              case 'tp': return 'secondary';
              case 'coordinateur': return 'primary';
              case 'regisseur': return 'warning';
              case 'demenagement': return 'info';
              default: return 'secondary';
            }
          }
          
          getStatusShort(status) {
            switch(status) {
              case 'conges': return 'C';
              case 'formation': return 'F';
              case 'assistance': return 'A';
              case 'absence': return 'ABS';
              case 'permanence': return 'P';
              case 'vigi': return 'V';
              case 'projet': return 'PR';
              case 'management': return 'M';
              case 'tp': return 'TP';
              case 'coordinateur': return 'CO';
              case 'regisseur': return 'R';
              case 'demenagement': return 'D';
              default: return '?';
            }
          }
          
          showEmployeeDetails(employeeId) {
            const employee = this.data.employees.find(emp => emp.id === employeeId);
            if (!employee) return;
            
            const detailsContainer = document.getElementById('employee-details');
            if (!detailsContainer) return;
            
            // Calculer les statistiques de l'employé
            const stats = this.calculateEmployeeStats(employee);
            
            let scheduleHtml = '<h4>Planning du mois</h4>';
            scheduleHtml += '<table class="table"><thead><tr><th>Jour</th><th>Matin</th><th>Après-midi</th></tr></thead><tbody>';
            
            // Nombre de jours dans le mois
            const daysInMonth = new Date(this.data.year, this.data.month + 1, 0).getDate();
            
            for (let day = 1; day <= daysInMonth; day++) {
              const dateStr = \`\${this.data.year}-\${String(this.data.month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
              
              // Trouver les statuts pour AM et PM
              const amStatus = employee.schedule.find(
                s => s.date === dateStr && (s.period === 'AM' || s.period === 'FULL')
              );
              
              const pmStatus = employee.schedule.find(
                s => s.date === dateStr && (s.period === 'PM' || s.period === 'FULL')
              );
              
              let morningStatus = '-';
              let afternoonStatus = '-';
              
              if (amStatus && amStatus.status) {
                morningStatus = \`<span class="badge badge-\${this.getStatusClass(amStatus.status)}">\${amStatus.status}</span>\`;
              }
              
              if (pmStatus && pmStatus.status) {
                afternoonStatus = \`<span class="badge badge-\${this.getStatusClass(pmStatus.status)}">\${pmStatus.status}</span>\`;
              }
              
              scheduleHtml += \`<tr><td>\${day}</td><td>\${morningStatus}</td><td>\${afternoonStatus}</td></tr>\`;
            }
            
            scheduleHtml += '</tbody></table>';
            
            detailsContainer.innerHTML = \`
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Détails de \${employee.name}</h3>
                </div>
                <div class="card-body">
                  <p><strong>Email:</strong> \${employee.email || 'Non défini'}</p>
                  <p><strong>Fonction:</strong> \${employee.position || 'Non défini'}</p>
                  <p><strong>Département:</strong> \${employee.department || 'Non défini'}</p>
                  
                  <h4>Statistiques</h4>
                  <ul>
                    <li>Jours de présence: \${stats.presentDays.toFixed(1)}</li>
                    <li>Jours de congés: \${stats.congesDays.toFixed(1)}</li>
                    <li>Jours de formation: \${stats.formationDays.toFixed(1)}</li>
                    <li>Jours d'assistance: \${stats.assistanceDays.toFixed(1)}</li>
                    <li>Jours d'absence: \${stats.absenceDays.toFixed(1)}</li>
                  </ul>
                  
                  \${scheduleHtml}
                  
                  <button class="btn btn-secondary mt-3" onclick="app.hideEmployeeDetails()">Fermer</button>
                </div>
              </div>
            \`;
            
            detailsContainer.style.display = 'block';
            window.scrollTo(0, detailsContainer.offsetTop);
          }
          
          hideEmployeeDetails() {
            const detailsContainer = document.getElementById('employee-details');
            if (detailsContainer) {
              detailsContainer.style.display = 'none';
            }
          }
          
          calculateEmployeeStats(employee) {
            const stats = {
              presentDays: 0,
              congesDays: 0,
              formationDays: 0,
              assistanceDays: 0,
              absenceDays: 0,
              vigiDays: 0,
              projetDays: 0,
              managementDays: 0,
              tpDays: 0,
              coordinateurDays: 0,
              regisseurDays: 0,
              demenagementDays: 0,
              permanenceDays: 0
            };
            
            if (!employee.schedule) return stats;
            
            // Parcourir tous les jours du planning
            employee.schedule.forEach(day => {
              const multiplier = day.period === 'FULL' ? 1 : 0.5;
              
              switch(day.status) {
                case 'conges': 
                  stats.congesDays += multiplier; 
                  break;
                case 'formation': 
                  stats.formationDays += multiplier; 
                  stats.presentDays += multiplier; 
                  break;
                case 'assistance': 
                  stats.assistanceDays += multiplier; 
                  stats.presentDays += multiplier; 
                  break;
                case 'absence': 
                  stats.absenceDays += multiplier; 
                  break;
                case 'permanence': 
                  stats.permanenceDays += multiplier; 
                  stats.presentDays += multiplier; 
                  break;
                case 'vigi':
                  stats.vigiDays += multiplier;
                  stats.presentDays += multiplier;
                  break;
                case 'projet':
                  stats.projetDays += multiplier;
                  stats.presentDays += multiplier;
                  break;
                case 'management':
                  stats.managementDays += multiplier;
                  stats.presentDays += multiplier;
                  break;
                case 'tp':
                  stats.tpDays += multiplier;
                  break;
                case 'coordinateur':
                  stats.coordinateurDays += multiplier;
                  stats.presentDays += multiplier;
                  break;
                case 'regisseur':
                  stats.regisseurDays += multiplier;
                  stats.presentDays += multiplier;
                  break;
                case 'demenagement':
                  stats.demenagementDays += multiplier;
                  stats.presentDays += multiplier;
                  break;
                default: break;
              }
            });
            
            return stats;
          }
          
          setupEventListeners() {
            // Bouton de téléchargement JSON
            const downloadBtn = document.getElementById('download-json-btn');
            if (downloadBtn) {
              downloadBtn.addEventListener('click', this.downloadJsonData.bind(this));
            }
            
            // Filtres de départements
            const deptFilter = document.getElementById('dept-filter');
            if (deptFilter) {
              deptFilter.addEventListener('change', this.filterByDepartment.bind(this));
            }
          }
          
          downloadJsonData() {
            if (!this.data) return;
            
            const dataStr = JSON.stringify(this.data, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            
            const a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', 'planningData.json');
            a.click();
          }
          
          filterByDepartment(event) {
            const department = event.target.value;
            const filteredData = JSON.parse(JSON.stringify(this.data));
            
            if (department !== 'all') {
              filteredData.employees = filteredData.employees.filter(emp => emp.department === department);
            }
            
            // Sauvegarder les données d'origine
            const originalData = this.data;
            
            // Temporairement remplacer les données pour le rendu
            this.data = filteredData;
            
            // Mettre à jour l'affichage
            this.renderEmployeeList();
            this.renderCalendar();
            
            // Restaurer les données d'origine
            this.data = originalData;
          }
        }
        
        // Initialiser l'application au chargement de la page
        let app;
        document.addEventListener('DOMContentLoaded', function() {
          app = new PlanningApp();
        });
      `);
    }
    
    // Ajouter un fichier HTML principal avec une interface plus complète
    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planning Application - Export Local</title>
  <link rel="stylesheet" href="./css/style.css">
</head>
<body>
  <header class="header">
    <div class="container">
      <h1>Planning Application - Export Local</h1>
      <p>Données exportées pour le mois de <span id="period-info">...</span></p>
    </div>
  </header>

  <div class="container">
    <div id="error-container"></div>
    
    <div class="card mb-3">
      <div class="card-header">
        <h2 class="card-title">Actions</h2>
      </div>
      <div class="card-body">
        <button id="download-json-btn" class="btn btn-primary">Télécharger les données (JSON)</button>
        
        <div class="mt-3">
          <label for="dept-filter">Filtrer par département:</label>
          <select id="dept-filter">
            <option value="all">Tous les départements</option>
            <option value="REC">REC</option>
            <option value="78">78</option>
            <option value="91">91</option>
            <option value="92">92</option>
            <option value="95">95</option>
          </select>
        </div>
      </div>
    </div>
    
    <div id="statistics-container"></div>
    
    <div id="calendar-container"></div>
    
    <h2 class="text-center mb-3">Liste des employés</h2>
    <div id="employee-list" class="grid"></div>
    
    <div id="employee-details" style="display: none;"></div>
  </div>
  
  <footer class="footer">
    <div class="container">
      <p>Planning Application - Export Local &copy; 2024</p>
    </div>
  </footer>

  <script src="./js/app.js"></script>
</body>
</html>`;
    
    zip.file('index.html', htmlContent);
    
    // Générer le fichier README avec les instructions
    const readmeContent = `# Planning Application

## Utilisation locale

Cette application a été exportée pour une utilisation locale. Voici comment l'utiliser:

1. Décompressez tous les fichiers dans un dossier en conservant la structure des dossiers.
2. Ouvrez le fichier index.html dans un navigateur moderne (Chrome, Firefox, Edge, etc.).
3. Vous pourrez visualiser et interagir avec votre planning directement dans le navigateur.
4. Pour une utilisation complète, réimportez ces données dans l'application principale si nécessaire.

## Structure des fichiers

- index.html - Page principale de l'application
- /css - Contient les styles de l'application
- /js - Contient les scripts JavaScript de l'application
- /data - Contient les données de votre planning au format JSON

## Fonctionnalités disponibles

- Visualisation du planning mensuel
- Liste des employés avec détails
- Statistiques de présence et d'absence
- Filtrage par département
- Téléchargement des données au format JSON

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
