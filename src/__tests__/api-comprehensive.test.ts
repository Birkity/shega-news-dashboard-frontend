/**
 * Comprehensive API Tests
 * Tests for uncovered API endpoints and edge cases
 */

import type { CategoryDistribution } from '@/types/api';

// Mock fetch globally
globalThis.fetch = jest.fn();

describe('Publishing API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch publishing trends', async () => {
    const mockTrends = {
      by_weekday: [
        { value: 'Monday', shega: 100, addis_insight: 80 },
        { value: 'Tuesday', shega: 120, addis_insight: 90 },
      ],
      by_hour: [
        { value: '9', shega: 50, addis_insight: 40 },
        { value: '14', shega: 75, addis_insight: 60 },
      ],
      by_month: [
        { value: 'January', shega: 200, addis_insight: 150 },
      ],
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTrends,
    });

    const { publishingAPI } = await import('@/lib/api');
    const result = await publishingAPI.getTrends();

    expect(globalThis.fetch).toHaveBeenCalled();
    expect(result.by_weekday).toBeDefined();
    expect(result.by_hour).toBeDefined();
  });

  it('should fetch publishing trends with site filter', async () => {
    const mockTrends = {
      by_weekday: [],
      by_hour: [],
      by_month: [],
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTrends,
    });

    const { publishingAPI } = await import('@/lib/api');
    await publishingAPI.getTrends('shega');

    expect(globalThis.fetch).toHaveBeenCalled();
    const fetchCall = (globalThis.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).toContain('site=shega');
  });

  it('should fetch yearly publishing data', async () => {
    const mockYearly = {
      years: [
        {
          year: 2023,
          shega: { articles: 500, unique_authors: 20, avg_word_count: 800, yoy_growth_pct: null },
          addis_insight: { articles: 400, unique_authors: 15, avg_word_count: 750, yoy_growth_pct: null },
        },
        {
          year: 2024,
          shega: { articles: 600, unique_authors: 25, avg_word_count: 850, yoy_growth_pct: 20 },
          addis_insight: { articles: 450, unique_authors: 18, avg_word_count: 780, yoy_growth_pct: 12.5 },
        },
      ],
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockYearly,
    });

    const { publishingAPI } = await import('@/lib/api');
    const result = await publishingAPI.getYearly();

    expect(globalThis.fetch).toHaveBeenCalled();
    expect(result.years).toBeDefined();
    expect(result.years.length).toBe(2);
  });

  it('should fetch yearly publishing data with site filter', async () => {
    const mockYearly = { years: [] };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockYearly,
    });

    const { publishingAPI } = await import('@/lib/api');
    await publishingAPI.getYearly('addis_insight');

    const fetchCall = (globalThis.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).toContain('site=addis_insight');
  });
});

describe('Scraping API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should trigger scraping job', async () => {
    const mockResponse = {
      task_id: 'task-123',
      status: 'started',
      message: 'Scraping initiated',
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { scrapingAPI } = await import('@/lib/api');
    const result = await scrapingAPI.trigger({ site: 'shega' });

    expect(globalThis.fetch).toHaveBeenCalled();
    const [url, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/scraping/trigger');
    expect(options.method).toBe('POST');
    expect(result.task_id).toBe('task-123');
  });

  it('should handle scraping trigger error', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Scraping failed' }),
    });

    const { scrapingAPI } = await import('@/lib/api');
    
    await expect(scrapingAPI.trigger({ site: 'shega' })).rejects.toThrow('Scraping failed');
  });

  it('should get scraping task status', async () => {
    const mockStatus = {
      status: 'completed' as const,
      started_at: '2024-01-15T10:00:00Z',
      completed_at: '2024-01-15T10:30:00Z',
      site: 'shega' as const,
      stats: {
        articles_found: 100,
        articles_new: 50,
        articles_updated: 20,
      },
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatus,
    });

    const { scrapingAPI } = await import('@/lib/api');
    const result = await scrapingAPI.getStatus('task-123');

    expect(result.status).toBe('completed');
    expect(result.site).toBe('shega');
  });

  it('should get all scraping statuses', async () => {
    const mockAllStatus = {
      tasks: {
        'task-123': { status: 'completed', progress: 100 },
        'task-124': { status: 'running', progress: 50 },
      },
      running_count: 1,
      completed_count: 1,
      failed_count: 0,
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAllStatus,
    });

    const { scrapingAPI } = await import('@/lib/api');
    const result = await scrapingAPI.getAllStatus();

    expect(result.tasks).toBeDefined();
    expect(result.running_count).toBe(1);
    expect(result.completed_count).toBe(1);
  });

  it('should preview scraping URLs', async () => {
    const mockPreview = {
      site: 'shega',
      total_urls: 100,
      preview_urls: ['https://example.com/article1', 'https://example.com/article2'],
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPreview,
    });

    const { scrapingAPI } = await import('@/lib/api');
    const result = await scrapingAPI.preview('shega', 10);

    expect(result.site).toBe('shega');
    expect(result.total_urls).toBe(100);
    expect(Array.isArray(result.preview_urls)).toBe(true);
  });
});

