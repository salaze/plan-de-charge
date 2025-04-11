
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create a separate component that will use the useNavigate hook
const AuthProviderWithNavigate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
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
    
    // Ne pas supprimer les données de planning lors de la déconnexion
    // Cela permet de conserver les statuts même après déconnexion
    
    navigate('/login');
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
      
      if (user && user.username) {
        const updatedEmployee = updatedEmployees.find(emp => emp.name === user.username);
        if (updatedEmployee && updatedEmployee.role !== user.role) {
          const updatedUser = { ...user, role: updatedEmployee.role };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          if (updatedUser.role !== 'admin') {
            navigate('/');
          }
        }
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

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    updateUserRoles,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export a wrapper component that doesn't use hooks directly
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthProviderWithNavigate>{children}</AuthProviderWithNavigate>;
};
