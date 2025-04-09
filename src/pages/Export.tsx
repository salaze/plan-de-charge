
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import SupabaseAlert from '@/components/export/SupabaseAlert';
import DepartmentFilter from '@/components/export/DepartmentFilter';
import { ExportTabsEnhanced } from '@/components/export/ExportTabsEnhanced';

const Export = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold">Exporter les données</h1>
        
        <SupabaseAlert />
        
        <DepartmentFilter 
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
        />
        
        <ExportTabsEnhanced />
      </div>
    </Layout>
  );
};

export default Export;
