
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
      .print-chart .recharts-wrapper,
      .recharts-responsive-container,
      .recharts-surface {
        display: block !important;
        visibility: visible !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
        page-break-inside: avoid !important;
      }
      
      /* Assurer que les SVG s'affichent bien */
      svg {
        display: block !important;
        visibility: visible !important;
        page-break-inside: avoid !important;
      }
    }
  `);
};
