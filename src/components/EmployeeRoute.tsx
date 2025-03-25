
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface EmployeeRouteProps {
  children: React.ReactNode;
}

export const EmployeeRoute = ({ children }: EmployeeRouteProps) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
