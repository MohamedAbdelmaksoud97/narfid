export type SearchCountry = "sau" | "all";
export type SearchMetrics = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};
export type SearchRow = SearchMetrics & { key: string };
export type SearchPeriod = { startDate: string; endDate: string };
export type SearchReport = {
  country: SearchCountry;
  currentPeriod: SearchPeriod;
  previousPeriod: SearchPeriod;
  current: SearchMetrics | null;
  previous: SearchMetrics | null;
  trend: SearchRow[];
  queries: SearchRow[];
  pages: SearchRow[];
  devices: SearchRow[];
  fetchedAt: string;
  lastDataDate: string | null;
};
export type SearchDashboard = {
  configured: boolean;
  connected: boolean;
  siteUrl: string;
  connectedAt: string | null;
  report: SearchReport | null;
  error: string | null;
  reconnectRequired: boolean;
};
export type Inspection = {
  url: string;
  verdict: string;
  coverage: string;
  indexingState: string | null;
  robotsState: string | null;
  lastCrawlTime: string | null;
  googleCanonical: string | null;
  userCanonical: string | null;
  inspectionLink: string | null;
  inspectedAt: string;
};
