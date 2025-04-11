
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

// Mock the supabase client with the correct chaining structure
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn()
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn()
        }))
      })),
      select: jest.fn()
    }))
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
      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ ...mockStatutData, id: '123' }],
            error: null
          })
        })
      });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await insertStatut(mockStatutData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ ...mockStatutData, id: '123' }]);
      expect(mockFrom).toHaveBeenCalledWith('statuts');
    });

    it('should return error when insertion fails', async () => {
      const error = new Error('Database error');
      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: null,
            error
          })
        })
      });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await insertStatut(mockStatutData);
      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should update statut successfully', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [{ ...mockStatutData, id: '123' }],
              error: null
            })
          })
        })
      });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await updateStatut('123', { libelle: 'Updated Test Status' });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ ...mockStatutData, id: '123' }]);
      expect(mockFrom).toHaveBeenCalledWith('statuts');
    });
  });

  describe('Employee table operations', () => {
    const mockEmployeeData: EmployeData = {
      nom: 'Doe',
      prenom: 'John',
      departement: 'IT'
    };

    it('should insert employee successfully', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ ...mockEmployeeData, id: '123' }],
            error: null
          })
        })
      });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await insertEmploye(mockEmployeeData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ ...mockEmployeeData, id: '123' }]);
      expect(mockFrom).toHaveBeenCalledWith('employes');
    });

    it('should update employee successfully', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [{ ...mockEmployeeData, id: '123', departement: 'HR' }],
              error: null
            })
          })
        })
      });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await updateEmploye('123', { departement: 'HR' });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ ...mockEmployeeData, id: '123', departement: 'HR' }]);
      expect(mockFrom).toHaveBeenCalledWith('employes');
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
      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ ...mockScheduleData, id: '123' }],
            error: null
          })
        })
      });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await insertSchedule(mockScheduleData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ ...mockScheduleData, id: '123' }]);
      expect(mockFrom).toHaveBeenCalledWith('employe_schedule');
    });
  });
});
