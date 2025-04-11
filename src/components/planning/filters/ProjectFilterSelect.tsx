
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProjectFilterSelectProps {
  projects: { id: string; code: string; name: string }[];
  selectedProjectCode: string | undefined;
  onChange: (projectCode: string | undefined) => void;
}

export function ProjectFilterSelect({ projects, selectedProjectCode, onChange }: ProjectFilterSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="project">Projet</Label>
      <Select
        value={selectedProjectCode || "all"}
        onValueChange={(value) => onChange(value === "all" ? undefined : value)}
      >
        <SelectTrigger id="project">
          <SelectValue placeholder="Tous les projets" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les projets</SelectItem>
          {projects.map(project => (
            <SelectItem key={project.id} value={project.code || `project-${project.id}`}>
              {project.name} ({project.code || 'N/A'})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
