
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { StatusToolbar } from './status/StatusToolbar';
import { StatusTable } from './status/StatusTable';
import { StatusFormDialog } from './status/StatusFormDialog';
import { DeleteStatusDialog } from './status/DeleteStatusDialog';
import { useStatusManagement } from './status/useStatusManagement';
import { Button } from '@/components/ui/button';
import { ensureStatusesCanBeSaved } from '@/utils/supabase/statusTableChecker';
import { toast } from 'sonner';

interface Status {
  id: string;
  code: StatusCode;
  label: string;
  color: string;
}

interface StatusManagerProps {
  statuses: Status[];
  onStatusesChange: (statuses: Status[]) => void;
}

export function StatusManager({ statuses, onStatusesChange }: StatusManagerProps) {
  const [isCheckingSupabase, setIsCheckingSupabase] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState<boolean | null>(null);
  
  const {
    formOpen,
    setFormOpen,
    currentStatus,
    code,
    setCode,
    label,
    setLabel,
    color,
    setColor,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleAddStatus,
    handleEditStatus,
    handleDeleteStatus,
    confirmDeleteStatus,
    handleSaveStatus,
    colorOptions
  } = useStatusManagement(statuses, onStatusesChange);
  
  useEffect(() => {
    if (statuses && statuses.length > 0) {
      statuses.forEach((status) => {
        if (status.code) {
          STATUS_LABELS[status.code] = status.label;
          STATUS_COLORS[status.code] = status.color;
        }
      });
      
      const event = new CustomEvent('statusesUpdated');
      window.dispatchEvent(event);
    }
  }, [statuses]);
  
  const checkSupabaseStatus = async () => {
    setIsCheckingSupabase(true);
    try {
      const ready = await ensureStatusesCanBeSaved();
      setSupabaseReady(ready);
      if (ready) {
        toast.success("La connexion Supabase est opérationnelle pour l'enregistrement des statuts");
      } else {
        toast.error("La connexion Supabase n'est pas disponible pour l'enregistrement des statuts");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de Supabase:", error);
      setSupabaseReady(false);
      toast.error("Erreur lors de la vérification de la connexion Supabase");
    } finally {
      setIsCheckingSupabase(false);
    }
  };
  
  // Vérifier l'état de Supabase au chargement du composant
  useEffect(() => {
    checkSupabaseStatus();
  }, []);
  
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gestion des statuts</CardTitle>
          <CardDescription>
            Ajouter, modifier ou supprimer des statuts et leur code associé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusToolbar onAddStatus={handleAddStatus} />
          <StatusTable 
            statuses={statuses} 
            onEdit={handleEditStatus} 
            onDelete={handleDeleteStatus}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
              supabaseReady === true 
                ? 'bg-green-500' 
                : supabaseReady === false 
                  ? 'bg-red-500' 
                  : 'bg-yellow-500'
            }`}></span>
            <span className="text-sm text-muted-foreground">
              {supabaseReady === true 
                ? 'Connexion à Supabase: OK' 
                : supabaseReady === false 
                  ? 'Connexion à Supabase: Erreur' 
                  : 'Vérification de la connexion...'}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkSupabaseStatus}
            disabled={isCheckingSupabase}
          >
            {isCheckingSupabase ? 'Vérification...' : 'Tester la connexion'}
          </Button>
        </CardFooter>
      </Card>
      
      <StatusFormDialog 
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        currentStatus={currentStatus}
        code={code}
        setCode={setCode}
        label={label}
        setLabel={setLabel}
        color={color}
        setColor={setColor}
        onSave={handleSaveStatus}
        colorOptions={colorOptions}
      />
      
      <DeleteStatusDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteStatus}
      />
    </>
  );
}

export default StatusManager;
