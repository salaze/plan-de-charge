
import { useState } from 'react';
import { toast } from 'sonner';
import { Project, ProjectFormData } from './types';
import { generateId } from '@/utils';

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
  
  const confirmDeleteProject = () => {
    if (!projectToDelete) return;
    
    const updatedProjects = projects.filter(project => project.id !== projectToDelete);
    onProjectsChange(updatedProjects);
    
    toast.success('Projet supprimé avec succès');
    setDeleteDialogOpen(false);
    setProjectToDelete('');
  };
  
  const handleFormChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveProject = (e: React.FormEvent) => {
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
    
    let updatedProjects: Project[];
    
    if (currentProject) {
      updatedProjects = projects.map(project => 
        project.id === currentProject.id 
          ? { ...project, ...formData } 
          : project
      );
      toast.success('Projet modifié avec succès');
    } else {
      const newProject: Project = {
        id: generateId(),
        ...formData
      };
      updatedProjects = [...projects, newProject];
      toast.success('Projet ajouté avec succès');
    }
    
    onProjectsChange(updatedProjects);
    setFormOpen(false);
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
