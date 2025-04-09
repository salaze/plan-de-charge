
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { storageService } from '@/services/storage';
import { Employee, Project, Status } from '@/types';
import { Calendar as CalendarIcon, ChevronRight, Users, BarChart, FileSpreadsheet, Settings } from 'lucide-react';

export default function Dashboard() {
  const [employeesCount, setEmployeesCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<Status[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Initialize data
        await storageService.initializeData();

        // Load employees
        const employees = await storageService.getEmployees();
        setEmployeesCount(employees.length);
        
        // Load projects
        const projects = await storageService.getProjects();
        setProjectsCount(projects.length);
        
        // Load statuses
        const statuses = await storageService.getStatuses();
        setStatuses(statuses);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const dashboardCards = [
    {
      title: "Planning",
      description: "Consultez et gérez le planning des employés",
      icon: <CalendarIcon className="h-8 w-8 text-primary" />,
      link: "/planning",
      color: "bg-primary/10"
    },
    {
      title: "Employés",
      description: `${employeesCount} employés enregistrés`,
      icon: <Users className="h-8 w-8 text-purple-600" />,
      link: "/employees",
      color: "bg-purple-600/10"
    },
    {
      title: "Statistiques",
      description: "Analyse des données de présence",
      icon: <BarChart className="h-8 w-8 text-green-600" />,
      link: "/statistics",
      color: "bg-green-600/10"
    },
    {
      title: "Exports",
      description: "Exportez les données de planning",
      icon: <FileSpreadsheet className="h-8 w-8 text-blue-600" />,
      link: "/export",
      color: "bg-blue-600/10"
    },
    {
      title: "Paramètres",
      description: "Configuration de l'application",
      icon: <Settings className="h-8 w-8 text-orange-600" />,
      link: "/settings",
      color: "bg-orange-600/10"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-muted-foreground">Bienvenue dans votre application Planning de Charge</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dashboardCards.map((card, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    {card.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-2">{card.title}</CardTitle>
                <CardDescription className="mb-4">{card.description}</CardDescription>
                <Button asChild className="w-full mt-2">
                  <Link to={card.link}>
                    Accéder <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Statuts disponibles</CardTitle>
            <CardDescription>Légende des statuts utilisés dans le planning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map((status) => (
                <div key={status.code} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{backgroundColor: status.color}}
                  ></div>
                  <span>{status.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Projets actifs</CardTitle>
            <CardDescription>{projectsCount} projets en cours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Gérez vos projets et assignez-les aux employés dans le planning.
              </p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/planning">
                Voir le planning <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
