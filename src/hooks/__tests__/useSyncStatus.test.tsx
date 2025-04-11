
import { renderHook, act } from '@testing-library/react-hooks';
import { useSyncStatus } from '../useSyncStatus';
import { checkSupabaseTables } from '@/utils/initSupabase';
import { syncTableData } from '@/services/syncService';
import { fetchFromTable } from '@/utils/supabaseHelpers';
import { SupabaseTable } from '@/types/supabase';

// Mock dependencies
jest.mock('@/utils/initSupabase', () => ({
  checkSupabaseTables: jest.fn()
}));

jest.mock('@/services/syncService', () => ({
  syncTableData: jest.fn()
}));

jest.mock('@/utils/supabaseHelpers', () => ({
  fetchFromTable: jest.fn()
}));

// Mock intervals in tests
jest.useFakeTimers();

describe('useSyncStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize correctly', () => {
    (checkSupabaseTables as jest.Mock).mockResolvedValue(true);
    
    const { result } = renderHook(() => useSyncStatus());
    
    expect(result.current.isSyncing).toBe(false);
    expect(result.current.lastSyncTime).toBeNull();
    expect(result.current.isConnected).toBeNull();
    expect(checkSupabaseTables).toHaveBeenCalled();
  });

  it('should update connection status after initialization', async () => {
    (checkSupabaseTables as jest.Mock).mockResolvedValue(true);
    
    const { result, waitForNextUpdate } = renderHook(() => useSyncStatus());
    
    await waitForNextUpdate();
    
    expect(result.current.isConnected).toBe(true);
  });

  it('should check connection periodically', async () => {
    (checkSupabaseTables as jest.Mock).mockResolvedValue(true);
    
    renderHook(() => useSyncStatus());
    
    expect(checkSupabaseTables).toHaveBeenCalledTimes(1);
    
    // Fast forward 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });
    
    expect(checkSupabaseTables).toHaveBeenCalledTimes(2);
  });

  it('should handle syncWithSupabase correctly when connected', async () => {
    (checkSupabaseTables as jest.Mock).mockResolvedValue(true);
    (syncTableData as jest.Mock).mockResolvedValue({ success: true, data: { id: '123' } });
    
    const { result, waitForNextUpdate } = renderHook(() => useSyncStatus());
    
    await waitForNextUpdate();
    
    let syncResult;
    await act(async () => {
      syncResult = await result.current.syncWithSupabase(
        { id: '123', nom: 'Test' }, 
        'employes' as SupabaseTable
      );
    });
    
    expect(syncResult).toEqual({ id: '123' });
    expect(syncTableData).toHaveBeenCalledWith(
      { id: '123', nom: 'Test' }, 
      'employes', 
      'id'
    );
    expect(result.current.lastSyncTime).not.toBeNull();
  });

  it('should not sync when disconnected', async () => {
    (checkSupabaseTables as jest.Mock).mockResolvedValue(false);
    
    const { result, waitForNextUpdate } = renderHook(() => useSyncStatus());
    
    await waitForNextUpdate();
    
    let syncResult;
    await act(async () => {
      syncResult = await result.current.syncWithSupabase(
        { id: '123', nom: 'Test' }, 
        'employes' as SupabaseTable
      );
    });
    
    expect(syncResult).toBe(false);
    expect(syncTableData).not.toHaveBeenCalled();
  });

  it('should handle fetchFromSupabase correctly when connected', async () => {
    (checkSupabaseTables as jest.Mock).mockResolvedValue(true);
    (fetchFromTable as jest.Mock).mockResolvedValue([{ id: '123', nom: 'Test' }]);
    
    const { result, waitForNextUpdate } = renderHook(() => useSyncStatus());
    
    await waitForNextUpdate();
    
    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchFromSupabase('employes' as SupabaseTable);
    });
    
    expect(fetchResult).toEqual([{ id: '123', nom: 'Test' }]);
    expect(fetchFromTable).toHaveBeenCalledWith('employes');
    expect(result.current.lastSyncTime).not.toBeNull();
  });

  it('should not fetch when disconnected', async () => {
    (checkSupabaseTables as jest.Mock).mockResolvedValue(false);
    
    const { result, waitForNextUpdate } = renderHook(() => useSyncStatus());
    
    await waitForNextUpdate();
    
    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchFromSupabase('employes' as SupabaseTable);
    });
    
    expect(fetchResult).toBeNull();
    expect(fetchFromTable).not.toHaveBeenCalled();
  });

  it('should handle fetch errors properly', async () => {
    (checkSupabaseTables as jest.Mock).mockResolvedValue(true);
    (fetchFromTable as jest.Mock).mockRejectedValue(new Error('Fetch error'));
    
    const { result, waitForNextUpdate } = renderHook(() => useSyncStatus());
    
    await waitForNextUpdate();
    
    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchFromSupabase('employes' as SupabaseTable);
    });
    
    expect(fetchResult).toBeNull();
  });
});
