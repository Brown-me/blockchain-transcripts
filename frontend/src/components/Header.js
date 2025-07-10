import React from 'react';
import useWallet from '../hooks/useWallet';

export default function Header() {
  const { account, connectWallet } = useWallet();

  return (
    <header className="w-full px-6 py-4 bg-lightBg border-b border-darkBg flex justify-between items-center">
      <h1 className="text-xl font-semibold text-primary">Blockchain Transcript</h1>
      <div>
        {account ? (
          <span className="text-sm text-gray-300">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
