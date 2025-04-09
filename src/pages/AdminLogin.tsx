import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Lock, User, KeyRound, Info } from 'lucide-react';
import { connectionLogService } from '@/services/supabase/connectionLogService';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Veuillez saisir un nom d\'utilisateur et un mot de passe');
      return;
    }
    
    const success = login(username, password);
    
    if (success) {
      try {
        // Log the successful login
        await connectionLogService.create({
          user_name: username,
          event_type: 'login_success',
          ip_address: 'client-ip', // In a real app, you would get the actual IP
          user_agent: navigator.userAgent
        });
      } catch (err) {
        console.error('Failed to log connection:', err);
      }
      
      navigate('/admin');
    } else {
      try {
        // Log the failed login attempt
        await connectionLogService.create({
          user_name: username,
          event_type: 'login_failed',
          ip_address: 'client-ip', // In a real app, you would get the actual IP
          user_agent: navigator.userAgent
        });
      } catch (err) {
        console.error('Failed to log connection attempt:', err);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Connexion</CardTitle>
          <CardDescription className="text-center">
            Connectez-vous pour accéder à l'application
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Alert className="bg-muted/50">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <ul className="text-xs list-disc list-inside">
                  <li>Employés: utilisez votre nom et le mot de passe défini</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="username">Nom</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre nom"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
