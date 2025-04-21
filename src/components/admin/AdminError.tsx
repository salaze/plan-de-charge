
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminErrorProps {
  error: string;
  onRetry: () => void;
}

export const AdminError = ({ error, onRetry }: AdminErrorProps) => {
  return (
    <div className="glass-panel p-6 animate-scale-in">
      <div className="flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-bold mb-2">Erreur de connexion</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={onRetry}>Réessayer</Button>
      </div>
    </div>
  );
};
