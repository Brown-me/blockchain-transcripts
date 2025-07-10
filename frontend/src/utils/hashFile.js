// src/utils/hashFile.js
export async function hashFile(file) {
  // Read file into an ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  // Compute SHA-256 digest
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  // Convert to byte array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Convert bytes to hex string
  const hashHex = hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}
