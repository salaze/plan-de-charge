import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Lock, User, KeyRound, Info } from 'lucide-react';
const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (!username || !password) {
      setError('Veuillez saisir un nom d\'utilisateur et un mot de passe');
      setIsLoading(false);
      return;
    }
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/admin');
      } else {
        setError('Identifiants incorrects');
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError('Une erreur s\'est produite lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="flex min-h-screen items-center justify-center bg-background p-4">
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
            {error && <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>}
            
            
            
            <div className="space-y-2">
              <Label htmlFor="username">Identifiant</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="UID, Email ou Nom" className="pl-10" disabled={isLoading} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" disabled={isLoading} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>;
};
export default AdminLogin;