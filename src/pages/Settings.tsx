
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SupabaseStatusIndicator } from '@/components/supabase/SupabaseStatusIndicator';
import { DisplaySettings } from '@/components/settings/DisplaySettings';
import { DatabaseSettings } from '@/components/settings/DatabaseSettings';
import { DangerZone } from '@/components/settings/DangerZone';

const Settings = () => {
  const [showWeekends, setShowWeekends] = useState<boolean>(() => {
    const saved = localStorage.getItem('showWeekends');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [autoSave, setAutoSave] = useState<boolean>(() => {
    const saved = localStorage.getItem('autoSave');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  useEffect(() => {
    localStorage.setItem('showWeekends', JSON.stringify(showWeekends));
  }, [showWeekends]);
  
  useEffect(() => {
    localStorage.setItem('autoSave', JSON.stringify(autoSave));
  }, [autoSave]);
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-6">Paramètres</h1>
          <SupabaseStatusIndicator />
        </div>
        
        <DisplaySettings 
          showWeekends={showWeekends}
          setShowWeekends={setShowWeekends}
          autoSave={autoSave}
          setAutoSave={setAutoSave}
        />
        
        <DatabaseSettings />
        
        <DangerZone />
      </div>
    </Layout>
  );
};

export default Settings;
