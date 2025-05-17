
import { supabase } from "@/integrations/supabase/client";
import { StatusCode, STATUS_COLORS } from '@/types';

// Fonction pour générer une image SVG de couleur unie pour un statut
function generateColorSVG(status: StatusCode): string {
  // Extraire la couleur Tailwind du statut
  const colorClass = STATUS_COLORS[status]?.split(' ')[0] || 'bg-gray-300';
  
  // Mapper les classes Tailwind aux couleurs SVG
  const colorMap: Record<string, string> = {
    'bg-yellow-300': '#fde047', // yellow-300
    'bg-red-500': '#ef4444',    // red-500
    'bg-blue-500': '#3b82f6',   // blue-500
    'bg-green-500': '#22c55e',  // green-500
    'bg-amber-800': '#92400e',  // amber-800
    'bg-purple-500': '#a855f7', // purple-500
    'bg-gray-400': '#9ca3af',   // gray-400
    'bg-green-600': '#16a34a',  // green-600
    'bg-pink-300': '#f9a8d4',   // pink-300
    'bg-blue-300': '#93c5fd',   // blue-300
    'bg-indigo-500': '#6366f1', // indigo-500
    'bg-pink-600': '#db2777',   // pink-600
    'bg-teal-500': '#14b8a6',   // teal-500
    'bg-gray-300': '#d1d5db',   // fallback color
  };
  
  const color = colorMap[colorClass] || '#d1d5db';
  
  // Générer un SVG circulaire avec la couleur
  return `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="${color}" stroke="#000000" stroke-width="2" />
    <text x="50" y="55" font-family="Arial" font-size="14" text-anchor="middle" fill="white">${status}</text>
  </svg>`;
}

// Fonction pour convertir un SVG en blob
async function svgToBlob(svg: string): Promise<Blob> {
  return new Blob([svg], { type: 'image/svg+xml' });
}

// Fonction pour télécharger toutes les icônes de statut par défaut
export async function uploadDefaultStatusIcons(statuses: StatusCode[] = []) {
  try {
    console.log('Starting upload of default status icons...');
    
    // Si aucun statut n'est fourni, utiliser les statuts par défaut
    const statusesToUpload = statuses.length > 0 
      ? statuses 
      : ['assistance', 'vigi', 'formation', 'projet', 'conges', 'management', 
         'tp', 'coordinateur', 'absence', 'regisseur', 'demenagement', 'permanence', 'parc'] as StatusCode[];
    
    // Télécharger chaque icône
    for (const status of statusesToUpload) {
      if (!status || status === '' as StatusCode) continue;
      
      const svg = generateColorSVG(status);
      const blob = await svgToBlob(svg);
      
      const { data, error } = await supabase.storage
        .from('status-icons')
        .upload(`${status}.svg`, blob, {
          contentType: 'image/svg+xml',
          upsert: true
        });
      
      if (error) {
        console.error(`Error uploading icon for ${status}:`, error);
      } else {
        console.log(`Successfully uploaded icon for ${status}:`, data);
      }
    }
    
    console.log('Finished uploading default status icons');
    return true;
  } catch (error) {
    console.error('Error uploading default status icons:', error);
    return false;
  }
}
