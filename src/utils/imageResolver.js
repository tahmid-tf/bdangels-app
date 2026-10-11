// Local high-resolution bundled images as primary and fallback
const PORTFOLIO_MAP = {
  pathao: require('../../assets/images/portfolio/pathao.png'),
  priyoshop: require('../../assets/images/portfolio/priyoshop.jpeg'),
  jatri: require('../../assets/images/portfolio/jatri.jpeg'),
  'apon-well-being': require('../../assets/images/portfolio/apon.jpeg'),
  apon: require('../../assets/images/portfolio/apon.jpeg'),
  airwrk: require('../../assets/images/portfolio/airwrk.jpeg'),
  bongo: require('../../assets/images/portfolio/bongo.jpeg'),
  'praava-health': require('../../assets/images/portfolio/praava.jpeg'),
  praava: require('../../assets/images/portfolio/praava.jpeg'),
  myalice: require('../../assets/images/portfolio/myalice.jpeg'),
};

const TEAM_MAP = {
  ivy: require('../../assets/images/team/ivy.png'),
  zaaim: require('../../assets/images/team/zaaim.jpg'),
  bonnhy: require('../../assets/images/team/bonnhy.jpg'),
  rifat: require('../../assets/images/team/bonnhy.jpg'),
  nadim: require('../../assets/images/team/nadim.jpg'),
  prajna: require('../../assets/images/team/prajna.jpg'),
  arham: require('../../assets/images/team/arham.jpg'),
  tahmid: require('../../assets/images/team/tahmid.jpg'),
};

const EVENT_FALLBACK = require('../../assets/images/events/showcase.webp');
const DEFAULT_AVATAR = require('../../assets/images/team/default_pfp.jpg');

/**
 * Helper to extract 1-2 letter uppercase initials from a person or company name
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return 'BAN';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'BAN';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Normalizes remote server URLs:
 * 1. Preserves valid HTTPS for live production domains (https://bdangels.co).
 * 2. Rewrites relative /storage/ paths to centralized storage URL.
 * 3. Rewrites local .test domains to accessible production storage if needed.
 */
export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return null;

  let cleanUrl = url.trim();

  // Handle local .test domains by mapping to centralized storage URL
  const customStorage = process.env.EXPO_PUBLIC_STORAGE_URL?.replace(/\/+$/, '') || 'https://bdangels.co/storage';
  if (cleanUrl.includes('.test') && cleanUrl.includes('/storage/')) {
    const storagePath = cleanUrl.substring(cleanUrl.indexOf('/storage/'));
    return encodeURI(decodeURI(`${customStorage}${storagePath.replace('/storage', '')}`));
  }

  // If URL is an absolute HTTPS on live web, keep HTTPS
  if (cleanUrl.startsWith('https://')) {
    return encodeURI(decodeURI(cleanUrl));
  }

  // Upgrade http://bdangels.co to https://bdangels.co
  if (cleanUrl.startsWith('http://bdangels.co')) {
    return encodeURI(decodeURI(cleanUrl.replace('http://bdangels.co', 'https://bdangels.co')));
  }

  // Handle relative storage paths
  if (cleanUrl.startsWith('/storage/')) {
    return encodeURI(decodeURI(`${customStorage}${cleanUrl.replace('/storage', '')}`));
  }
  if (cleanUrl.startsWith('storage/')) {
    return encodeURI(decodeURI(`${customStorage}/${cleanUrl.replace(/^storage\//, '')}`));
  }

  return encodeURI(decodeURI(cleanUrl));
}

/**
 * Resolves a portfolio company logo:
 * Checks remote logo_url first, then bundled assets.
 */
export function resolvePortfolioLogo(deal) {
  if (!deal) return null;

  if (deal.logo_url) {
    const normalized = normalizeImageUrl(deal.logo_url);
    if (normalized) {
      return { source: { uri: normalized }, isLocal: false };
    }
  }

  const key = (deal.slug || deal.title || '').toLowerCase().trim();
  for (const [mapKey, asset] of Object.entries(PORTFOLIO_MAP)) {
    if (key.includes(mapKey)) {
      return { source: asset, isLocal: true };
    }
  }

  return null;
}

/**
 * Resolves a team member profile photo:
 * Prioritizes live remote photo_url from website API so new photos always show!
 */
export function resolveTeamPhoto(member) {
  const initials = getInitials(member?.name);
  if (!member) return { source: DEFAULT_AVATAR, isLocal: true, initials };

  // 1. LIVE REMOTE PHOTO FROM WEBSITE / API FIRST (ensures new/updated pictures show!)
  if (member.photo_url) {
    const normalized = normalizeImageUrl(member.photo_url);
    if (normalized) {
      return { source: { uri: normalized }, isLocal: false, initials };
    }
  }

  // 2. FALLBACK TO LOCAL ASSETS IF NO REMOTE PHOTO AVAILABLE
  const nameKey = (member.name || '').toLowerCase().trim();
  for (const [mapKey, asset] of Object.entries(TEAM_MAP)) {
    if (nameKey.includes(mapKey)) {
      return { source: asset, isLocal: true, initials };
    }
  }

  return { source: DEFAULT_AVATAR, isLocal: true, initials };
}

/**
 * Resolves an event showcase banner
 */
export function resolveEventBanner(event) {
  if (!event) return { source: EVENT_FALLBACK, isLocal: true };

  if (event.banner_url) {
    const normalized = normalizeImageUrl(event.banner_url);
    if (normalized) {
      return { source: { uri: normalized }, isLocal: false };
    }
  }

  return { source: EVENT_FALLBACK, isLocal: true };
}
