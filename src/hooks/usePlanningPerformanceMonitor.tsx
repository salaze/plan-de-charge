
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number | null;
  fpsMeasurements: number[];
  avgFps: number;
}

export const usePlanningPerformanceMonitor = (enabled: boolean = true) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: null,
    fpsMeasurements: [],
    avgFps: 0
  });
  
  const [isMonitoring, setIsMonitoring] = useState(enabled);
  
  // Références pour le suivi des performances
  const startLoadTimeRef = useRef(performance.now());
  const lastFrameTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const fpsIntervalRef = useRef<number | null>(null);
  const interactionStartRef = useRef<number | null>(null);
  const totalInteractionTimeRef = useRef(0);
  
  // Mesurer le FPS
  useEffect(() => {
    if (!isMonitoring) return;
    
    const measureFps = () => {
      const now = performance.now();
      const elapsed = now - lastFrameTimeRef.current;
      
      if (elapsed >= 1000) { // Mesure toutes les secondes
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);
        
        setMetrics(prev => {
          const newMeasurements = [...prev.fpsMeasurements, fps].slice(-30); // Garder 30 dernières mesures
          const avgFps = newMeasurements.reduce((sum, val) => sum + val, 0) / newMeasurements.length;
          
          return {
            ...prev,
            fpsMeasurements: newMeasurements,
            avgFps: Math.round(avgFps)
          };
        });
        
        frameCountRef.current = 0;
        lastFrameTimeRef.current = now;
      }
    };
    
    // Compter les frames
    const countFrame = () => {
      frameCountRef.current++;
      requestAnimationFrame(countFrame);
    };
    
    // Démarrer le comptage de frames
    const frameId = requestAnimationFrame(countFrame);
    
    // Mesurer le FPS périodiquement
    fpsIntervalRef.current = window.setInterval(measureFps, 1000);
    
    return () => {
      cancelAnimationFrame(frameId);
      if (fpsIntervalRef.current !== null) {
        clearInterval(fpsIntervalRef.current);
        fpsIntervalRef.current = null;
      }
    };
  }, [isMonitoring]);
  
  // Mesurer le temps de chargement et l'usage mémoire
  useEffect(() => {
    if (!isMonitoring) return;
    
    // Mesurer le temps de chargement initial
    const loadCompleteHandler = () => {
      const loadTime = performance.now() - startLoadTimeRef.current;
      
      setMetrics(prev => ({
        ...prev,
        loadTime
      }));
      
      // Afficher le temps de chargement si particulièrement lent
      if (loadTime > 2000) {
        console.warn(`Planning load time: ${Math.round(loadTime)}ms - Consider optimizing`);
      }
    };
    
    // Mesurer l'usage mémoire si disponible
    const measureMemory = async () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / (1024 * 1024))
        }));
      } else if ('measureUserAgentSpecificMemory' in performance) {
        try {
          const memory = await (performance as any).measureUserAgentSpecificMemory();
          const totalBytes = memory.bytes;
          
          setMetrics(prev => ({
            ...prev,
            memoryUsage: Math.round(totalBytes / (1024 * 1024))
          }));
        } catch (e) {
          console.error('Error measuring memory:', e);
        }
      }
    };
    
    // Mesurer le temps de rendu
    const renderObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({
            ...prev,
            renderTime: entry.startTime
          }));
          renderObserver.disconnect();
        }
      }
    });
    
    // Observer les interactions utilisateur
    const interactionObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'first-input') {
          const firstInputEntry = entry as PerformanceEventTiming;
          setMetrics(prev => ({
            ...prev,
            interactionTime: firstInputEntry.processingStart - firstInputEntry.startTime
          }));
          interactionObserver.disconnect();
        }
      }
    });
    
    // Événements pour suivre les interactions utilisateur
    const trackInteractionStart = () => {
      if (interactionStartRef.current === null) {
        interactionStartRef.current = performance.now();
      }
    };
    
    const trackInteractionEnd = () => {
      if (interactionStartRef.current !== null) {
        const duration = performance.now() - interactionStartRef.current;
        totalInteractionTimeRef.current += duration;
        interactionStartRef.current = null;
        
        // Afficher un avertissement pour les interactions très lentes
        if (duration > 100) {
          console.warn(`Slow interaction detected: ${Math.round(duration)}ms`);
        }
      }
    };
    
    // Démarrer les observations
    try {
      renderObserver.observe({ entryTypes: ['paint'] });
      interactionObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.error('Performance observer not supported:', e);
    }
    
    // Mesurer la mémoire périodiquement
    const memoryInterval = setInterval(measureMemory, 10000);
    
    // Ajouter les écouteurs d'événements pour les interactions
    document.addEventListener('mousedown', trackInteractionStart);
    document.addEventListener('keydown', trackInteractionStart);
    document.addEventListener('touchstart', trackInteractionStart);
    document.addEventListener('mouseup', trackInteractionEnd);
    document.addEventListener('keyup', trackInteractionEnd);
    document.addEventListener('touchend', trackInteractionEnd);
    
    // Mesurer à la fin du chargement
    window.addEventListener('load', loadCompleteHandler);
    
    // Si window.load est déjà passé
    if (document.readyState === 'complete') {
      loadCompleteHandler();
    }
    
    // Nettoyer les écouteurs d'événements
    return () => {
      renderObserver.disconnect();
      interactionObserver.disconnect();
      clearInterval(memoryInterval);
      
      document.removeEventListener('mousedown', trackInteractionStart);
      document.removeEventListener('keydown', trackInteractionStart);
      document.removeEventListener('touchstart', trackInteractionStart);
      document.removeEventListener('mouseup', trackInteractionEnd);
      document.removeEventListener('keyup', trackInteractionEnd);
      document.removeEventListener('touchend', trackInteractionEnd);
      
      window.removeEventListener('load', loadCompleteHandler);
    };
  }, [isMonitoring]);
  
  // Alerte automatique sur les problèmes de performances
  useEffect(() => {
    if (!isMonitoring) return;
    
    // Vérifier les performances toutes les 30 secondes
    const checkInterval = setInterval(() => {
      // Si FPS trop bas
      if (metrics.avgFps > 0 && metrics.avgFps < 30) {
        console.warn(`⚠️ Low FPS detected: ${metrics.avgFps}`);
        toast.warning(`Performance dégradée (${metrics.avgFps} FPS)`);
      }
      
      // Si utilisation mémoire élevée
      if (metrics.memoryUsage && metrics.memoryUsage > 200) { // Plus de 200 MB
        console.warn(`⚠️ High memory usage: ${metrics.memoryUsage} MB`);
        toast.warning(`Usage mémoire élevé: ${metrics.memoryUsage} MB`);
      }
    }, 30000);
    
    return () => clearInterval(checkInterval);
  }, [isMonitoring, metrics]);
  
  return {
    metrics,
    isMonitoring,
    startMonitoring: () => setIsMonitoring(true),
    stopMonitoring: () => setIsMonitoring(false),
    resetMetrics: () => {
      startLoadTimeRef.current = performance.now();
      setMetrics({
        loadTime: 0,
        renderTime: 0,
        interactionTime: 0,
        memoryUsage: null,
        fpsMeasurements: [],
        avgFps: 0
      });
    }
  };
};
