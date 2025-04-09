
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>(null);

  const logConnection = async (userId: string, userName: string, eventType: string) => {
    try {
      const userAgent = navigator.userAgent;
      const ipAddress = '127.0.0.1'; // Placeholder - would be fetched server-side
      
      // Since we're not using Supabase, we'll just log to console
      console.log('Connection log:', {
        user_id: userId,
        user_name: userName,
        event_type: eventType,
        ip_address: ipAddress,
        user_agent: userAgent
      });
    } catch (error) {
      console.error('Failed to log connection:', error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser) {
          logConnection(
            parsedUser.employeeId || parsedUser.username, 
            parsedUser.username, 
            'session_restored'
          );
        }
      } catch (e) {
        console.error('Failed to parse stored user data:', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      if (username === 'admin' && password === 'admin123') {
        const adminUser = { username, role: 'admin' as UserRole };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        
        logConnection('admin', 'admin', 'login');
        
        toast.success('Connexion réussie en tant qu\'administrateur');
        return true;
      }
      
      // Get employees from localStorage instead of Supabase
      const employees = employeeService.getAll();
      
      // Find employee by username or uid
      const employee = employees.find(emp => 
        emp.name === username || emp.uid === username
      );
      
      if (employee) {
        // Use default password if not set
        const employeePassword = employee.password || 'employee123';
        
        if (password === employeePassword) {
          const userRole = employee.role || 'employee';
          const employeeUser = { 
            username, 
            role: userRole as UserRole,
            employeeId: employee.id 
          };
          setUser(employeeUser);
          localStorage.setItem('user', JSON.stringify(employeeUser));
          
          logConnection(employee.id, employee.name, 'login');
          
          toast.success(`Bienvenue, ${employee.name}`);
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
    if (user) {
      logConnection(user.employeeId || user.username, user.username, 'logout');
    }
    
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUserRoles = (employeeId: string, newRole: UserRole) => {
    const success = employeeService.updateRole(employeeId, newRole);
    
    if (success && user && user.employeeId === employeeId) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updatePassword = (employeeId: string, newPassword: string): boolean => {
    if (!newPassword || newPassword.length < 6) {
      return false;
    }

    try {
      // Find the employee in localStorage
      const employee = employeeService.getById(employeeId);
      
      if (!employee) {
        toast.error('Employé non trouvé');
        return false;
      }
      
      // Update the employee with the new password
      const updatedEmployee = {
        ...employee,
        password: newPassword
      };
      
      const success = employeeService.update(updatedEmployee);
      
      if (success) {
        toast.success('Mot de passe mis à jour avec succès');
        return true;
      } else {
        toast.error('Échec de la mise à jour du mot de passe');
        return false;
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Une erreur est survenue');
      return false;
    }
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
