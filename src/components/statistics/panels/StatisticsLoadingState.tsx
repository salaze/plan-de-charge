
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface StatisticsLoadingStateProps {
  loadingState: string;
}

export const StatisticsLoadingState = ({ loadingState }: StatisticsLoadingStateProps) => {
  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-6 w-24 ml-auto" />
          </div>
          <div className="w-full h-[400px] rounded-md bg-muted/20 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading statistics... {loadingState}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-24 ml-auto" />
          </div>
          <div className="space-y-2">
            <div className="flex space-x-3 items-center">
              <Skeleton className="h-6 w-36" />
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-6 w-16" />
              ))}
            </div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex space-x-3 items-center">
                <Skeleton className="h-6 w-36" />
                {[1, 2, 3, 4, 5].map(j => (
                  <Skeleton key={j} className="h-6 w-16" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
