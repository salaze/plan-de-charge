
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Employee } from '@/types';
import { Mail, Building, Briefcase, Key } from 'lucide-react';

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
  const [name, setName] = useState(employee?.name || '');
  const [email, setEmail] = useState(employee?.email || '');
  const [position, setPosition] = useState(employee?.position || '');
  const [department, setDepartment] = useState(employee?.department || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    // Vérifier le mot de passe uniquement si c'est un nouvel employé ou si on a mis un mot de passe
    if ((isNewEmployee || password) && !validatePassword()) {
      return;
    }
    
    const updatedEmployee: Employee = {
      id: employee?.id || '',
      name: name.trim(),
      email: email.trim() || undefined,
      position: position.trim() || undefined,
      department: department.trim() || undefined,
      password: password || employee?.password,
      schedule: employee?.schedule || []
    };
    
    onSave(updatedEmployee);
    onClose();
  };
  
  const resetForm = () => {
    setName(employee?.name || '');
    setEmail(employee?.email || '');
    setPosition(employee?.position || '');
    setDepartment(employee?.department || '');
    setPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };
  
  React.useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, employee]);
  
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
          <div className="grid gap-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de l'employé"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2 relative">
              <Mail className="h-4 w-4 absolute left-3 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email de l'employé"
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="position">Poste</Label>
            <div className="flex items-center gap-2 relative">
              <Briefcase className="h-4 w-4 absolute left-3 text-muted-foreground" />
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Poste de l'employé"
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="department">Département</Label>
            <div className="flex items-center gap-2 relative">
              <Building className="h-4 w-4 absolute left-3 text-muted-foreground" />
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Département de l'employé"
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="password">
              {isNewEmployee ? 'Mot de passe *' : 'Nouveau mot de passe (optionnel)'}
            </Label>
            <div className="flex items-center gap-2 relative">
              <Key className="h-4 w-4 absolute left-3 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isNewEmployee ? "Minimum 6 caractères" : "Laisser vide pour conserver l'actuel"}
                className="pl-10"
                required={isNewEmployee}
              />
            </div>
          </div>
          
          {(isNewEmployee || password) && (
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                required={isNewEmployee || !!password}
              />
            </div>
          )}
          
          {passwordError && (
            <p className="text-sm font-medium text-destructive">{passwordError}</p>
          )}
          
          {!isNewEmployee && !password && (
            <p className="text-sm text-muted-foreground">
              Laissez le champ du mot de passe vide pour conserver le mot de passe actuel.
            </p>
          )}
          
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
