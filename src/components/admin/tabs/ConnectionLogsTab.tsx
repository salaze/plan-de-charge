
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ConnectionLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  event_type: string | null;
  created_at: string;
}

export function ConnectionLogsTab() {
  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('connection_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching connection logs:', error);
          return;
        }

        setLogs(data || []);
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('connection_logs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'connection_logs' },
        (payload) => {
          console.log('Connection logs real-time update:', payload);
          fetchLogs(); // Refresh data when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
