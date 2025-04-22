
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Project, ProjectFormData } from './projects/types';
import { ProjectTable } from './projects/ProjectTable';
import { ProjectForm } from './projects/ProjectForm';
import { DeleteDialog } from './projects/DeleteDialog';
import { useProjectManager } from './projects/useProjectManager';
import { toast } from 'sonner';

interface ProjectManagerProps {
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
}

export function ProjectManager({ projects, onProjectsChange }: ProjectManagerProps) {
  const {
    formOpen,
    currentProject,
    deleteDialogOpen,
    projectToDelete,
    setFormOpen,
    setCurrentProject,
    setDeleteDialogOpen,
    setProjectToDelete,
    handleAddProject,
    handleEditProject,
    generateProjectId
  } = useProjectManager();

  const handleDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProject = () => {
    if (!projectToDelete) return;

    const updatedProjects = projects.filter(
      (project: Project) => project.id !== projectToDelete
    );
    onProjectsChange(updatedProjects);

    toast.success('Projet supprimé avec succès');
    setDeleteDialogOpen(false);
    setProjectToDelete('');
  };

  const handleSaveProject = (projectData: ProjectFormData) => {
    let updatedProjects: Project[];

    if (currentProject) {
      // Update existing project
      updatedProjects = projects.map((project: Project) =>
        project.id === currentProject.id
          ? { ...project, ...projectData }
          : project
      );
      toast.success('Projet modifié avec succès');
    } else {
      // Create new project
      const newProject = {
        ...projectData,
        id: generateProjectId()
      };
      updatedProjects = [...projects, newProject];
      toast.success('Projet ajouté avec succès');
    }

    onProjectsChange(updatedProjects);
    setFormOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestion des projets</CardTitle>
          <CardDescription>
            Ajouter, modifier ou supprimer des projets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectTable
            projects={projects}
            onAddProject={handleAddProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        </CardContent>
      </Card>

      <ProjectForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveProject}
        project={currentProject}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteProject}
      />
    </>
  );
}
