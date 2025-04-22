
import React from 'react';
import { ProjectManager } from '@/components/admin/ProjectManager';
import { Project } from '../projects/types';

interface ProjectsTabProps {
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
}

export function ProjectsTab({ projects, onProjectsChange }: ProjectsTabProps) {
  return (
    <ProjectManager
      projects={projects}
      onProjectsChange={onProjectsChange}
    />
  );
}
