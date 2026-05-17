'use client';

import { useWalletConnection } from '@/hooks/useWalletConnection';
import WalletConnectButton from '@/components/wallet/WalletConnectButton';

/**
 * Diagnostic Auth Dashboard
 * 
 * PURPOSE: 
 * Manually verify the output of useWalletConnection without needing a test runner.
 */
export default function DebugAuthPage() {
  const connection = useWalletConnection();

  return (
    <div className="p-10 font-mono text-sm bg-gray-900 text-green-400 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 border-b border-green-800 pb-2">
        Web3 Auth Diagnostic Tool
      </h1>

      <div className="mb-8">
        <h2 className="text-lg mb-2 text-white font-semibold underline">1. Connection Trigger</h2>
        <WalletConnectButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="border border-green-800 p-4 rounded bg-black">
          <h2 className="text-lg mb-4 text-white font-semibold border-b border-green-900">2. Hook Output (Raw State)</h2>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(
              {
                connected: connection.connected,
                connecting: connection.connecting,
                walletName: connection.name,
                hasWalletInstance: !!connection.wallet,
                error: connection.error || 'none',
              },
              null,
              2
            )}
          </pre>
        </section>

        <section className="border border-green-800 p-4 rounded bg-black">
          <h2 className="text-lg mb-4 text-white font-semibold border-b border-green-900">3. Hydrated Data</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 uppercase text-xs">Public Address:</p>
              <p className="break-all text-blue-300">
                {connection.address || '--- (Disconnected)'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 uppercase text-xs">ADA Balance (Lovelace):</p>
              <p className="text-yellow-400 text-xl font-bold">
                {connection.balance || '0'}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-10 p-4 bg-blue-900/20 border border-blue-900 text-blue-300 rounded text-xs">
        <p className="font-bold mb-1">How to verify:</p>
        <ol className="list-decimal ml-4 space-y-1">
          <li>Click the button and connect your Eternl/Nami wallet.</li>
          <li>Verify "connected" changes to true in section 2.</li>
          <li>Verify "address" and "balance" populate correctly in section 3.</li>
          <li>Disconnect your wallet and verify both sections reset to null/initial state.</li>
        </ol>
      </div>
    </div>
  );
}