describe('Scheduler API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should get scheduler status', async () => {
    const mockStatus = {
      enabled: true,
      running: true,
      interval_weeks: 1,
      is_pipeline_running: false,
      last_run: '2024-12-01T09:00:00Z',
      next_run: '2024-12-01T10:00:00Z',
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatus,
    });

    const { schedulerAPI } = await import('@/lib/api');
    const result = await schedulerAPI.getStatus();

    expect(result.running).toBe(true);
    expect(result.interval_weeks).toBe(1);
  });

  it('should trigger scheduler', async () => {
    const mockResponse = {
      status: 'success',
      message: 'Scheduler triggered',
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { schedulerAPI } = await import('@/lib/api');
    const result = await schedulerAPI.trigger();

    expect(globalThis.fetch).toHaveBeenCalled();
    const [url, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/scheduler/trigger');
    expect(options.method).toBe('POST');
    expect(result.status).toBe('success');
  });

  it('should handle scheduler trigger error', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ detail: 'Scheduler unavailable' }),
    });

    const { schedulerAPI } = await import('@/lib/api');
    
    await expect(schedulerAPI.trigger()).rejects.toThrow('Scheduler unavailable');
  });

  it('should get scheduler health', async () => {
    const mockHealth = {
      healthy: true,
      enabled: true,
      next_run: '2024-12-01T10:00:00Z',
      details: 'All systems operational',
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealth,
    });

    const { schedulerAPI } = await import('@/lib/api');
    const result = await schedulerAPI.getHealth();

    expect(result.healthy).toBe(true);
    expect(result.details).toBe('All systems operational');
  });
});

describe('Categories API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch category distribution', async () => {
    const mockDistribution = [
      { category: 'Technology', shega_count: 100, addis_insight_count: 100, total: 200 },
      { category: 'Business', shega_count: 80, addis_insight_count: 70, total: 150 },
      { category: 'Politics', shega_count: 50, addis_insight_count: 50, total: 100 },
    ];

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDistribution,
    });

    const { categoriesAPI } = await import('@/lib/api');
    const result = await categoriesAPI.getDistribution();

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('category');
    expect(result[0]).toHaveProperty('total');
  });

  it('should fetch category distribution with site filter', async () => {
    const mockDistribution: CategoryDistribution[] = [];

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDistribution,
    });

    const { categoriesAPI } = await import('@/lib/api');
    await categoriesAPI.getDistribution('shega');

    const fetchCall = (globalThis.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).toContain('site=shega');
  });
});

