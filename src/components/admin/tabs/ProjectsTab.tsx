
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectManager } from '@/components/admin/ProjectManager';
import { Project } from '@/types';

interface ProjectsTabProps {
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
}

export function ProjectsTab({ projects, onProjectsChange }: ProjectsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des projets</CardTitle>
        <CardDescription>
          Ajouter, modifier ou supprimer des projets et leur code associé
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectManager 
          projects={projects} 
          onProjectsChange={onProjectsChange} 
        />
      </CardContent>
    </Card>
  );
}
