
import React, { useState, useEffect, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/types';
import { employeeService } from '@/services/supabase';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { Search, SortAsc } from 'lucide-react';

type SortOption = 'name' | 'position' | 'department';
type SortDirection = 'asc' | 'desc';

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const [formOpen, setFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string>('');
  
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
  
  useEffect(() => {
    fetchEmployees();
  }, []);
  
  // Set up real-time updates
  useRealtimeUpdates({
    tables: ['employes'],
    onDataChange: fetchEmployees,
    showToasts: true
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
      console.log('Deleting employee with ID:', employeeToDelete);
      const success = await employeeService.delete(employeeToDelete);
      
      if (success) {
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

  const toggleSortDirection = () => {
    setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
  };

  const filteredAndSortedEmployees = useMemo(() => {
    // Filter employees based on search term
    const filtered = employees.filter(employee => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        employee.name.toLowerCase().includes(searchTermLower) ||
        (employee.position?.toLowerCase().includes(searchTermLower) || false) ||
        (employee.department?.toLowerCase().includes(searchTermLower) || false) ||
        (employee.uid?.toLowerCase().includes(searchTermLower) || false)
      );
    });

    // Sort employees
    return filtered.sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [employees, searchTerm, sortBy, sortDirection]);
  
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
          {/* Barre de recherche et options de tri */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="position">Fonction</SelectItem>
                  <SelectItem value="department">Département</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={toggleSortDirection}
                className="px-3 py-2 border rounded-md hover:bg-accent flex items-center justify-center"
                aria-label={sortDirection === 'asc' ? 'Trier par ordre décroissant' : 'Trier par ordre croissant'}
              >
                <SortAsc className={`h-5 w-5 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
              </button>
            </div>
          </div>

          <EmployeeList 
            employees={filteredAndSortedEmployees}
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
