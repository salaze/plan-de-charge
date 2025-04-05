
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProjectList } from './project/ProjectList';
import { ProjectForm } from './project/ProjectForm';
import { DeleteProjectDialog } from './project/DeleteProjectDialog';
import { useProjectManager } from '@/hooks/useProjectManager';
import { Project } from '@/types';

interface ProjectManagerProps {
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
}

export function ProjectManager({ projects, onProjectsChange }: ProjectManagerProps) {
  const {
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
    handleSaveProject
  } = useProjectManager(projects, onProjectsChange);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gestion des projets</CardTitle>
        <CardDescription>
          Ajouter, modifier ou supprimer des projets et leur code associé
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectList 
          projects={projects}
          onAddProject={handleAddProject}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
        />
      </CardContent>
      
      {/* Forms and dialogs */}
      <ProjectForm 
        open={formOpen}
        onOpenChange={setFormOpen}
        currentProject={currentProject}
        code={code}
        setCode={setCode}
        name={name}
        setName={setName}
        color={color}
        setColor={setColor}
        onSave={handleSaveProject}
      />
      
      <DeleteProjectDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteProject}
      />
    </Card>
  );
}
