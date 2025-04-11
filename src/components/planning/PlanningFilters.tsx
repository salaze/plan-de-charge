
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { STATUS_LABELS, StatusCode, FilterOptions } from '@/types';

interface PlanningFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  employees: { id: string; name: string }[];
  projects: { id: string; code: string; name: string }[];
  filters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
}

export function PlanningFilters({
  isOpen,
  onClose,
  employees,
  projects,
  filters,
  onApplyFilters
}: PlanningFiltersProps) {
  // État local des filtres (copie pour modifier sans impact direct)
  const [localFilters, setLocalFilters] = useState<FilterOptions>({
    ...filters
  });

  // Gérer la sélection des statuts
  const handleStatusToggle = (status: StatusCode) => {
    setLocalFilters(prev => {
      const currentStatuses = prev.statusCodes || [];
      if (currentStatuses.includes(status)) {
        return {
          ...prev,
          statusCodes: currentStatuses.filter(s => s !== status)
        };
      } else {
        return {
          ...prev,
          statusCodes: [...currentStatuses, status]
        };
      }
    });
  };

  // Réinitialiser les filtres
  const handleReset = () => {
    setLocalFilters({});
  };

  // Appliquer les filtres et fermer le dialogue
  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  // États pour les popover de dates
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Liste de tous les statuts disponibles
  const availableStatuses: StatusCode[] = [
    'assistance',
    'vigi',
    'formation',
    'projet',
    'conges',
    'management',
    'tp',
    'coordinateur',
    'absence',
    'regisseur',
    'demenagement',
    'permanence'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtrer le planning</DialogTitle>
          <DialogDescription>
            Définissez des filtres pour afficher uniquement certaines données du planning
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Filtre par employé */}
          <div className="space-y-2">
            <Label htmlFor="employee">Employé</Label>
            <Select
              value={localFilters.employeeId || ""}
              onValueChange={(value) => setLocalFilters(prev => ({ ...prev, employeeId: value || undefined }))}
            >
              <SelectTrigger id="employee">
                <SelectValue placeholder="Tous les employés" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les employés</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par projet */}
          <div className="space-y-2">
            <Label htmlFor="project">Projet</Label>
            <Select
              value={localFilters.projectCode || ""}
              onValueChange={(value) => setLocalFilters(prev => ({ ...prev, projectCode: value || undefined }))}
            >
              <SelectTrigger id="project">
                <SelectValue placeholder="Tous les projets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les projets</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.code}>
                    {project.name} ({project.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par période */}
          <div className="space-y-3">
            <Label>Période</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !localFilters.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.startDate ? (
                        format(localFilters.startDate, "dd/MM/yyyy", { locale: fr })
                      ) : (
                        "Sélectionner"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={localFilters.startDate}
                      onSelect={(date) => {
                        setLocalFilters(prev => ({ ...prev, startDate: date || undefined }));
                        setStartDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="endDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !localFilters.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.endDate ? (
                        format(localFilters.endDate, "dd/MM/yyyy", { locale: fr })
                      ) : (
                        "Sélectionner"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={localFilters.endDate}
                      onSelect={(date) => {
                        setLocalFilters(prev => ({ ...prev, endDate: date || undefined }));
                        setEndDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Filtre par statut */}
          <div className="space-y-3">
            <Label>Statuts</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              {availableStatuses.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`status-${status}`} 
                    checked={(localFilters.statusCodes || []).includes(status)}
                    onCheckedChange={() => handleStatusToggle(status)}
                  />
                  <Label 
                    htmlFor={`status-${status}`}
                    className="text-sm cursor-pointer"
                  >
                    {STATUS_LABELS[status]}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset} className="mr-auto">
            Réinitialiser
          </Button>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleApply}>
            Appliquer les filtres
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