describe('Topics API - Additional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch topic spikes', async () => {
    const mockSpikes = [
      { keyword: 'AI', recent_count: 100, previous_count: 20, spike_ratio: 5, is_new: false },
      { keyword: 'Politics', recent_count: 80, previous_count: 30, spike_ratio: 2.67, is_new: false },
    ];

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSpikes,
    });

    const { topicsAPI } = await import('@/lib/api');
    const result = await topicsAPI.getSpikes({ weeks: 4, threshold: 2 });

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('keyword');
    expect(result[0]).toHaveProperty('spike_ratio');
  });

  it('should fetch topic sentiment', async () => {
    const mockSentiment = {
      most_positive: [
        { keyword: 'Technology', count: 50, avg_polarity: 0.5, avg_subjectivity: 0.4 },
      ],
      most_negative: [
        { keyword: 'Politics', count: 30, avg_polarity: -0.3, avg_subjectivity: 0.6 },
      ],
      most_subjective: [
        { keyword: 'Opinion', count: 20, avg_polarity: 0.1, avg_subjectivity: 0.8 },
      ],
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSentiment,
    });

    const { topicsAPI } = await import('@/lib/api');
    const result = await topicsAPI.getSentiment({ limit: 10 });

    expect(result.most_positive).toBeDefined();
  });

  it('should fetch topic sentiment distribution', async () => {
    const mockDistribution: Array<{
      keyword: string;
      total: number;
      positive: number;
      negative: number;
      neutral: number;
      positive_pct: number;
      negative_pct: number;
      neutral_pct: number;
    }> = [
      { keyword: 'Tech', total: 120, positive: 70, negative: 30, neutral: 20, positive_pct: 58, negative_pct: 25, neutral_pct: 17 },
    ];

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDistribution,
    });

    const { topicsAPI } = await import('@/lib/api');
    const result = await topicsAPI.getSentimentDistribution({ limit: 5, site: 'shega' });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe('NLP API - Additional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch sentiment by site', async () => {
    const mockSentiment = {
      shega: { avg_polarity: 0.2, avg_subjectivity: 0.4 },
      addis_insight: { avg_polarity: 0.1, avg_subjectivity: 0.5 },
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSentiment,
    });

    const { nlpAPI } = await import('@/lib/api');
    const result = await nlpAPI.getSentimentBySite();

    expect(result.shega).toBeDefined();
    expect(result.addis_insight).toBeDefined();
  });

  it('should fetch readability summary', async () => {
    const mockReadability = {
      count: 500,
      avg_readability: 45.5,
      avg_sentence_length: 18.5,
      avg_word_length: 5.2,
      avg_sentences: 12,
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockReadability,
    });

    const { nlpAPI } = await import('@/lib/api');
    const result = await nlpAPI.getReadabilitySummary();

    expect(result.avg_readability).toBeDefined();
    expect(result.count).toBe(500);
  });

  it('should fetch readability by site', async () => {
    const mockReadability = {
      shega: { avg_flesch_reading_ease: 50 },
      addis_insight: { avg_flesch_reading_ease: 45 },
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockReadability,
    });

    const { nlpAPI } = await import('@/lib/api');
    const result = await nlpAPI.getReadabilityBySite();

    expect(result.shega).toBeDefined();
    expect(result.addis_insight).toBeDefined();
  });

  it('should fetch enrichment status', async () => {
    const mockStatus = {
      total: 1000,
      enriched: 800,
      pending: 200,
      enriched_pct: 80,
      by_site: {
        shega: { total: 600, enriched: 500 },
        addis_insight: { total: 400, enriched: 300 },
      },
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatus,
    });

    const { nlpAPI } = await import('@/lib/api');
    const result = await nlpAPI.getEnrichmentStatus();

    expect(result.total).toBe(1000);
    expect(result.enriched).toBe(800);
  });
});

