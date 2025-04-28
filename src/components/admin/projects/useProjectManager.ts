import { useState } from 'react';
import { toast } from 'sonner';
import { Project, ProjectFormData } from './types';
import { generateId } from '@/utils';
import { saveProject, deleteProject } from '@/utils/supabase/projects';

export function useProjectManager(
  projects: Project[],
  onProjectsChange: (projects: Project[]) => void
) {
  const [formOpen, setFormOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string>('');
  
  const [formData, setFormData] = useState<ProjectFormData>({
    code: '',
    name: '',
    color: '#4CAF50'
  });

  const handleAddProject = () => {
    setCurrentProject(null);
    setFormData({
      code: '',
      name: '',
      color: '#4CAF50'
    });
    setFormOpen(true);
  };
  
  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setFormData({
      code: project.code,
      name: project.name,
      color: project.color
    });
    setFormOpen(true);
  };
  
  const handleDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    
    const success = await deleteProject(projectToDelete);
    
    if (success) {
      const updatedProjects = projects.filter(project => project.id !== projectToDelete);
      onProjectsChange(updatedProjects);
      toast.success('Projet supprimé avec succès');
    }
    
    setDeleteDialogOpen(false);
    setProjectToDelete('');
  };
  
  const handleFormChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const codeExists = projects.some(p => 
      p.code === formData.code && p.id !== (currentProject?.id || '')
    );
    
    if (codeExists) {
      toast.error('Ce code de projet existe déjà');
      return;
    }
    
    const projectToSave: Project = currentProject 
      ? { ...currentProject, ...formData }
      : { id: generateId(), ...formData };
    
    const success = await saveProject(projectToSave);
    
    if (success) {
      const updatedProjects = currentProject
        ? projects.map(p => p.id === currentProject.id ? projectToSave : p)
        : [...projects, projectToSave];
        
      onProjectsChange(updatedProjects);
      setFormOpen(false);
      toast.success(currentProject ? 'Projet modifié avec succès' : 'Projet ajouté avec succès');
    }
  };

  return {
    formOpen,
    currentProject,
    deleteDialogOpen,
    projectToDelete,
    formData,
    setFormOpen,
    setCurrentProject,
    setDeleteDialogOpen,
    setProjectToDelete,
    handleAddProject,
    handleEditProject,
    handleDeleteProject,
    confirmDeleteProject,
    handleFormChange,
    handleSaveProject
  };
}
