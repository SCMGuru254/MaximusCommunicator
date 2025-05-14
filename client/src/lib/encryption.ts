/**
 * Simple encryption/decryption utility for messages
 * In a production environment, you'd use a more robust encryption library
 */

// Simple XOR encryption with a key
export function encryptMessage(message: string, key: string): string {
  let result = '';
  for (let i = 0; i < message.length; i++) {
    const messageChar = message.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    result += String.fromCharCode(messageChar ^ keyChar);
  }
  // Convert to base64 for safe storage
  return btoa(result);
}

// Decrypt an XOR encrypted message
export function decryptMessage(encryptedMessage: string, key: string): string {
  // Convert from base64
  const base64Decoded = atob(encryptedMessage);
  let result = '';
  for (let i = 0; i < base64Decoded.length; i++) {
    const encryptedChar = base64Decoded.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    result += String.fromCharCode(encryptedChar ^ keyChar);
  }
  return result;
}

// Generate a random encryption key
export function generateEncryptionKey(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  
  return result;
}

// Hash a string (for storing passwords, etc.)
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

// Storage key for the encryption key
const ENCRYPTION_KEY_STORAGE = 'maximus_encryption_key';

// Get the stored encryption key or generate a new one
export function getOrCreateEncryptionKey(): string {
  let key = localStorage.getItem(ENCRYPTION_KEY_STORAGE);
  if (!key) {
    key = generateEncryptionKey();
    localStorage.setItem(ENCRYPTION_KEY_STORAGE, key);
  }
  return key;
}
