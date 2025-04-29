
import React from 'react';
import { Button } from "@/components/ui/button";
import { StatusCode } from '@/types';

interface StatusButtonGridProps {
  currentStatus: StatusCode;
  onStatusClick: (status: StatusCode) => void;
}

export function StatusButtonGrid({ currentStatus, onStatusClick }: StatusButtonGridProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="flex flex-wrap gap-2 justify-center">
        <Button 
          variant="outline"
          className={currentStatus === 'assistance' ? 'bg-yellow-300 text-yellow-800' : ''}
          onClick={() => onStatusClick('assistance')}
        >
          Assistance
        </Button>
        <Button
          variant="outline"
          className={currentStatus === 'vigi' ? 'bg-red-500 text-white' : ''}
          onClick={() => onStatusClick('vigi')}
        >
          Vigi
        </Button>
        <Button
          variant="outline"
          className={currentStatus === 'formation' ? 'bg-blue-500 text-white' : ''}
          onClick={() => onStatusClick('formation')}
        >
          Formation
        </Button>
        <Button
          variant="outline"
          className={currentStatus === 'projet' ? 'bg-green-500 text-white' : ''}
          onClick={() => onStatusClick('projet')}
        >
          Projet
        </Button>
        <Button
          variant="outline"
          className={currentStatus === 'conges' ? 'bg-amber-800 text-white' : ''}
          onClick={() => onStatusClick('conges')}
        >
          Congés
        </Button>
        <Button
          variant="outline"
          className={currentStatus === 'management' ? 'bg-purple-500 text-white' : ''}
          onClick={() => onStatusClick('management')}
        >
          Management
        </Button>
        <Button
          variant="outline"
          className={currentStatus === 'tp' ? 'bg-gray-400 text-gray-800' : ''}
          onClick={() => onStatusClick('tp')}
        >
          Temps Partiel
        </Button>
        <Button
          variant="outline"
          className={currentStatus === 'coordinateur' ? 'bg-green-600 text-white' : ''}
          onClick={() => onStatusClick('coordinateur')}
        >
          Coordinateur
        </Button>
        <Button
          variant="outline"
          className={currentStatus === 'absence' ? 'bg-pink-300 text-pink-800' : ''}
          onClick={() => onStatusClick('absence')}
        >
          Autre Absence
        </Button>
        <Button
          variant="outline"
          className={currentStatus === 'regisseur' ? 'bg-blue-300 text-blue-800' : ''}
          onClick={() => onStatusClick('regisseur')}
        >
          Régisseur
        </Button>
        <Button
          variant="outline"
          className={currentStatus === 'demenagement' ? 'bg-indigo-500 text-white' : ''}
          onClick={() => onStatusClick('demenagement')}
        >
          Déménagement
        </Button>
        <Button
          variant="outline"
          className={currentStatus === 'permanence' ? 'bg-pink-600 text-white' : ''}
          onClick={() => onStatusClick('permanence')}
        >
          Permanence
        </Button>
        <Button
          variant="outline"
          className={currentStatus === 'parc' ? 'bg-teal-500 text-white' : ''}
          onClick={() => onStatusClick('parc')}
        >
          Parc
        </Button>
        <Button
          variant="outline"
          className={currentStatus === 'none' ? 'bg-transparent text-foreground' : ''}
          onClick={() => onStatusClick('none')}
        >
          Aucun
        </Button>
      </div>
    </div>
  );
}
