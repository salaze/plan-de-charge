
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchProjectByCode } from '@/utils/supabase/projects';
import { Loader2 } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  
  const handleProjectChange = async (projectCode: string) => {
    // Appeler le callback immédiatement pour une expérience utilisateur réactive
    onProjectChange(projectCode);
    
    if (projectCode === 'select-project') {
      return;
    }
    
    // Récupérer les données fraîches du projet en temps réel depuis Supabase
    setLoading(true);
    try {
      await fetchProjectByCode(projectCode);
      // Nous n'avons pas besoin de stocker le résultat localement
      // car nous utilisons toujours les données directement depuis Supabase
      // quand nous en avons besoin
    } catch (error) {
      console.error("Erreur lors de la récupération des données du projet:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Sélectionner un projet</Label>
      <div className="relative">
        <Select 
          value={selectedProject || "select-project"} 
          onValueChange={handleProjectChange}
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
        {loading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectSelector;
