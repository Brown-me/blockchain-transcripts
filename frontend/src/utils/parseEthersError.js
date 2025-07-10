// src/utils/parseEthersError.js
import { ethers } from 'ethers';

export function parseEthersError(err) {
  // 1) If it’s a standard revert with data, decode it
  try {
    const data = err.cause?.error?.data || err.data;
    if (data && typeof data === 'string') {
      // strip method id and decode the ABI‑encoded string
      return ethers.AbiCoder.defaultAbiCoder.decode(
        ['string'],
        '0x' + data.slice(10)
      )[0];
    }
  } catch {
    // fall through to next checks
  }

  // 2) If we know it’s a CALL_EXCEPTION with no data,
  //    give a generic “duplicate” hint
  if (err.code === 'CALL_EXCEPTION') {
    return 'Transaction reverted on‑chain: possibly duplicate matric number or document hash.';
  }

  // 3) Otherwise fall back
  return err.reason || err.message || 'Unknown error';
}
