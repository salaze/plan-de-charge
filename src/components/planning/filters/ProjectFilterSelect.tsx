
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchProjects } from '@/utils/supabase/projects';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Loader2 } from 'lucide-react';

interface ProjectFilterSelectProps {
  projects: { id: string; code: string; name: string }[];
  selectedProjectCode: string | undefined;
  onChange: (projectCode: string | undefined) => void;
}

export function ProjectFilterSelect({ projects: initialProjects, selectedProjectCode, onChange }: ProjectFilterSelectProps) {
  const [projects, setProjects] = useState<{ id: string; code: string; name: string; color?: string }[]>(initialProjects);
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
          console.log("Projets chargés depuis Supabase pour les filtres:", fetchedProjects);
        } else {
          // Utiliser les projets passés en prop si la requête échoue
          console.log("Aucun projet trouvé dans Supabase pour les filtres, utilisation des projets fournis en props");
        }
      } catch (err) {
        console.error("Erreur lors du chargement des projets pour les filtres:", err);
        setError("Impossible de charger les projets");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, []);
  
  // Si les props changent après le chargement initial, les utiliser comme fallback
  useEffect(() => {
    if (initialProjects.length > 0 && projects.length === 0) {
      setProjects(initialProjects);
    }
  }, [initialProjects, projects.length]);
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Projet</Label>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Chargement des projets...</span>
        </div>
      </div>
    );
  }

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
            <SelectItem 
              key={project.id} 
              value={project.code || `project-${project.id}`}
            >
              <div className="flex items-center gap-2">
                {project.color && (
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: project.color }}
                  />
                )}
                {project.name} ({project.code || 'N/A'})
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <div className="flex items-center gap-2 text-destructive mt-1">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
