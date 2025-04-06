import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
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
import { Employee } from '@/types';
import { employeeService } from '@/services/jsonStorage';

const Employees = () => {
  // Récupérer les employés du service JSON
  const [employees, setEmployees] = useState<Employee[]>(() => {
    return employeeService.getAll();
  });
  
  const [formOpen, setFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string>('');
  
  // Rafraîchir la liste quand nécessaire
  useEffect(() => {
    setEmployees(employeeService.getAll());
  }, []);
  
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
  
  const confirmDeleteEmployee = () => {
    if (!employeeToDelete) return;
    
    // Supprimer via le service
    const success = employeeService.delete(employeeToDelete);
    
    if (success) {
      // Mise à jour locale après suppression réussie
      const updatedEmployees = employees.filter(emp => emp.id !== employeeToDelete);
      setEmployees(updatedEmployees);
      
      toast.success('Employé supprimé avec succès');
    } else {
      toast.error('Erreur lors de la suppression de l\'employé');
    }
    
    setDeleteDialogOpen(false);
    setEmployeeToDelete('');
  };
  
  const handleSaveEmployee = (employee: Employee) => {
    if (employee.id) {
      // Mise à jour via le service
      const updatedEmployee = employeeService.update(employee);
      
      // Mettre à jour la liste locale
      const updatedEmployees = employees.map(emp => 
        emp.id === employee.id ? updatedEmployee : emp
      );
      
      setEmployees(updatedEmployees);
      toast.success('Employé modifié avec succès');
    } else {
      // Créer via le service (le service génère l'ID)
      const newEmployee = employeeService.create(employee);
      
      // Ajouter à la liste locale
      setEmployees(prev => [...prev, newEmployee]);
      toast.success('Employé ajouté avec succès');
    }
    
    setFormOpen(false);
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Gestion des employés</h1>
        
        <div className="glass-panel p-6 animate-scale-in">
          <EmployeeList 
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        </div>
        
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
      </div>
    </Layout>
  );
};

export default Employees;
