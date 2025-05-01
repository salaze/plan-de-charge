
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchProjects } from '@/utils/supabase/projects';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Loader2 } from 'lucide-react';

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

export function ProjectSelector({ projects: initialProjects, selectedProject, onProjectChange }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Récupérer les projets depuis Supabase à chaque montage du composant
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedProjects = await fetchProjects();
        if (fetchedProjects && fetchedProjects.length > 0) {
          setProjects(fetchedProjects);
          console.log("Projets chargés depuis Supabase:", fetchedProjects);
          
          // Si le projet sélectionné n'existe pas dans la liste des projets chargés,
          // sélectionner automatiquement le premier projet
          if (selectedProject !== 'select-project' && selectedProject !== 'no-project') {
            const projectExists = fetchedProjects.some(p => p.code === selectedProject);
            if (!projectExists && fetchedProjects.length > 0) {
              console.log(`Le projet ${selectedProject} n'existe pas dans la liste. Sélection du premier projet.`);
              onProjectChange(fetchedProjects[0].code);
            }
          }
        } else {
          // Utiliser les projets passés en prop si la requête échoue
          console.log("Aucun projet trouvé dans Supabase, utilisation des projets fournis en props");
        }
      } catch (err) {
        console.error("Erreur lors du chargement des projets:", err);
        setError("Impossible de charger les projets");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, [selectedProject, onProjectChange]);
  
  // Si les props changent après le chargement initial, les utiliser comme fallback
  useEffect(() => {
    if (initialProjects.length > 0 && projects.length === 0) {
      setProjects(initialProjects);
    }
  }, [initialProjects, projects.length]);
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Label>Sélectionner un projet</Label>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Chargement des projets...</span>
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-3">
        <Label>Sélectionner un projet</Label>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
        <Select 
          value={selectedProject || "select-project"} 
          onValueChange={onProjectChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir un projet" />
          </SelectTrigger>
          <SelectContent>
            {initialProjects.map((project) => (
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
