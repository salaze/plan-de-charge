
import React from 'react';
import { Layout } from '@/components/layout/Layout';

interface StatisticsLayoutProps {
  children: React.ReactNode;
}

export const StatisticsLayout = ({ children }: StatisticsLayoutProps) => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {children}
      </div>
    </Layout>
  );
};
