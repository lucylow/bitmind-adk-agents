import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  isConnected: boolean;
  userAddress: string | null;
  network: 'mainnet' | 'testnet';
  setConnected: (address: string) => void;
  setDisconnected: () => void;
  setNetwork: (network: 'mainnet' | 'testnet') => void;
  checkSession: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      isConnected: false,
      userAddress: null,
      network: 'testnet',
      setConnected: (address: string) => set({ isConnected: true, userAddress: address }),
      setDisconnected: () => set({ isConnected: false, userAddress: null }),
      setNetwork: (network: 'mainnet' | 'testnet') => set({ network }),
      checkSession: () => {
        // This will be called by components to check existing session
        // The actual session check is done in WalletConnect component
      },
    }),
    {
      name: 'wallet-storage', // localStorage key
    }
  )
);

