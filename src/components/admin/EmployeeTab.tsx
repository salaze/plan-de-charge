
import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Employee } from "@/types";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { generateId } from "@/utils";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { saveEmployee, deleteEmployee } from "@/utils/supabase/employees";
import { EmployeeTable } from "./employee/EmployeeTable";
import { DeleteEmployeeDialog } from "./employee/DeleteEmployeeDialog";

interface EmployeeTabProps {
  employees: Employee[];
  onEmployeesChange: (employees: Employee[]) => void;
}

export function EmployeeTab({ employees, onEmployeesChange }: EmployeeTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useRealtimeSync(true, () => {
    // Actualiser les données des employés après un changement
    // Cette fonction sera appelée quand des changements sont détectés
    console.log("Changement détecté dans les données, actualisation...");
  });

  const handleAddEmployee = () => {
    setError(null);
    setCurrentEmployee(undefined);
    setFormOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setError(null);
    setCurrentEmployee(employee);
    setFormOpen(true);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setError(null);
    setEmployeeToDelete(employeeId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    setLoading(true);
    setError(null);
    
    try {
      const success = await deleteEmployee(employeeToDelete);
      if (success) {
        const updatedEmployees = employees.filter(emp => emp.id !== employeeToDelete);
        onEmployeesChange(updatedEmployees);
        toast.success("Employé supprimé avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setError("Une erreur est survenue lors de la suppression");
    } finally {
      setDeleteDialogOpen(false);
      setEmployeeToDelete("");
      setLoading(false);
    }
  };

  const handleSaveEmployee = async (employee: Employee) => {
    setLoading(true);
    setError(null);
    
    try {
      let updatedEmployees: Employee[];
      let newEmployee = employee;

      // Vérifier si l'ID est déjà défini
      if (!employee.id) {
        const employeeId = generateId();
        console.log("Nouvel ID généré:", employeeId);
        newEmployee = {
          ...employee,
          id: employeeId,
          schedule: [],
        };
      }

      const success = await saveEmployee(newEmployee);

      if (success) {
        if (employee.id) {
          updatedEmployees = employees.map(emp =>
            emp.id === employee.id ? newEmployee : emp
          );
          toast.success("Employé modifié avec succès");
        } else {
          updatedEmployees = [...employees, newEmployee];
          toast.success("Employé ajouté avec succès");
        }
        onEmployeesChange(updatedEmployees);
        setFormOpen(false);
      }
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      setError(`Erreur lors de la sauvegarde: ${error.message || "Erreur inconnue"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestion des employés</CardTitle>
          <CardDescription>Ajouter, modifier ou supprimer des employés</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeTable
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            error={error}
            loading={loading}
          />
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
        onConfirm={confirmDeleteEmployee}
      />
    </>
  );
}
