
import { Project } from '@/types';

/**
 * Get existing projects from localStorage
 */
export function getExistingProjects(): Project[] {
  try {
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.projects && Array.isArray(data.projects)) {
        return data.projects;
      }
    }
  } catch (e) {
    console.warn('Error getting existing projects:', e);
  }
  
  // Default projects if none found
  return [
    { id: '1', code: 'P001', name: 'Développement interne', color: '#4CAF50' },
    { id: '2', code: 'P002', name: 'Client A', color: '#2196F3' },
    { id: '3', code: 'P003', name: 'Client B', color: '#FF9800' },
    { id: '4', code: 'P004', name: 'Maintenance préventive', color: '#9C27B0' },
    { id: '5', code: 'P005', name: 'Mission externe', color: '#00BCD4' },
  ];
}
