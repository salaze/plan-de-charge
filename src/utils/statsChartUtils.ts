
import { StatusCode, SummaryStats } from '@/types';

interface EmployeeStatusData {
  name: string;
  [key: string]: number | string;
}

/**
 * Converts employee statistics into chart-ready data format
 */
export const prepareChartDataPoint = (
  employeeStats: SummaryStats, 
  availableStatusCodes: StatusCode[]
): EmployeeStatusData => {
  const dataPoint: EmployeeStatusData = { name: employeeStats.employeeName || '' };
  
  availableStatusCodes.forEach(status => {
    if (status !== 'none') {
      switch(status) {
        case 'assistance':
          dataPoint[status] = employeeStats.presentDays -
            employeeStats.vigiDays -
            employeeStats.trainingDays -
            employeeStats.projectDays -
            employeeStats.managementDays -
            employeeStats.coordinatorDays -
            employeeStats.regisseurDays -
            employeeStats.demenagementDays -
            employeeStats.permanenceDays -
            employeeStats.parcDays;
          break;
        case 'vigi':
          dataPoint[status] = employeeStats.vigiDays;
          break;
        case 'formation':
          dataPoint[status] = employeeStats.trainingDays;
          break;
        case 'projet':
          dataPoint[status] = employeeStats.projectDays;
          break;
        case 'conges':
          dataPoint[status] = employeeStats.vacationDays;
          break;
        case 'management':
          dataPoint[status] = employeeStats.managementDays;
          break;
        case 'tp':
          dataPoint[status] = employeeStats.tpDays;
          break;
        case 'coordinateur':
          dataPoint[status] = employeeStats.coordinatorDays;
          break;
        case 'absence':
          dataPoint[status] = employeeStats.otherAbsenceDays;
          break;
        case 'regisseur':
          dataPoint[status] = employeeStats.regisseurDays;
          break;
        case 'demenagement':
          dataPoint[status] = employeeStats.demenagementDays;
          break;
        case 'permanence':
          dataPoint[status] = employeeStats.permanenceDays;
          break;
        case 'parc':
          dataPoint[status] = employeeStats.parcDays;
          break;
      }
    }
  });
  
  return dataPoint;
};
