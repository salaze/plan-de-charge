
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Project {
  id: string;
  code: string;
  name: string;
  color: string;
}

interface ProjectSelectorProps {
  projects: Project[];
  selectedProject: string;
  onProjectChange: (projectCode: string) => void;
}

export function ProjectSelector({ projects, selectedProject, onProjectChange }: ProjectSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Sélectionner un projet</Label>
      <Select 
        value={selectedProject || "select-project"} 
        onValueChange={onProjectChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Choisir un projet" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem 
              key={project.id} 
              value={project.code || `project-${project.id}`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: project.color }}
                />
                {project.code || project.id} - {project.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default ProjectSelector;
