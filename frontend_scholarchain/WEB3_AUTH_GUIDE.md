# Web3 Authentication Implementation Guide (Redux)

This guide outlines the implementation of Web3 Authentication for ScholarChain, aligned with the `project-structure.md` architecture.

## File Mappings

| Component/Module | Project Path | Description |
|---|---|---|
| **Root Provider** | `app/layout.tsx` | Wraps the application in `MeshProvider`. |
| **Auth Hook** | `hooks/useWalletConnection.ts` | Orchestrates wallet state and data fetching. |
| **Connect Button** | `components/wallet/WalletConnectButton.tsx` | UI entry point for wallet link. |
| **Wallet Display** | `components/wallet/WalletStatus.tsx` | Shows address/balance post-auth. |
| **Transaction Logic** | `lib/mesh/sendAda.ts` | Pure function for ADA transfers. |
| **Math Utilities** | `lib/utils/lovelaceConversion.ts` | ADA <-> Lovelace helpers. |
| **String Utilities** | `lib/utils/addressUtils.ts` | Address formatting/validation. |

## Implementation Workflow

1.  **Context Injection**: Update `app/layout.tsx` to include the `MeshProvider`.
2.  **State Management**: Implement the `useWalletConnection` hook to bridge MeshJS state with application-specific UX requirements.
3.  **UI Integration**: Add the `WalletConnectButton` to the Header and `WalletStatus` to the dashboard/header.
4.  **Transaction Foundation**: Implement the utilities in `lib/utils/` to handle Cardano-specific data formats.
5.  **Execution Logic**: Implement `lib/mesh/sendAda.ts` to facilitate on-chain movements using the authenticated wallet instance.

## Return Values Summary

*   **`useWalletConnection`**: Returns `{ wallet, connected, connecting, address, balance, name }`.
*   **`sendADA`**: Returns `Promise<string>` (the TxHash).
*   **`adaToLovelace`**: Returns `string` (integer value).
