// Shega News Analytics Dashboard - API Service Layer
// Based on API Documentation v2.0 (January 15, 2026)

import config, { endpoints } from './config';
import type * as API from '@/types/api';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  revalidate: number = config.defaultRevalidate
): Promise<T> {
  const url = `${config.apiBaseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    next: { revalidate },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Build query string from params
function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const filtered = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  
  return filtered.length > 0 ? `?${filtered.join('&')}` : '';
}

// ============= Health API =============
export const healthAPI = {
  getHealth: () => 
    fetchAPI<API.HealthResponse>(endpoints.health, {}, config.shortRevalidate),
  
  getReady: () => 
    fetchAPI<{ status: string }>(endpoints.healthReady, {}, 0),
  
  getLive: () => 
    fetchAPI<{ status: string }>(endpoints.healthLive, {}, 0),
};

// ============= Content Analytics API =============
export const contentAnalyticsAPI = {
  // Content Length endpoints
  getLengthComparison: () => 
    fetchAPI<API.ContentLengthComparison>(endpoints.contentLengthComparison),

  getLengthDistribution: (params: { site?: API.Site } = {}) => 
    fetchAPI<API.ContentLengthDistribution>(
      `${endpoints.contentLengthDistribution}${buildQuery(params)}`
    ),

  // Content Format endpoints
  getFormatInsights: (params: { site?: API.Site } = {}) => 
    fetchAPI<API.ContentFormatInsights>(
      `${endpoints.contentFormatInsights}${buildQuery(params)}`
    ),

  getFormatTrends: (params: { site?: API.Site; months?: number } = {}) => 
    fetchAPI<API.ContentFormatTrends>(
      `${endpoints.contentFormatTrends}${buildQuery(params)}`
    ),

  // Content Elements endpoints
  getImageCoverage: (params: { site?: API.Site } = {}) => 
    fetchAPI<API.ImageCoverage>(
      `${endpoints.contentElementsImages}${buildQuery(params)}`
    ),
};

// ============= Keywords Analytics API =============
export const keywordsAnalyticsAPI = {
  getTop: (params: { limit?: number; site?: API.Site } = {}) => 
    fetchAPI<API.TopKeywordsResponse>(
      `${endpoints.keywordsTop}${buildQuery(params)}`
    ),

  getTrending: (params: { days?: number; months?: number; site?: API.Site } = {}) => 
    fetchAPI<API.TrendingKeywordsResponse>(
      `${endpoints.keywordsTrending}${buildQuery(params)}`
    ),

  getBySite: (params: { limit?: number } = {}) => 
    fetchAPI<API.KeywordsBySiteResponse>(
      `${endpoints.keywordsBySite}${buildQuery(params)}`
    ),
};

// ============= Topics Analytics API =============
export const topicsAnalyticsAPI = {
  getLabels: (params: { limit?: number; site?: API.Site } = {}) => 
    fetchAPI<API.TopicLabelsResponse>(
      `${endpoints.topicsLabels}${buildQuery(params)}`
    ),

  getLabelsBySite: (params: { limit?: number } = {}) => 
    fetchAPI<API.TopicLabelsBySiteResponse>(
      `${endpoints.topicsLabelsBySite}${buildQuery(params)}`
    ),

  getLabelsOverTime: (params: { site?: API.Site; months?: number; top_n?: number } = {}) => 
    fetchAPI<API.TopicLabelsOverTimeResponse>(
      `${endpoints.topicsLabelsOverTime}${buildQuery(params)}`
    ),
};

// ============= Sentiment Analytics API =============
export const sentimentAnalyticsAPI = {
  getDistribution: (params: { site?: API.Site } = {}) => 
    fetchAPI<API.SentimentDistributionResponse>(
      `${endpoints.sentimentDistribution}${buildQuery(params)}`
    ),

  getTimeline: (params: { site?: API.Site; months?: number } = {}) => 
    fetchAPI<API.SentimentTrendsResponse>(
      `${endpoints.sentimentTimeline}${buildQuery(params)}`
    ),

  getTopPositive: (params: { site?: API.Site; limit?: number } = {}) => 
    fetchAPI<any>(
      `${endpoints.sentimentTopPositive}${buildQuery(params)}`
    ),

  getTopNegative: (params: { site?: API.Site; limit?: number } = {}) => 
    fetchAPI<any>(
      `${endpoints.sentimentTopNegative}${buildQuery(params)}`
    ),
};

// ============= NLP & Entity Analytics API =============
export const nlpAnalyticsAPI = {
  getPeople: (params: { site?: API.Site; limit?: number } = {}) => 
    fetchAPI<API.NLPPeopleResponse>(
      `${endpoints.nlpEntitiesPeople}${buildQuery(params)}`
    ),

  getOrganizations: (params: { site?: API.Site; limit?: number } = {}) => 
    fetchAPI<API.NLPOrganizationsResponse>(
      `${endpoints.nlpEntitiesOrganizations}${buildQuery(params)}`
    ),

  getLocations: (params: { site?: API.Site; limit?: number } = {}) => 
    fetchAPI<API.NLPLocationsResponse>(
      `${endpoints.nlpEntitiesLocations}${buildQuery(params)}`
    ),

  getEnrichmentStatus: (params: { site?: API.Site } = {}) => 
    fetchAPI<API.NLPEnrichmentStatusResponse>(
      `${endpoints.nlpEnrichmentStatus}${buildQuery(params)}`
    ),

  getReadabilitySummary: () => 
    fetchAPI<API.NLPReadabilitySummaryResponse>(
      endpoints.nlpReadabilitySummary
    ),

  getReadabilityBySite: () => 
    fetchAPI<API.NLPReadabilityBySiteResponse>(
      endpoints.nlpReadabilityBySite
    ),
};

// ============= Author Analytics API =============
export const authorAnalyticsAPI = {
  getOverviewCards: (params: { site?: API.Site } = {}) => 
    fetchAPI<API.AuthorOverviewCardsResponse>(
      `${endpoints.authorsOverviewCards}${buildQuery(params)}`
    ),

  getList: (params: { 
    site?: API.Site; 
    min_articles?: number; 
    sort_by?: 'articles' | 'sentiment' | 'recent' 
  } = {}) => 
    fetchAPI<API.AuthorListResponse>(
      `${endpoints.authorsList}${buildQuery(params)}`
    ),

  getSentiment: (params: { 
    site?: API.Site; 
    sort_by?: 'polarity' | 'subjectivity' | 'articles';
    order?: 'asc' | 'desc';
    limit?: number;
  } = {}) => 
    fetchAPI<API.AuthorSentimentResponse>(
      `${endpoints.authorsSentiment}${buildQuery(params)}`
    ),

  getProductivity: (author: string, params: { 
    site?: API.Site; 
    granularity?: 'day' | 'week' | 'month';
    days?: number;
  } = {}) => 
    fetchAPI<API.AuthorProductivity>(
      `${endpoints.authorsProductivity(author)}${buildQuery(params)}`
    ),

  getKeywords: (author: string, params: { 
    site?: API.Site; 
    limit?: number;
    include_nlp?: boolean;
  } = {}) => 
    fetchAPI<API.AuthorKeywords>(
      `${endpoints.authorsKeywords(author)}${buildQuery(params)}`
    ),

  getSentimentDetail: (author: string, params: { site?: API.Site } = {}) => 
    fetchAPI<API.AuthorSentimentDetailResponse>(
      `${endpoints.authorsSentimentDetail(author)}${buildQuery(params)}`
    ),
};

// ============= Publishing Analytics API =============
export const publishingAnalyticsAPI = {
  getCalendarHeatmap: (params: { 
    site?: API.Site; 
    year?: number; 
    months?: number 
  } = {}) => 
    fetchAPI<API.PublishingCalendarHeatmapResponse>(
      `${endpoints.publishingCalendarHeatmap}${buildQuery(params)}`,
      {},
      config.shortRevalidate
    ),

  getYearlyComparison: (params: { site?: API.Site } = {}) => 
    fetchAPI<API.PublishingYearlyComparisonResponse>(
      `${endpoints.publishingYearlyComparison}${buildQuery(params)}`
    ),

  getMonthlyCalendar: (params: { 
    site?: API.Site; 
    year: number; 
    month: number 
  }) => 
    fetchAPI<API.PublishingMonthlyCalendarResponse>(
      `${endpoints.publishingMonthlyCalendar}${buildQuery(params)}`
    ),
};

// ============= Competitive Analysis API =============
export const competitiveAnalysisAPI = {
  getContentOverlap: () => 
    fetchAPI<API.ContentOverlapResponse>(endpoints.compareContentOverlap),

  getTopicOverlap: () => 
    fetchAPI<API.TopicOverlapResponse>(endpoints.compareTopicOverlap),

  getCompetitiveSummary: () => 
    fetchAPI<API.CompetitiveSummaryResponse>(endpoints.compareCompetitiveSummary),
};

// ============= Article Drill-Down API =============
export const articleDrillDownAPI = {
  getList: (params: {
    page?: number;
    per_page?: number;
    site?: API.Site;
    author?: string;
    keyword?: string;
    topic_label?: string;
    category?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
    content_length?: 'short' | 'medium' | 'long';
    search?: string;
    date_range?: string;
    sort_by?: 'recent' | 'oldest' | 'positive' | 'negative' | 'long' | 'short';
  } = {}) => 
    fetchAPI<API.ArticleListResponse>(
      `${endpoints.articlesList}${buildQuery(params)}`,
      {},
      config.shortRevalidate
    ),

  getByKeyword: (params: {
    keyword: string;
    site?: API.Site;
    page?: number;
    per_page?: number;
  }) => 
    fetchAPI<API.ArticleListResponse>(
      `${endpoints.articlesByKeyword}${buildQuery(params)}`,
      {},
      config.shortRevalidate
    ),

  getByTopic: (params: {
    topic_label: string;
    site?: API.Site;
    page?: number;
    per_page?: number;
  }) => 
    fetchAPI<API.ArticleListResponse>(
      `${endpoints.articlesByTopic}${buildQuery(params)}`,
      {},
      config.shortRevalidate
    ),

  getByAuthor: (params: {
    author: string;
    site?: API.Site;
    page?: number;
    per_page?: number;
  }) => 
    fetchAPI<API.ArticleListResponse>(
      `${endpoints.articlesByAuthor}${buildQuery(params)}`,
      {},
      config.shortRevalidate
    ),
};

// ============= Scraping API =============
export const scrapingAPI = {
  trigger: async (data: API.ScrapeRequest) => {
    const response = await fetch(`${config.apiBaseUrl}${endpoints.scrapeTrigger}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail);
    }
    
    return response.json() as Promise<API.ScrapeResponse>;
  },

  getStatus: (taskId: string) => 
    fetchAPI<API.ScrapeTaskStatus>(endpoints.scrapeStatus(taskId), {}, 0),

  getAllStatus: () => 
    fetchAPI<API.ScrapeAllStatusResponse>(
      endpoints.scrapeAllStatus, {}, 0
    ),

  preview: (site: string, limit?: number) => 
    fetchAPI<API.ScrapePreviewResponse>(
      `${endpoints.scrapePreview(site)}${buildQuery({ limit })}`
    ),
};

// ============= Scheduler API =============
export const schedulerAPI = {
  getStatus: () => 
    fetchAPI<API.SchedulerStatus>(endpoints.schedulerStatus, {}, 0),

  trigger: async () => {
    const response = await fetch(`${config.apiBaseUrl}${endpoints.schedulerTrigger}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail);
    }
    
    return response.json() as Promise<{ status: string; message: string }>;
  },

  getHealth: () => 
    fetchAPI<API.SchedulerHealth>(endpoints.schedulerHealth, {}, 0),
};

// Export all APIs as a single object for convenience
export const api = {
  health: healthAPI,
  contentAnalytics: contentAnalyticsAPI,
  keywordsAnalytics: keywordsAnalyticsAPI,
  topicsAnalytics: topicsAnalyticsAPI,
  sentimentAnalytics: sentimentAnalyticsAPI,
  nlpAnalytics: nlpAnalyticsAPI,
  authorAnalytics: authorAnalyticsAPI,
  publishingAnalytics: publishingAnalyticsAPI,
  competitiveAnalysis: competitiveAnalysisAPI,
  articleDrillDown: articleDrillDownAPI,
  scraping: scrapingAPI,
  scheduler: schedulerAPI,
};

export default api;
