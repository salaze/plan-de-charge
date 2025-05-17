
import { StatusCode } from '@/types';

export interface Status {
  id: string;
  code: StatusCode;
  label: string;
  color: string;
}

export interface StatusFormProps {
  code: StatusCode;
  label: string;
  color: string;
  onCodeChange: (value: StatusCode) => void;
  onLabelChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export interface StatusTableProps {
  statuses: Status[];
  onEditStatus: (status: Status) => void;
  onDeleteStatus: (statusId: string) => void;
}

export interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export interface StatusManagerProps {
  statuses: Status[];
  onStatusesChange: (statuses: Status[]) => void;
  isLoading: boolean;
  isConnected: boolean;
}
