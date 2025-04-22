
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Employee } from '@/types';
import { EmployeeList } from '@/components/employees/EmployeeList';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
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
import { useRealtimeSync } from '@/hooks/useRealtimeSync'; 
import { supabase } from '@/integrations/supabase/client';

interface EmployeeTabProps {
  employees: Employee[];
  onEmployeesChange: (employees: Employee[]) => void;
}

export function EmployeeTab({ employees, onEmployeesChange }: EmployeeTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string>('');
  
  // Ajout de la synchronisation en temps réel pour les employés
  useRealtimeSync(true, () => {
    // Actualiser les données des employés après un changement
    console.log("Changement détecté dans les données, actualisation...");
    // Cette fonction sera appelée quand des changements sont détectés
  });
  
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
  
  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    try {
      // Supprimer l'employé de la base de données Supabase
      const { error } = await supabase
        .from('employes')
        .delete()
        .eq('id', employeeToDelete);
      
      if (error) {
        console.error('Erreur lors de la suppression de l\'employé:', error);
        toast.error('Erreur lors de la suppression de l\'employé');
        return;
      }
      
      // Mettre à jour l'état local
      const updatedEmployees = employees.filter((emp: Employee) => emp.id !== employeeToDelete);
      onEmployeesChange(updatedEmployees);
      
      toast.success('Employé supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Une erreur est survenue lors de la suppression');
    } finally {
      setDeleteDialogOpen(false);
      setEmployeeToDelete('');
    }
  };
  
  const handleSaveEmployee = async (employee: Employee) => {
    try {
      let updatedEmployees: Employee[];
      let newEmployee = employee;
      
      if (employee.id) {
        // Mise à jour d'un employé existant
        const { error } = await supabase
          .from('employes')
          .update({
            nom: employee.name,
            identifiant: employee.email || '',
            fonction: employee.position || '',
            departement: employee.department || '',
            uid: employee.uid || ''
          })
          .eq('id', employee.id);
        
        if (error) {
          console.error('Erreur lors de la mise à jour de l\'employé:', error);
          toast.error('Erreur lors de la mise à jour de l\'employé');
          return;
        }
        
        updatedEmployees = employees.map((emp: Employee) => 
          emp.id === employee.id ? employee : emp
        );
        toast.success('Employé modifié avec succès');
      } else {
        // Création d'un nouvel employé
        const employeeId = generateId();
        newEmployee = {
          ...employee,
          id: employeeId,
          schedule: []
        };
        
        const { error } = await supabase
          .from('employes')
          .insert({
            id: employeeId,
            nom: newEmployee.name,
            identifiant: newEmployee.email || '',
            fonction: newEmployee.position || '',
            departement: newEmployee.department || '',
            uid: newEmployee.uid || ''
          });
        
        if (error) {
          console.error('Erreur lors de la création de l\'employé:', error);
          toast.error('Erreur lors de la création de l\'employé');
          return;
        }
        
        updatedEmployees = [...employees, newEmployee];
        toast.success('Employé ajouté avec succès');
      }
      
      onEmployeesChange(updatedEmployees);
      setFormOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Une erreur est survenue lors de la sauvegarde');
    }
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
    </>
  );
}
