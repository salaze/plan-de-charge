
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Project, ProjectFormData } from './projects/types';
import { ProjectTable } from './projects/ProjectTable';
import { ProjectForm } from './projects/ProjectForm';
import { DeleteDialog } from './projects/DeleteDialog';
import { useProjectManager } from './projects/useProjectManager';

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
    formData,
    isSubmitting,
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
  } = useProjectManager(projects, onProjectsChange);

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
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
          <div className="mt-4 flex justify-end">
            <button
              className="bg-primary text-white px-4 py-2 rounded"
              onClick={handleAddProject}
            >
              Ajouter un projet
            </button>
          </div>
        </CardContent>
      </Card>

      {formOpen && (
        <ProjectForm
          formData={formData}
          onSubmit={handleSaveProject}
          onClose={() => setFormOpen(false)}
          onChange={handleFormChange}
          isSubmitting={isSubmitting}
        />
      )}

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteProject}
      />
    </>
  );
}
