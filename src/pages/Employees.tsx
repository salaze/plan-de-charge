
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { EmployeeList } from '@/components/employees/EmployeeList';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import { ConnectionErrorPanel } from '@/components/common/ConnectionErrorPanel';
import { ConnectionLostDialog } from '@/components/employees/ConnectionLostDialog';
import { DeleteEmployeeDialog } from '@/components/employees/DeleteEmployeeDialog';
import { useEmployeeLoader } from '@/hooks/employees/useEmployeeLoader';

const Employees = () => {
  const {
    employees,
    loading,
    connectionError,
    isConnected,
    loadEmployees,
    formOpen,
    setFormOpen,
    currentEmployee,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleAddEmployee,
    handleEditEmployee,
    handleDeleteEmployee,
    confirmDeleteEmployee,
    handleSaveEmployee
  } = useEmployeeLoader();

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Gestion des employés</h1>
        
        {connectionError ? (
          <ConnectionErrorPanel 
            errorMessage={connectionError} 
            onRetry={loadEmployees} 
          />
        ) : (
          <div className="glass-panel p-6 animate-scale-in">
            <EmployeeList 
              employees={employees}
              onAddEmployee={handleAddEmployee}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              loading={loading}
            />
          </div>
        )}
        
        <EmployeeForm 
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleSaveEmployee}
          employee={currentEmployee}
        />
        
        <DeleteEmployeeDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDeleteEmployee}
        />
        
        <ConnectionLostDialog 
          open={!isConnected && !loading} 
          onRetry={loadEmployees} 
        />
      </div>
    </Layout>
  );
};

export default Employees;
