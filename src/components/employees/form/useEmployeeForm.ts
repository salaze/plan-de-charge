
import { useState, useEffect } from 'react';
import { Employee } from '@/types';
import { generateId } from '@/utils';

interface UseEmployeeFormProps {
  employee?: Employee;
  open: boolean;
}

export function useEmployeeForm({ employee, open }: UseEmployeeFormProps) {
  const [name, setName] = useState(employee?.name || '');
  const [uid, setUid] = useState(employee?.uid || '');
  const [email, setEmail] = useState(employee?.email || '');
  const [position, setPosition] = useState(employee?.position || '');
  const [department, setDepartment] = useState(employee?.department || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [uidError, setUidError] = useState('');
  const isNewEmployee = !employee?.id;
  
  const validatePassword = () => {
    if (isNewEmployee || password) {
      if (password.length < 6) {
        setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
        return false;
      }
      
      if (password !== confirmPassword) {
        setPasswordError('Les mots de passe ne correspondent pas');
        return false;
      }
    }
    
    setPasswordError('');
    return true;
  };
  
  const validateUid = () => {
    if (!uid.trim()) {
      setUidError('L\'UID est obligatoire');
      return false;
    }
    
    setUidError('');
    return true;
  };
  
  const resetForm = () => {
    setName(employee?.name || '');
    setUid(employee?.uid || '');
    setEmail(employee?.email || '');
    setPosition(employee?.position || '');
    setDepartment(employee?.department || '');
    setPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setUidError('');
  };
  
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, employee]);
  
  const prepareEmployeeData = (): Employee | null => {
    if (!name.trim()) return null;
    
    // Validate UID
    if (!validateUid()) {
      return null;
    }
    
    // Vérifier le mot de passe uniquement si c'est un nouvel employé ou si on a mis un mot de passe
    if ((isNewEmployee || password) && !validatePassword()) {
      return null;
    }
    
    // Créer un nouvel ID si c'est un nouvel employé
    const id = isNewEmployee ? generateId() : employee?.id;
    
    const updatedEmployee: Employee = {
      id: id || '',
      name: name.trim(),
      uid: uid.trim(),
      email: email.trim() || undefined,
      position: position.trim() || undefined,
      department: department.trim() || undefined,
      role: employee?.role || 'employee',
      schedule: employee?.schedule || []
    };
    
    return updatedEmployee;
  };
  
  return {
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
  };
}
