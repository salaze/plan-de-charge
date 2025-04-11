
import { syncTableData } from '../syncService';
import { checkRecordExists } from '@/utils/supabaseHelpers';
import * as tableHelpers from '@/utils/supabaseTableHelpers';
import { SupabaseTable } from '@/types/supabase';

// Mock the dependencies
jest.mock('@/utils/supabaseHelpers', () => ({
  checkRecordExists: jest.fn()
}));

jest.mock('@/utils/supabaseTableHelpers', () => ({
  insertStatut: jest.fn(),
  updateStatut: jest.fn(),
  insertEmploye: jest.fn(),
  updateEmploye: jest.fn(),
  insertSchedule: jest.fn(),
  updateSchedule: jest.fn(),
  insertTache: jest.fn(),
  updateTache: jest.fn(),
  insertConnectionLog: jest.fn(),
  updateConnectionLog: jest.fn()
}));

describe('syncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('syncTableData', () => {
    it('should return error when id field is missing', async () => {
      const result = await syncTableData({}, 'statuts' as SupabaseTable);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should update existing record', async () => {
      (checkRecordExists as jest.Mock).mockResolvedValue({ id: '123' });
      (tableHelpers.updateStatut as jest.Mock).mockResolvedValue({ 
        success: true, 
        data: { id: '123', code: 'test', libelle: 'Test', couleur: '#FF0000' } 
      });

      const data = { id: '123', code: 'test', libelle: 'Test', couleur: '#FF0000' };
      const result = await syncTableData(data, 'statuts' as SupabaseTable);
      
      expect(result.success).toBe(true);
      expect(checkRecordExists).toHaveBeenCalledWith('statuts', 'id', '123');
      expect(tableHelpers.updateStatut).toHaveBeenCalledWith('123', data);
    });

    it('should insert new record', async () => {
      (checkRecordExists as jest.Mock).mockResolvedValue(null);
      (tableHelpers.insertStatut as jest.Mock).mockResolvedValue({ 
        success: true, 
        data: { id: '123', code: 'test', libelle: 'Test', couleur: '#FF0000' } 
      });

      const data = { id: '123', code: 'test', libelle: 'Test', couleur: '#FF0000' };
      const result = await syncTableData(data, 'statuts' as SupabaseTable);
      
      expect(result.success).toBe(true);
      expect(checkRecordExists).toHaveBeenCalledWith('statuts', 'id', '123');
      expect(tableHelpers.insertStatut).toHaveBeenCalledWith(data);
    });

    it('should handle error during sync', async () => {
      (checkRecordExists as jest.Mock).mockRejectedValue(new Error('Database error'));

      const data = { id: '123', code: 'test', libelle: 'Test', couleur: '#FF0000' };
      const result = await syncTableData(data, 'statuts' as SupabaseTable);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for unsupported table', async () => {
      (checkRecordExists as jest.Mock).mockResolvedValue(null);

      const data = { id: '123', name: 'test' };
      // @ts-ignore - Testing with invalid table name
      const result = await syncTableData(data, 'invalid_table');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
