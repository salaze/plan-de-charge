
import React from 'react';
import { cn } from '@/lib/utils';
import { StatusCode } from '@/types';
import { useStatusIcons } from '@/hooks/useStatusIcons';
import { Skeleton } from '@/components/ui/skeleton';

interface StatusIconProps {
  status: StatusCode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  withFallback?: boolean;
}

export function StatusIcon({ 
  status,
  className, 
  size = 'md',
  withFallback = true
}: StatusIconProps) {
  const { getIconUrl, loading } = useStatusIcons();
  const iconUrl = getIconUrl(status);
  
  // Dimensions en fonction de la taille
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  // Si en cours de chargement, afficher un skeleton
  if (loading) {
    return <Skeleton className={cn(sizeClasses[size], 'rounded-full', className)} />;
  }
  
  // Si une URL d'icône existe, l'utiliser
  if (iconUrl) {
    return (
      <img 
        src={iconUrl}
        alt={`Status: ${status}`}
        className={cn(sizeClasses[size], 'rounded-full object-cover', className)}
      />
    );
  }
  
  // Fallback : utiliser un cercle coloré
  if (withFallback) {
    return (
      <div className={cn(
        sizeClasses[size],
        'rounded-full',
        status ? `bg-${status}-500` : 'bg-gray-300',
        className
      )} />
    );
  }
  
  // Si pas de fallback souhaité, ne rien afficher
  return null;
}
