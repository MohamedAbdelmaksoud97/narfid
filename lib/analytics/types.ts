import type { SearchCountry, SearchPeriod } from "@/lib/search-console/types";

export type AnalyticsMetrics = {
  users: number;
  sessions: number;
  views: number;
};
export type AnalyticsRow = { key: string; value: number };
export type AnalyticsReport = {
  country: SearchCountry;
  currentPeriod: SearchPeriod;
  previousPeriod: SearchPeriod;
  timeZone: string;
  current: AnalyticsMetrics | null;
  previous: AnalyticsMetrics | null;
  pages: AnalyticsRow[];
  channels: AnalyticsRow[];
  events: AnalyticsRow[];
  warnings: string[];
  fetchedAt: string;
};
export type AnalyticsRealtime = {
  activeUsers: number | null;
  events: AnalyticsRow[];
  country: SearchCountry;
  fetchedAt: string;
  warnings: string[];
};
export type AnalyticsDashboard = {
  configured: boolean;
  connected: boolean;
  propertyId: string;
  report: AnalyticsReport | null;
  error: string | null;
  reconnectRequired: boolean;
};
