
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Employee } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { employeeService } from '@/services/supabaseServices';

type User = {
  username: string;
  role: UserRole;
  employeeId?: string;
} | null;

interface AuthContextType {
  user: User;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  updateUserRoles: (employeeId: string, newRole: UserRole) => void;
  updatePassword: (employeeId: string, newPassword: string) => boolean;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>(null);

  // Load user data from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user data:', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Admin hardcoded credentials check
      if (username === 'admin' && password === 'admin123') {
        const adminUser = { username, role: 'admin' as UserRole };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        toast.success('Connexion réussie en tant qu\'administrateur');
        return true;
      }
      
      // Supabase employee check by UID/name
      const { data: employees, error } = await supabase
        .from('employes')
        .select('*')
        .or(`uid.eq.${username},nom.eq.${username}`);
        
      if (error) {
        console.error('Error fetching employee:', error);
        toast.error('Erreur lors de la vérification des identifiants');
        return false;
      }
      
      const employee = employees && employees.length > 0 ? employees[0] : null;
      
      if (employee) {
        if (employee.password && password === employee.password) {
          const userRole = employee.role || 'employee';
          const employeeUser = { 
            username, 
            role: userRole as UserRole,
            employeeId: employee.id 
          };
          setUser(employeeUser);
          localStorage.setItem('user', JSON.stringify(employeeUser));
          toast.success(`Bienvenue, ${employee.nom}${employee.prenom ? ' ' + employee.prenom : ''}`);
          return true;
        } else {
          toast.error('Mot de passe incorrect');
        }
      } else {
        toast.error('Utilisateur non trouvé');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Une erreur est survenue lors de la connexion');
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUserRoles = (employeeId: string, newRole: UserRole) => {
    employeeService.updateRole(employeeId, newRole)
      .then(success => {
        if (success && user && user.employeeId === employeeId) {
          const updatedUser = { ...user, role: newRole };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      })
      .catch(error => {
        console.error('Error updating user role:', error);
      });
  };

  const updatePassword = (employeeId: string, newPassword: string): boolean => {
    if (!newPassword || newPassword.length < 6) {
      return false;
    }

    employeeService.updatePassword(employeeId, newPassword)
      .then(success => {
        if (success) {
          toast.success('Mot de passe mis à jour avec succès');
        } else {
          toast.error('Échec de la mise à jour du mot de passe');
        }
        return success;
      })
      .catch(error => {
        console.error('Error updating password:', error);
        return false;
      });
    
    return true;
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    updateUserRoles,
    updatePassword
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
