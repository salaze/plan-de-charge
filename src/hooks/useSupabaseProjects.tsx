
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
      // Use type assertion to handle dynamic table access
      const { data, error } = await (supabase as any)
        .from('projets')
        .select('*')
        .order('code');

      if (error) {
        throw error;
      }

      if (data) {
        // Safely type the returned data
        const typedData: SupabaseProject[] = data.map((item: any) => ({
          id: item.id || '',
          code: item.code || '',
          name: item.name || '',
          color: item.color || '#cccccc',
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
        
        setProjects(typedData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      setError('Impossible de charger les projets depuis Supabase');
      
      // Fallback au localStorage si Supabase échoue
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
        } catch (error) {
          console.error("Erreur lors du parsing des données locales:", error);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (project: Omit<SupabaseProject, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Transform to the expected format for Supabase
      const supabaseProject = {
        code: project.code,
        name: project.name,
        color: project.color
      };

      // Use type assertion for dynamic table access
      const { data, error } = await (supabase as any)
        .from('projets')
        .insert([supabaseProject])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Use type assertion to safely handle data
        const newProject: SupabaseProject = {
          id: data[0].id || '',
          code: data[0].code || '',
          name: data[0].name || '',
          color: data[0].color || '#cccccc',
          created_at: data[0].created_at,
          updated_at: data[0].updated_at
        };
        
        setProjects(prev => [...prev, newProject]);
        return newProject;
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de l'ajout du projet:", error);
      toast.error("Impossible d'ajouter le projet");
      throw error;
    }
  };

  const updateProject = async (id: string, project: Partial<SupabaseProject>) => {
    try {
      // Use type assertion for dynamic table access
      const { data, error } = await (supabase as any)
        .from('projets')
        .update(project)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Use type assertion to safely handle data
        const updatedProject: SupabaseProject = {
          id: data[0].id || '',
          code: data[0].code || '',
          name: data[0].name || '',
          color: data[0].color || '#cccccc',
          created_at: data[0].created_at,
          updated_at: data[0].updated_at
        };
        
        setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
        return updatedProject;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      toast.error('Impossible de mettre à jour le projet');
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      // Use type assertion for dynamic table access
      const { error } = await (supabase as any)
        .from('projets')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setProjects(prev => prev.filter(p => p.id !== id));
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
