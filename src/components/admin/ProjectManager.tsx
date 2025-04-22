
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Project } from './projects/types';
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
    setFormOpen,
    deleteDialogOpen,
    formData,
    handleAddProject,
    handleEditProject,
    handleDeleteProject,
    confirmDeleteProject,
    handleFormChange,
    handleSaveProject
  } = useProjectManager(projects, onProjectsChange);
  
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gestion des projets</CardTitle>
          <CardDescription>
            Ajouter, modifier ou supprimer des projets et leur code associé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddProject} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un projet
            </Button>
          </div>
          
          <ProjectTable
            projects={projects}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        </CardContent>
      </Card>
      
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData.code ? 'Modifier un projet' : 'Ajouter un projet'}
            </DialogTitle>
          </DialogHeader>
          
          <ProjectForm
            formData={formData}
            onSubmit={handleSaveProject}
            onClose={() => setFormOpen(false)}
            onChange={handleFormChange}
          />
        </DialogContent>
      </Dialog>
      
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteProject}
      />
    </>
  );
}
