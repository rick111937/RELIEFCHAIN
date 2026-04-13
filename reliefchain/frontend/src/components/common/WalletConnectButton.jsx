import { useWallet } from '../../hooks/useWallet';

export default function WalletConnectButton() {
  const { account, connect, disconnect } = useWallet();
  return account
    ? <button onClick={disconnect}>{account.slice(0,6)}...{account.slice(-4)}</button>
    : <button onClick={connect}>Connect Wallet</button>;
}
