
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User } from '@/types';
import { storageService } from '@/services/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await storageService.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Admin login
      if (username === 'admin' && password === 'admin123') {
        const adminUser = {
          id: 'admin',
          name: 'Administrateur',
          role: 'admin' as const
        };
        
        setUser(adminUser);
        await storageService.setItem('user', JSON.stringify(adminUser));
        toast.success('Connecté en tant qu\'administrateur');
        return true;
      }

      // Regular employee login
      const employees = await storageService.getEmployees();
      const employee = employees.find(emp => 
        emp.name.toLowerCase() === username.toLowerCase() || 
        emp.email?.toLowerCase() === username.toLowerCase()
      );

      if (employee) {
        const employeePassword = employee.password || 'employee123';
        
        if (password === employeePassword) {
          const userData = {
            id: employee.id,
            name: employee.name,
            role: employee.role || 'employee',
            departmentId: employee.departmentId,
            email: employee.email
          };
          
          setUser(userData);
          await storageService.setItem('user', JSON.stringify(userData));
          toast.success(`Bienvenue, ${employee.name}`);
          return true;
        } else {
          toast.error('Mot de passe incorrect');
        }
      } else {
        toast.error('Utilisateur non trouvé');
      }
      
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('Une erreur est survenue lors de la connexion');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    await storageService.removeItem('user');
    toast.success('Vous êtes déconnecté');
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    await storageService.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
