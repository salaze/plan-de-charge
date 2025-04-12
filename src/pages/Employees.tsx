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
import { generateId } from '@/utils';
import { useSupabaseEmployees } from '@/hooks/useSupabaseEmployees';

const Employees = () => {
  const { employees: supabaseEmployees, loading, error, addEmployee, updateEmployee, deleteEmployee } = useSupabaseEmployees();
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  const [formOpen, setFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string>('');
  
  useEffect(() => {
    if (!loading) {
      const convertedEmployees = supabaseEmployees.map(emp => ({
        id: emp.id,
        name: emp.prenom ? `${emp.prenom} ${emp.nom}` : emp.nom,
        department: emp.departement || undefined,
        position: emp.fonction || undefined,
        uid: emp.identifiant || emp.uid || undefined,  // Using either identifiant or uid
        role: emp.role as any || 'employee',
        schedule: []
      }));
      
      setEmployees(convertedEmployees);
    }
  }, [supabaseEmployees, loading]);
  
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
      await deleteEmployee(employeeToDelete);
      setEmployees(prev => prev.filter(emp => emp.id !== employeeToDelete));
      toast.success('Employé supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'employé:', error);
      toast.error('Impossible de supprimer l\'employé');
    }
    
    setDeleteDialogOpen(false);
    setEmployeeToDelete('');
  };
  
  const handleSaveEmployee = async (employee: Employee) => {
    try {
      if (employee.id) {
        await updateEmployee(employee.id, employee);
        setEmployees(prev => prev.map(emp => emp.id === employee.id ? employee : emp));
        toast.success('Employé modifié avec succès');
      } else {
        const newEmployee = {
          ...employee,
          id: generateId(),
          schedule: []
        };
        
        const result = await addEmployee(newEmployee);
        
        const savedEmployee = {
          id: result.id,
          name: result.prenom ? `${result.prenom} ${result.nom}` : result.nom,
          uid: result.identifiant || result.uid || '',  // Using either identifiant or uid
          position: result.fonction || undefined,
          department: result.departement || undefined,
          role: result.role as any || 'employee',
          schedule: []
        };
        
        setEmployees(prev => [...prev, savedEmployee]);
        toast.success('Employé ajouté avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'employé:', error);
      toast.error('Impossible de sauvegarder l\'employé');
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Gestion des employés</h1>
        
        <div className="glass-panel p-6 animate-scale-in">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Chargement des employés...</span>
            </div>
          ) : (
            <EmployeeList 
              employees={employees}
              onAddEmployee={handleAddEmployee}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}
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
