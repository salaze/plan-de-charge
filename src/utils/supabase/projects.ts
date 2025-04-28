
import { supabase } from "@/integrations/supabase/client";
import { Project } from '@/components/admin/projects/types';
import { toast } from 'sonner';

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    console.log("Récupération des projets depuis Supabase...");
    
    const { data: projects, error } = await supabase
      .from('projets')
      .select('*')
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error("Erreur Supabase:", error);
      throw error;
    }
    
    return projects.map(project => ({
      id: project.id,
      code: project.code,
      name: project.name,
      color: project.color
    }));
  } catch (error: any) {
    console.error('Erreur lors de la récupération des projets:', error);
    toast.error('Erreur lors de la récupération des projets');
    return [];
  }
};

export const saveProject = async (project: Project): Promise<boolean> => {
  try {
    const projectData = {
      id: project.id,
      code: project.code,
      name: project.name,
      color: project.color
    };
    
    const { error } = await supabase
      .from('projets')
      .upsert(projectData)
      .select();
      
    if (error) {
      console.error('Erreur Supabase:', error);
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde du projet:', error);
    
    if (error.code === '23505') {
      toast.error('Un projet avec ce code existe déjà');
    } else {
      toast.error('Erreur lors de la sauvegarde du projet');
    }
    
    return false;
  }
};

export const deleteProject = async (projectId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('projets')
      .delete()
      .eq('id', projectId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    toast.error('Erreur lors de la suppression du projet');
    return false;
  }
};
