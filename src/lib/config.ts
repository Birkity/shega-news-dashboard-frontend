// Shega News Analytics Dashboard - API Configuration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const config = {
  apiBaseUrl: API_BASE_URL,
  defaultRevalidate: 300, // 5 minutes cache for most endpoints
  shortRevalidate: 60, // 1 minute for real-time data
  longRevalidate: 3600, // 1 hour for static data
};

export const endpoints = {
  // Health
  health: '/health',
  healthReady: '/health/ready',
  healthLive: '/health/live',

  // Dashboard Overview
  overview: '/analytics/overview',
  dailyArticles: '/analytics/articles/daily',
  dashboardSummary: '/analytics/dashboard/summary',

  // Articles
  articles: '/articles',
  articleById: (id: string) => `/articles/${id}`,
  articleBySlug: (site: string, slug: string) => `/articles/by-slug/${site}/${slug}`,
  articleStats: '/articles/stats/summary',
  articleSamples: '/analytics/articles/samples',

  // Authors
  topAuthors: '/analytics/authors/top',
  topAuthorsWithStats: '/analytics/authors/top-with-stats',
  authorsSentiment: '/analytics/authors/sentiment',

  // Categories
  categoriesDistribution: '/analytics/categories/distribution',

  // Keywords
  topKeywords: '/analytics/keywords/top',

  // Topics
  topicsEvolution: '/analytics/topics/evolution',
  topicsSpikes: '/analytics/topics/spikes',
  topicsSentiment: '/analytics/topics/sentiment',
  topicsSentimentDistribution: '/analytics/topics/sentiment-distribution',

  // Sentiment
  sentimentTimeline: '/analytics/sentiment/timeline',
  topPositive: '/analytics/sentiment/top-positive',
  topNegative: '/analytics/sentiment/top-negative',

  // NLP
  nlpSentimentSummary: '/analytics/nlp/sentiment/summary',
  nlpSentimentBySite: '/analytics/nlp/sentiment/by-site',
  nlpTopEntities: '/analytics/nlp/entities/top',
  nlpReadabilitySummary: '/analytics/nlp/readability/summary',
  nlpReadabilityBySite: '/analytics/nlp/readability/by-site',
  nlpExtractedKeywords: '/analytics/nlp/keywords/extracted',
  nlpEnrichmentStatus: '/analytics/nlp/enrichment-status',

  // Publishing
  publishingTrends: '/analytics/publishing/trends',
  publishingYearly: '/analytics/publishing/yearly',

  // Comparison
  compareKeywords: '/analytics/compare/keywords',
  compareEntities: '/analytics/compare/entities',

  // Content
  contentLengthComparison: '/analytics/content-length/comparison',

  // Scraping
  scrapeTrigger: '/scraping/trigger',
  scrapeStatus: (taskId: string) => `/scraping/status/${taskId}`,
  scrapeAllStatus: '/scraping/status',
  scrapePreview: (site: string) => `/scraping/preview/${site}`,

  // Scheduler
  schedulerStatus: '/scheduler/status',
  schedulerTrigger: '/scheduler/trigger',
  schedulerHealth: '/scheduler/health',
};

export default config;
