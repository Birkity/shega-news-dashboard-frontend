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
  authorProductivity: (author: string) => `/analytics/authors/${encodeURIComponent(author)}/productivity`,
  authorKeywords: (author: string) => `/analytics/authors/${encodeURIComponent(author)}/keywords`,

  // Categories
  categoriesDistribution: '/analytics/categories/distribution',
  categoriesTopTopics: '/analytics/categories/top-topics',
  categoriesTopicComparison: '/analytics/categories/topic-comparison',

  // Keywords
  topKeywords: '/analytics/keywords/top',
  headlineKeywords: '/analytics/keywords/headlines',
  bodyKeywords: '/analytics/keywords/body',
  keywordsComprehensive: '/analytics/keywords/comprehensive',
  keywordsBySite: '/analytics/keywords/by-site',
  keywordsTrending: '/analytics/keywords/trending',

  // Topics
  topicsEvolution: '/analytics/topics/evolution',
  topicsSpikes: '/analytics/topics/spikes',
  topicsSentiment: '/analytics/topics/sentiment',
  topicsSentimentDistribution: '/analytics/topics/sentiment-distribution',
  topicsModeling: '/analytics/topics/modeling',
  topicsTreemap: '/analytics/topics/treemap',
  topicsSpikeTimeline: '/analytics/topics/spike-timeline',

  // Sentiment
  sentimentTimeline: '/analytics/sentiment/timeline',
  topPositive: '/analytics/sentiment/top-positive',
  topNegative: '/analytics/sentiment/top-negative',
  sentimentDistribution: '/analytics/sentiment/distribution',

  // NLP
  nlpSentimentSummary: '/analytics/nlp/sentiment/summary',
  nlpSentimentBySite: '/analytics/nlp/sentiment/by-site',
  nlpTopEntities: '/analytics/nlp/entities/top',
  nlpEntitiesPeople: '/analytics/nlp/entities/people',
  nlpEntitiesOrganizations: '/analytics/nlp/entities/organizations',
  nlpEntitiesLocations: '/analytics/nlp/entities/locations',
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
  compareOverview: '/analytics/compare/overview',
  comparePublishingTrends: '/analytics/compare/publishing-trends',
  compareDuplication: '/analytics/compare/duplication',
  compareCoverageGaps: '/analytics/compare/coverage-gaps',
  compareInsights: '/analytics/compare/insights',

  // Content
  contentLengthComparison: '/analytics/content-length/comparison',
  contentLengthDistribution: '/analytics/content-length/distribution',

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
