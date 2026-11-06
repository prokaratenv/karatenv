import type { Account, Platform } from './types';

export const PLATFORMS: Platform[] = ['youtube', 'instagram', 'facebook', 'tiktok', 'linkedin'];

export const PLATFORM_LABEL: Record<Platform, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
};

/** Fixed categorical slot per platform (color follows the entity, never its rank). */
export const PLATFORM_SLOT: Record<Platform, number> = {
  youtube: 1,
  instagram: 2,
  facebook: 3,
  tiktok: 4,
  linkedin: 5,
};

export const platformColor = (p: Platform) => `var(--series-${PLATFORM_SLOT[p]})`;

/** The accounts CD runs today. Editable in the Accounts view. */
export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'yt-engage', platform: 'youtube', name: 'Engage Lifestyle Martial Arts', kind: 'business' },
  { id: 'ig-engage', platform: 'instagram', name: 'Engage Lifestyle Martial Arts', kind: 'business' },
  { id: 'ig-cdyoung', platform: 'instagram', name: 'CD Young', kind: 'personal' },
  { id: 'fb-engage', platform: 'facebook', name: 'Engage Lifestyle Martial Arts', kind: 'business' },
  { id: 'fb-cdyoung', platform: 'facebook', name: 'CD Young', kind: 'personal' },
  { id: 'tt-engage', platform: 'tiktok', name: 'Engage Lifestyle Martial Arts', kind: 'business' },
  { id: 'tt-cdyoung', platform: 'tiktok', name: 'CD Young', kind: 'personal' },
  { id: 'li-cdyoung', platform: 'linkedin', name: 'CD Young', kind: 'personal' },
];

export const accountLabel = (a: Account) => `${PLATFORM_LABEL[a.platform]} · ${a.name}`;
