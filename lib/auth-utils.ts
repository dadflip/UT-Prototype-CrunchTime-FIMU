import crypto from 'crypto';

/**
 * Hash a PIN using SHA-256 for database storage
 * In production, consider using bcrypt for better security
 */
export function hashPIN(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

/**
 * Verify a PIN against its hash
 */
export function verifyPIN(pin: string, hash: string): boolean {
  return hashPIN(pin) === hash;
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a random PIN for jury members
 */
export function generateRandomPIN(length: number = 6): string {
  return Math.random().toString().substring(2, 2 + length);
}

/**
 * Validate PIN format (numeric, specific length)
 */
export function isValidPINFormat(pin: string, minLength: number = 4, maxLength: number = 8): boolean {
  return /^\d+$/.test(pin) && pin.length >= minLength && pin.length <= maxLength;
}
