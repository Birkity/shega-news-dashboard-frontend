/**
 * Comprehensive API Tests
 * Tests for uncovered API endpoints and edge cases
 */

// Mock fetch globally
global.fetch = jest.fn();

describe('Publishing API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch publishing trends', async () => {
    const mockTrends = {
      by_day_of_week: [
        { day: 'Monday', count: 100 },
        { day: 'Tuesday', count: 120 },
      ],
      by_hour: [
        { hour: 9, count: 50 },
        { hour: 14, count: 75 },
      ],
      peak_times: {
        most_active_day: 'Wednesday',
        most_active_hour: 14,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTrends,
    });

    const { publishingAPI } = await import('@/lib/api');
    const result = await publishingAPI.getTrends();

    expect(global.fetch).toHaveBeenCalled();
    expect(result.by_day_of_week).toBeDefined();
    expect(result.by_hour).toBeDefined();
  });

  it('should fetch publishing trends with site filter', async () => {
    const mockTrends = {
      by_day_of_week: [],
      by_hour: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTrends,
    });

    const { publishingAPI } = await import('@/lib/api');
    const result = await publishingAPI.getTrends('shega');

    expect(global.fetch).toHaveBeenCalled();
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).toContain('site=shega');
  });

  it('should fetch yearly publishing data', async () => {
    const mockYearly = {
      years: [2023, 2024],
      data: {
        2023: { shega: 500, addis_insight: 400 },
        2024: { shega: 600, addis_insight: 450 },
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockYearly,
    });

    const { publishingAPI } = await import('@/lib/api');
    const result = await publishingAPI.getYearly();

    expect(global.fetch).toHaveBeenCalled();
    expect(result.years).toBeDefined();
    expect(result.data).toBeDefined();
  });

  it('should fetch yearly publishing data with site filter', async () => {
    const mockYearly = { years: [], data: {} };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockYearly,
    });

    const { publishingAPI } = await import('@/lib/api');
    await publishingAPI.getYearly('addis_insight');

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
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

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { scrapingAPI } = await import('@/lib/api');
    const result = await scrapingAPI.trigger({ site: 'shega' });

    expect(global.fetch).toHaveBeenCalled();
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/scraping/trigger');
    expect(options.method).toBe('POST');
    expect(result.task_id).toBe('task-123');
  });

  it('should handle scraping trigger error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Scraping failed' }),
    });

    const { scrapingAPI } = await import('@/lib/api');
    
    await expect(scrapingAPI.trigger({ site: 'shega' })).rejects.toThrow('Scraping failed');
  });

  it('should get scraping task status', async () => {
    const mockStatus = {
      task_id: 'task-123',
      status: 'completed',
      progress: 100,
      articles_scraped: 50,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatus,
    });

    const { scrapingAPI } = await import('@/lib/api');
    const result = await scrapingAPI.getStatus('task-123');

    expect(result.task_id).toBe('task-123');
    expect(result.status).toBe('completed');
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

    (global.fetch as jest.Mock).mockResolvedValueOnce({
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

    (global.fetch as jest.Mock).mockResolvedValueOnce({
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
      is_running: true,
      next_run: '2024-12-01T10:00:00Z',
      last_run: '2024-12-01T09:00:00Z',
      interval_minutes: 60,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatus,
    });

    const { schedulerAPI } = await import('@/lib/api');
    const result = await schedulerAPI.getStatus();

    expect(result.is_running).toBe(true);
    expect(result.interval_minutes).toBe(60);
  });

  it('should trigger scheduler', async () => {
    const mockResponse = {
      status: 'success',
      message: 'Scheduler triggered',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { schedulerAPI } = await import('@/lib/api');
    const result = await schedulerAPI.trigger();

    expect(global.fetch).toHaveBeenCalled();
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/scheduler/trigger');
    expect(options.method).toBe('POST');
    expect(result.status).toBe('success');
  });

  it('should handle scheduler trigger error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ detail: 'Scheduler unavailable' }),
    });

    const { schedulerAPI } = await import('@/lib/api');
    
    await expect(schedulerAPI.trigger()).rejects.toThrow('Scheduler unavailable');
  });

  it('should get scheduler health', async () => {
    const mockHealth = {
      status: 'healthy',
      uptime: 3600,
      jobs_completed: 100,
      jobs_failed: 2,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealth,
    });

    const { schedulerAPI } = await import('@/lib/api');
    const result = await schedulerAPI.getHealth();

    expect(result.status).toBe('healthy');
    expect(result.jobs_completed).toBe(100);
  });
});

