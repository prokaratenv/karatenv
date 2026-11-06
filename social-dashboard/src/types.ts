export type Platform = 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'linkedin';

export type AccountKind = 'business' | 'personal';

export interface Account {
  id: string;
  platform: Platform;
  name: string;
  kind: AccountKind;
  handle?: string;
}

export type PostFormat = 'short' | 'video' | 'image' | 'carousel' | 'text' | 'other';

/** One published piece of content on one account, with its latest metrics snapshot. */
export interface Post {
  /** Stable key: accountId + external id / url / title+date. */
  id: string;
  accountId: string;
  platform: Platform;
  externalId?: string;
  title: string;
  caption: string;
  url?: string;
  /** ISO timestamp. */
  publishedAt: string;
  durationSec?: number;
  format: PostFormat;
  views: number;
  impressions?: number;
  reach?: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  watchTimeHours?: number;
  avgViewDurationSec?: number;
  avgPercentViewed?: number;
  followersGained?: number;
  /** Posted via Opus Clip (detected from file or set on import). */
  viaOpus?: boolean;
  /** Opus Clip's predicted virality score (0-100), when known. */
  viralityScore?: number;
  hashtags: string[];
  importedAt: string;
  source: string;
}

export interface Topic {
  id: string;
  label: string;
  keywords: string[];
}

export interface Settings {
  topics: Topic[];
  anthropicApiKey?: string;
}

export interface Filters {
  /** Days back from the latest post; 0 = all time. */
  rangeDays: number;
  platforms: Platform[];
  accountIds: string[];
}
