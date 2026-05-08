/**
 * useWalletConnection.test.ts
 * 
 * PURPOSE:
 * Unit tests for the useWalletConnection custom hook. 
 * Since this hook depends on the MeshJS 'useWallet' hook and browser wallet extensions, 
 * we must mock these dependencies to verify the hook's logic in isolation.
 * 
 * PREREQUISITES:
 * 1. Install Vitest: `npm install -D vitest @testing-library/react @testing-library/react-hooks`
 * 2. Run tests: `npx vitest`
 * 
 * TEST COVERAGE:
 * 1. Initial State: Should return disconnected/null states initially.
 * 2. Connection Logic: Should trigger data fetching when 'connected' becomes true.
 * 3. Data Hydration: Should correctly capture address and balance from the wallet instance.
 * 4. Cleanup Logic: Should reset states to null when the wallet disconnects.
 */

/* 
// --- PSEUDOCODE FOR THE TEST SUITE ---

DESCRIBE "useWalletConnection Hook"
  
  IT "should initialize with disconnected state"
    MOCK useWallet TO RETURN { connected: false, wallet: null }
    RENDER hook
    EXPECT result.connected TO BE false
    EXPECT result.address TO BE null

  IT "should fetch address and balance when connected"
    MOCK wallet_instance { 
      getUsedAddresses: () => ["addr_test123"], 
      getBalance: () => "50000000" 
    }
    MOCK useWallet TO RETURN { connected: true, wallet: wallet_instance }
    
    RENDER hook
    AWAIT hook_to_finish_effects
    
    EXPECT result.address TO BE "addr_test123"
    EXPECT result.balance TO BE "50000000"

  IT "should clear state on disconnect"
    // Start connected
    MOCK useWallet TO RETURN { connected: true, wallet: instance }
    RENDER hook
    
    // Simulate disconnect
    UPDATE MOCK useWallet TO RETURN { connected: false, wallet: null }
    RE-RENDER
    
    EXPECT result.address TO BE null
    EXPECT result.balance TO BE null

END DESCRIBE
*/

// Actual Vitest code structure below:

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWalletConnection } from '../../hooks/useWalletConnection';
import { useWallet } from '@meshsdk/react';

// Mock the external dependency
vi.mock('@meshsdk/react', () => ({
  useWallet: vi.fn(),
}));

describe('useWalletConnection', () => {
  it('should handle the full connection lifecycle', async () => {
    // 1. Setup Mock for Disconnected State
    const mockUseWallet = useWallet as any;
    mockUseWallet.mockReturnValue({
      connected: false,
      wallet: null,
      connecting: false,
      name: '',
    });

    const { result, rerender } = renderHook(() => useWalletConnection());

    // Verify initial disconnected state
    expect(result.current.connected).toBe(false);
    expect(result.current.address).toBe(null);

    // 2. Setup Mock for Connected State
    const mockWallet = {
      getUsedAddresses: vi.fn().mockResolvedValue(['addr_test_mock_123']),
      getBalance: vi.fn().mockResolvedValue('100000000'),
    };

    mockUseWallet.mockReturnValue({
      connected: true,
      wallet: mockWallet,
      connecting: false,
      name: 'Eternl',
    });

    // Rerender the hook to trigger the useEffect
    rerender();

    // 3. Wait for Async Data Hydration
    await waitFor(() => {
      expect(result.current.address).toBe('addr_test_mock_123');
      expect(result.current.balance).toBe('100000000');
    });

    // 4. Setup Mock for Disconnect
    mockUseWallet.mockReturnValue({
      connected: false,
      wallet: null,
      connecting: false,
    });

    rerender();

    // 5. Verify Cleanup
    expect(result.current.address).toBe(null);
    expect(result.current.balance).toBe(null);
  });
});
