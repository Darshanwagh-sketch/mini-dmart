// High-availability image utilities with bulletproof SVG data-URI fallback
export const DEFAULT_FALLBACK_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" fill="none"><rect width="300" height="300" rx="16" fill="%230f172a"/><path d="M150 75c-24.8 0-45 20.2-45 45v20h90v-20c0-24.8-20.2-45-45-45zm-25 65v-20c0-13.8 11.2-25 25-25s25 11.2 25 25v20h-50z" fill="%2310b981"/><rect x="75" y="140" width="150" height="105" rx="16" fill="%231e293b" stroke="%23334155" stroke-width="4"/><path d="M115 185h70M130 205h40" stroke="%2310b981" stroke-width="4" stroke-linecap="round"/><circle cx="150" cy="98" r="6" fill="%2310b981"/><text x="150" y="275" font-family="sans-serif" font-size="12" font-weight="700" fill="%2364748b" text-anchor="middle">D-MART ESSENTIALS</text></svg>`;

/**
 * Returns a valid image URL or fallback SVG
 */
export function getSafeImageUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return DEFAULT_FALLBACK_IMAGE;
  }
  return url.trim();
}

/**
 * Image error handler to guarantee images load without broken icons
 */
export function handleImageError(e) {
  if (e && e.target) {
    e.target.onerror = null; // prevent infinite loop
    e.target.src = DEFAULT_FALLBACK_IMAGE;
  }
}