describe('Sentiment API - Additional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch top positive articles', async () => {
    const mockPositive = {
      shega: [
        { title: 'Positive Article 1', excerpt: 'Excerpt', posted_date: '2024-01-15', author: 'John', polarity: 0.9, url: 'https://example.com/1' },
      ],
      addis_insight: [
        { title: 'Positive Article 2', excerpt: 'Excerpt 2', posted_date: '2024-01-16', author: 'Jane', polarity: 0.85, url: 'https://example.com/2' },
      ],
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPositive,
    });

    const { sentimentAPI } = await import('@/lib/api');
    const result = await sentimentAPI.getTopPositive({ limit: 5 });

    expect(result.shega).toBeDefined();
    expect(Array.isArray(result.shega)).toBe(true);
  });

  it('should fetch top negative articles', async () => {
    const mockNegative = {
      shega: [
        { title: 'Negative Article 1', excerpt: 'Excerpt', posted_date: '2024-01-15', author: null, polarity: -0.8, url: 'https://example.com/3' },
      ],
      addis_insight: [],
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockNegative,
    });

    const { sentimentAPI } = await import('@/lib/api');
    const result = await sentimentAPI.getTopNegative({ limit: 5, site: 'shega' });

    expect(result.shega).toBeDefined();
  });
});

describe('Authors API - Additional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch top authors with stats', async () => {
    const mockAuthors = [
      { 
        author: 'John Doe', 
        article_count: 50, 
        avg_word_count: 800,
        first_article: '2024-01-01',
        last_article: '2024-12-01',
      },
    ];

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAuthors,
    });

    const { authorsAPI } = await import('@/lib/api');
    const result = await authorsAPI.getTopWithStats({ limit: 10, site: 'shega' });

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('article_count');
    expect(result[0]).toHaveProperty('avg_word_count');
  });

  it('should fetch author sentiment', async () => {
    const mockSentiment = [
      { author: 'John Doe', avg_polarity: 0.3, avg_subjectivity: 0.5, article_count: 50 },
    ];

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSentiment,
    });

    const { authorsAPI } = await import('@/lib/api');
    const result = await authorsAPI.getSentiment({ limit: 10, sort_by: 'polarity' });

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('avg_polarity');
  });
});

describe('Keywords API - Additional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch extracted NLP keywords', async () => {
    const mockKeywords = [
      { keyword: 'artificial intelligence', count: 150, score: 0.95 },
      { keyword: 'machine learning', count: 120, score: 0.88 },
    ];

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockKeywords,
    });

    const { keywordsAPI } = await import('@/lib/api');
    const result = await keywordsAPI.getExtracted({ limit: 20, site: 'shega' });

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('keyword');
  });
});

describe('Dashboard API - Additional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch dashboard summary', async () => {
    const mockSummary = {
      shega: {
        total_articles: 800,
        unique_authors: 50,
        avg_body_word_count: 600,
        avg_headline_word_count: 10,
        avg_readability: 45,
        avg_sentiment: 0.1,
      },
      addis_insight: {
        total_articles: 700,
        unique_authors: 40,
        avg_body_word_count: 550,
        avg_headline_word_count: 9,
        avg_readability: 50,
        avg_sentiment: 0.05,
      },
      comparison: {
        total_articles_diff: 100,
        unique_authors_diff: 10,
        avg_body_words_diff: 50,
      },
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSummary,
    });

    const { dashboardAPI } = await import('@/lib/api');
    const result = await dashboardAPI.getSummary();

    expect(result.shega).toBeDefined();
    expect(result.comparison).toBeDefined();
  });
});

