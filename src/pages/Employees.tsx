import React, { useState } from 'react';
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
import { createEmptyEmployee, generateId } from '@/utils';

const Employees = () => {
  // Récupérer les employés du localStorage
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const savedData = localStorage.getItem('planningData');
    return savedData ? JSON.parse(savedData).employees : [];
  });
  
  const [formOpen, setFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string>('');
  
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
    
    const updatedEmployees = employees.filter(emp => emp.id !== employeeToDelete);
    setEmployees(updatedEmployees);
    
    // Mettre à jour le localStorage
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      const data = JSON.parse(savedData);
      data.employees = updatedEmployees;
      localStorage.setItem('planningData', JSON.stringify(data));
    }
    
    toast.success('Employé supprimé avec succès');
    setDeleteDialogOpen(false);
    setEmployeeToDelete('');
  };
  
  const handleSaveEmployee = (employee: Employee) => {
    let updatedEmployees: Employee[];
    
    if (employee.id) {
      // Mettre à jour un employé existant
      updatedEmployees = employees.map(emp => 
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
    
    setEmployees(updatedEmployees);
    
    // Mettre à jour le localStorage
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      const data = JSON.parse(savedData);
      data.employees = updatedEmployees;
      localStorage.setItem('planningData', JSON.stringify(data));
    }
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
