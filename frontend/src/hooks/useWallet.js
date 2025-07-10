import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export default function useWallet() {
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);

  // On mount, check if already connected
  useEffect(() => {
    if (window.ethereum) {
      const p = new ethers.BrowserProvider(window.ethereum);
      setProvider(p);
      p.listAccounts().then(accounts => {
        if (accounts.length) setAddress(accounts[0]);
      });
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
      setProvider(new ethers.BrowserProvider(window.ethereum));
    } catch (err) {
      console.error(err);
    }
  }, []);

  return { address, connect, provider };
}
