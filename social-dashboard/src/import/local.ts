/** Website (Search Console) and Google Business Profile numbers, from monthly reports. */
export interface GbpMonth {
  month: string; // YYYY-MM
  profile: string;
  interactions?: number;
  calls?: number;
  chatClicks?: number;
  directions?: number;
  websiteVisits?: number;
  profileViews?: number;
  searches?: number;
  /** Month-over-month change as a fraction (-0.46 = down 46%), as Google reports it. */
  change: Record<string, number>;
  topSearchTerms: { term: string; count: string }[];
}

export interface WebsitePeriod {
  period: string;
  clicks: number;
  impressions: number;
  ctr?: number;
  avgPosition?: number;
  indexedPages?: number;
  prev?: Partial<Pick<WebsitePeriod, 'clicks' | 'impressions' | 'avgPosition' | 'indexedPages'>>;
  source?: string;
}

export interface LocalData {
  gbp: GbpMonth[];
  website: WebsitePeriod[];
}

