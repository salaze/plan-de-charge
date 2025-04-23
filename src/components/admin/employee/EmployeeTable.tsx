
import React from "react";
import { Employee } from "@/types";
import { EmployeeList } from "@/components/employees/EmployeeList";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface EmployeeTableProps {
  employees: Employee[];
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  error?: string | null;
  loading?: boolean;
}

export function EmployeeTable({
  employees,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  error,
  loading = false
}: EmployeeTableProps) {
  return (
    <div className="glass-panel p-6 animate-scale-in">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <EmployeeList
        employees={employees}
        onAddEmployee={onAddEmployee}
        onEditEmployee={onEditEmployee}
        onDeleteEmployee={onDeleteEmployee}
        loading={loading}
      />
    </div>
  );
}
