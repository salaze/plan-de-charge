
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, Employee } from '@/types';
import { toast } from 'sonner';

type User = {
  username: string;
  role: UserRole;
  employeeId?: string;
} | null;

interface AuthContextType {
  user: User;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  updateUserRoles: (employeeId: string, newRole: UserRole) => void;
  updatePassword: (employeeId: string, newPassword: string) => boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
  updateUserRoles: () => {},
  updatePassword: () => false
});

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Define AuthProvider as a React functional component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
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

  const login = (username: string, password: string): boolean => {
    const planningData = localStorage.getItem('planningData');
    if (planningData) {
      const data = JSON.parse(planningData);
      const employees: Employee[] = data.employees || [];
      
      if (username === 'admin' && password === 'admin123') {
        const adminUser = { username, role: 'admin' as UserRole };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        toast.success('Connexion réussie en tant qu\'administrateur');
        return true;
      }
      
      const employee = employees.find(emp => emp.name === username);
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
          toast.success(`Bienvenue, ${employee.name}`);
          return true;
        } else {
          toast.error('Mot de passe incorrect');
        }
      } else {
        toast.error('Utilisateur non trouvé');
      }
    } else {
      if (username === 'admin' && password === 'admin123') {
        const adminUser = { username, role: 'admin' as UserRole };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        toast.success('Connexion réussie en tant qu\'administrateur');
        return true;
      } else {
        toast.error('Identifiants incorrects');
      }
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUserRoles = (employeeId: string, newRole: UserRole) => {
    const planningData = localStorage.getItem('planningData');
    if (planningData) {
      const data = JSON.parse(planningData);
      const employees: Employee[] = data.employees || [];
      
      const updatedEmployees = employees.map(emp => {
        if (emp.id === employeeId) {
          return { ...emp, role: newRole };
        }
        return emp;
      });
      
      localStorage.setItem('planningData', JSON.stringify({
        ...data,
        employees: updatedEmployees
      }));
      
      if (user && user.employeeId === employeeId) {
        const updatedUser = { ...user, role: newRole };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
  };

  const updatePassword = (employeeId: string, newPassword: string): boolean => {
    if (!newPassword || newPassword.length < 6) {
      return false;
    }

    const planningData = localStorage.getItem('planningData');
    if (planningData) {
      const data = JSON.parse(planningData);
      const employees: Employee[] = data.employees || [];
      
      const updatedEmployees = employees.map(emp => {
        if (emp.id === employeeId) {
          return { ...emp, password: newPassword };
        }
        return emp;
      });
      
      localStorage.setItem('planningData', JSON.stringify({
        ...data,
        employees: updatedEmployees
      }));
      
      return true;
    }
    
    return false;
  };

  const contextValue = {
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
};
