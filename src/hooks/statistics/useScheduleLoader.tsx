
import { useCallback } from 'react';
import { Employee, StatusCode } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useScheduleLoader = () => {
  const fetchSchedules = useCallback(async (
    employees: Employee[],
    startDate: string, 
    endDate: string
  ) => {
    if (employees.length === 0) return employees;

    try {
      console.log(`Loading schedules from ${startDate} to ${endDate} for ${employees.length} employees`);
      
      // Create array of employee IDs for efficient filtering
      const employeeIds = employees.map(emp => emp.id);
      
      // Optimized query with pagination using smaller batches for better performance
      const batchSize = 1000; // Smaller batch size for faster response
      let allScheduleData: any[] = [];
      let hasMoreData = true;
      let lastId = '';
      let attemptCount = 0;
      const maxAttempts = 3;
      
      while (hasMoreData && attemptCount < maxAttempts) {
        try {
          let query = supabase
            .from('employe_schedule')
            .select('*')
            .in('employe_id', employeeIds) // Filter to only relevant employees
            .gte('date', startDate)
            .lte('date', endDate)
            .order('id', { ascending: true })
            .limit(batchSize);
            
          // Pagination based on ID
          if (lastId) {
            query = query.gt('id', lastId);
          }
          
          // Set a timeout to prevent hanging
          const timeoutPromise = new Promise<{ data: any[], error: Error }>((_, reject) => {
            setTimeout(() => reject(new Error('Supabase query timed out')), 6000);
          });
          
          // Execute query with timeout
          const { data: batchData, error } = await Promise.race([
            query,
            timeoutPromise
          ]);
          
          if (error) {
            console.error('Error loading schedules:', error);
            attemptCount++;
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retry
            continue;
          }
          
          if (batchData && batchData.length > 0) {
            allScheduleData = [...allScheduleData, ...batchData];
            lastId = batchData[batchData.length - 1].id;
            hasMoreData = batchData.length === batchSize;
            console.log(`Loaded batch of ${batchData.length} schedule entries`);
          } else {
            hasMoreData = false;
          }
        } catch (err) {
          console.error('Error in schedule batch:', err);
          attemptCount++;
          await new Promise(resolve => setTimeout(resolve, 500)); 
        }
      }

      if (attemptCount >= maxAttempts) {
        toast.error('Schedule loading issue - please try again');
      }

      console.log(`Total schedule entries loaded: ${allScheduleData.length}`);
      
      // Optimized indexing of schedules by employee ID
      const schedulesByEmployee: Record<string, any[]> = {};
      
      for (let i = 0; i < allScheduleData.length; i++) {
        const entry = allScheduleData[i];
        if (!schedulesByEmployee[entry.employe_id]) {
          schedulesByEmployee[entry.employe_id] = [];
        }
        schedulesByEmployee[entry.employe_id].push({
          date: entry.date,
          status: entry.statut_code as StatusCode,
          period: entry.period as 'AM' | 'PM' | 'FULL',
          note: entry.note || undefined,
          projectCode: entry.project_code || undefined,
          isHighlighted: entry.is_highlighted || false
        });
      }

      // Map employees to their schedules in a single pass
      const employeesWithSchedules = employees.map(employee => ({
        ...employee,
        schedule: schedulesByEmployee[employee.id] || []
      }));

      console.log('Schedules loaded and assigned to employees');
      return employeesWithSchedules;
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast.error('Error loading schedules');
      return employees.map(emp => ({...emp, schedule: []})); // Return employees without schedules
    }
  }, []);

  return { fetchSchedules };
};
