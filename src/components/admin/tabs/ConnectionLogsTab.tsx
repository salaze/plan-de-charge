
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ConnectionLog } from '@/types';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { connectionLogService } from '@/services/supabase/connectionLogService';

export function ConnectionLogsTab() {
  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const logData = await connectionLogService.getAll();
      setLogs(logData);
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
    tables: ['employes', 'statuts', 'connection_logs'],
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
                      {log.createdAt || log.created_at ? format(new Date(log.createdAt || log.created_at), 'dd/MM/yyyy HH:mm:ss') : '-'}
                    </TableCell>
                    <TableCell>{log.userName || log.user_name || log.userId || log.user_id || '-'}</TableCell>
                    <TableCell>{log.eventType || log.event_type || '-'}</TableCell>
                    <TableCell>{log.ipAddress || log.ip_address || '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {log.userAgent || log.user_agent || '-'}
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
