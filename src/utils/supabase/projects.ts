
import { supabase } from "@/integrations/supabase/client";
import { Project } from '@/components/admin/projects/types';
import { toast } from 'sonner';

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    console.log("Récupération des projets depuis Supabase...");
    
    const { data: projects, error } = await supabase
      .from('projets')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      console.error("Erreur Supabase:", error);
      throw error;
    }
    
    console.log("Projets récupérés:", projects);
    
    // S'assurer que tous les champs nécessaires sont présents
    return projects.map(project => ({
      id: project.id,
      code: project.code || `projet-${project.id.substring(0,8)}`, // Assurer qu'un code est toujours présent
      name: project.name,
      color: project.color || '#4CAF50' // Couleur par défaut si non définie
    }));
  } catch (error: any) {
    console.error('Erreur lors de la récupération des projets:', error);
    toast.error('Erreur lors de la récupération des projets');
    return [];
  }
};

export const saveProject = async (project: Project): Promise<boolean> => {
  try {
    console.log("Sauvegarde du projet:", project);
    
    // S'assurer que toutes les propriétés requises sont présentes
    if (!project.code || !project.name) {
      toast.error('Le code et le nom du projet sont requis');
      return false;
    }
    
    const projectData = {
      id: project.id,
      code: project.code,
      name: project.name,
      color: project.color || '#4CAF50'
    };
    
    const { data, error } = await supabase
      .from('projets')
      .upsert(projectData)
      .select();
      
    if (error) {
      console.error('Erreur Supabase lors de la sauvegarde:', error);
      
      // Gestion des erreurs spécifiques
      if (error.code === '23505') {
        toast.error('Un projet avec ce code existe déjà');
      } else {
        toast.error(`Erreur lors de la sauvegarde du projet: ${error.message}`);
      }
      
      return false;
    }
    
    console.log('Projet sauvegardé avec succès:', data);
    return true;
  } catch (error: any) {
    console.error('Exception lors de la sauvegarde du projet:', error);
    toast.error('Erreur lors de la sauvegarde du projet');
    return false;
  }
};

export const deleteProject = async (projectId: string): Promise<boolean> => {
  try {
    console.log("Suppression du projet:", projectId);
    
    const { error } = await supabase
      .from('projets')
      .delete()
      .eq('id', projectId);
      
    if (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
    
    console.log('Projet supprimé avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    toast.error('Erreur lors de la suppression du projet');
    return false;
  }
};
