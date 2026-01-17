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
  headline_keywords: AuthorKeywordItem[];
  body_keywords: AuthorKeywordItem[];
  total_unique_headline_keywords: number;
  total_unique_body_keywords: number;
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
export interface ContentLengthSiteStats {
  avg_body_words: number;
  min_body_words: number;
  max_body_words: number;
  count: number;
}

export interface ContentLengthComparison {
  sites: {
    shega: ContentLengthSiteStats;
    addis_insight: ContentLengthSiteStats;
  };
  available_sites: string[];
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

// =================== NEW TYPES ===================

// Trending Keywords
export interface TrendingKeyword {
  keyword: string;
  recent_count: number;
  previous_count: number;
  spike_ratio: number | null;
  is_new: boolean;
}

// Topics Treemap
export interface TopicTreemapItem {
  name: string;
  value: number;
  site?: Site;
}

// Topics Modeling
export interface TopicModelCluster {
  topic_id: number;
  label: string;
  keywords: string[];
  article_count: number;
}

export interface TopicsModelingResponse {
  num_topics: number;
  topics: TopicModelCluster[];
}

// Topic Spike Timeline
export interface TopicSpikeTimelineItem {
  week: string;
  keyword: string;
  count: number;
  spike_intensity: number;
}

export interface TopicSpikeTimelineResponse {
  weeks: number;
  threshold: number;
  data: TopicSpikeTimelineItem[];
}

// Sentiment Distribution
export interface SentimentDistribution {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
  positive_pct: number;
  negative_pct: number;
  neutral_pct: number;
}

// Content Length Distribution
export interface ContentLengthDistributionBin {
  bin: string;
  min_words: number;
  max_words: number;
  shega: number;
  addis_insight: number;
  total: number;
}

export interface ContentLengthDistribution {
  bins: ContentLengthDistributionBin[];
  stats: {
    total_articles: number;
    avg_word_count: number;
  };
}

// Compare Overview
export interface CompareOverviewSite {
  total_articles: number;
  unique_authors: number;
  avg_sentiment: number;
  avg_readability: number;
  avg_word_count: number;
  top_keyword: string;
  coverage_period: {
    earliest: string;
    latest: string;
  };
}

export interface CompareOverview {
  shega: CompareOverviewSite;
  addis_insight: CompareOverviewSite;
  winner: {
    articles: Site;
    sentiment: Site;
    readability: Site;
    word_count: Site;
  };
}

// Compare Publishing Trends
export interface ComparePublishingTrendsItem {
  month: string;
  shega: number;
  addis_insight: number;
}

export interface ComparePublishingTrends {
  months: number;
  data: ComparePublishingTrendsItem[];
}

// Compare Duplication
export interface DuplicateArticlePair {
  shega_title: string;
  addis_title: string;
  shega_url: string;
  addis_url: string;
  similarity_score: number;
  published_date_shega: string;
  published_date_addis: string;
}

export interface CompareDuplication {
  threshold: number;
  total_duplicates: number;
  duplicates: DuplicateArticlePair[];
}

// Compare Coverage Gaps
export interface CoverageGapTopic {
  topic: string;
  count: number;
  sample_articles?: string[];
}

export interface CompareCoverageGaps {
  shega_exclusive: CoverageGapTopic[];
  addis_insight_exclusive: CoverageGapTopic[];
  recommendations: {
    shega_should_cover: string[];
    addis_should_cover: string[];
  };
}

// Compare Insights
export interface CompetitiveInsight {
  category: string;
  insight: string;
  winner?: Site | 'tie';
  metric?: string;
  shega_value?: number | string;
  addis_value?: number | string;
}

export interface CompareInsights {
  generated_at: string;
  insights: CompetitiveInsight[];
  summary: {
    shega_wins: number;
    addis_wins: number;
    ties: number;
  };
}

// Categories Top Topics
export interface CategoryTopTopic {
  category: string;
  topics: Array<{
    topic: string;
    count: number;
  }>;
}

// Keywords Comprehensive
export interface ComprehensiveKeyword {
  keyword: string;
  total_count: number;
  headline_count: number;
  body_count: number;
  sites: Site[];
}

export interface KeywordsComprehensive {
  keywords: ComprehensiveKeyword[];
  stats: {
    total_unique: number;
    headline_only: number;
    body_only: number;
    both: number;
  };
}

// Keywords by Site
export interface KeywordsBySite {
  shega: TopKeyword[];
  addis_insight: TopKeyword[];
}

// ============= NEW API v2.0 Types =============

// Content Analytics - Length Distribution
export interface ContentLengthDistribution {
  thresholds: {
    short: string;
    medium: string;
    long: string;
  };
  distribution: {
    [site: string]: {
      short: number;
      medium: number;
      long: number;
      total: number;
      short_pct: number;
      medium_pct: number;
      long_pct: number;
    };
  };
  details: {
    [site: string]: {
      short: { count: number; avg_words: number; min_words: number; max_words: number };
      medium: { count: number; avg_words: number; min_words: number; max_words: number };
      long: { count: number; avg_words: number; min_words: number; max_words: number };
    };
  };
  visualization_config: {
    recommended_chart: string;
    color_scheme: Record<string, string>;
  };
}

// Content Analytics - Format Insights
export interface FormatPerformance {
  by_length: Array<{
    format: string;
    article_count: number;
    avg_sentiment: number;
    positive_rate: number;
    negative_rate: number;
  }>;
  description: string;
}

export interface TopPerformingTopic {
  topic: string;
  article_count: number;
  avg_sentiment: number;
  avg_word_count: number;
}

export interface FormatTopicCombination {
  topic: string;
  format: string;
  article_count: number;
  avg_sentiment: number;
}

export interface ContentFormatInsights {
  format_performance: FormatPerformance;
  top_performing_topics: {
    topics: TopPerformingTopic[];
    description: string;
  };
  format_topic_combinations: {
    combinations: FormatTopicCombination[];
    description: string;
  };
  recommendations: Array<{
    type: string;
    insight: string;
    action: string;
  }>;
  methodology: string;
}

// Content Analytics - Format Trends
export interface FormatTrendMonth {
  month: string;
  short: number;
  medium: number;
  long: number;
  total: number;
  short_pct: number;
  medium_pct: number;
  long_pct: number;
}

export interface ContentFormatTrends {
  months: number;
  timeline: FormatTrendMonth[];
  visualization_config: {
    chart_type: string;
    x_axis: string;
    series: string[];
    color_scheme: Record<string, string>;
  };
}

// Content Analytics - Image Coverage
export interface ImageCoverage {
  overall_coverage: {
    total_articles: number;
    with_images: number;
    without_images: number;
    coverage_percentage: number;
  };
  by_site: {
    [site: string]: {
      total: number;
      with_images: number;
      coverage_percentage: number;
    };
  };
  by_topic: Array<{
    topic: string;
    total: number;
    with_images: number;
    coverage_percentage: number;
  }>;
  insights: Array<{
    type: string;
    finding: string;
    recommendation: string;
  }>;
}

// Keywords Analytics - Top Keywords
export interface KeywordItem {
  keyword: string;
  count: number;
}

export interface TopKeywordsResponse {
  value: KeywordItem[];
  Count: number;
}

// Keywords Analytics - Trending
export interface TrendingKeywordsResponse {
  period: {
    days: number;
    start_date: string;
    end_date: string;
  };
  trending_body_keywords: KeywordItem[];
  trending_headline_keywords: KeywordItem[];
}

// Keywords Analytics - By Site
export interface SiteKeywords {
  headline_keywords: KeywordItem[];
  body_keywords: KeywordItem[];
}

export interface KeywordsBySiteResponse {
  shega: SiteKeywords;
  addis_insight: SiteKeywords;
  comparison: {
    headline_keywords: {
      unique_per_site: {
        shega: string[];
        addis_insight: string[];
      };
      pairwise_overlap: {
        shega_vs_addis_insight: {
          shared_count: number;
          overlap_percentage: number;
          shared_sample: string;
        };
      };
    };
    body_keywords: {
      unique_per_site: {
        shega: string[];
        addis_insight: string[];
      };
      pairwise_overlap: {
        shega_vs_addis_insight: {
          shared_count: number;
          overlap_percentage: number;
          shared_sample: string;
        };
      };
    };
  };
}

// Topics Analytics - Labels
export interface TopicLabelDetail {
  topic_label: string;
  article_count: number;
  percentage: number;
  avg_sentiment: number;
}

export interface TopicLabelsResponse {
  total_with_labels: number;
  total_articles: number;
  coverage_percentage: number;
  labels: TopicLabelDetail[];
  methodology: string;
}

// Topics Analytics - Labels by Site
export interface SiteTopicLabel {
  topic_label: string;
  count: number;
}

export interface SiteTopicLabels {
  labels: SiteTopicLabel[];
  total_labeled: number;
}

export interface SharedTopicLabel {
  topic_label: string;
  shega: number;
  addis_insight: number;
  total: number;
}

export interface TopicLabelsBySiteResponse {
  by_site: {
    shega: SiteTopicLabels;
    addis_insight: SiteTopicLabels;
  };
  shared_labels: SharedTopicLabel[];
  summary: {
    total_unique_labels: number;
    shared_count: number;
  };
}

// Topics Analytics - Labels Over Time
export interface TopicOverTimeMonth {
  month: string;
  [topicName: string]: string | number; // Dynamic topic columns
}

export interface TopicLabelsOverTimeResponse {
  tracked_topics: string[];
  months: number;
  timeline: TopicOverTimeMonth[];
  visualization_config: {
    chart_type: string;
    x_axis: string;
    series: string[];
  };
}

// Sentiment Analytics - Distribution
export interface SentimentDistributionItem {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
}

export interface SentimentPolarityByLabel {
  positive: number;
  neutral: number;
  negative: number;
}

export interface SentimentDistributionResponse {
  distribution: {
    all: SentimentDistributionItem;
    shega: SentimentDistributionItem;
    addis_insight: SentimentDistributionItem;
  };
  avg_polarity_by_label: {
    shega: SentimentPolarityByLabel;
    addis_insight: SentimentPolarityByLabel;
  };
  visualization_config: {
    recommended_chart: string;
    color_scheme: {
      positive: string;
      neutral: string;
      negative: string;
    };
  };
}

// Sentiment Analytics - Trends
export interface SentimentTrendMonth {
  month: string;
  avg_polarity: number;
  avg_subjectivity: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  total_articles: number;
}

export interface SentimentTrendsResponse {
  site: string;
  months_analyzed: number;
  timeline: SentimentTrendMonth[];
  visualization_config: {
    chart_type: string;
    y_axis: string;
    series: string[];
  };
}

// NLP & Entity Analytics - People
export interface NLPPersonEntity {
  person: string;
  total_count: number;
  example_titles: string[];
  shega_count: number;
  addis_insight_count: number;
}

export interface NLPPeopleResponse {
  entity_type: 'people';
  total_unique: number;
  people: NLPPersonEntity[];
}

// NLP & Entity Analytics - Organizations
export interface NLPOrganizationEntity {
  organization: string;
  total_count: number;
  example_titles: string[];
  shega_count: number;
  addis_insight_count: number;
}

export interface NLPOrganizationsResponse {
  entity_type: 'organizations';
  total_unique: number;
  organizations: NLPOrganizationEntity[];
}

// NLP & Entity Analytics - Locations
export interface NLPLocationEntity {
  location: string;
  total_count: number;
  example_titles: string[];
  shega_count: number;
  addis_insight_count: number;
}

export interface NLPLocationsResponse {
  entity_type: 'locations';
  total_unique: number;
  locations: NLPLocationEntity[];
}

// NLP & Entity Analytics - Enrichment Status
export interface NLPEnrichmentStatusResponse {
  total: number;
  enriched: number;
  pending: number;
  enriched_pct: number;
  by_site: {
    shega: {
      total: number;
      enriched: number;
    };
    addis_insight: {
      total: number;
      enriched: number;
    };
  };
}

// NLP & Entity Analytics - Readability
export interface NLPReadabilitySummaryResponse {
  count: number;
  avg_readability: number;
  avg_sentence_length: number;
  avg_word_length: number;
  avg_sentences: number;
}

export interface NLPReadabilitySiteStats {
  count: number;
  avg_readability: number;
  avg_sentence_length: number;
  avg_word_length: number;
  avg_word_count: number;
}

export interface NLPReadabilityBySiteResponse {
  shega: NLPReadabilitySiteStats;
  addis_insight: NLPReadabilitySiteStats;
}

// Author Analytics - Overview Cards
export interface AuthorOverviewTopAuthor {
  author: string;
  article_count: number;
  avg_sentiment: number;
}

export interface SiteAuthorOverview {
  total_authors: number;
  total_articles: number;
  avg_articles_per_author: number;
  avg_sentiment: number;
  top_authors: AuthorOverviewTopAuthor[];
}

export interface AuthorOverviewCardsResponse {
  shega: SiteAuthorOverview;
  addis_insight: SiteAuthorOverview;
}

// Author Analytics - List
export interface AuthorListItem {
  author: string;
  site: Site;
  article_count: number;
  avg_sentiment_polarity: number;
  avg_sentiment_subjectivity: number;
  positive_articles: number;
  negative_articles: number;
  neutral_articles: number;
  avg_word_count: number;
  first_article_date: string;
  last_article_date: string;
}

export interface AuthorListResponse {
  total_authors: number;
  authors: AuthorListItem[];
}

// Author Analytics - Sentiment (all authors)
export interface AuthorSentimentItem {
  author: string;
  site: Site;
  article_count: number;
  avg_polarity: number;
  avg_subjectivity: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  positive_pct: number;
  negative_pct: number;
  neutral_pct: number;
}

export interface AuthorSentimentResponse {
  total_authors: number;
  authors: AuthorSentimentItem[];
  site_averages?: {
    shega?: { avg_polarity: number; avg_subjectivity: number };
    addis_insight?: { avg_polarity: number; avg_subjectivity: number };
  };
}

// Author Analytics - Productivity
export interface ProductivityDataPoint {
  period: string;
  article_count: number;
  avg_word_count?: number;
  avg_sentiment?: number;
}

export interface AuthorProductivityResponse {
  author: string;
  site?: Site;
  granularity: 'day' | 'week' | 'month';
  days_analyzed: number;
  total_articles: number;
  productivity_data: ProductivityDataPoint[];
  statistics: {
    avg_articles_per_period: number;
    max_articles_per_period: number;
    min_articles_per_period: number;
    most_productive_period: string;
  };
}

// Author Analytics - Keywords
export interface AuthorKeywordItem {
  keyword: string;
  count: number;
  source: 'headline' | 'body' | 'both';
  percentage?: number;
}

export interface AuthorKeywordsResponse {
  author: string;
  site?: Site;
  total_articles: number;
  headline_keywords: AuthorKeywordItem[];
  body_keywords: AuthorKeywordItem[];
  combined_keywords?: AuthorKeywordItem[];
  nlp_entities?: {
    persons: AuthorKeywordItem[];
    organizations: AuthorKeywordItem[];
    locations: AuthorKeywordItem[];
  };
}

// Author Analytics - Sentiment Detail
export interface AuthorSentimentStats {
  avg_polarity: number;
  avg_subjectivity: number;
  polarity_range: {
    min: number;
    max: number;
  };
  subjectivity_range: {
    min: number;
    max: number;
  };
}

export interface AuthorSentimentComparison {
  site_avg_polarity: number;
  difference: number;
  is_more_positive: boolean;
  percentile_rank: number;
}

export interface AuthorSentimentTrendMonth {
  month: string;
  avg_polarity: number;
  avg_subjectivity: number;
  article_count: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
}

export interface AuthorSentimentDetailResponse {
  author: string;
  site: Site;
  total_articles: number;
  sentiment_stats: AuthorSentimentStats;
  sentiment_breakdown: {
    positive: number;
    negative: number;
    neutral: number;
    positive_pct: number; 
    negative_pct: number; 
    neutral_pct: number; 
  };
  comparison_to_site: AuthorSentimentComparison;
  sentiment_trend: AuthorSentimentTrendMonth[];
}

// Publishing Analytics - Calendar Heatmap
export interface CalendarHeatmapDay {
  date: string;
  total: number;
  shega: number;
  addis_insight: number;
  day_of_week: string;
}

export interface PublishingCalendarHeatmapResponse {
  start_date: string;
  end_date: string;
  heatmap_data: CalendarHeatmapDay[];
  statistics: {
    total_days: number;
    days_with_articles: number;
    days_without_articles: number;
    max_articles_per_day: number;
    min_articles_per_day: number;
    avg_articles_per_day: number;
    median_articles_per_day: number;
  };
}

// Publishing Analytics - Yearly Comparison
export interface SiteYearlyStats {
  articles: number;
  unique_authors: number;
  avg_word_count: number;
  avg_sentiment: number | null;
  articles_per_author: number;
  date_range: {
    start: string;
    end: string;
  };
  yoy_growth_pct?: number;
}

export interface YearlyPublishingData {
  year: number;
  shega: SiteYearlyStats;
  addis_insight: SiteYearlyStats;
}

export interface PublishingYearlyComparisonResponse {
  yearly_data: YearlyPublishingData[];
  summary: {
    years_covered: number;
    date_range: {
      start: number;
      end: number;
    };
    total_articles_by_site: {
      shega: number;
      addis_insight: number;
    };
  };
}

// Publishing Analytics - Monthly Calendar
export interface MonthlyCalendarDay {
  date: string;
  day: string;
  count: number;
}

export interface MonthlyCalendarWeek {
  week_number: number;
  days: MonthlyCalendarDay[];
}

export interface PublishingMonthlyCalendarResponse {
  year: number;
  month: number;
  month_name: string;
  weeks: MonthlyCalendarWeek[];
  month_statistics: {
    total_articles: number;
    avg_per_day: number;
    busiest_day: string;
    busiest_day_count: number;
  };
}

// Competitive Analysis - Content Overlap
export interface ContentOverlapResponse {
  overview: {
    shega_articles: number;
    addis_articles: number;
    volume_difference: number;
    volume_ratio: number;
  };
  duplicate_detection: {
    exact_title_matches: number;
    similar_titles: number;
    content_similarity_high: number;
    unique_to_shega: number;
    unique_to_addis: number;
  };
  keyword_overlap: {
    total_unique_keywords_shega: number;
    total_unique_keywords_addis: number;
    shared_keywords: number;
    overlap_percentage: number;
    shega_exclusive_keywords: string[];
    addis_exclusive_keywords: string[];
  };
}

// Competitive Analysis - Topic Overlap
export interface TopicOverlapResponse {
  shared_topics: Array<{
    topic: string;
    shega_count: number;
    addis_count: number;
    total: number;
  }>;
  shega_unique_topics: Array<{
    topic: string;
    count: number;
  }>;
  addis_unique_topics: Array<{
    topic: string;
    count: number;
  }>;
  summary: {
    total_shega_topics: number;
    total_addis_topics: number;
    shared_count: number;
    shega_unique_count: number;
    addis_unique_count: number;
    overlap_percentage: number;
  };
}

// Competitive Analysis - Summary
export interface CompetitiveSiteOverview {
  total_articles: number;
  unique_authors: number;
  avg_word_count: number;
  avg_sentiment: number;
  date_range: {
    earliest: string;
    latest: string;
  };
}

export interface ContentGap {
  topic: string;
  shega_count: number;
  addis_count: number;
  gap_type: 'shega_dominant' | 'shega_exclusive' | 'addis_dominant' | 'addis_exclusive';
}

export interface CompetitiveSummaryResponse {
  overview: {
    shega: CompetitiveSiteOverview;
    addis_insight: CompetitiveSiteOverview;
  };
  competitive_metrics: {
    volume_leader: Site;
    volume_difference: number;
    volume_ratio: number;
    author_leader: Site;
    depth_leader: Site;
    depth_difference: number;
  };
  content_gaps: {
    shega_exclusive_topics: number;
    addis_exclusive_topics: number;
    top_shega_gaps: ContentGap[];
    top_addis_gaps: ContentGap[];
  };
  key_insights: string[];
}

// Article Drill-Down - List
export interface ArticleListItem {
  title: string;
  slug: string;
  site: Site;
  author: string | null;
  posted_date: string;
  url: string;
  excerpt?: string;
  word_count: number;
  category?: string | null;
  keywords?: string[];
  topic_label?: string | null;
  polarity?: number | null;
  sentiment?: SentimentLabel | null;
}

export interface ArticleListResponse {
  articles: ArticleListItem[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  filters_applied?: Record<string, string>;
}

// Scraping & Scheduler Types
export interface ScrapeAllStatusResponse {
  tasks: Record<string, ScrapeTaskStatus>;
  running_count: number;
  completed_count: number;
  failed_count: number;
}

export interface ScrapePreviewResponse {
  site: string;
  total_urls: number;
  preview_urls: string[];
}
