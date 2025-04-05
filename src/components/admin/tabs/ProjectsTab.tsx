
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectManager } from '@/components/admin/ProjectManager';

interface ProjectsTabProps {
  projects: any[];
  onProjectsChange: (projects: any[]) => void;
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
