
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MonthData, FilterOptions } from '@/types';
import { filterData } from '@/utils/dataFilterUtils';

export const usePlanningFilters = (data: MonthData) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [filteredData, setFilteredData] = useState<MonthData>(data);

  // Appliquer les filtres lorsqu'ils changent
  useEffect(() => {
    const filtered = filterData(data, filters);
    setFilteredData(filtered);
  }, [data, filters]);
  
  // Gestionnaire pour mettre à jour les filtres
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    
    // Afficher un toast pour indiquer que les filtres ont été appliqués
    if (Object.keys(newFilters).length > 0 && 
        (newFilters.employeeId || 
         newFilters.projectCode || 
         (newFilters.statusCodes && newFilters.statusCodes.length) || 
         newFilters.startDate || 
         newFilters.endDate)) {
      toast.success("Filtres appliqués");
    } else {
      toast.info("Filtres réinitialisés");
    }
  };
  
  return {
    filters,
    filteredData,
    handleFiltersChange
  };
};
