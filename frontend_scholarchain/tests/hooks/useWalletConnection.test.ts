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
