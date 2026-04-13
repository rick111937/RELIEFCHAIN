import { createContext, useContext } from 'react';
import { useWallet } from '../hooks/useWallet';
const WalletContext = createContext(null);
export function WalletProvider({ children }) {
  const wallet = useWallet();
  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>;
}
export const useWalletContext = () => useContext(WalletContext);
