
import React, { useState } from 'react';
import { Employee } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Lock, Key } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordManagerProps {
  employee: Employee;
  onSuccess?: () => void;
}

export function PasswordManager({ employee, onSuccess }: PasswordManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { updatePassword } = useAuth();

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleUpdatePassword = () => {
    // Validation
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    // Update password
    const success = updatePassword(employee.id, password);
    if (success) {
      toast.success(`Mot de passe mis à jour pour ${employee.name}`);
      handleCloseDialog();
      if (onSuccess) onSuccess();
    } else {
      setError('Erreur lors de la mise à jour du mot de passe');
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex gap-1"
        onClick={handleOpenDialog}
      >
        <Key className="h-4 w-4" />
        {employee.password ? 'Modifier mot de passe' : 'Définir mot de passe'}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {employee.password 
                ? `Modifier le mot de passe de ${employee.name}` 
                : `Définir un mot de passe pour ${employee.name}`
              }
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez le mot de passe"
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}

            {!employee.password && (
              <p className="text-sm text-muted-foreground">
                Note: Si aucun mot de passe n'est défini, l'employé utilisera le mot de passe par défaut "employee123".
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button onClick={handleUpdatePassword}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
