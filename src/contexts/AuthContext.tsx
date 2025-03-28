
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole, Employee } from '@/types';
import { toast } from 'sonner';

type User = {
  username: string;
  role: UserRole;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const navigate = useNavigate();
  
  // Check local storage for existing session on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Vérifier si l'utilisateur existe dans les employés avec son rôle défini
    const planningData = localStorage.getItem('planningData');
    if (planningData) {
      const data = JSON.parse(planningData);
      const employees: Employee[] = data.employees || [];
      
      // Admin par défaut
      if (username === 'admin' && password === 'admin123') {
        const adminUser = { username, role: 'admin' as UserRole };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        return true;
      }
      
      // Vérifier si l'employé existe
      const employee = employees.find(emp => emp.email === username);
      if (employee) {
        // Vérifier le mot de passe de l'employé s'il existe, sinon utiliser celui par défaut
        const correctPassword = employee.password || 'employee123';
        if (password === correctPassword) {
          const userRole = employee.role || 'employee';
          const employeeUser = { username, role: userRole as UserRole };
          setUser(employeeUser);
          localStorage.setItem('user', JSON.stringify(employeeUser));
          return true;
        }
      }
    } else {
      // Fallback pour les utilisateurs par défaut si aucune donnée n'est trouvée
      if (username === 'admin' && password === 'admin123') {
        const adminUser = { username, role: 'admin' as UserRole };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        return true;
      } else if (username === 'employee' && password === 'employee123') {
        const employeeUser = { username, role: 'employee' as UserRole };
        setUser(employeeUser);
        localStorage.setItem('user', JSON.stringify(employeeUser));
        return true;
      }
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const updateUserRoles = (employeeId: string, newRole: UserRole) => {
    // Mise à jour du rôle de l'employé dans le localStorage
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
      
      // Mettre à jour les données dans le localStorage
      localStorage.setItem('planningData', JSON.stringify({
        ...data,
        employees: updatedEmployees
      }));
      
      // Si l'utilisateur actuellement connecté a son rôle modifié, mettre à jour la session
      if (user && user.username) {
        const updatedEmployee = updatedEmployees.find(emp => emp.email === user.username);
        if (updatedEmployee && updatedEmployee.role !== user.role) {
          const updatedUser = { ...user, role: updatedEmployee.role };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Si l'utilisateur n'est plus admin, rediriger vers la page principale
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
      
      // Mettre à jour les données dans le localStorage
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
