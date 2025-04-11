
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
      // Load from localStorage as a fallback
      const loadLocalProjects = () => {
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
              console.log('Using locally stored projects');
            }
          } catch (parseError) {
            console.error("Error parsing local data:", parseError);
          }
        }
      };

      try {
        // First check if we can connect to Supabase at all
        const { data: statusCheck, error: statusError } = await supabase
          .from('statuts')
          .select('id')
          .limit(1);
          
        if (statusError) {
          console.warn("Could not connect to Supabase, using local data instead");
          loadLocalProjects();
          return;
        }
        
        // If we've made it here, we're connected to Supabase
        loadLocalProjects(); // Still load local projects as a fallback
      } catch (connectionError) {
        console.error('Error connecting to Supabase:', connectionError);
        loadLocalProjects();
      }
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (project: Omit<SupabaseProject, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Add locally first
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
      } else {
        localStorage.setItem('planningData', JSON.stringify({
          projects: [newProject]
        }));
      }
      
      return newProject;
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Could not add project");
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
      console.error('Error updating project:', error);
      toast.error('Could not update project');
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
      console.error('Error deleting project:', error);
      toast.error('Could not delete project');
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
