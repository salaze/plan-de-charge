
import { addGlobalStyle } from '@/lib/utils';

/**
 * Ajoute des styles CSS spécifiques à l'impression lors de l'initialisation
 */
export const initPrintStyles = () => {
  // Styles pour l'impression
  addGlobalStyle(`
    @media print {
      body {
        background-color: white !important;
        color: black !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      /* Cache les éléments qui ne devraient pas être imprimés */
      header, nav, button, .glass-panel, .sidebar, .no-print {
        display: none !important;
      }

      /* Style pour les éléments à imprimer */
      .print-view {
        display: block !important;
        width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      /* Forcer un saut de page */
      .page-break-before {
        page-break-before: always;
      }

      /* Styles spécifiques pour les graphiques */
      .print-chart {
        display: block !important;
        visibility: visible !important;
        width: 100% !important;
        overflow: visible !important;
        page-break-inside: avoid !important;
      }
      
      /* Assurer que les SVG s'affichent bien */
      svg {
        display: block !important;
        visibility: visible !important;
        page-break-inside: avoid !important;
        width: 100% !important;
        height: auto !important;
        max-height: 500px !important;
      }

      /* Styles pour recharts */
      .recharts-wrapper,
      .recharts-surface,
      .recharts-legend-wrapper,
      .recharts-tooltip-wrapper {
        display: block !important;
        visibility: visible !important;
        overflow: visible !important;
      }

      /* Tous les éléments graphiques doivent avoir une couleur visible */
      .recharts-sector,
      .recharts-bar-rectangle,
      .recharts-cartesian-grid-horizontal line,
      .recharts-cartesian-grid-vertical line {
        stroke-opacity: 1 !important;
        fill-opacity: 1 !important;
      }

      /* S'assurer que le texte est visible */
      .recharts-legend-item-text,
      .recharts-cartesian-axis-tick-value {
        fill: #000 !important;
        font-weight: 500 !important;
      }
      
      /* Fix pour les camemberts */
      .recharts-pie-sector {
        visibility: visible !important;
      }
    }
  `);
};

/**
 * Prépare le document pour l'impression PDF
 */
export const printToPDF = async (content: HTMLElement | null): Promise<void> => {
  if (!content) return;
  
  // Ajouter une classe temporaire pour l'impression
  document.body.classList.add('printing-pdf');
  
  // Laisser le temps au navigateur de traiter les styles
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Lancer l'impression
  window.print();
  
  // Nettoyer après l'impression
  document.body.classList.remove('printing-pdf');
};

