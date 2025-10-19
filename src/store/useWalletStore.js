import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useWalletStore = create()(persist((set) => ({
    isConnected: false,
    userAddress: null,
    network: 'testnet',
    setConnected: (address) => set({ isConnected: true, userAddress: address }),
    setDisconnected: () => set({ isConnected: false, userAddress: null }),
    setNetwork: (network) => set({ network }),
    checkSession: () => {
        // This will be called by components to check existing session
        // The actual session check is done in WalletConnect component
    },
}), {
    name: 'wallet-storage', // localStorage key
}));
