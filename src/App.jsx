import './App.css'
import { TokenLaunchpad } from './components/TokenLaunchpad'
import { ErrorBoundary } from './components/ErrorBoundary'
import { WalletDetector } from './components/WalletDetector'

// wallet adapter imports
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  // Create wallet adapters with error handling
  const createWalletAdapter = () => {
    try {
      const adapter = new PhantomWalletAdapter();
      return adapter;
    } catch (error) {
      console.warn('Failed to create Phantom wallet adapter:', error);
      return null;
    }
  };

  const phantomAdapter = createWalletAdapter();
  const wallets = phantomAdapter ? [phantomAdapter] : [];

  return (
    <ErrorBoundary>
      <div style={{width: "100vw"}}>
        <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
          <WalletProvider wallets={wallets} autoConnect={false}>
              <WalletModalProvider>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 20
                }}>
                  <WalletMultiButton />
                  <WalletDisconnectButton />
                </div>
                <WalletDetector />
                <TokenLaunchpad></TokenLaunchpad>
              </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </div>
    </ErrorBoundary>
  )
}

export default App
