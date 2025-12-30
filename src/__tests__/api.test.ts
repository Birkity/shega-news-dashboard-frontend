/**
 * API Service Tests
 * Tests for the API service layer functions
 */

import config, { endpoints } from '@/lib/config';

// Mock fetch globally
globalThis.fetch = jest.fn();

describe('API Configuration', () => {
  it('should have correct default API base URL', () => {
    expect(config.apiBaseUrl).toBeDefined();
    expect(typeof config.apiBaseUrl).toBe('string');
  });

  it('should have default revalidation time', () => {
    expect(config.defaultRevalidate).toBeDefined();
    expect(typeof config.defaultRevalidate).toBe('number');
    expect(config.defaultRevalidate).toBeGreaterThan(0);
  });

  it('should have short revalidation time for health checks', () => {
    expect(config.shortRevalidate).toBeDefined();
    expect(config.shortRevalidate).toBeLessThan(config.defaultRevalidate);
  });

  it('should have long revalidation time for static data', () => {
    expect(config.longRevalidate).toBeDefined();
    expect(config.longRevalidate).toBeGreaterThan(config.defaultRevalidate);
  });
});

describe('Endpoints Configuration', () => {
  it('should have health endpoints', () => {
    expect(endpoints.health).toBe('/health');
    expect(endpoints.healthReady).toBe('/health/ready');
    expect(endpoints.healthLive).toBe('/health/live');
  });

  it('should have dashboard endpoints', () => {
    expect(endpoints.overview).toBeDefined();
    expect(endpoints.dailyArticles).toBeDefined();
    expect(endpoints.dashboardSummary).toBeDefined();
  });

  it('should have article endpoints', () => {
    expect(endpoints.articles).toBeDefined();
    expect(typeof endpoints.articleById).toBe('function');
    expect(endpoints.articleById('123')).toBe('/articles/123');
    expect(typeof endpoints.articleBySlug).toBe('function');
    expect(endpoints.articleBySlug('shega', 'test-slug')).toBe('/articles/by-slug/shega/test-slug');
  });

  it('should have NLP endpoints', () => {
    expect(endpoints.nlpSentimentSummary).toBeDefined();
    expect(endpoints.nlpTopEntities).toBeDefined();
    expect(endpoints.nlpReadabilitySummary).toBeDefined();
  });

  it('should have comparison endpoints', () => {
    expect(endpoints.compareKeywords).toBeDefined();
    expect(endpoints.compareEntities).toBeDefined();
    expect(endpoints.contentLengthComparison).toBeDefined();
  });

  it('should have scraping endpoints', () => {
    expect(endpoints.scrapeTrigger).toBeDefined();
    expect(typeof endpoints.scrapeStatus).toBe('function');
    expect(endpoints.scrapeStatus('task-123')).toBe('/scraping/status/task-123');
  });
});

describe('fetchAPI helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should call fetch with correct URL and options', async () => {
    const mockData = { status: 'healthy' };
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { healthAPI } = await import('@/lib/api');
    
    const result = await healthAPI.getHealth();
    
    expect(globalThis.fetch).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it('should throw error on failed fetch', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Server error' }),
    });

    const { healthAPI } = await import('@/lib/api');
    
    await expect(healthAPI.getHealth()).rejects.toThrow();
  });
});

describe('Dashboard API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch dashboard overview', async () => {
    const mockOverview = {
      article_count: {
        shega_count: 100,
        addis_insight_count: 80,
        difference: 20,
        percentage_difference: 25,
      },
      date_range: {
        earliest_article: '2024-01-01',
        latest_article: '2024-12-01',
        total_days: 335,
      },
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOverview,
    });

    const { dashboardAPI } = await import('@/lib/api');
    const result = await dashboardAPI.getOverview();

    expect(result.article_count).toBeDefined();
    expect(result.article_count.shega_count).toBe(100);
  });

  it('should fetch daily articles with days parameter', async () => {
    const mockDailyArticles = [
      { date: '2024-01-01', shega: 5, addis_insight: 3 },
      { date: '2024-01-02', shega: 7, addis_insight: 4 },
    ];

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDailyArticles,
    });

    const { dashboardAPI } = await import('@/lib/api');
    const result = await dashboardAPI.getDailyArticles(30);

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('date');
    expect(result[0]).toHaveProperty('shega');
    expect(result[0]).toHaveProperty('addis_insight');
  });
});

describe('Articles API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch paginated articles', async () => {
    const mockArticles = {
      articles: [
        { id: '1', title: 'Test Article 1' },
        { id: '2', title: 'Test Article 2' },
      ],
      total: 100,
      page: 1,
      per_page: 20,
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockArticles,
    });

    const { articlesAPI } = await import('@/lib/api');
    const result = await articlesAPI.getArticles({ page: 1, per_page: 20 });

    expect(result.articles).toBeDefined();
    expect(result.total).toBe(100);
    expect(Array.isArray(result.articles)).toBe(true);
  });

  it('should fetch single article by ID', async () => {
    const mockArticle = {
      id: '123',
      title: 'Test Article',
      body: 'Test content',
      site: 'shega',
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockArticle,
    });

    const { articlesAPI } = await import('@/lib/api');
    const result = await articlesAPI.getArticleById('123');

    expect(result.id).toBe('123');
    expect(result.title).toBe('Test Article');
  });

  it('should fetch article stats', async () => {
    const mockStats = {
      total_articles: 1000,
      by_site: {
        shega: 600,
        addis_insight: 400,
      },
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    const { articlesAPI } = await import('@/lib/api');
    const result = await articlesAPI.getStats();

    expect(result.total_articles).toBe(1000);
  });
});

