
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Employee } from '@/types';
import { EmployeeList } from '@/components/employees/EmployeeList';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { createEmptyEmployee, generateId } from '@/utils';

interface EmployeeTabProps {
  employees: Employee[];
  onEmployeesChange: (employees: Employee[]) => void;
}

export function EmployeeTab({ employees, onEmployeesChange }: EmployeeTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string>('');
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  
  const handleAddEmployee = () => {
    setCurrentEmployee(undefined);
    setFormOpen(true);
  };
  
  const handleEditEmployee = (employee: Employee) => {
    setCurrentEmployee(employee);
    setFormOpen(true);
  };
  
  const handleDeleteEmployee = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteAllEmployees = () => {
    setDeleteAllDialogOpen(true);
  };
  
  const confirmDeleteAllEmployees = () => {
    onEmployeesChange([]);
    toast.success('Tous les employés ont été supprimés');
    setDeleteAllDialogOpen(false);
  };
  
  const confirmDeleteEmployee = () => {
    if (!employeeToDelete) return;
    
    const updatedEmployees = employees.filter((emp: Employee) => emp.id !== employeeToDelete);
    onEmployeesChange(updatedEmployees);
    
    toast.success('Employé supprimé avec succès');
    setDeleteDialogOpen(false);
    setEmployeeToDelete('');
  };
  
  const handleSaveEmployee = (employee: Employee) => {
    let updatedEmployees: Employee[];
    
    if (employee.id) {
      // Mettre à jour un employé existant
      updatedEmployees = employees.map((emp: Employee) => 
        emp.id === employee.id ? employee : emp
      );
      toast.success('Employé modifié avec succès');
    } else {
      // Ajouter un nouvel employé
      const newEmployee = {
        ...employee,
        id: generateId(),
        schedule: []
      };
      updatedEmployees = [...employees, newEmployee];
      toast.success('Employé ajouté avec succès');
    }
    
    onEmployeesChange(updatedEmployees);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestion des employés</CardTitle>
          <CardDescription>
            Ajouter, modifier ou supprimer des employés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="glass-panel p-6 animate-scale-in">
            <div className="mb-4 flex justify-end">
              <Button 
                variant="destructive"
                onClick={handleDeleteAllEmployees}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer tous les employés
              </Button>
            </div>
            <EmployeeList 
              employees={employees}
              onAddEmployee={handleAddEmployee}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          </div>
        </CardContent>
      </Card>
      
      <EmployeeForm 
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveEmployee}
        employee={currentEmployee}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement l'employé
              et toutes ses données de présence.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteEmployee}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer tous les employés ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement TOUS les employés
              et leurs données de présence.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteAllEmployees}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Tout supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
