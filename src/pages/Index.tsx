
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { PlanningGrid } from '@/components/calendar/PlanningGrid';
import { MonthSelector } from '@/components/calendar/MonthSelector';
import { planningService } from '@/services/jsonStorage';

// Page d'accueil principale
const Index = () => {
  const planningData = planningService.getData();
  
  return (
    <Layout>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h1 className="text-2xl font-bold">Planning</h1>
          <div className="flex items-center gap-2">
            <Link to="/init" className="text-sm text-muted-foreground hover:text-primary">
              Initialisation/Migration
            </Link>
            <MonthSelector />
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-md">
          <PlanningGrid />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
