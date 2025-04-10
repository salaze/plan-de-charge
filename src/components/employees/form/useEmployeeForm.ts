
import { useState, useEffect } from 'react';
import { Employee, Department } from '@/types';
import { toast } from '@/hooks/toast';

export interface UseEmployeeFormProps {
  employee?: Employee;
  onSave: (employee: Employee) => void;
  open: boolean;
}

export const useEmployeeForm = ({ employee, onSave, open }: UseEmployeeFormProps) => {
  const [name, setName] = useState(employee?.name || '');
  const [uid, setUid] = useState(employee?.uid || '');
  const [email, setEmail] = useState(employee?.email || '');
  const [position, setPosition] = useState(employee?.position || '');
  const [department, setDepartment] = useState(employee?.departmentId || '');
  const [role, setRole] = useState(employee?.role || 'employee');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [uidError, setUidError] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);

  // Reset the form when the employee changes or when the modal is opened/closed
  useEffect(() => {
    if (open) {
      setName(employee?.name || '');
      setUid(employee?.uid || '');
      setEmail(employee?.email || '');
      setPosition(employee?.position || '');
      setDepartment(employee?.departmentId || '');
      setRole(employee?.role || 'employee');
      setPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setUidError('');
    }
  }, [employee, open]);

  // Load departments
  useEffect(() => {
    // In a real app, fetch departments from API or database
    // For now, using mock data
    setDepartments([
      { id: "dept1", name: "IT" },
      { id: "dept2", name: "HR" },
      { id: "dept3", name: "Finance" },
      { id: "dept4", name: "Marketing" }
    ]);
  }, []);

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
  };

  const handleRoleChange = (value: string) => {
    setRole(value as 'admin' | 'employee');
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate password
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setPasswordError("Les mots de passe ne correspondent pas");
        isValid = false;
      } else {
        setPasswordError("");
      }
    }

    // Validate name
    if (!name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom est obligatoire",
        variant: "destructive"
      });
      isValid = false;
    }

    return isValid;
  };

  const prepareEmployeeData = (): Employee => {
    const updatedEmployee: Employee = {
      id: employee?.id || '',
      name,
      uid,
      email,
      position,
      departmentId: department,
      role: role as 'admin' | 'employee',
      schedule: employee?.schedule || [],
    };

    if (password) {
      updatedEmployee.password = password;
    }

    return updatedEmployee;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const employeeData = prepareEmployeeData();
    onSave(employeeData);
  };

  return {
    name,
    setName,
    uid,
    setUid,
    position,
    setPosition,
    department,
    setDepartment,
    role,
    setRole,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    setPasswordError,
    uidError,
    isNewEmployee: !employee?.id,
    departments,
    handleDepartmentChange,
    handleRoleChange,
    handleSubmit,
    validateForm,
    prepareEmployeeData
  };
};
