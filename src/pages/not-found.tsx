
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold mt-6">Page non trouvée</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retourner à l'accueil
        </Link>
      </Button>
    </div>
  );
}
