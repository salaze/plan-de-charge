
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, NavigateFunction } from 'react-router-dom';
import { UserRole, Employee } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Split implementation into a context component that doesn't use router hooks
const AuthProviderImpl: React.FC<{ 
  children: React.ReactNode; 
  navigate: NavigateFunction;
}> = ({ children, navigate }) => {
  const [user, setUser] = useState<User>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Tentative de connexion pour:', username);
      
      // Admin hardcoded login
      if (username === 'admin' && password === 'admin123') {
        const adminUser = { username, role: 'admin' as UserRole };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        toast.success('Connexion réussie en tant qu\'administrateur');
        return true;
      }
      
      // Try to find the employee in Supabase by UID (username) or name
      const { data: employees, error } = await supabase
        .from('employes')
        .select('*')
        .or(`uid.eq.${username},nom.eq.${username},identifiant.eq.${username}`);
      
      if (error) {
        console.error('Erreur lors de la recherche de l\'employé:', error);
        toast.error('Erreur de connexion à la base de données');
        return false;
      }
      
      console.log('Employés trouvés:', employees);
      
      if (employees && employees.length > 0) {
        const employee = employees[0];
        
        // Check if the employee has a password
        if (employee.password && password === employee.password) {
          // If employee has a role of 'admin' or 'administrateur', grant admin privileges
          const userRole = (employee.role === 'admin' || employee.role === 'administrateur') 
            ? 'admin' as UserRole 
            : 'employee' as UserRole;
            
          const employeeUser = { 
            username: employee.nom, 
            role: userRole,
            employeeId: employee.id 
          };
          
          setUser(employeeUser);
          localStorage.setItem('user', JSON.stringify(employeeUser));
          toast.success(`Bienvenue, ${employee.nom}`);
          return true;
        } else {
          toast.error('Mot de passe incorrect');
        }
      } else {
        toast.error('Utilisateur non trouvé');
      }
      
      return false;
    } catch (error) {
      console.error('Erreur durant le processus de connexion:', error);
      toast.error('Erreur de connexion');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    
    // Ne pas supprimer les données de planning lors de la déconnexion
    // Cela permet de conserver les statuts même après déconnexion
    
    navigate('/login');
  };

  const updateUserRoles = async (employeeId: string, newRole: UserRole) => {
    try {
      // Mettre à jour le rôle dans Supabase
      const { error } = await supabase
        .from('employes')
        .update({ role: newRole })
        .eq('id', employeeId);
        
      if (error) throw error;
      
      // Mettre à jour localement si c'est l'utilisateur courant
      if (user && user.employeeId === employeeId) {
        const updatedUser = { ...user, role: newRole };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        if (newRole !== 'admin') {
          navigate('/');
        }
      }
      
      toast.success("Rôle mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rôle:", error);
      toast.error("Erreur lors de la mise à jour du rôle");
    }
  };

  const updatePassword = async (employeeId: string, newPassword: string): Promise<boolean> => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    try {
      const { error } = await supabase
        .from('employes')
        .update({ password: newPassword })
        .eq('id', employeeId);
        
      if (error) throw error;
      
      toast.success("Mot de passe mis à jour avec succès");
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
      toast.error("Erreur lors de la mise à jour du mot de passe");
      return false;
    }
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

// Wrapper component that safely uses router hooks
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the navigate function from the router context
  const navigate = useNavigate();
  
  // This ensures useNavigate is only called inside a Router context
  return <AuthProviderImpl navigate={navigate}>{children}</AuthProviderImpl>;
};
