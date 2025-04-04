
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Employee } from '@/types';

// Import our new components
import { EmployeeNameField } from './form/EmployeeNameField';
import { EmployeeUidField } from './form/EmployeeUidField';
import { EmployeeContactField } from './form/EmployeeContactField';
import { EmployeeJobField } from './form/EmployeeJobField';
import { EmployeePasswordFields } from './form/EmployeePasswordFields';
import { useEmployeeForm } from './form/useEmployeeForm';

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employee?: Employee;
}

export function EmployeeForm({ 
  open, 
  onClose, 
  onSave, 
  employee 
}: EmployeeFormProps) {
  const {
    name,
    uid,
    email,
    position,
    department,
    password,
    confirmPassword,
    passwordError,
    uidError,
    isNewEmployee,
    setName,
    setUid,
    setEmail,
    setPosition,
    setDepartment,
    setPassword,
    setConfirmPassword,
    prepareEmployeeData
  } = useEmployeeForm({ employee, open });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedEmployee = prepareEmployeeData();
    if (updatedEmployee) {
      onSave(updatedEmployee);
      onClose();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {employee ? 'Modifier un employé' : 'Ajouter un employé'}
          </DialogTitle>
          <DialogDescription>
            {employee ? 'Modifiez les informations de l\'employé' : 'Remplissez les informations du nouvel employé'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <EmployeeNameField 
            name={name} 
            onChange={setName} 
          />
          
          <EmployeeUidField 
            uid={uid} 
            onChange={setUid} 
            error={uidError} 
          />

          <EmployeeContactField 
            email={email} 
            onChange={setEmail} 
          />
          
          <EmployeeJobField 
            position={position} 
            department={department} 
            onPositionChange={setPosition} 
            onDepartmentChange={setDepartment} 
          />
          
          <EmployeePasswordFields 
            password={password}
            confirmPassword={confirmPassword}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            isNewEmployee={isNewEmployee}
            error={passwordError}
          />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
