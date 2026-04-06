/**
 * Map subscription name (normalized) to local logo filename in public/logos/.
 * Add PNGs to frontend/public/logos/ (e.g. netflix.png, disney.png) and extend NAME_TO_LOGO.
 * Unmapped services show character-only fallback.
 */
const NAME_TO_LOGO = {
  netflix: 'netflix.png',
  disney: 'disney.png',
  'disney+': 'disney.png',
  disneyplus: 'disney.png',
  youtube: 'youtube.png',
  'youtube premium': 'youtube.png',
  'youtube music': 'youtube.png',
  spotify: 'spotify.png',
  amazon: 'prime-amz.png',
  'amazon prime': 'prime-amz.png',
  prime: 'prime-amz.png',
};

function normalize(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns local logo path for a subscription name, or null if no asset (use character only).
 */
export function getSubscriptionLogoUrl(name) {
  const n = normalize(name);
  if (!n) return null;
  const filename =
    NAME_TO_LOGO[n] ||
    Object.keys(NAME_TO_LOGO).find((key) => n.includes(key));
  if (!filename) return null;
  return `/logos/${filename}`;
}

/**
 * First letter of subscription name for fallback when no logo.
 */
export function getSubscriptionInitial(name) {
  if (!name || typeof name !== 'string') return '?';
  const trimmed = name.trim();
  return (trimmed[0] || '?').toUpperCase();
}
