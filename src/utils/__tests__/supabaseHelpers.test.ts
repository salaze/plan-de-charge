
import { supabase } from '@/integrations/supabase/client';
import { checkRecordExists, fetchFromTable } from '../supabaseHelpers';
import { SupabaseTable } from '@/types/supabase';

// Mock the supabase client with the correct chaining structure
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn()
        })),
        limit: jest.fn(() => ({
          maybeSingle: jest.fn()
        }))
      }))
    }))
  }
}));

describe('supabaseHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkRecordExists', () => {
    it('should return data when record exists', async () => {
      const mockData = { id: '123' };
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: mockData,
              error: null,
            })
          })
        })
      });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await checkRecordExists('statuts' as SupabaseTable, 'id', '123');
      expect(result).toEqual(mockData);
      expect(mockFrom).toHaveBeenCalledWith('statuts');
    });

    it('should return null when error occurs', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error'),
            })
          })
        })
      });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await checkRecordExists('statuts' as SupabaseTable, 'id', '123');
      expect(result).toBeNull();
    });
  });

  describe('fetchFromTable', () => {
    it('should return data when fetch is successful', async () => {
      const mockData = [{ id: '123', code: 'test' }];
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockData,
          error: null,
        })
      });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await fetchFromTable('statuts' as SupabaseTable);
      expect(result).toEqual(mockData);
      expect(mockFrom).toHaveBeenCalledWith('statuts');
    });

    it('should return null when error occurs', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        })
      });
      
      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await fetchFromTable('statuts' as SupabaseTable);
      expect(result).toBeNull();
    });
  });
});
