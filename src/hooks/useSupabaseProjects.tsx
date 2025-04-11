
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
      const { data, error } = await supabase
        .from('projets')
        .select('*')
        .order('code');

      if (error) {
        throw error;
      }

      setProjects(data || []);
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
      const { data, error } = await supabase
        .from('projets')
        .insert([project])
        .select();

      if (error) {
        throw error;
      }

      setProjects(prev => [...prev, data[0]]);
      return data[0];
    } catch (error) {
      console.error("Erreur lors de l'ajout du projet:", error);
      toast.error("Impossible d'ajouter le projet");
      throw error;
    }
  };

  const updateProject = async (id: string, project: Partial<SupabaseProject>) => {
    try {
      const { data, error } = await supabase
        .from('projets')
        .update(project)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      setProjects(prev => prev.map(p => p.id === id ? data[0] : p));
      return data[0];
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      toast.error('Impossible de mettre à jour le projet');
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
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
