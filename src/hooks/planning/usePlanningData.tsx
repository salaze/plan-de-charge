
import { useState, useEffect, useCallback } from 'react';
import { MonthData } from '@/types';
import { toast } from 'sonner';
import { fetchEmployees } from '@/utils/supabase/employees';
import { fetchSchedule } from '@/utils/supabase/schedule';
import { fetchProjects } from '@/utils/supabase/projects';
import { checkSupabaseConnection } from '@/utils/supabase/connection';
import { syncStatusesWithDatabase } from '@/utils/supabase/status/sync';

export const usePlanningData = (currentYear?: number, currentMonth?: number) => {
  const year = currentYear || new Date().getFullYear();
  const month = currentMonth || new Date().getMonth();
  
  const [data, setData] = useState<MonthData>(() => ({
    year: year,
    month: month,
    employees: [],
    projects: []
  }));
  
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [retryCount, setRetryCount] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setConnectionError(null);
    
    try {
      console.log(`Loading data from Supabase... (${new Date().toISOString()})`);
      
      const isConnected = await checkSupabaseConnection();
      setIsOnline(isConnected);
      
      if (!isConnected) {
        const errorMsg = "Unable to connect to Supabase. Please check your internet connection.";
        console.error(errorMsg);
        setConnectionError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      
      // First synchronize statuses with noRefresh flag to prevent UI flickering
      try {
        await syncStatusesWithDatabase();
      } catch (syncError) {
        console.error("Error synchronizing statuses:", syncError);
        // Continue loading data even if status sync fails
      }
      
      // Get projects from Supabase (before employees to ensure they're available)
      const projects = await fetchProjects();
      console.log(`${projects.length} projects retrieved from Supabase:`, projects);
      
      // Increase timeout for employee retrieval
      const employees = await fetchEmployees();
      console.log(`${employees.length} employees retrieved from Supabase`);
      
      if (employees.length === 0) {
        toast.warning("No employees found in database");
      }
      
      // Load schedule for each employee
      let schedulesLoaded = 0;
      for (let i = 0; i < employees.length; i++) {
        try {
          const schedule = await fetchSchedule(employees[i].id);
          employees[i].schedule = schedule;
          schedulesLoaded += schedule.length;
          console.log(`Schedule loaded for employee ${employees[i].name}: ${schedule.length} entries`);
        } catch (scheduleError) {
          console.error(`Error loading schedule for ${employees[i].name}:`, scheduleError);
          employees[i].schedule = [];
        }
      }
      
      console.log(`Total schedule entries loaded: ${schedulesLoaded}`);
      console.log(`Total employees loaded: ${employees.length}`);
      
      setData({
        year: year,
        month: month,
        employees,
        projects
      });
      
      setLastRefresh(new Date());
      setRetryCount(0); // Reset retry counter on successful load
      
    } catch (error) {
      console.error('Error loading data:', error);
      const errorMsg = "Error loading data. Please try again.";
      setConnectionError(errorMsg);
      setIsOnline(false);
      toast.error(errorMsg);
      
      // Increment retry counter and retry if needed
      setRetryCount(prev => prev + 1);
      if (retryCount < 3) {
        console.log(`Retry loading attempt (${retryCount + 1}/3)...`);
        setTimeout(() => {
          loadData();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [year, month, retryCount]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Function for manual data reload
  const reloadData = useCallback(async () => {
    console.log("Manual data reload requested");
    setRetryCount(0); // Reset retry counter
    await loadData();
  }, [loadData]);

  return { 
    data, 
    setData, 
    loading, 
    isOnline, 
    connectionError, 
    reloadData, 
    lastRefresh 
  };
};