describe('NLP API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch sentiment summary', async () => {
    const mockSentiment = {
      count: 100,
      avg_polarity: 0.1,
      avg_subjectivity: 0.4,
      positive: 40,
      negative: 30,
      neutral: 30,
      positive_pct: 40,
      negative_pct: 30,
      neutral_pct: 30,
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSentiment,
    });

    const { nlpAPI } = await import('@/lib/api');
    const result = await nlpAPI.getSentimentSummary();

    expect(result.count).toBeDefined();
    expect(result.positive).toBeDefined();
  });

  it('should fetch top entities with optional type filter', async () => {
    const mockEntities = [
      { entity: 'Ethiopia', entity_type: 'locations', count: 50 },
      { entity: 'Addis Ababa', entity_type: 'locations', count: 30 },
    ];

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEntities,
    });

    const { nlpAPI } = await import('@/lib/api');
    const result = await nlpAPI.getTopEntities({ entity_type: 'locations', limit: 10 });

    expect(Array.isArray(result)).toBe(true);
    expect(result[0].entity_type).toBe('locations');
  });
});

describe('Keywords API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch top keywords', async () => {
    const mockKeywords = [
      { keyword: 'technology', count: 100 },
      { keyword: 'business', count: 80 },
    ];

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockKeywords,
    });

    const { keywordsAPI } = await import('@/lib/api');
    const result = await keywordsAPI.getTop({ limit: 10 });

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('keyword');
    expect(result[0]).toHaveProperty('count');
  });
});

describe('Comparison API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch keyword comparison data', async () => {
    const mockComparison = {
      shared: [{ keyword: 'tech', shega_count: 10, addis_count: 8 }],
      shega_only: [{ keyword: 'startup', count: 20 }],
      addis_insight_only: [{ keyword: 'economy', count: 15 }],
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockComparison,
    });

    const { comparisonAPI } = await import('@/lib/api');
    const result = await comparisonAPI.getKeywords(15);

    expect(result.shared).toBeDefined();
    expect(result.shega_only).toBeDefined();
    expect(result.addis_insight_only).toBeDefined();
  });

  it('should fetch entity comparison data', async () => {
    const mockComparison = {
      shared: [],
      shega_only: [],
      addis_insight_only: [],
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockComparison,
    });

    const { comparisonAPI } = await import('@/lib/api');
    const result = await comparisonAPI.getEntities({ entity_type: 'locations', limit: 10 });

    expect(result).toBeDefined();
  });
});

describe('Health API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch health status', async () => {
    const mockHealth = {
      status: 'healthy',
      mongodb_connected: true,
      version: '1.0.0',
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealth,
    });

    const { healthAPI } = await import('@/lib/api');
    const result = await healthAPI.getHealth();

    expect(result.status).toBe('healthy');
    expect(result.mongodb_connected).toBe(true);
  });

  it('should fetch ready status', async () => {
    const mockReady = { status: 'ready' };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockReady,
    });

    const { healthAPI } = await import('@/lib/api');
    const result = await healthAPI.getReady();

    expect(result.status).toBe('ready');
  });

  it('should fetch live status', async () => {
    const mockLive = { status: 'live' };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockLive,
    });

    const { healthAPI } = await import('@/lib/api');
    const result = await healthAPI.getLive();

    expect(result.status).toBe('live');
  });
});

describe('Authors API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch top authors', async () => {
    const mockAuthors = [
      { author: 'John Doe', count: 50 },
      { author: 'Jane Smith', count: 40 },
    ];

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAuthors,
    });

    const { authorsAPI } = await import('@/lib/api');
    const result = await authorsAPI.getTop({ limit: 10 });

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('author');
    expect(result[0]).toHaveProperty('count');
  });
});

describe('Topics API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch topic evolution', async () => {
    const mockEvolution = {
      months: 6,
      evolution: [
        { month: '2024-01', top_keywords: [{ keyword: 'Technology', count: 10 }], total_keywords: 15 },
        { month: '2024-02', top_keywords: [{ keyword: 'Technology', count: 15 }], total_keywords: 20 },
      ],
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEvolution,
    });

    const { topicsAPI } = await import('@/lib/api');
    const result = await topicsAPI.getEvolution({ months: 6 });

    expect(result.months).toBeDefined();
    expect(result.evolution).toBeDefined();
  });
});

describe('Sentiment API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should fetch sentiment timeline', async () => {
    const mockTimeline = [
      { month: '2024-01', positive: 40, negative: 30, neutral: 30 },
      { month: '2024-02', positive: 45, negative: 25, neutral: 30 },
    ];

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTimeline,
    });

    const { sentimentAPI } = await import('@/lib/api');
    const result = await sentimentAPI.getTimeline({ months: 6 });

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('month');
  });
});
