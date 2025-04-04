
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Key } from 'lucide-react';

interface EmployeePasswordFieldsProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  isNewEmployee: boolean;
  error?: string;
}

export function EmployeePasswordFields({ 
  password, 
  confirmPassword, 
  onPasswordChange, 
  onConfirmPasswordChange, 
  isNewEmployee,
  error
}: EmployeePasswordFieldsProps) {
  return (
    <>
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
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder={isNewEmployee ? "Minimum 6 caractères" : "Laisser vide pour conserver l'actuel"}
            className="pl-10"
            required={isNewEmployee}
            minLength={6}
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
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="Confirmer le mot de passe"
            required={isNewEmployee || !!password}
            minLength={6}
          />
        </div>
      )}
      
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
      
      {!isNewEmployee && !password && (
        <p className="text-sm text-muted-foreground">
          Laissez le champ du mot de passe vide pour conserver le mot de passe actuel.
        </p>
      )}
    </>
  );
}
