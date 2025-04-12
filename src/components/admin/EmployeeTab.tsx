
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Employee } from '@/types';
import { EmployeeList } from '@/components/employees/EmployeeList';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import { DeleteEmployeeDialog } from './employees/DeleteEmployeeDialog';
import { DeleteAllEmployeesDialog } from './employees/DeleteAllEmployeesDialog';
import { EmployeeTabHeader } from './employees/EmployeeTabHeader';
import { useEmployeeManagement } from '@/hooks/useEmployeeManagement';

interface EmployeeTabProps {
  employees: Employee[];
  onEmployeesChange: (employees: Employee[]) => void;
}

export function EmployeeTab({ employees, onEmployeesChange }: EmployeeTabProps) {
  const {
    formOpen,
    currentEmployee,
    deleteDialogOpen,
    deleteAllDialogOpen,
    handleAddEmployee,
    handleEditEmployee,
    handleDeleteEmployee,
    handleDeleteAllEmployees,
    confirmDeleteAllEmployees,
    confirmDeleteEmployee,
    handleSaveEmployee,
    setFormOpen,
    setDeleteDialogOpen,
    setDeleteAllDialogOpen
  } = useEmployeeManagement(employees, onEmployeesChange);
  
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
            <EmployeeTabHeader onDeleteAllEmployees={handleDeleteAllEmployees} />
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
      
      <DeleteEmployeeDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={confirmDeleteEmployee}
      />
      
      <DeleteAllEmployeesDialog
        open={deleteAllDialogOpen}
        onOpenChange={setDeleteAllDialogOpen}
        onConfirmDelete={confirmDeleteAllEmployees}
      />
    </>
  );
}
