
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
      .print-chart .recharts-wrapper {
        margin: 0 auto;
      }
    }
  `);
};