describe('Articles API - Additional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch article by slug', async () => {
    const mockArticle = {
      _id: '123',
      title: 'Test Article',
      slug: 'test-article',
      site: 'shega',
      content: 'Full article content...',
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockArticle,
    });

    const { articlesAPI } = await import('@/lib/api');
    const result = await articlesAPI.getArticleBySlug('shega', 'test-article');

    expect(result.slug).toBe('test-article');
    expect(result.site).toBe('shega');
  });

  it('should fetch article samples with sort options', async () => {
    const mockSamples = [
      { _id: '1', title: 'Sample 1', polarity: 0.9 },
      { _id: '2', title: 'Sample 2', polarity: 0.8 },
    ];

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSamples,
    });

    const { articlesAPI } = await import('@/lib/api');
    const result = await articlesAPI.getSamples({ limit: 5, sort_by: 'positive', site: 'shega' });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  it('should fetch articles with all filter options', async () => {
    const mockArticles = {
      items: [],
      total: 0,
      page: 1,
      per_page: 20,
      total_pages: 0,
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockArticles,
    });

    const { articlesAPI } = await import('@/lib/api');
    await articlesAPI.getArticles({
      page: 1,
      per_page: 20,
      site: 'shega',
      author: 'John Doe',
      category: 'Technology',
      keyword: 'AI',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      search: 'test',
    });

    const fetchCall = (globalThis.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).toContain('site=shega');
    expect(fetchCall).toContain('author=John');
    expect(fetchCall).toContain('category=Technology');
  });
});

describe('Comparison API - Additional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch content length comparison', async () => {
    const mockComparison = {
      shega: {
        avg_body_words: 500,
        min_body_words: 100,
        max_body_words: 2000,
        count: 100,
      },
      addis_insight: {
        avg_body_words: 450,
        min_body_words: 80,
        max_body_words: 1800,
        count: 80,
      },
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockComparison,
    });

    const { comparisonAPI } = await import('@/lib/api');
    const result = await comparisonAPI.getContentLength();

    expect(result.shega).toBeDefined();
    expect(result.addis_insight).toBeDefined();
    expect(result.shega.avg_body_words).toBe(500);
  });
});

describe('API object export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should export all APIs as a single object', async () => {
    const { api } = await import('@/lib/api');

    expect(api.health).toBeDefined();
    expect(api.dashboard).toBeDefined();
    expect(api.articles).toBeDefined();
    expect(api.authors).toBeDefined();
    expect(api.categories).toBeDefined();
    expect(api.keywords).toBeDefined();
    expect(api.topics).toBeDefined();
    expect(api.sentiment).toBeDefined();
    expect(api.nlp).toBeDefined();
    expect(api.publishing).toBeDefined();
    expect(api.comparison).toBeDefined();
    expect(api.scraping).toBeDefined();
    expect(api.scheduler).toBeDefined();
  });
});

describe('Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should handle default error message when JSON parsing fails', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error('JSON parse error'); },
    });

    const { healthAPI } = await import('@/lib/api');
    
    await expect(healthAPI.getHealth()).rejects.toThrow('An error occurred');
  });

  it('should handle HTTP status error', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    const { healthAPI } = await import('@/lib/api');
    
    await expect(healthAPI.getHealth()).rejects.toThrow();
  });

  it('should handle scraping trigger with JSON parse error', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error('Parse error'); },
    });

    const { scrapingAPI } = await import('@/lib/api');
    
    await expect(scrapingAPI.trigger({ site: 'shega' })).rejects.toThrow('An error occurred');
  });

  it('should handle scheduler trigger with JSON parse error', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error('Parse error'); },
    });

    const { schedulerAPI } = await import('@/lib/api');
    
    await expect(schedulerAPI.trigger()).rejects.toThrow('An error occurred');
  });
});

describe('Query String Builder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should build correct query string with parameters', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { articlesAPI } = await import('@/lib/api');
    await articlesAPI.getArticles({ page: 1, per_page: 20 });

    const fetchCall = (globalThis.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).toContain('page=1');
    expect(fetchCall).toContain('per_page=20');
  });

  it('should skip undefined and null parameters', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { articlesAPI } = await import('@/lib/api');
    await articlesAPI.getArticles({ page: 1, site: undefined, author: undefined });

    const fetchCall = (globalThis.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).toContain('page=1');
    expect(fetchCall).not.toContain('site=');
    expect(fetchCall).not.toContain('author=');
  });

  it('should return empty query string when no parameters', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { articlesAPI } = await import('@/lib/api');
    await articlesAPI.getArticles({});

    const fetchCall = (globalThis.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).not.toContain('?');
  });
});
