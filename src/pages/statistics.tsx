
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BarChart, ResponsiveBar } from '@nivo/bar';
import { storageService } from '@/services/storage';
import { formatDate, getMonthDays, isWeekend } from '@/lib/utils';
import { Employee, Status } from '@/types';

export default function Statistics() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [statsData, setStatsData] = useState<any[]>([]);
  
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = [
    { value: 0, label: 'Janvier' },
    { value: 1, label: 'Février' },
    { value: 2, label: 'Mars' },
    { value: 3, label: 'Avril' },
    { value: 4, label: 'Mai' },
    { value: 5, label: 'Juin' },
    { value: 6, label: 'Juillet' },
    { value: 7, label: 'Août' },
    { value: 8, label: 'Septembre' },
    { value: 9, label: 'Octobre' },
    { value: 10, label: 'Novembre' },
    { value: 11, label: 'Décembre' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const employees = await storageService.getEmployees();
        const statuses = await storageService.getStatuses();
        
        setEmployees(employees);
        setStatuses(statuses);
      } catch (error) {
        console.error('Error fetching data for statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    calculateStats();
  }, [employees, currentYear, currentMonth]);
  
  const calculateStats = () => {
    if (!employees.length) return;
    
    const days = getMonthDays(currentYear, currentMonth);
    const data: any[] = [];
    
    // Prepare the base data for each status
    const statusesMap = statuses.reduce<Record<string, string>>((acc, status) => {
      acc[status.code] = status.label;
      return acc;
    }, {});
    
    employees.forEach(employee => {
      // Initialize counts for each status
      const statusCounts: Record<string, number> = Object.keys(statusesMap).reduce((acc, code) => {
        acc[code] = 0;
        return acc;
      }, {} as Record<string, number>);
      
      // Count days for each status in the selected month
      days.forEach(day => {
        const dateStr = formatDate(day);
        
        // Skip weekends
        if (isWeekend(day)) return;
        
        // Find employee's status for this day
        const dayStatus = employee.schedule.find(s => s.date === dateStr);
        
        if (dayStatus) {
          const { status, period } = dayStatus;
          
          // Convert period to day fraction
          let dayFraction = 1;
          if (period === 'AM' || period === 'PM') {
            dayFraction = 0.5;
          }
          
          // Increment the appropriate status counter
          if (status in statusCounts) {
            statusCounts[status] += dayFraction;
          }
        }
      });
      
      // Create data point for this employee
      const dataPoint = {
        name: employee.name,
        ...statusCounts
      };
      
      data.push(dataPoint);
    });
    
    setStatsData(data);
  };
  
  const handleYearChange = (value: string) => {
    setCurrentYear(parseInt(value));
  };
  
  const handleMonthChange = (value: string) => {
    setCurrentMonth(parseInt(value));
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Statistiques</h1>
        <p className="text-muted-foreground">Analyse des données de présence des employés</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Période</CardTitle>
          <CardDescription>Sélectionnez la période à analyser</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Année</Label>
              <Select
                defaultValue={currentYear.toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une année" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Mois</Label>
              <Select
                defaultValue={currentMonth.toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un mois" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Répartition des statuts par employé</CardTitle>
          <CardDescription>
            {months.find(m => m.value === currentMonth)?.label} {currentYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statsData.length > 0 ? (
            <div className="h-[400px]">
              <ResponsiveBar
                data={statsData}
                keys={statuses.map(s => s.code)}
                indexBy="name"
                margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={{ scheme: 'nivo' }}
                borderColor={{
                  from: 'color',
                  modifiers: [['darker', 1.6]]
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Employés',
                  legendPosition: 'middle',
                  legendOffset: 32
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Jours',
                  legendPosition: 'middle',
                  legendOffset: -40
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: 'left-to-right',
                    itemOpacity: 0.85,
                    symbolSize: 20,
                    effects: [
                      {
                        on: 'hover',
                        style: {
                          itemOpacity: 1
                        }
                      }
                    ]
                  }
                ]}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center h-[400px]">
              <p className="text-muted-foreground">
                Aucune donnée disponible pour cette période
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
