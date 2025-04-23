
import React from "react";
import { Employee } from "@/types";
import { EmployeeList } from "@/components/employees/EmployeeList";

interface EmployeeTableProps {
  employees: Employee[];
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
}

export function EmployeeTable({
  employees,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
}: EmployeeTableProps) {
  return (
    <div className="glass-panel p-6 animate-scale-in">
      <EmployeeList
        employees={employees}
        onAddEmployee={onAddEmployee}
        onEditEmployee={onEditEmployee}
        onDeleteEmployee={onDeleteEmployee}
      />
    </div>
  );
}
