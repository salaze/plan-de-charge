
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
      
      // Use a smaller batch size for better response times
      const batchSize = 500;
      let allScheduleData: any[] = [];
      let hasMoreData = true;
      let lastId = '';
      let attemptCount = 0;
      const maxAttempts = 3;
      
      // Load data in batches to prevent timeouts
      while (hasMoreData && attemptCount < maxAttempts) {
        try {
          let query = supabase
            .from('employe_schedule')
            .select('employe_id, date, statut_code, period, note, project_code, is_highlighted')
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
            setTimeout(() => reject(new Error('Schedule query timed out')), 5000);
          });
          
          // Execute query with timeout
          const { data: batchData, error } = await Promise.race([
            query,
            timeoutPromise
          ]);
          
          if (error) {
            console.error('Error loading schedules batch:', error);
            attemptCount++;
            await new Promise(resolve => setTimeout(resolve, 300)); // Wait before retry
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
          await new Promise(resolve => setTimeout(resolve, 300)); 
        }
      }

      if (attemptCount >= maxAttempts) {
        toast.error('Schedule loading issue - please try again');
      }

      console.log(`Total schedule entries loaded: ${allScheduleData.length}`);
      
      // Use an object to index schedules by employee ID for better performance
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

      // Assign schedules to employees in a single efficient pass
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
