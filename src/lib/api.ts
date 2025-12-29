// Shega News Analytics Dashboard - API Service Layer
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
function buildQuery(params: Record<string, string | number | undefined | null>): string {
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

// ============= Dashboard API =============
export const dashboardAPI = {
  getOverview: () => 
    fetchAPI<API.OverviewResponse>(endpoints.overview),

  getDailyArticles: (days: number = 30) => 
    fetchAPI<API.DailyArticle[]>(
      `${endpoints.dailyArticles}${buildQuery({ days })}`,
      {},
      config.shortRevalidate
    ),

  getSummary: () => 
    fetchAPI<API.DashboardSummary>(endpoints.dashboardSummary),
};

// ============= Articles API =============
export const articlesAPI = {
  getArticles: (params: {
    page?: number;
    per_page?: number;
    site?: API.Site;
    author?: string;
    category?: string;
    keyword?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  } = {}) => 
    fetchAPI<API.ArticlesResponse>(
      `${endpoints.articles}${buildQuery(params)}`,
      {},
      config.shortRevalidate
    ),

  getArticleById: (id: string) => 
    fetchAPI<API.Article>(endpoints.articleById(id)),

  getArticleBySlug: (site: string, slug: string) => 
    fetchAPI<API.Article>(endpoints.articleBySlug(site, slug)),

  getStats: () => 
    fetchAPI<API.ArticleStatsSummary>(endpoints.articleStats),

  getSamples: (params: {
    limit?: number;
    site?: API.Site;
    sort_by?: 'recent' | 'positive' | 'negative' | 'long' | 'short';
  } = {}) => 
    fetchAPI<API.ArticleSample[]>(
      `${endpoints.articleSamples}${buildQuery(params)}`,
      {},
      config.shortRevalidate
    ),
};

// ============= Authors API =============
export const authorsAPI = {
  getTop: (params: { limit?: number; site?: API.Site } = {}) => 
    fetchAPI<API.TopAuthor[]>(
      `${endpoints.topAuthors}${buildQuery(params)}`
    ),

  getTopWithStats: (params: { limit?: number; site?: API.Site } = {}) => 
    fetchAPI<API.AuthorWithStats[]>(
      `${endpoints.topAuthorsWithStats}${buildQuery(params)}`
    ),

  getSentiment: (params: {
    limit?: number;
    site?: API.Site;
    sort_by?: 'polarity' | 'subjectivity' | 'count';
  } = {}) => 
    fetchAPI<API.AuthorSentiment[]>(
      `${endpoints.authorsSentiment}${buildQuery(params)}`
    ),
};

// ============= Categories API =============
export const categoriesAPI = {
  getDistribution: (site?: API.Site) => 
    fetchAPI<API.CategoryDistribution[]>(
      `${endpoints.categoriesDistribution}${buildQuery({ site })}`
    ),
};

// ============= Keywords API =============
export const keywordsAPI = {
  getTop: (params: { limit?: number; site?: API.Site } = {}) => 
    fetchAPI<API.TopKeyword[]>(
      `${endpoints.topKeywords}${buildQuery(params)}`
    ),

  getExtracted: (params: { limit?: number; site?: API.Site } = {}) => 
    fetchAPI<API.TopKeyword[]>(
      `${endpoints.nlpExtractedKeywords}${buildQuery(params)}`
    ),
};

// ============= Topics API =============
export const topicsAPI = {
  getEvolution: (params: { months?: number; site?: API.Site; limit?: number } = {}) => 
    fetchAPI<API.TopicEvolution>(
      `${endpoints.topicsEvolution}${buildQuery(params)}`
    ),

  getSpikes: (params: { weeks?: number; threshold?: number; site?: API.Site } = {}) => 
    fetchAPI<API.TopicSpike[]>(
      `${endpoints.topicsSpikes}${buildQuery(params)}`,
      {},
      config.shortRevalidate
    ),

  getSentiment: (params: { limit?: number; site?: API.Site } = {}) => 
    fetchAPI<API.TopicSentiment>(
      `${endpoints.topicsSentiment}${buildQuery(params)}`
    ),

  getSentimentDistribution: (params: { limit?: number; site?: API.Site } = {}) => 
    fetchAPI<API.TopicSentimentDistribution[]>(
      `${endpoints.topicsSentimentDistribution}${buildQuery(params)}`
    ),
};

// ============= Sentiment API =============
export const sentimentAPI = {
  getTimeline: (params: { months?: number; site?: API.Site } = {}) => 
    fetchAPI<API.SentimentTimelineItem[]>(
      `${endpoints.sentimentTimeline}${buildQuery(params)}`
    ),

  getTopPositive: (params: { limit?: number; site?: API.Site } = {}) => 
    fetchAPI<API.TopSentimentResponse>(
      `${endpoints.topPositive}${buildQuery(params)}`
    ),

  getTopNegative: (params: { limit?: number; site?: API.Site } = {}) => 
    fetchAPI<API.TopSentimentResponse>(
      `${endpoints.topNegative}${buildQuery(params)}`
    ),
};

// ============= NLP API =============
export const nlpAPI = {
  getSentimentSummary: (params: { site?: API.Site; author?: string } = {}) => 
    fetchAPI<API.SentimentSummary>(
      `${endpoints.nlpSentimentSummary}${buildQuery(params)}`
    ),

  getSentimentBySite: () => 
    fetchAPI<API.SentimentBySite>(endpoints.nlpSentimentBySite),

  getTopEntities: (params: {
    entity_type?: API.EntityType;
    limit?: number;
    site?: API.Site;
  } = {}) => 
    fetchAPI<API.EntityItem[]>(
      `${endpoints.nlpTopEntities}${buildQuery(params)}`
    ),

  getReadabilitySummary: (site?: API.Site) => 
    fetchAPI<API.ReadabilitySummary>(
      `${endpoints.nlpReadabilitySummary}${buildQuery({ site })}`
    ),

  getReadabilityBySite: () => 
    fetchAPI<API.ReadabilityBySite>(endpoints.nlpReadabilityBySite),

  getEnrichmentStatus: () => 
    fetchAPI<API.EnrichmentStatus>(endpoints.nlpEnrichmentStatus),
};

// ============= Publishing API =============
export const publishingAPI = {
  getTrends: (site?: API.Site) => 
    fetchAPI<API.PublishingTrends>(
      `${endpoints.publishingTrends}${buildQuery({ site })}`
    ),

  getYearly: (site?: API.Site) => 
    fetchAPI<API.YearlyResponse>(
      `${endpoints.publishingYearly}${buildQuery({ site })}`
    ),
};

// ============= Comparison API =============
export const comparisonAPI = {
  getKeywords: (limit?: number) => 
    fetchAPI<API.KeywordComparison>(
      `${endpoints.compareKeywords}${buildQuery({ limit })}`
    ),

  getEntities: (params: { entity_type?: API.EntityType; limit?: number } = {}) => 
    fetchAPI<API.EntityComparison>(
      `${endpoints.compareEntities}${buildQuery(params)}`
    ),

  getContentLength: () => 
    fetchAPI<API.ContentLengthComparison>(endpoints.contentLengthComparison),
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
    fetchAPI<{ tasks: Record<string, API.ScrapeTaskStatus>; running_count: number; completed_count: number; failed_count: number }>(
      endpoints.scrapeAllStatus, {}, 0
    ),

  preview: (site: string, limit?: number) => 
    fetchAPI<{ site: string; total_urls: number; preview_urls: string[] }>(
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
  dashboard: dashboardAPI,
  articles: articlesAPI,
  authors: authorsAPI,
  categories: categoriesAPI,
  keywords: keywordsAPI,
  topics: topicsAPI,
  sentiment: sentimentAPI,
  nlp: nlpAPI,
  publishing: publishingAPI,
  comparison: comparisonAPI,
  scraping: scrapingAPI,
  scheduler: schedulerAPI,
};

export default api;
