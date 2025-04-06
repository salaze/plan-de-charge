
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface EmployeeRouteProps {
  children: React.ReactNode;
}

export const EmployeeRoute = ({ children }: EmployeeRouteProps) => {
  // The existing component just returns children without any authentication check
  return <>{children}</>;
};
