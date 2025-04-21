
import React from 'react';
import { TabsTrigger } from '@/components/ui/tabs';
import { LucideIcon } from 'lucide-react';

interface TabTriggerProps {
  value: string;
  icon: LucideIcon;
  label: string;
}

export function TabTrigger({ value, icon: Icon, label }: TabTriggerProps) {
  return (
    <TabsTrigger value={value} className="flex items-center gap-2">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </TabsTrigger>
  );
}
