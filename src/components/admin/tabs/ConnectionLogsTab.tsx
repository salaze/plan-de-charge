
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ConnectionLog } from '@/types';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

export function ConnectionLogsTab() {
  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Using the any type as a workaround until types are updated
      const { data, error } = await supabase
        .from('connection_logs' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching connection logs:', error);
        return;
      }

      // Properly validate and transform the data before setting state
      if (data && Array.isArray(data)) {
        const validLogs = data.filter(item => 
          item && typeof item === 'object' && 'id' in item
        ) as ConnectionLog[];
        
        setLogs(validLogs);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Use the realtimeUpdates hook for the connection_logs table
  useRealtimeUpdates({
    tables: ['employes', 'statuts', 'connection_logs' as any],
    onDataChange: fetchLogs,
    showToasts: false
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journaux de connexion</CardTitle>
        <CardDescription>
          Historique des connexions utilisateurs à l'application
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <p>Chargement des journaux...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            <p>Aucun journal de connexion disponible</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[400px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Événement</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Navigateur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {log.created_at ? format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss') : '-'}
                    </TableCell>
                    <TableCell>{log.user_name || log.user_id || '-'}</TableCell>
                    <TableCell>{log.event_type || '-'}</TableCell>
                    <TableCell>{log.ip_address || '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {log.user_agent || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
