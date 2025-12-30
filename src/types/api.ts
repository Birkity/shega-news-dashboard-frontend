// Shega News Analytics Dashboard - TypeScript Type Definitions

// Site Types
export type Site = 'shega' | 'addis_insight';
export type SentimentLabel = 'positive' | 'negative' | 'neutral';
export type EntityType = 'persons' | 'organizations' | 'locations';

// Health & Status
export interface HealthResponse {
  status: 'healthy' | 'degraded';
  app_name: string;
  version: string;
  timestamp: string;
  mongodb_connected: boolean;
  mongodb_status: string;
}

// Dashboard Overview
export interface ArticleCount {
  shega_count: number;
  addis_insight_count: number;
  difference: number;
  percentage_difference: number;
}

export interface DateRange {
  shega: { earliest: string; latest: string };
  addis_insight: { earliest: string; latest: string };
}

export interface OverviewResponse {
  article_count: ArticleCount;
  date_range: DateRange;
}

// Daily Articles
export interface DailyArticle {
  date: string;
  shega: number;
  addis_insight: number;
}

// Dashboard Summary
export interface SiteSummary {
  total_articles: number;
  unique_authors: number;
  avg_body_word_count: number;
  avg_headline_word_count: number;
  avg_readability: number;
  avg_sentiment: number;
}

export interface DashboardSummary {
  shega: SiteSummary;
  addis_insight: SiteSummary;
  comparison: {
    total_articles_diff: number;
    unique_authors_diff: number;
    avg_body_words_diff: number;
  };
}

// Articles
export interface Article {
  id: string;
  title: string;
  slug: string;
  site: Site;
  author: string | null;
  posted_date: string;
  body: string;
  full_url: string;
  categories: string[];
  keywords: string[];
  word_count_body: number;
  word_count_headline?: number;
  sentence_count?: number;
  avg_sentence_length?: number;
  avg_word_length?: number;
  nlp_enriched?: boolean;
  sentiment_polarity?: number;
  sentiment_subjectivity?: number;
  sentiment_label?: SentimentLabel;
  readability_score?: number;
  entities_persons?: string[];
  entities_organizations?: string[];
  entities_locations?: string[];
  keywords_extracted?: string[];
}

export interface ArticlesResponse {
  total: number;
  page: number;
  per_page: number;
  articles: Article[];
}

export interface ArticleSample {
  title: string;
  excerpt: string;
  posted_date: string;
  author: string | null;
  site: Site;
  word_count: number;
  polarity: number;
  sentiment: SentimentLabel;
  keywords: string[];
  url: string;
}

// Authors
export interface TopAuthor {
  author: string;
  article_count: number;
  avg_word_count: number;
}

export interface AuthorWithStats extends TopAuthor {
  site: Site;
  avg_polarity: number;
  avg_subjectivity: number;
  sentiment_breakdown: {
    positive: number;
    negative: number;
    neutral: number;
    positive_pct: number;
  };
}

export interface AuthorSentiment {
  author: string;
  site: Site;
  article_count: number;
  avg_polarity: number;
  avg_subjectivity: number;
  polarity_range: { min: number; max: number };
}

// Author Productivity (Timeline)
export interface AuthorProductivityTimelineItem {
  date: string;
  total: number;
  shega: number;
  addis_insight: number;
  avg_word_count: number;
}

export interface AuthorProductivity {
  author: string;
  period: {
    start: string;
    end: string;
    days: number;
    granularity: 'day' | 'week' | 'month';
  };
  summary: {
    total_articles: number;
    active_periods: number;
    avg_per_period: number;
    max_in_period: number;
    min_in_period: number;
  };
  timeline: AuthorProductivityTimelineItem[];
}

// Author Keywords
export interface AuthorKeywordItem {
  keyword: string;
  count: number;
}

export interface AuthorNlpKeywordItem {
  keyword: string;
  count: number;
  avg_relevance_score: number;
}

export interface AuthorKeywords {
  author: string;
  stats: {
    total_articles: number;
    sites: string[];
    avg_keywords_per_article: number;
  };
  meta_keywords: AuthorKeywordItem[];
  nlp_keywords: AuthorNlpKeywordItem[] | null;
  total_unique_meta_keywords: number;
  total_unique_nlp_keywords: number | null;
}

// Categories
export interface CategoryDistribution {
  category: string;
  shega_count: number;
  addis_insight_count: number;
  total: number;
}

// Keywords
export interface TopKeyword {
  keyword: string;
  count: number;
}

export interface HeadlineKeyword {
  keyword: string;
  count: number;
}

export interface BodyKeyword {
  keyword: string;
  count: number;
  tfidf_score: number;
}

export interface HeadlineKeywordsResponse {
  keywords: {
    all: HeadlineKeyword[];
    shega: HeadlineKeyword[];
    addis_insight: HeadlineKeyword[];
  };
  stats: {
    total_articles_analyzed: number;
    unique_headline_words: {
      all: number;
      shega: number;
      addis_insight: number;
    };
    by_site: Record<string, { total_articles: number }>;
  };
  comparison: {
    shared_keywords: string[];
    shega_unique: string[];
    addis_insight_unique: string[];
    overlap_percentage: number;
  };
  visualization_config: {
    recommended_chart: string;
    color_scheme: Record<string, string>;
    size_scaling: string;
    tooltip_fields: string[];
  };
}

export interface BodyKeywordsResponse {
  keywords: {
    all: BodyKeyword[];
    shega: BodyKeyword[];
    addis_insight: BodyKeyword[];
  };
  stats: {
    total_articles_analyzed: number;
    unique_body_keywords: {
      all: number;
      shega: number;
      addis_insight: number;
    };
    by_site: Record<string, {
      articles_with_keywords: number;
      avg_keywords_per_article: number;
    }>;
  };
  comparison: {
    shared_keywords: string[];
    shega_unique: string[];
    addis_insight_unique: string[];
    overlap_percentage: number;
  };
  visualization_config: {
    recommended_chart: string;
    color_scheme: Record<string, string>;
    size_scaling: string;
    tooltip_fields: string[];
  };
}

