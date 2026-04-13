import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);

  const connect = useCallback(async () => {
    if (!window.ethereum) return alert('MetaMask not installed');
    const p = new ethers.BrowserProvider(window.ethereum);
    const [addr] = await p.send('eth_requestAccounts', []);
    setProvider(p);
    setAccount(addr);
  }, []);

  const disconnect = useCallback(() => { setAccount(null); setProvider(null); }, []);

  return { account, provider, connect, disconnect };
}
