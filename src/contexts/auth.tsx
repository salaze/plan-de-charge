import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Update the type to include isAuthenticated
export interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: any;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = supabase.auth.getSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.session?.user) {
        setUser(session.session.user);
        setIsAuthenticated(true);
        setIsAdmin(session.session.user.app_metadata?.isAdmin === true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    });

    if (session?.data?.session?.user) {
      setUser(session.data.session.user);
      setIsAuthenticated(true);
      setIsAdmin(session.data.session.user.app_metadata?.isAdmin === true);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      setUser(data.user);
      setIsAuthenticated(true);
      setIsAdmin(data.user?.app_metadata?.isAdmin === true);

      return data;
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isAdmin,
    user,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
