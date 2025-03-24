
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Employee } from '@/types';
import { Mail } from 'lucide-react';

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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    onSave({
      id: employee?.id || '',
      name: name.trim(),
      email: email.trim() || undefined,
      position: position.trim() || undefined,
      department: department.trim() || undefined,
      schedule: employee?.schedule || []
    });
    
    onClose();
  };
  
  const resetForm = () => {
    setName(employee?.name || '');
    setEmail(employee?.email || '');
    setPosition(employee?.position || '');
    setDepartment(employee?.department || '');
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
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Poste de l'employé"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="department">Département</Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Département de l'employé"
            />
          </div>
          
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
