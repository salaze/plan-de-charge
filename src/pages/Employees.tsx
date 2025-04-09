
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
import { employeeService } from '@/services/supabaseServices';

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formOpen, setFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string>('');
  
  // Charger les employés depuis Supabase
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching employees...');
        const data = await employeeService.getAll();
        console.log('Employees fetched:', data);
        setEmployees(data);
      } catch (error) {
        console.error('Erreur lors du chargement des employés:', error);
        toast.error('Erreur lors du chargement des employés');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployees();
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
  
  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    try {
      console.log('Deleting employee with ID:', employeeToDelete);
      const success = await employeeService.delete(employeeToDelete);
      
      if (success) {
        // Mettre à jour l'état local
        const updatedEmployees = employees.filter(emp => emp.id !== employeeToDelete);
        setEmployees(updatedEmployees);
        toast.success('Employé supprimé avec succès');
      } else {
        toast.error('Erreur lors de la suppression de l\'employé');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setDeleteDialogOpen(false);
      setEmployeeToDelete('');
    }
  };
  
  const handleSaveEmployee = async (employee: Employee) => {
    try {
      if (employee.id) {
        console.log('Updating employee:', employee);
        // Mettre à jour un employé existant
        const updatedEmployee = await employeeService.update(employee);
        
        if (updatedEmployee) {
          setEmployees(prev => prev.map(emp => 
            emp.id === employee.id ? updatedEmployee : emp
          ));
          setFormOpen(false);
          toast.success('Employé modifié avec succès');
        } else {
          toast.error('Erreur lors de la modification de l\'employé');
        }
      } else {
        console.log('Creating new employee:', employee);
        // Ajouter un nouvel employé
        const newEmployee = await employeeService.create(employee);
        
        if (newEmployee) {
          console.log('Employee created successfully:', newEmployee);
          setEmployees(prev => [...prev, newEmployee]);
          setFormOpen(false);
          toast.success('Employé ajouté avec succès');
        } else {
          toast.error('Erreur lors de l\'ajout de l\'employé');
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[80vh]">
          <p>Chargement des employés...</p>
        </div>
      </Layout>
    );
  }
  
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
