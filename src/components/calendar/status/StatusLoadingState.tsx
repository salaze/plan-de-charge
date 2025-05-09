
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export function StatusLoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-2 text-primary">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>Chargement des statuts...</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      <Skeleton className="h-10 w-full mt-4" />
    </div>
  );
}