describe('Categories API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch category distribution', async () => {
    const mockDistribution = [
      { category: 'Technology', count: 200, percentage: 40 },
      { category: 'Business', count: 150, percentage: 30 },
      { category: 'Politics', count: 100, percentage: 20 },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDistribution,
    });

    const { categoriesAPI } = await import('@/lib/api');
    const result = await categoriesAPI.getDistribution();

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('category');
    expect(result[0]).toHaveProperty('count');
  });

  it('should fetch category distribution with site filter', async () => {
    const mockDistribution = [];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDistribution,
    });

    const { categoriesAPI } = await import('@/lib/api');
    await categoriesAPI.getDistribution('shega');

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
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
      { topic: 'AI', date: '2024-01-15', spike_value: 3.5, normal_value: 1.0 },
      { topic: 'Politics', date: '2024-01-20', spike_value: 2.8, normal_value: 1.2 },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSpikes,
    });

    const { topicsAPI } = await import('@/lib/api');
    const result = await topicsAPI.getSpikes({ weeks: 4, threshold: 2.0 });

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('topic');
    expect(result[0]).toHaveProperty('spike_value');
  });

  it('should fetch topic sentiment', async () => {
    const mockSentiment = {
      topics: [
        { topic: 'Technology', positive: 0.5, negative: 0.2, neutral: 0.3 },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSentiment,
    });

    const { topicsAPI } = await import('@/lib/api');
    const result = await topicsAPI.getSentiment({ limit: 10 });

    expect(result.topics).toBeDefined();
  });

  it('should fetch topic sentiment distribution', async () => {
    const mockDistribution = [
      { topic: 'Tech', sentiment: 'positive', count: 100 },
      { topic: 'Tech', sentiment: 'negative', count: 20 },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
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

    (global.fetch as jest.Mock).mockResolvedValueOnce({
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
      avg_flesch_reading_ease: 45.5,
      avg_flesch_kincaid_grade: 12.3,
      total_analyzed: 500,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockReadability,
    });

    const { nlpAPI } = await import('@/lib/api');
    const result = await nlpAPI.getReadabilitySummary();

    expect(result.avg_flesch_reading_ease).toBeDefined();
    expect(result.total_analyzed).toBe(500);
  });

  it('should fetch readability by site', async () => {
    const mockReadability = {
      shega: { avg_flesch_reading_ease: 50 },
      addis_insight: { avg_flesch_reading_ease: 45 },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
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
      total_articles: 1000,
      enriched_articles: 800,
      pending_articles: 200,
      last_enrichment: '2024-01-15T10:00:00Z',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatus,
    });

    const { nlpAPI } = await import('@/lib/api');
    const result = await nlpAPI.getEnrichmentStatus();

    expect(result.total_articles).toBe(1000);
    expect(result.enriched_articles).toBe(800);
  });
});

describe('Sentiment API - Additional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch top positive articles', async () => {
    const mockPositive = {
      articles: [
        { title: 'Positive Article 1', polarity: 0.9 },
        { title: 'Positive Article 2', polarity: 0.85 },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPositive,
    });

    const { sentimentAPI } = await import('@/lib/api');
    const result = await sentimentAPI.getTopPositive({ limit: 5 });

    expect(result.articles).toBeDefined();
    expect(Array.isArray(result.articles)).toBe(true);
  });

  it('should fetch top negative articles', async () => {
    const mockNegative = {
      articles: [
        { title: 'Negative Article 1', polarity: -0.8 },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockNegative,
    });

    const { sentimentAPI } = await import('@/lib/api');
    const result = await sentimentAPI.getTopNegative({ limit: 5, site: 'shega' });

    expect(result.articles).toBeDefined();
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

    (global.fetch as jest.Mock).mockResolvedValueOnce({
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

    (global.fetch as jest.Mock).mockResolvedValueOnce({
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

    (global.fetch as jest.Mock).mockResolvedValueOnce({
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
      total_articles: 1500,
      articles_this_week: 50,
      articles_this_month: 200,
      top_category: 'Technology',
      top_author: 'John Doe',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSummary,
    });

    const { dashboardAPI } = await import('@/lib/api');
    const result = await dashboardAPI.getSummary();

    expect(result.total_articles).toBe(1500);
    expect(result.top_category).toBe('Technology');
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

    (global.fetch as jest.Mock).mockResolvedValueOnce({
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

    (global.fetch as jest.Mock).mockResolvedValueOnce({
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

    (global.fetch as jest.Mock).mockResolvedValueOnce({
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

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
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
        avg_word_count: 500,
        avg_reading_time: 3,
        min_word_count: 100,
        max_word_count: 2000,
      },
      addis_insight: {
        avg_word_count: 450,
        avg_reading_time: 2.5,
        min_word_count: 80,
        max_word_count: 1800,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockComparison,
    });

    const { comparisonAPI } = await import('@/lib/api');
    const result = await comparisonAPI.getContentLength();

    expect(result.shega).toBeDefined();
    expect(result.addis_insight).toBeDefined();
    expect(result.shega.avg_word_count).toBe(500);
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
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error('JSON parse error'); },
    });

    const { healthAPI } = await import('@/lib/api');
    
    await expect(healthAPI.getHealth()).rejects.toThrow('An error occurred');
  });

  it('should handle HTTP status error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    const { healthAPI } = await import('@/lib/api');
    
    await expect(healthAPI.getHealth()).rejects.toThrow();
  });

  it('should handle scraping trigger with JSON parse error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error('Parse error'); },
    });

    const { scrapingAPI } = await import('@/lib/api');
    
    await expect(scrapingAPI.trigger({ site: 'shega' })).rejects.toThrow('An error occurred');
  });

  it('should handle scheduler trigger with JSON parse error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
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
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { articlesAPI } = await import('@/lib/api');
    await articlesAPI.getArticles({ page: 1, per_page: 20 });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).toContain('page=1');
    expect(fetchCall).toContain('per_page=20');
  });

  it('should skip undefined and null parameters', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { articlesAPI } = await import('@/lib/api');
    await articlesAPI.getArticles({ page: 1, site: undefined, author: undefined });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).toContain('page=1');
    expect(fetchCall).not.toContain('site=');
    expect(fetchCall).not.toContain('author=');
  });

  it('should return empty query string when no parameters', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { articlesAPI } = await import('@/lib/api');
    await articlesAPI.getArticles({});

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).not.toContain('?');
  });
});
