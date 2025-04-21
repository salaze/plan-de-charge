
import React from 'react';
import { ProjectManager } from '@/components/admin/ProjectManager';

interface ProjectsTabProps {
  projects: any[];
  onProjectsChange: (projects: any[]) => void;
}

export function ProjectsTab({ projects, onProjectsChange }: ProjectsTabProps) {
  return (
    <ProjectManager
      projects={projects}
      onProjectsChange={onProjectsChange}
    />
  );
}
