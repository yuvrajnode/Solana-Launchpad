import { useEffect, useState } from 'react';

export function WalletDetector() {
  const [walletStatus, setWalletStatus] = useState({
    phantom: false,
    solflare: false,
    backpack: false,
    glow: false
  });

  useEffect(() => {
    const checkWallets = () => {
      const status = {
        phantom: !!(window.phantom?.solana || window.solana?.isPhantom),
        solflare: !!(window.solflare),
        backpack: !!(window.backpack?.solana),
        glow: !!(window.glow?.solana)
      };
      setWalletStatus(status);
    };

    checkWallets();
    
    // Check again after a delay to handle slow-loading extensions
    const timer = setTimeout(checkWallets, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const installedWallets = Object.entries(walletStatus)
    .filter(([, installed]) => installed)
    .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));

  return (
    <div style={{
      backgroundColor: '#e7f3ff',
      border: '1px solid #b3d9ff',
      borderRadius: '8px',
      padding: '15px',
      margin: '10px 0',
      fontSize: '14px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>Wallet Status</h4>
      
      {installedWallets.length > 0 ? (
        <div>
          <p style={{ margin: '5px 0', color: '#006600' }}>
            ✅ Detected wallets: {installedWallets.join(', ')}
          </p>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
            If you're having connection issues, try disabling other wallet extensions in your browser.
          </p>
        </div>
      ) : (
        <div>
          <p style={{ margin: '5px 0', color: '#cc6600' }}>
            ⚠️ No Solana wallets detected
          </p>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
            Please install Phantom wallet or another Solana wallet to use this app.
          </p>
          <a 
            href="https://phantom.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: '#0066cc',
              textDecoration: 'underline',
              fontSize: '12px'
            }}
          >
            Install Phantom Wallet
          </a>
        </div>
      )}
      
      <div style={{ marginTop: '10px', fontSize: '11px', color: '#888' }}>
        <details>
          <summary style={{ cursor: 'pointer' }}>Troubleshooting Tips</summary>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Disable other wallet extensions temporarily</li>
            <li>Refresh the page after installing a wallet</li>
            <li>Make sure your wallet is unlocked</li>
            <li>Try using a different browser</li>
          </ul>
        </details>
      </div>
    </div>
  );
}
