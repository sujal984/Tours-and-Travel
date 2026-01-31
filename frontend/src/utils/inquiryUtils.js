/**
 * Utility functions for handling anonymous inquiries (abandoned cart-like flow)
 */

const INQUIRY_TOKENS_KEY = 'anonymous_inquiry_tokens';

/**
 * Store anonymous inquiry token in localStorage
 * @param {string} token - The anonymous inquiry token
 */
export const storeAnonymousInquiryToken = (token) => {
  try {
    const existingTokens = getAnonymousInquiryTokens();
    const updatedTokens = [...existingTokens, token];
    localStorage.setItem(INQUIRY_TOKENS_KEY, JSON.stringify(updatedTokens));
  } catch (error) {
    console.error('Error storing anonymous inquiry token:', error);
  }
};

/**
 * Get all stored anonymous inquiry tokens
 * @returns {string[]} Array of anonymous inquiry tokens
 */
export const getAnonymousInquiryTokens = () => {
  try {
    const tokens = localStorage.getItem(INQUIRY_TOKENS_KEY);
    return tokens ? JSON.parse(tokens) : [];
  } catch (error) {
    console.error('Error getting anonymous inquiry tokens:', error);
    return [];
  }
};

/**
 * Clear all anonymous inquiry tokens (after successful association)
 */
export const clearAnonymousInquiryTokens = () => {
  try {
    localStorage.removeItem(INQUIRY_TOKENS_KEY);
  } catch (error) {
    console.error('Error clearing anonymous inquiry tokens:', error);
  }
};

/**
 * Check if there are any stored anonymous inquiry tokens
 * @returns {boolean} True if there are stored tokens
 */
export const hasAnonymousInquiryTokens = () => {
  const tokens = getAnonymousInquiryTokens();
  return tokens.length > 0;
};

/**
 * Generate a unique token for anonymous inquiries
 * @returns {string} Unique token
 */
export const generateAnonymousToken = () => {
  return 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};