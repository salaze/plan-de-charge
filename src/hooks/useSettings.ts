
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createSampleData } from '@/utils';

export function useSettings() {
  const [showWeekends, setShowWeekends] = useState<boolean>(() => {
    // Récupérer la valeur depuis localStorage ou utiliser true par défaut
    const saved = localStorage.getItem('showWeekends');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [autoSave, setAutoSave] = useState<boolean>(() => {
    // Récupérer la valeur depuis localStorage ou utiliser true par défaut
    const saved = localStorage.getItem('autoSave');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Sauvegarder les paramètres lors des changements
  useEffect(() => {
    localStorage.setItem('showWeekends', JSON.stringify(showWeekends));
    toast.success('Paramètre "Afficher les weekends" mis à jour');
  }, [showWeekends]);
  
  useEffect(() => {
    localStorage.setItem('autoSave', JSON.stringify(autoSave));
    toast.success('Paramètre "Sauvegarde automatique" mis à jour');
  }, [autoSave]);
  
  const resetData = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
      const sampleData = createSampleData();
      localStorage.setItem('planningData', JSON.stringify(sampleData));
      toast.success('Données réinitialisées avec succès');
    }
  };
  
  const clearData = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.')) {
      const emptyData = {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        employees: [],
        projects: [
          { id: '1', code: 'P001', name: 'Développement interne', color: '#4CAF50' },
          { id: '2', code: 'P002', name: 'Client A', color: '#2196F3' },
          { id: '3', code: 'P003', name: 'Client B', color: '#FF9800' },
          { id: '4', code: 'P004', name: 'Maintenance préventive', color: '#9C27B0' },
          { id: '5', code: 'P005', name: 'Mission externe', color: '#00BCD4' },
        ]
      };
      localStorage.setItem('planningData', JSON.stringify(emptyData));
      toast.success('Données supprimées avec succès');
    }
  };

  return {
    showWeekends,
    setShowWeekends,
    autoSave, 
    setAutoSave,
    resetData,
    clearData
  };
}
