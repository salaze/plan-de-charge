
import { supabase } from '@/integrations/supabase/client';
import { checkRecordExists, fetchFromTable } from '../supabaseHelpers';
import { SupabaseTable } from '@/types/supabase';

// Mock the supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
  }
}));

describe('supabaseHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkRecordExists', () => {
    it('should return data when record exists', async () => {
      const mockData = { id: '123' };
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.maybeSingle as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await checkRecordExists('statuts' as SupabaseTable, 'id', '123');
      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith('statuts');
      expect(supabase.select).toHaveBeenCalledWith('id');
      expect(supabase.eq).toHaveBeenCalledWith('id', '123');
    });

    it('should return null when error occurs', async () => {
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.maybeSingle as jest.Mock).mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });

      const result = await checkRecordExists('statuts' as SupabaseTable, 'id', '123');
      expect(result).toBeNull();
    });
  });

  describe('fetchFromTable', () => {
    it('should return data when fetch is successful', async () => {
      const mockData = [{ id: '123', code: 'test' }];
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await fetchFromTable('statuts' as SupabaseTable);
      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith('statuts');
      expect(supabase.select).toHaveBeenCalledWith('*');
    });

    it('should return null when error occurs', async () => {
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });

      const result = await fetchFromTable('statuts' as SupabaseTable);
      expect(result).toBeNull();
    });
  });
});
