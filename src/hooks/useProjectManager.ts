
import { useState } from 'react';
import { generateId } from '@/utils/idUtils';
import { toast } from 'sonner';
import { Project } from '@/types';
import { projectService } from '@/services/jsonStorage';

export function useProjectManager(projects: Project[], onProjectsChange: (projects: Project[]) => void) {
  const [formOpen, setFormOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string>('');
  
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4CAF50');
  
  const handleAddProject = () => {
    setCurrentProject(null);
    setCode('');
    setName('');
    setColor('#4CAF50');
    setFormOpen(true);
  };
  
  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setCode(project.code);
    setName(project.name);
    setColor(project.color);
    setFormOpen(true);
  };
  
  const handleDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteProject = () => {
    if (!projectToDelete) return;
    
    // Suppression via le service
    const success = projectService.delete(projectToDelete);
    
    if (success) {
      const updatedProjects = projects.filter(project => project.id !== projectToDelete);
      onProjectsChange(updatedProjects);
      
      toast.success('Projet supprimé avec succès');
      setDeleteDialogOpen(false);
      setProjectToDelete('');
    } else {
      toast.error('Erreur lors de la suppression du projet');
    }
  };
  
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || !name) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Vérifier si le code est déjà utilisé (sauf pour le projet en cours d'édition)
    const codeExists = projects.some(p => 
      p.code === code && p.id !== (currentProject?.id || '')
    );
    
    if (codeExists) {
      toast.error('Ce code de projet existe déjà');
      return;
    }
    
    let updatedProjects: Project[];
    
    if (currentProject) {
      // Mise à jour via le service
      const updatedProject = projectService.update({
        ...currentProject,
        code,
        name,
        color
      });
      
      updatedProjects = projects.map(project => 
        project.id === currentProject.id ? updatedProject : project
      );
      
      toast.success('Projet modifié avec succès');
    } else {
      // Création via le service
      const newProject = projectService.create({
        code,
        name,
        color
      });
      
      updatedProjects = [...projects, newProject];
      toast.success('Projet ajouté avec succès');
    }
    
    onProjectsChange(updatedProjects);
    setFormOpen(false);
  };

  return {
    formOpen,
    setFormOpen,
    currentProject,
    deleteDialogOpen,
    setDeleteDialogOpen,
    code,
    setCode,
    name,
    setName,
    color,
    setColor,
    handleAddProject,
    handleEditProject,
    handleDeleteProject,
    confirmDeleteProject,
    handleSaveProject,
    projectToDelete
  };
}
