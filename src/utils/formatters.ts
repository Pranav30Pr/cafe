// Utility functions for formatting and validation complying with PROJECT_SPEC.md

/**
 * Format integer paise into INR currency display.
 * E.g., 14000 paise -> "₹140", 14050 paise -> "₹140.50"
 */
export function formatRupees(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(rupees);
}

/**
 * Extract customer first name only.
 * Section 5.3: Kitchen only sees first name.
 */
export function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return 'Guest';
  const clean = fullName.trim();
  const parts = clean.split(/\s+/);
  return parts[0] || 'Guest';
}

/**
 * Validate 10-digit Indian mobile number.
 * Must start with digits 6, 7, 8, or 9.
 */
export function validateIndianMobile(phone: string): boolean {
  const clean = phone.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(clean);
}

/**
 * Format relative elapsed time since order creation (e.g., "just now", "4m ago", "18m ago")
 */
export function formatMinutesAgo(isoDate: string): string {
  const now = Date.now();
  const created = new Date(isoDate).getTime();
  const diffMinutes = Math.floor((now - created) / 60000);

  if (diffMinutes <= 0) return 'Just now';
  if (diffMinutes === 1) return '1m ago';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const hours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;
  return `${hours}h ${remainingMinutes}m ago`;
}

/**
 * Generate a cryptographically secure, random URL-safe table token
 * Section 4: at least 16 characters, URL-safe, cryptographically secure.
 */
export function generateSecureTableToken(length = 24): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
}
