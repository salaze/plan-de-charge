
import { useState } from 'react';
import { StatusCode } from '@/types';
import { Status } from '@/components/admin/status/types';

interface UseStatusFormProps {
  currentStatus: Status | null;
}

export function useStatusForm({ currentStatus }: UseStatusFormProps) {
  const [code, setCode] = useState<StatusCode>(currentStatus?.code || '' as StatusCode);
  const [label, setLabel] = useState(currentStatus?.label || '');
  const [color, setColor] = useState(currentStatus?.color || 'bg-green-500 text-white');

  // Reset form values when currentStatus changes
  const resetForm = (status: Status | null) => {
    if (status) {
      setCode(status.code);
      setLabel(status.label);
      setColor(status.color);
    } else {
      setCode('' as StatusCode);
      setLabel('');
      setColor('bg-green-500 text-white');
    }
  };

  return {
    code,
    label,
    color,
    setCode,
    setLabel,
    setColor,
    resetForm
  };
}
