
import { useEffect, useState } from 'react';
import { usePreciseRealtimeSubscription } from './usePreciseRealtimeSubscription';
import { useOptimizedCache } from './useOptimizedCache';
import { usePlanningPerformanceMonitor } from './usePlanningPerformanceMonitor';
import { toast } from 'sonner';

export const useSuperOptimizedPlanning = () => {
  const [isOptimized, setIsOptimized] = useState(false);
  
  // Utiliser les hooks d'optimisation
  const { metrics, isMonitoring } = usePlanningPerformanceMonitor(true);
  
  // Activer la mise en cache optimisée pour les données du planning
  useOptimizedCache({
    keys: [['schedules'], ['employees'], ['statuses']],
    strategy: 'balanced',
    maxEntries: 200,
    gcIntervalMinutes: 15
  });
  
  // Abonnements temps réel de haute précision
  const scheduleUpdates = usePreciseRealtimeSubscription('employe_schedule', '*', {
    precision: 'high',
    bufferTime: 25, // 25ms pour une réactivité optimale
    showNotifications: true
  });
  
  const employeeUpdates = usePreciseRealtimeSubscription('employes', '*', {
    precision: 'normal',
    bufferTime: 100,
    showNotifications: true
  });
  
  const statusUpdates = usePreciseRealtimeSubscription('statuts', '*', {
    precision: 'high',
    bufferTime: 50,
    showNotifications: true
  });
  
  // Effet pour vérifier l'état des optimisations
  useEffect(() => {
    if (scheduleUpdates.isActive && employeeUpdates.isActive && statusUpdates.isActive) {
      console.log('🚀 Super optimized planning mode activated!');
      
      if (!isOptimized) {
        setIsOptimized(true);
        toast.success('Optimisations avancées activées');
      }
    } else {
      if (isOptimized) {
        setIsOptimized(false);
        console.warn('⚠️ Super optimized planning mode deactivated');
      }
    }
  }, [scheduleUpdates.isActive, employeeUpdates.isActive, statusUpdates.isActive, isOptimized]);
  
  // Effet pour surveiller les performances et ajuster les optimisations si nécessaire
  useEffect(() => {
    if (!isMonitoring) return;
    
    // Détection des problèmes de performances et ajustements automatiques
    if (metrics.avgFps < 30 && metrics.avgFps > 0) {
      console.warn('⚠️ Performance issues detected, applying additional optimizations');
      
      // Force la stratégie de cache aggressive pour améliorer les performances
      useOptimizedCache({
        keys: [['schedules'], ['employees'], ['statuses']],
        strategy: 'aggressive',
        maxEntries: 100,
        gcIntervalMinutes: 5
      });
    }
  }, [metrics, isMonitoring]);
  
  return {
    isOptimized,
    realtime: {
      schedule: scheduleUpdates,
      employees: employeeUpdates,
      statuses: statusUpdates
    },
    performance: metrics
  };
};
