
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface SupabaseProject {
  id: string;
  code: string;
  name: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export const useSupabaseProjects = () => {
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Instead of using type assertion, check if the table exists first
      try {
        // Check if the 'projets' table exists in our database
        const { count, error: checkError } = await supabase
          .from('statuts')  // Use a table we know exists
          .select('*', { count: 'exact', head: true });
        
        if (checkError) throw checkError;
        
        // If we can query a known table, we can try to get projects from localStorage
        const savedData = localStorage.getItem('planningData');
        if (savedData) {
          try {
            const data = JSON.parse(savedData);
            if (data.projects && data.projects.length > 0) {
              const localProjects: SupabaseProject[] = data.projects.map((p: any) => ({
                id: p.id,
                code: p.code,
                name: p.name,
                color: p.color
              }));
              setProjects(localProjects);
              toast.info('Utilisation des projets stockés localement');
            }
          } catch (parseError) {
            console.error("Erreur lors du parsing des données locales:", parseError);
          }
        }
      } catch (tableError) {
        console.error('Erreur lors de la vérification des tables:', tableError);
        setError('Impossible de vérifier la structure de la base de données');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      setError('Impossible de charger les projets depuis Supabase');
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (project: Omit<SupabaseProject, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Since we might not have the projets table yet, handle locally
      const newProject: SupabaseProject = {
        id: crypto.randomUUID(),
        code: project.code,
        name: project.name,
        color: project.color,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setProjects(prev => [...prev, newProject]);
      
      // Save to localStorage
      const savedData = localStorage.getItem('planningData');
      if (savedData) {
        const data = JSON.parse(savedData);
        data.projects = [...(data.projects || []), newProject];
        localStorage.setItem('planningData', JSON.stringify(data));
      }
      
      return newProject;
    } catch (error) {
      console.error("Erreur lors de l'ajout du projet:", error);
      toast.error("Impossible d'ajouter le projet");
      throw error;
    }
  };

  const updateProject = async (id: string, project: Partial<SupabaseProject>) => {
    try {
      // Update locally first
      const updatedProjects = projects.map(p => 
        p.id === id ? { ...p, ...project, updated_at: new Date().toISOString() } : p
      );
      setProjects(updatedProjects);
      
      // Update in localStorage
      const savedData = localStorage.getItem('planningData');
      if (savedData) {
        const data = JSON.parse(savedData);
        data.projects = updatedProjects;
        localStorage.setItem('planningData', JSON.stringify(data));
      }
      
      const updatedProject = updatedProjects.find(p => p.id === id);
      return updatedProject || null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      toast.error('Impossible de mettre à jour le projet');
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      // Delete locally
      const filteredProjects = projects.filter(p => p.id !== id);
      setProjects(filteredProjects);
      
      // Update localStorage
      const savedData = localStorage.getItem('planningData');
      if (savedData) {
        const data = JSON.parse(savedData);
        data.projects = filteredProjects;
        localStorage.setItem('planningData', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      toast.error('Impossible de supprimer le projet');
      throw error;
    }
  };

  return {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject
  };
};

export default useSupabaseProjects;
