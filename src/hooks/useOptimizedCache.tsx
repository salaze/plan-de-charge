
import { useEffect, useRef, useCallback } from 'react';
import { queryClient } from '@/contexts/QueryContext';
import { QueryKey } from '@tanstack/react-query';

// Type de stratégie de cache
type CacheStrategy = 'aggressive' | 'balanced' | 'conservative';

interface OptimizedCacheOptions {
  keys: string[] | string[][] | RegExp;
  strategy?: CacheStrategy;
  maxEntries?: number;
  gcIntervalMinutes?: number;
}

/**
 * Hook pour optimiser la gestion du cache React Query
 */
export const useOptimizedCache = ({
  keys,
  strategy = 'balanced',
  maxEntries = 100,
  gcIntervalMinutes = 10
}: OptimizedCacheOptions) => {
  const gcIntervalRef = useRef<number | null>(null);
  
  // Configurations basées sur la stratégie
  const strategies = {
    // Cache très agressif, maximise les performances au détriment de la fraîcheur des données
    aggressive: {
      staleTimeMinutes: 60, // 1 heure
      gcTimeMinutes: 120, // 2 heures
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retriesEnabled: false
    },
    // Équilibre entre performances et fraîcheur
    balanced: {
      staleTimeMinutes: 15, // 15 minutes
      gcTimeMinutes: 30, // 30 minutes
      refetchOnMount: 'always' as const,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retriesEnabled: true
    },
    // Priorité à la fraîcheur des données
    conservative: {
      staleTimeMinutes: 5, // 5 minutes
      gcTimeMinutes: 15, // 15 minutes
      refetchOnMount: 'always' as const,
      refetchOnWindowFocus: 'always' as const,
      refetchOnReconnect: 'always' as const,
      retriesEnabled: true
    }
  };
  
  const config = strategies[strategy];
  
  // Fonction pour supprimer les entrées les plus anciennes si on dépasse maxEntries
  const pruneCache = useCallback(() => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    console.log(`Cache pruning: ${queries.length}/${maxEntries} entries`);
    
    // Si nous avons plus d'entrées que le maximum autorisé, supprimer les plus anciennes
    if (queries.length > maxEntries) {
      const queriesToRemove = queries
        .sort((a, b) => (a.state.dataUpdatedAt || 0) - (b.state.dataUpdatedAt || 0))
        .slice(0, queries.length - maxEntries);
      
      queriesToRemove.forEach(query => {
        // Fix: Use the query's entire object to remove it, not just the queryKey
        queryCache.remove(query);
      });
      
      console.log(`Removed ${queriesToRemove.length} oldest cache entries`);
    }
  }, [maxEntries]);
  
  // Fonction pour mettre à jour les paramètres de cache pour les requêtes spécifiées
  const optimizeQueries = useCallback(() => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    // Fonction pour vérifier si une requête correspond aux clés spécifiées
    const matchesKey = (queryKey: QueryKey): boolean => {
      // Si nous avons un tableau de chaînes ou de tableaux
      if (Array.isArray(keys)) {
        if (Array.isArray(keys[0])) {
          // C'est un tableau de tableaux de clés
          return (keys as string[][]).some(keyPattern => 
            keyPattern.length === queryKey.length &&
            keyPattern.every((k, i) => k === queryKey[i])
          );
        } else {
          // C'est un tableau de chaînes
          return (keys as string[]).every(k => queryKey.includes(k as string));
        }
      }
      // Si c'est une expression régulière
      else if (keys instanceof RegExp) {
        return keys.test(queryKey.join(','));
      }
      
      return false;
    };
    
    // Mettre à jour les paramètres pour les requêtes correspondantes
    const matchingQueries = queries.filter(q => matchesKey(q.queryKey));
    
    console.log(`Optimizing ${matchingQueries.length} matching queries with ${strategy} strategy`);
    
    matchingQueries.forEach(query => {
      // Mettre à jour les paramètres de la requête
      queryClient.setQueryDefaults(query.queryKey, {
        staleTime: config.staleTimeMinutes * 60 * 1000,
        gcTime: config.gcTimeMinutes * 60 * 1000,
        refetchOnMount: config.refetchOnMount,
        refetchOnWindowFocus: config.refetchOnWindowFocus,
        refetchOnReconnect: config.refetchOnReconnect,
        retry: config.retriesEnabled ? 3 : false
      });
    });
    
    return matchingQueries.length;
  }, [keys, strategy, config]);
  
  // Configurer et démarer le garbage collector
  useEffect(() => {
    // Optimiser les requêtes immédiatement
    optimizeQueries();
    
    // Configurer le garbage collector périodique
    gcIntervalRef.current = window.setInterval(() => {
      console.log(`Running scheduled cache optimization (${strategy} strategy)`);
      pruneCache();
      optimizeQueries();
    }, gcIntervalMinutes * 60 * 1000);
    
    // Nettoyer l'intervalle lors du démontage
    return () => {
      if (gcIntervalRef.current !== null) {
        clearInterval(gcIntervalRef.current);
        gcIntervalRef.current = null;
      }
    };
  }, [optimizeQueries, pruneCache, strategy, gcIntervalMinutes]);
  
  // Exposer des méthodes pour utilisation manuelle
  return {
    optimizeNow: optimizeQueries,
    pruneNow: pruneCache,
    setStrategy: (newStrategy: CacheStrategy) => {
      // Cette fonction permettrait de changer la stratégie dynamiquement
      // Mais ce n'est pas implémenté ici car elle nécessiterait de reconfigurer le hook
      console.log(`Strategy change requested to ${newStrategy}, please update the hook parameter`);
    }
  };
};
