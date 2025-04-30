
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export function StatusLoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Chargement des statuts...</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      <Skeleton className="h-10 w-full mt-4" />
    </div>
  );
}
