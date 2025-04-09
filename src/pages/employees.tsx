
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Employee } from '@/types';
import { storageService } from '@/services/storage';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { EmployeeForm } from '@/components/employees/EmployeeForm';

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      try {
        const employees = await storageService.getEmployees();
        setEmployees(employees);
        setFilteredEmployees(employees);
      } catch (error) {
        console.error('Error loading employees:', error);
        toast.error('Erreur lors du chargement des employés');
      } finally {
        setLoading(false);
      }
    };
    
    loadEmployees();
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmployees(employees);
      return;
    }
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = employees.filter((employee) =>
      employee.name.toLowerCase().includes(lowerCaseQuery) ||
      employee.position?.toLowerCase().includes(lowerCaseQuery) ||
      employee.email?.toLowerCase().includes(lowerCaseQuery)
    );
    
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);
  
  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };
  
  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };
  
  const handleDeleteEmployee = async (id: string) => {
    try {
      const success = await storageService.deleteEmployee(id);
      if (success) {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        toast.success('Employé supprimé avec succès');
      } else {
        toast.error('Erreur lors de la suppression de l\'employé');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Erreur lors de la suppression de l\'employé');
    }
  };
  
  const handleSaveEmployee = async (employeeData: Employee) => {
    try {
      if (selectedEmployee) {
        // Update existing employee
        const updatedEmployee = await storageService.updateEmployee(employeeData);
        setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
        toast.success('Employé mis à jour avec succès');
      } else {
        // Add new employee
        const newEmployee = await storageService.addEmployee(employeeData);
        setEmployees(prev => [...prev, newEmployee]);
        toast.success('Employé ajouté avec succès');
      }
      
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Erreur lors de l\'enregistrement de l\'employé');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion des employés</h1>
          <p className="text-muted-foreground">Gérez la liste des employés</p>
        </div>
        <Button onClick={handleAddEmployee} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un employé
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employés</CardTitle>
          <CardDescription>Liste de tous les employés enregistrés</CardDescription>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher un employé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                {searchQuery ? 'Aucun employé ne correspond à votre recherche' : 'Aucun employé enregistré'}
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery('')} 
                  className="mt-2"
                >
                  Effacer la recherche
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email || '-'}</TableCell>
                    <TableCell>{employee.position || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        employee.role === 'admin' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {employee.role === 'admin' ? 'Admin' : 'Employé'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action supprimera définitivement l'employé {employee.name} et toutes ses données de planning.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteEmployee(employee.id)}
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Employee Form Modal */}
      <EmployeeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        employee={selectedEmployee}
        onSave={handleSaveEmployee}
      />
    </div>
  );
}
