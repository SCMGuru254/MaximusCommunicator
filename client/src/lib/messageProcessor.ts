import { encryptMessage, decryptMessage, getOrCreateEncryptionKey } from './encryption';

interface ProcessedMessage {
  content: string;
  isEncrypted: boolean;
}

/**
 * Process outgoing messages (encrypt if needed)
 */
export function processOutgoingMessage(message: string, shouldEncrypt: boolean): ProcessedMessage {
  if (!shouldEncrypt) {
    return { content: message, isEncrypted: false };
  }
  
  const key = getOrCreateEncryptionKey();
  const encryptedContent = encryptMessage(message, key);
  
  return {
    content: encryptedContent,
    isEncrypted: true
  };
}

/**
 * Process incoming messages (decrypt if needed)
 */
export function processIncomingMessage(message: string, isEncrypted: boolean): string {
  if (!isEncrypted) {
    return message;
  }
  
  try {
    const key = getOrCreateEncryptionKey();
    return decryptMessage(message, key);
  } catch (error) {
    console.error('Error decrypting message:', error);
    return '[Encrypted message - Unable to decrypt]';
  }
}

/**
 * Parse menu options from a message
 * Returns an array of options if found, or null if no menu is detected
 */
export function parseMenuOptions(message: string): { title: string, prefix: string }[] | null {
  // Look for numbered or lettered options in the message
  const numberRegex = /\n(\d+)\.\s+([^\n]+)/g;
  const letterRegex = /\n([a-z])\.\s+([^\n]+)/g;
  
  const options: { title: string, prefix: string }[] = [];
  
  // Find numbered options
  let match;
  while ((match = numberRegex.exec(message)) !== null) {
    options.push({
      prefix: match[1], // The number
      title: match[2].trim() // The option text
    });
  }
  
  // Find lettered options
  while ((match = letterRegex.exec(message)) !== null) {
    options.push({
      prefix: match[1], // The letter
      title: match[2].trim() // The option text
    });
  }
  
  return options.length > 0 ? options : null;
}

/**
 * Extract form link from a message if present
 */
export function extractFormLink(message: string): string | null {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = urlRegex.exec(message);
  return match ? match[1] : null;
}

/**
 * Format time for display in chat
 */
export function formatMessageTime(date: Date | string): string {
  const messageDate = typeof date === 'string' ? new Date(date) : date;
  return messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
