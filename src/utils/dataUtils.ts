
import { DayPeriod, DayStatus, Employee, FilterOptions, MonthData, StatusCode, SummaryStats } from '@/types';

// Génère un identifiant unique
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Crée un tableau de jours pour un mois donné
export const generateDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }
  
  return days;
};

// Formate une date en YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Retourne le nom du mois en français
export const getMonthName = (month: number): string => {
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return monthNames[month];
};

// Retourne le nom du jour en français
export const getDayName = (date: Date, short: boolean = false): string => {
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const shortDayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  return short ? shortDayNames[date.getDay()] : dayNames[date.getDay()];
};

// Crée un employé avec un planning vide
export const createEmptyEmployee = (name: string): Employee => {
  return {
    id: generateId(),
    name,
    schedule: []
  };
};

// Obtenir le statut d'un employé pour une date donnée
export const getEmployeeStatusForDate = (
  employee: Employee,
  date: string,
  period: DayPeriod = 'FULL'
): StatusCode => {
  const dayStatus = employee.schedule.find(
    (day) => day.date === date && (day.period === period || day.period === 'FULL' || period === 'FULL')
  );
  
  return dayStatus?.status || '';
};

// Définir le statut d'un employé pour une date donnée
export const setEmployeeStatus = (
  employee: Employee,
  date: string,
  status: StatusCode,
  period: DayPeriod = 'FULL'
): Employee => {
  // Supprimer toute entrée existante pour cette date et période
  const updatedSchedule = employee.schedule.filter(
    (day) => !(day.date === date && (day.period === period || day.period === 'FULL' || period === 'FULL'))
  );
  
  // Ajouter la nouvelle entrée si le statut n'est pas vide
  if (status) {
    updatedSchedule.push({
      date,
      status,
      period
    });
  }
  
  return {
    ...employee,
    schedule: updatedSchedule
  };
};

// Filtrer les données selon les critères
export const filterData = (data: MonthData, filters: FilterOptions): MonthData => {
  let filteredEmployees = [...data.employees];
  
  // Filtrer par employé si spécifié
  if (filters.employeeId) {
    filteredEmployees = filteredEmployees.filter(emp => emp.id === filters.employeeId);
  }
  
  // Filtrer les statuts si spécifié
  if (filters.statusCodes && filters.statusCodes.length > 0) {
    filteredEmployees = filteredEmployees.map(employee => {
      const filteredSchedule = employee.schedule.filter(day => 
        filters.statusCodes?.includes(day.status)
      );
      
      return {
        ...employee,
        schedule: filteredSchedule
      };
    });
  }
  
  // Filtrer par plage de dates si spécifiée
  if (filters.startDate || filters.endDate) {
    filteredEmployees = filteredEmployees.map(employee => {
      let filteredSchedule = [...employee.schedule];
      
      if (filters.startDate) {
        const startDateStr = formatDate(filters.startDate);
        filteredSchedule = filteredSchedule.filter(day => day.date >= startDateStr);
      }
      
      if (filters.endDate) {
        const endDateStr = formatDate(filters.endDate);
        filteredSchedule = filteredSchedule.filter(day => day.date <= endDateStr);
      }
      
      return {
        ...employee,
        schedule: filteredSchedule
      };
    });
  }
  
  return {
    ...data,
    employees: filteredEmployees
  };
};

// Calculer les statistiques pour un employé sur un mois
export const calculateEmployeeStats = (
  employee: Employee,
  year: number,
  month: number
): SummaryStats => {
  const days = generateDaysInMonth(year, month);
  const startDate = formatDate(days[0]);
  const endDate = formatDate(days[days.length - 1]);
  
  const relevantSchedule = employee.schedule.filter(
    day => day.date >= startDate && day.date <= endDate
  );
  
  // Initialiser les compteurs
  const stats: SummaryStats = {
    totalDays: days.length,
    presentDays: 0,
    absentDays: 0,
    vacationDays: 0,
    sickDays: 0,
    trainingDays: 0
  };
  
  // Compter chaque type de jour
  relevantSchedule.forEach(day => {
    const dayMultiplier = day.period === 'FULL' ? 1 : 0.5;
    
    switch(day.status) {
      case 'present':
        stats.presentDays += dayMultiplier;
        break;
      case 'absent':
        stats.absentDays += dayMultiplier;
        break;
      case 'vacation':
        stats.vacationDays += dayMultiplier;
        break;
      case 'sick':
        stats.sickDays += dayMultiplier;
        break;
      case 'training':
        stats.trainingDays += dayMultiplier;
        break;
    }
  });
  
  return stats;
};

// Créer des données initiales de démonstration
export const createSampleData = (): MonthData => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const employees: Employee[] = [
    {
      id: 'emp1',
      name: 'Jean Dupont',
      position: 'Développeur',
      schedule: []
    },
    {
      id: 'emp2',
      name: 'Marie Martin',
      position: 'Designer',
      schedule: []
    },
    {
      id: 'emp3',
      name: 'Luc Bernard',
      position: 'Chef de projet',
      schedule: []
    }
  ];
  
  // Générer quelques statuts aléatoires pour chaque employé
  const days = generateDaysInMonth(year, month);
  const statuses: StatusCode[] = ['present', 'absent', 'vacation', 'sick', 'training'];
  
  employees.forEach(employee => {
    days.forEach(day => {
      // Skip weekends
      if (day.getDay() === 0 || day.getDay() === 6) return;
      
      // 70% de chance d'être présent
      if (Math.random() < 0.7) {
        employee.schedule.push({
          date: formatDate(day),
          status: 'present',
          period: 'FULL'
        });
      } else {
        // Statut aléatoire pour les 30% restants
        const randomStatus = statuses[Math.floor(Math.random() * (statuses.length - 1)) + 1];
        employee.schedule.push({
          date: formatDate(day),
          status: randomStatus,
          period: 'FULL'
        });
      }
    });
  });
  
  return {
    year,
    month,
    employees
  };
};

// Exporter les données au format Excel (simulation)
export const exportToExcel = (data: MonthData): void => {
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `planning_${data.year}_${data.month + 1}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Dans une vraie app, utilisez une bibliothèque comme xlsx pour générer un vrai fichier Excel
  console.log('Export to Excel feature would be implemented here with a proper Excel library');
};
