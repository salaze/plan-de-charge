
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

const NotFound = () => {
  const location = useLocation();

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in">
        <div className="glass-panel p-10 text-center max-w-md animate-scale-in">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <p className="text-xl mb-6">
            La page <span className="font-semibold">{location.pathname}</span> n'existe pas
          </p>
          <Button asChild className="transition-transform hover:scale-105">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
