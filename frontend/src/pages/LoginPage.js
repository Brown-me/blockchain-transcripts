import React, { useState } from 'react';
import { ethers } from 'ethers';

export default function LoginPage({ onLogin }) {
  const [error, setError] = useState('');

  const handleConnect = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to continue');
      }
      // Request accounts
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer   = await provider.getSigner();
      const address  = await signer.getAddress();

      // Fetch the ABI from the public folder
      const abiResponse = await fetch('/abi/TranscriptRegistry.json');
      if (!abiResponse.ok) {
        throw new Error('Could not load contract ABI');
      }
      const { abi } = await abiResponse.json();

      // Instantiate the contract
      const contract = new ethers.Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS,
        abi,
        signer
      );

      // Read the owner
      const owner = await contract.owner();
      const isOwner = address.toLowerCase() === owner.toLowerCase();

      // Notify parent
      onLogin({ address, isOwner });
    } catch (err) {
      setError(err.message || 'MetaMask login failed');
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-darkBg text-gray-100">
      <button
        onClick={handleConnect}
        className="px-6 py-3 bg-accent rounded-lg text-darkBg font-semibold hover:scale-105 transition"
      >
        Connect with MetaMask
      </button>
      {error && <p className="mt-4 text-red-400">{error}</p>}
    </div>
  );
}
