
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NoteInputProps {
  note: string;
  onChange: (note: string) => void;
}

export function NoteInput({ note, onChange }: NoteInputProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="note">Note</Label>
      <Textarea
        id="note"
        placeholder="Ajouter une note"
        value={note}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
