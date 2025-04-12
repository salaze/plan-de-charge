
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { generateId } from '@/utils';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTabs } from '@/components/admin/AdminTabs';

const Admin = () => {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('planningData');
    return savedData ? JSON.parse(savedData) : { 
      projects: [], 
      employees: [],
      statuses: [] 
    };
  });
  
  // Initialiser les statuts si c'est le premier accès
  useEffect(() => {
    if (!data.statuses || data.statuses.length === 0) {
      // Créer des statuts par défaut à partir des STATUS_LABELS et STATUS_COLORS
      const defaultStatuses = Object.entries(STATUS_LABELS)
        .filter(([code]) => code !== '') // Ignorer le statut vide
        .map(([code, label]) => ({
          id: generateId(),
          code: code as StatusCode,
          label,
          color: STATUS_COLORS[code as StatusCode]
        }));
      
      setData(prevData => ({
        ...prevData,
        statuses: defaultStatuses
      }));
    }
    
    // Vider les employés lors du chargement initial
    setData(prevData => ({
      ...prevData,
      employees: []
    }));
    
    // Mettre à jour le localStorage
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      localStorage.setItem('planningData', JSON.stringify({
        ...parsedData,
        employees: []
      }));
    }
  }, []);
  
  useEffect(() => {
    if (data) {
      const savedData = localStorage.getItem('planningData');
      const fullData = savedData ? JSON.parse(savedData) : {};
      
      // Mettre à jour les projets, les employés et les statuts dans le localStorage
      localStorage.setItem('planningData', JSON.stringify({
        ...fullData,
        projects: data.projects,
        employees: data.employees,
        statuses: data.statuses
      }));
    }
  }, [data]);
  
  const handleProjectsChange = (projects: any[]) => {
    setData(prevData => ({
      ...prevData,
      projects
    }));
  };
  
  const handleStatusesChange = (statuses: any[]) => {
    setData(prevData => ({
      ...prevData,
      statuses
    }));
  };
  
  const handleEmployeesChange = (employees: any[]) => {
    setData(prevData => ({
      ...prevData,
      employees
    }));
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <AdminHeader />
        
        <AdminTabs 
          projects={data.projects || []}
          employees={data.employees || []}
          statuses={data.statuses || []}
          onProjectsChange={handleProjectsChange}
          onStatusesChange={handleStatusesChange}
          onEmployeesChange={handleEmployeesChange}
        />
      </div>
    </Layout>
  );
};

export default Admin;
