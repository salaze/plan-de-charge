
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface EmployeeRouteProps {
  children: React.ReactNode;
}

export const EmployeeRoute = ({ children }: EmployeeRouteProps) => {
  // Plus besoin de vérifier l'authentification pour accéder au planning
  return <>{children}</>;
};
