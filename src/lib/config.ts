// Shega News Analytics Dashboard - API Configuration
// Based on API Documentation v2.0 (January 15, 2026)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const config = {
  apiBaseUrl: API_BASE_URL,
  defaultRevalidate: 300, // 5 minutes cache for most endpoints
  shortRevalidate: 60, // 1 minute for real-time data
  longRevalidate: 3600, // 1 hour for static data
};

// Complete endpoint mapping from API Documentation v2.0
export const endpoints = {
  // ============= Health & System =============
  health: '/health',
  healthReady: '/health/ready',
  healthLive: '/health/live',

  // ============= Content Analytics =============
  // Content Length
  contentLengthComparison: '/analytics/content-length/comparison',
  contentLengthDistribution: '/analytics/content-length/distribution',
  
  // Content Format
  contentFormatInsights: '/analytics/content-format/insights',
  contentFormatTrends: '/analytics/content-format/trends',
  
  // Content Elements
  contentElementsImages: '/analytics/content-elements/images',

  // ============= Keywords Analytics =============
  keywordsTop: '/analytics/keywords/top',
  keywordsTrending: '/analytics/keywords/trending',
  keywordsBySite: '/analytics/keywords/by-site',

  // ============= Topics Analytics =============
  topicsLabels: '/analytics/topics/labels',
  topicsLabelsBySite: '/analytics/topics/labels-by-site',
  topicsLabelsOverTime: '/analytics/topics/labels-over-time',

  // ============= Sentiment Analytics =============
  sentimentDistribution: '/analytics/sentiment/distribution',
  sentimentTrends: '/analytics/sentiment/trends',

  // ============= NLP & Entity Analytics =============
  nlpEntitiesPeople: '/analytics/nlp/entities/people',
  nlpEntitiesOrganizations: '/analytics/nlp/entities/organizations',
  nlpEntitiesLocations: '/analytics/nlp/entities/locations',
  nlpEntitiesTop: '/analytics/nlp/entities/top',
  nlpEnrichmentStatus: '/analytics/nlp/enrichment-status',
  nlpReadabilitySummary: '/analytics/nlp/readability/summary',
  nlpReadabilityBySite: '/analytics/nlp/readability/by-site',

  // ============= Author Analytics =============
  authorsOverviewCards: '/analytics/authors/overview-cards',
  authorsList: '/analytics/authors/list',
  authorsSentiment: '/analytics/authors/sentiment',
  authorsProductivity: (author: string) => `/analytics/authors/${encodeURIComponent(author)}/productivity`,
  authorsKeywords: (author: string) => `/analytics/authors/${encodeURIComponent(author)}/keywords`,
  authorsSentimentDetail: (author: string) => `/analytics/authors/${encodeURIComponent(author)}/sentiment-detail`,

  // ============= Publishing Analytics =============
  publishingCalendarHeatmap: '/analytics/publishing/calendar-heatmap',
  publishingYearlyComparison: '/analytics/publishing/yearly-comparison',
  publishingMonthlyCalendar: '/analytics/publishing/monthly-calendar',

  // ============= Competitive Analysis =============
  compareContentOverlap: '/analytics/compare/content-overlap',
  compareTopicOverlap: '/analytics/compare/topic-overlap',
  compareCompetitiveSummary: '/analytics/compare/competitive-summary',

  // ============= Article Drill-Down =============
  articlesList: '/analytics/articles/list',
  articlesByKeyword: '/analytics/articles/by-keyword',
  articlesByTopic: '/analytics/articles/by-topic',
  articlesByAuthor: '/analytics/articles/by-author',

  // ============= Scraping & Scheduler =============
  scrapeTrigger: '/scraping/trigger',
  scrapeStatus: (taskId: string) => `/scraping/status/${taskId}`,
  scrapeAllStatus: '/scraping/status',
  scrapePreview: (site: string) => `/scraping/preview/${site}`,
  
  schedulerStatus: '/scheduler/status',
  schedulerTrigger: '/scheduler/trigger',
  schedulerHealth: '/scheduler/health',
};

export default config;
