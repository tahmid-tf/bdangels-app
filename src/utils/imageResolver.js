import { Platform } from 'react-native';

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
};

const EVENT_FALLBACK = require('../../assets/images/events/showcase.webp');
const DEFAULT_AVATAR = require('../../assets/images/team/default_pfp.jpg');

/**
 * Normalizes remote server URLs:
 * 1. Downgrades https -> http to prevent self-signed SSL handshake failures in dev/local environments.
 * 2. Rewrites bangladsh-angels-v2.test to accessible domain/IP.
 */
export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return null;

  let cleanUrl = url.trim();

  // Strip HTTPS to prevent mobile/browser self-signed SSL rejection
  if (cleanUrl.startsWith('https://')) {
    cleanUrl = 'http://' + cleanUrl.slice(8);
  }

  // If centralized storage URL is configured, route storage paths to it
  const customStorage = process.env.EXPO_PUBLIC_STORAGE_URL?.replace(/\/+$/, '');
  if (customStorage && cleanUrl.includes('/storage/')) {
    const storagePath = cleanUrl.substring(cleanUrl.indexOf('/storage/'));
    return `${customStorage}${storagePath.replace('/storage', '')}`;
  }

  // Replace internal Laravel APP_URL domain with accessible domain or local machine IP
  if (cleanUrl.includes('bangladsh-angels-v2.test')) {
    if (Platform.OS === 'android') {
      cleanUrl = cleanUrl.replace('bangladsh-angels-v2.test', '10.0.2.2/bdangels/public');
    } else {
      cleanUrl = cleanUrl.replace('bangladsh-angels-v2.test', 'bdangels.test');
    }
  }

  return cleanUrl;
}

/**
 * Resolves a portfolio company logo:
 * Checks bundled assets first for guaranteed instant load, otherwise normalizes remote URL.
 */
export function resolvePortfolioLogo(deal) {
  if (!deal) return null;

  const key = (deal.slug || deal.title || '').toLowerCase().trim();

  // Match bundled local asset
  for (const [mapKey, asset] of Object.entries(PORTFOLIO_MAP)) {
    if (key.includes(mapKey)) {
      return { source: asset, isLocal: true };
    }
  }

  // Fallback to normalized remote URL if provided
  if (deal.logo_url) {
    const normalized = normalizeImageUrl(deal.logo_url);
    if (normalized) {
      return { source: { uri: normalized }, isLocal: false };
    }
  }

  return null;
}

/**
 * Resolves a team member profile photo:
 * Checks bundled assets first, then normalized remote URL, then default avatar.
 */
export function resolveTeamPhoto(member) {
  if (!member) return { source: DEFAULT_AVATAR, isLocal: true };

  const nameKey = (member.name || '').toLowerCase().trim();

  for (const [mapKey, asset] of Object.entries(TEAM_MAP)) {
    if (nameKey.includes(mapKey)) {
      return { source: asset, isLocal: true };
    }
  }

  if (member.photo_url) {
    const normalized = normalizeImageUrl(member.photo_url);
    if (normalized) {
      return { source: { uri: normalized }, isLocal: false };
    }
  }

  return { source: DEFAULT_AVATAR, isLocal: true };
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
