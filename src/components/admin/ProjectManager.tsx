import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Edit, Plus, Trash } from 'lucide-react';
import { generateId } from '@/utils';

interface Project {
  id: string;
  code: string;
  name: string;
  color: string;
}

interface ProjectManagerProps {
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
}

export function ProjectManager({ projects, onProjectsChange }: ProjectManagerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string>('');
  
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4CAF50');
  
  const handleAddProject = () => {
    setCurrentProject(null);
    setCode('');
    setName('');
    setColor('#4CAF50');
    setFormOpen(true);
  };
  
  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setCode(project.code);
    setName(project.name);
    setColor(project.color);
    setFormOpen(true);
  };
  
  const handleDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteProject = () => {
    if (!projectToDelete) return;
    
    const updatedProjects = projects.filter(project => project.id !== projectToDelete);
    onProjectsChange(updatedProjects);
    
    toast.success('Projet supprimé avec succès');
    setDeleteDialogOpen(false);
    setProjectToDelete('');
  };
  
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || !name) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Vérifier si le code est déjà utilisé (sauf pour le projet en cours d'édition)
    const codeExists = projects.some(p => 
      p.code === code && p.id !== (currentProject?.id || '')
    );
    
    if (codeExists) {
      toast.error('Ce code de projet existe déjà');
      return;
    }
    
    let updatedProjects: Project[];
    
    if (currentProject) {
      // Mettre à jour un projet existant
      updatedProjects = projects.map(project => 
        project.id === currentProject.id 
          ? { ...project, code, name, color } 
          : project
      );
      toast.success('Projet modifié avec succès');
    } else {
      // Ajouter un nouveau projet
      const newProject: Project = {
        id: generateId(),
        code,
        name,
        color
      };
      updatedProjects = [...projects, newProject];
      toast.success('Projet ajouté avec succès');
    }
    
    onProjectsChange(updatedProjects);
    setFormOpen(false);
  };
  
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gestion des projets</CardTitle>
          <CardDescription>
            Ajouter, modifier ou supprimer des projets et leur code associé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddProject} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un projet
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom du projet</TableHead>
                <TableHead>Couleur</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    Aucun projet disponible
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.code}</TableCell>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div 
                          className="w-6 h-6 rounded-full mr-2" 
                          style={{ backgroundColor: project.color }} 
                        />
                        {project.color}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditProject(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentProject ? 'Modifier un projet' : 'Ajouter un projet'}
            </DialogTitle>
            <DialogDescription>
              {currentProject 
                ? 'Modifiez les détails du projet existant' 
                : 'Complétez les informations pour ajouter un nouveau projet'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveProject}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project-code">Code du projet</Label>
                <Input
                  id="project-code"
                  placeholder="P001"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-name">Nom du projet</Label>
                <Input
                  id="project-name"
                  placeholder="Développement interne"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-color">Couleur</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="project-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-24 h-10"
                  />
                  <div 
                    className="flex-1 h-10 rounded-md" 
                    style={{ backgroundColor: color }} 
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteProject}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
