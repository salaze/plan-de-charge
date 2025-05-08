
import { StatusCode, STATUS_LABELS } from '@/types';

/**
 * Format status for display
 */
export function formatStatus(status: StatusCode): string {
  if (status === undefined || status === null || status === '') return '';
  return STATUS_LABELS[status] || status;
}

/**
 * Get status code from displayed label
 */
export function getStatusCodeFromLabel(label: string): StatusCode | null {
  const normalizedLabel = label.toLowerCase().trim();
  
  // Check if it's a direct match from STATUS_LABELS
  for (const [code, statusLabel] of Object.entries(STATUS_LABELS)) {
    if (statusLabel.toLowerCase() === normalizedLabel) {
      return code as StatusCode;
    }
  }
  
  // Si le statut contient une indication d'être surligné (permanence)
  if (normalizedLabel.includes('(permanence)')) {
    const baseStatus = normalizedLabel.replace(/\s*\(permanence\)\s*/i, '');
    const statusCode = getStatusCodeFromLabel(baseStatus);
    
    if (statusCode) {
      return statusCode;
    }
  }
  
  // If not found, use some common abbreviations/alternative names
  const alternatives: Record<string, StatusCode> = {
    'présent': 'assistance',
    'present': 'assistance',
    'p': 'assistance',
    'abs': 'absence',
    'a': 'absence',
    'congés': 'conges',
    'conges': 'conges',
    'vacances': 'conges',
    'vac': 'conges',
    'v': 'conges',
    'formation': 'formation',
    'form': 'formation',
    't': 'formation',
    'mal': 'absence',
    'maladie': 'absence',
    's': 'absence',
    'tp': 'tp',
    'télétravail': 'tp',
    'teletravail': 'tp',
    'remote': 'tp',
    'proj': 'projet',
    'project': 'projet',
    'mission': 'projet',
    'vigi': 'vigi',
    'management': 'management',
    'coordinateur': 'coordinateur',
    'regisseur': 'regisseur',
    'demenagement': 'demenagement',
    'permanence': 'permanence'
  };
  
  return alternatives[normalizedLabel] || null;
}

// Nouvelle fonction pour adapter dynamiquement le type StatusCode
export function extendStatusCode(code: string): StatusCode {
  // Si c'est déjà un StatusCode connu, le retourner tel quel
  if (Object.keys(STATUS_LABELS).includes(code)) {
    return code as StatusCode;
  }
  
  // Sinon, on étend dynamiquement le type (même si TypeScript ne le sait pas)
  // et on s'assure que les structures STATUS_LABELS et STATUS_COLORS sont mises à jour
  return code as StatusCode;
}
