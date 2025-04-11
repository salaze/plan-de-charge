
import { supabase } from '@/integrations/supabase/client';
import {
  insertStatut,
  updateStatut,
  insertEmploye,
  updateEmploye,
  insertSchedule,
  updateSchedule,
  insertTache,
  updateTache,
  insertConnectionLog,
  updateConnectionLog
} from '../supabaseTableHelpers';
import { StatutData, EmployeData, ScheduleData, TacheData, ConnectionLogData } from '@/types/supabaseModels';

// Mock the supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    select: jest.fn(),
  }
}));

describe('supabaseTableHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Statut table operations', () => {
    const mockStatutData: StatutData = {
      code: 'test',
      libelle: 'Test Status',
      couleur: '#FF0000',
      display_order: 1
    };

    it('should insert statut successfully', async () => {
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockResolvedValue({
        data: [{ ...mockStatutData, id: '123' }],
        error: null
      });

      const result = await insertStatut(mockStatutData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ ...mockStatutData, id: '123' }]);
      expect(supabase.from).toHaveBeenCalledWith('statuts');
      expect(supabase.insert).toHaveBeenCalled();
    });

    it('should return error when insertion fails', async () => {
      const error = new Error('Database error');
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockResolvedValue({
        data: null,
        error
      });

      const result = await insertStatut(mockStatutData);
      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should update statut successfully', async () => {
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.update as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockResolvedValue({
        data: [{ ...mockStatutData, id: '123' }],
        error: null
      });

      const result = await updateStatut('123', { libelle: 'Updated Test Status' });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ ...mockStatutData, id: '123' }]);
      expect(supabase.from).toHaveBeenCalledWith('statuts');
      expect(supabase.update).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('id', '123');
    });
  });

  describe('Employee table operations', () => {
    const mockEmployeeData: EmployeData = {
      nom: 'Doe',
      prenom: 'John',
      departement: 'IT'
    };

    it('should insert employee successfully', async () => {
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockResolvedValue({
        data: [{ ...mockEmployeeData, id: '123' }],
        error: null
      });

      const result = await insertEmploye(mockEmployeeData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ ...mockEmployeeData, id: '123' }]);
      expect(supabase.from).toHaveBeenCalledWith('employes');
      expect(supabase.insert).toHaveBeenCalled();
    });

    it('should update employee successfully', async () => {
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.update as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockResolvedValue({
        data: [{ ...mockEmployeeData, id: '123', departement: 'HR' }],
        error: null
      });

      const result = await updateEmploye('123', { departement: 'HR' });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ ...mockEmployeeData, id: '123', departement: 'HR' }]);
      expect(supabase.from).toHaveBeenCalledWith('employes');
      expect(supabase.update).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('id', '123');
    });
  });

  describe('Schedule table operations', () => {
    const mockScheduleData: ScheduleData = {
      date: '2023-01-01',
      period: 'AM',
      statut_code: 'conges',
      employe_id: '123'
    };

    it('should insert schedule successfully', async () => {
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockResolvedValue({
        data: [{ ...mockScheduleData, id: '123' }],
        error: null
      });

      const result = await insertSchedule(mockScheduleData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ ...mockScheduleData, id: '123' }]);
      expect(supabase.from).toHaveBeenCalledWith('employe_schedule');
      expect(supabase.insert).toHaveBeenCalled();
    });
  });
});
