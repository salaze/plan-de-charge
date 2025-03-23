
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, Settings, LogOut } from 'lucide-react';

const Admin = () => {
  const { logout, user } = useAuth();
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Interface Administrateur</h1>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">
              Connecté en tant que <strong>{user?.username}</strong>
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full md:w-auto grid-cols-3 h-auto">
            <TabsTrigger value="overview" className="py-2">
              <Settings className="h-4 w-4 mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="employees" className="py-2">
              <Users className="h-4 w-4 mr-2" />
              Employés
            </TabsTrigger>
            <TabsTrigger value="planning" className="py-2">
              <Calendar className="h-4 w-4 mr-2" />
              Planning
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Employés</CardTitle>
                  <CardDescription>Gestion des employés</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15</div>
                  <p className="text-muted-foreground text-sm">Employés actifs</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Planning</CardTitle>
                  <CardDescription>Statistiques planning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">32</div>
                  <p className="text-muted-foreground text-sm">Jours planifiés</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Activité</CardTitle>
                  <CardDescription>Dernières actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">128</div>
                  <p className="text-muted-foreground text-sm">Actions ce mois</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>
                  Gérez facilement votre application
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Ajouter un employé
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Générer planning
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="employees" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des employés</CardTitle>
                <CardDescription>
                  Interface avancée pour la gestion des employés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cette section sera développée avec des fonctionnalités avancées de gestion des employés.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="planning" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion du planning</CardTitle>
                <CardDescription>
                  Interface avancée pour la gestion du planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cette section sera développée avec des fonctionnalités avancées de gestion du planning.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