// Topics
export interface TopicEvolutionMonth {
  month: string;
  top_keywords: Array<{ keyword: string; count: number }>;
  total_keywords: number;
}

export interface TopicEvolution {
  months: number;
  evolution: TopicEvolutionMonth[];
}

export interface TopicSpike {
  keyword: string;
  recent_count: number;
  previous_count: number;
  spike_ratio: number | null;
  is_new: boolean;
}

export interface TopicSentiment {
  most_positive: Array<{
    keyword: string;
    count: number;
    avg_polarity: number;
    avg_subjectivity: number;
  }>;
  most_negative: Array<{
    keyword: string;
    count: number;
    avg_polarity: number;
    avg_subjectivity: number;
  }>;
  most_subjective: Array<{
    keyword: string;
    count: number;
    avg_polarity: number;
    avg_subjectivity: number;
  }>;
}

export interface TopicSentimentDistribution {
  keyword: string;
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  positive_pct: number;
  negative_pct: number;
  neutral_pct: number;
}

// Sentiment
export interface SentimentTimelineItem {
  month: string;
  shega: {
    count: number;
    avg_polarity: number;
    positive_pct: number;
    negative_pct: number;
  };
  addis_insight: {
    count: number;
    avg_polarity: number;
    positive_pct: number;
    negative_pct: number;
  };
}

export interface TopSentimentArticle {
  title: string;
  excerpt: string;
  posted_date: string;
  author: string | null;
  polarity: number;
  url: string;
}

export interface TopSentimentResponse {
  shega: TopSentimentArticle[];
  addis_insight: TopSentimentArticle[];
}

// NLP Analytics
export interface SentimentSummary {
  count: number;
  avg_polarity: number;
  avg_subjectivity: number;
  positive: number;
  negative: number;
  neutral: number;
  positive_pct: number;
  negative_pct: number;
  neutral_pct: number;
}

export interface SentimentBySite {
  shega: SentimentSummary;
  addis_insight: SentimentSummary;
}

export interface EntityItem {
  entity: string;
  count: number;
  entity_type?: EntityType;
}

export interface ReadabilitySummary {
  count: number;
  avg_readability: number;
  avg_sentence_length: number;
  avg_word_length: number;
  avg_sentences: number;
}

export interface ReadabilityBySite {
  shega: ReadabilitySummary & { avg_word_count: number };
  addis_insight: ReadabilitySummary & { avg_word_count: number };
}

export interface EnrichmentStatus {
  total: number;
  enriched: number;
  pending: number;
  enriched_pct: number;
  by_site: {
    shega: { total: number; enriched: number };
    addis_insight: { total: number; enriched: number };
  };
}

// Publishing
export interface PublishingTrendItem {
  value: string;
  shega: number;
  addis_insight: number;
}

export interface PublishingTrends {
  by_hour: PublishingTrendItem[];
  by_weekday: PublishingTrendItem[];
  by_month: PublishingTrendItem[];
}

export interface YearlyStats {
  articles: number;
  unique_authors: number;
  avg_word_count: number;
  yoy_growth_pct: number | null;
}

export interface YearlyData {
  year: number;
  shega: YearlyStats;
  addis_insight: YearlyStats;
}

export interface YearlyResponse {
  years: YearlyData[];
}

// Comparison
export interface SharedKeyword {
  keyword: string;
  shega_count: number;
  addis_count: number;
}

export interface UniqueKeyword {
  keyword: string;
  count: number;
}

export interface KeywordComparison {
  shared: SharedKeyword[];
  shega_only: UniqueKeyword[];
  addis_insight_only: UniqueKeyword[];
  summary: {
    total_shared: number;
    total_shega_unique: number;
    total_addis_unique: number;
  };
}

export interface SharedEntity {
  entity: string;
  shega_count: number;
  addis_count: number;
}

export interface UniqueEntity {
  entity: string;
  count: number;
}

export interface EntityComparison {
  entity_type: EntityType;
  shared: SharedEntity[];
  shega_only: UniqueEntity[];
  addis_insight_only: UniqueEntity[];
}

// Content Analytics
export interface ContentLengthComparison {
  shega: {
    avg_body_words: number;
    min_body_words: number;
    max_body_words: number;
    count: number;
  };
  addis_insight: {
    avg_body_words: number;
    min_body_words: number;
    max_body_words: number;
    count: number;
  };
}

// Scraping Management
export interface ScrapeRequest {
  site: Site;
  max_articles?: number;
}

export interface ScrapeResponse {
  status: 'started' | 'completed' | 'failed';
  message: string;
  task_id?: string;
}

export interface ScrapeTaskStatus {
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  site: Site;
  stats?: {
    articles_found: number;
    articles_new: number;
    articles_updated: number;
  };
}

// Scheduler
export interface SchedulerStatus {
  enabled: boolean;
  running: boolean;
  interval_weeks: number;
  is_pipeline_running: boolean;
  last_run: string | null;
  next_run: string | null;
}

export interface SchedulerHealth {
  healthy: boolean;
  enabled: boolean;
  next_run: string | null;
  details: string;
}

// API Error
export interface APIError {
  detail: string;
}

// Articles Stats Summary
export interface ArticleStatsSite {
  _id: Site;
  count: number;
  avg_word_count: number;
  min_date: string;
  max_date: string;
  unique_authors_count: number;
}

export interface ArticleStatsSummary {
  sites: ArticleStatsSite[];
  total_articles: number;
}
