// @ts-nocheck
/**
 * Dashboard Overview Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the API modules
jest.mock('@/lib/api', () => ({
  dashboardAPI: {
    getOverview: jest.fn(),
    getSummary: jest.fn(),
    getDailyArticles: jest.fn(),
  },
  nlpAPI: {
    getSentimentBySite: jest.fn(),
  },
  authorsAPI: {
    getTopWithStats: jest.fn(),
  },
  topicsAPI: {
    getSpikes: jest.fn(),
  },
  categoriesAPI: {
    getDistribution: jest.fn(),
  },
}));

import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { dashboardAPI, nlpAPI, authorsAPI, topicsAPI, categoriesAPI } from '@/lib/api';

const mockOverview = {
  article_count: {
    shega_count: 1000,
    addis_insight_count: 800,
    difference: 200,
    percentage_difference: 25,
  },
  date_range: {
    earliest_article: '2024-01-01',
    latest_article: '2024-12-01',
    total_days: 335,
  },
};

const mockSummary = {
  shega: {
    unique_authors: 50,
    avg_body_word_count: 450,
    avg_readability: 60,
    total_articles: 1000,
  },
  addis_insight: {
    unique_authors: 40,
    avg_body_word_count: 400,
    avg_readability: 55,
    total_articles: 800,
  },
};

const mockDailyArticles = [
  { date: '2024-01-01', shega: 10, addis_insight: 8 },
  { date: '2024-01-02', shega: 12, addis_insight: 9 },
];

const mockSentimentBySite = {
  shega: { positive: 40, neutral: 35, negative: 25, positive_pct: 40, neutral_pct: 35, negative_pct: 25 },
  addis_insight: { positive: 30, neutral: 40, negative: 30, positive_pct: 30, neutral_pct: 40, negative_pct: 30 },
};

const mockTopAuthors = [
  { author: 'John Doe', site: 'shega', article_count: 50, avg_polarity: 0.2, avg_subjectivity: 0.4, sentiment_breakdown: { positive: 30, negative: 10, neutral: 10, positive_pct: 60 }, avg_word_count: 500 },
  { author: 'Jane Smith', site: 'addis_insight', article_count: 40, avg_polarity: 0.1, avg_subjectivity: 0.5, sentiment_breakdown: { positive: 20, negative: 10, neutral: 10, positive_pct: 50 }, avg_word_count: 450 },
];

const mockSpikes = [
  { keyword: 'AI', recent_count: 100, previous_count: 20, spike_ratio: 5, is_new: false },
];

const mockCategories = [
  { category: 'Technology', shega_count: 200, addis_insight_count: 150, total: 350 },
  { category: 'Business', shega_count: 180, addis_insight_count: 120, total: 300 },
];

describe('DashboardOverview Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard with successful API responses', async () => {
    (dashboardAPI.getOverview as jest.Mock).mockResolvedValue(mockOverview);
    (dashboardAPI.getSummary as jest.Mock).mockResolvedValue(mockSummary);
    (dashboardAPI.getDailyArticles as jest.Mock).mockResolvedValue(mockDailyArticles);
    (nlpAPI.getSentimentBySite as jest.Mock).mockResolvedValue(mockSentimentBySite);
    (authorsAPI.getTopWithStats as jest.Mock).mockResolvedValue(mockTopAuthors);
    (topicsAPI.getSpikes as jest.Mock).mockResolvedValue(mockSpikes);
    (categoriesAPI.getDistribution as jest.Mock).mockResolvedValue(mockCategories);

    const DashboardComponent = await DashboardOverview({ site: 'all' });
    render(DashboardComponent);

    // Check KPI cards are rendered (multiple Shega/Addis Insight labels exist)
    expect(screen.getAllByText('Shega').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Addis Insight').length).toBeGreaterThan(0);
    expect(screen.getByText(/1,000/)).toBeInTheDocument();
    expect(screen.getByText(/800/)).toBeInTheDocument();
  });

  it('renders dashboard with partial API failures', async () => {
    (dashboardAPI.getOverview as jest.Mock).mockRejectedValue(new Error('API Error'));
    (dashboardAPI.getSummary as jest.Mock).mockResolvedValue(mockSummary);
    (dashboardAPI.getDailyArticles as jest.Mock).mockResolvedValue([]);
    (nlpAPI.getSentimentBySite as jest.Mock).mockRejectedValue(new Error('API Error'));
    (authorsAPI.getTopWithStats as jest.Mock).mockResolvedValue([]);
    (topicsAPI.getSpikes as jest.Mock).mockResolvedValue([]);
    (categoriesAPI.getDistribution as jest.Mock).mockResolvedValue([]);

    const DashboardComponent = await DashboardOverview({ site: 'all' });
    render(DashboardComponent);

    // Dashboard should still render with fallback values (multiple Shega labels exist)
    expect(screen.getAllByText('Shega').length).toBeGreaterThan(0);
  });

  it('renders dashboard with all API failures', async () => {
    (dashboardAPI.getOverview as jest.Mock).mockRejectedValue(new Error('API Error'));
    (dashboardAPI.getSummary as jest.Mock).mockRejectedValue(new Error('API Error'));
    (dashboardAPI.getDailyArticles as jest.Mock).mockRejectedValue(new Error('API Error'));
    (nlpAPI.getSentimentBySite as jest.Mock).mockRejectedValue(new Error('API Error'));
    (authorsAPI.getTopWithStats as jest.Mock).mockRejectedValue(new Error('API Error'));
    (topicsAPI.getSpikes as jest.Mock).mockRejectedValue(new Error('API Error'));
    (categoriesAPI.getDistribution as jest.Mock).mockRejectedValue(new Error('API Error'));

    const DashboardComponent = await DashboardOverview({ site: 'all' });
    render(DashboardComponent);

    // Dashboard should still render with fallback values (multiple Shega labels exist)
    expect(screen.getAllByText('Shega').length).toBeGreaterThan(0);
  });

  it('calls APIs with correct parameters', async () => {
    (dashboardAPI.getOverview as jest.Mock).mockResolvedValue(mockOverview);
    (dashboardAPI.getSummary as jest.Mock).mockResolvedValue(mockSummary);
    (dashboardAPI.getDailyArticles as jest.Mock).mockResolvedValue(mockDailyArticles);
    (nlpAPI.getSentimentBySite as jest.Mock).mockResolvedValue(mockSentimentBySite);
    (authorsAPI.getTopWithStats as jest.Mock).mockResolvedValue(mockTopAuthors);
    (topicsAPI.getSpikes as jest.Mock).mockResolvedValue(mockSpikes);
    (categoriesAPI.getDistribution as jest.Mock).mockResolvedValue(mockCategories);

    await DashboardOverview({ site: 'all' });

    expect(dashboardAPI.getOverview).toHaveBeenCalled();
    expect(dashboardAPI.getSummary).toHaveBeenCalled();
    expect(dashboardAPI.getDailyArticles).toHaveBeenCalledWith(30, undefined);
    expect(authorsAPI.getTopWithStats).toHaveBeenCalledWith({ limit: 10, site: undefined });
    expect(topicsAPI.getSpikes).toHaveBeenCalledWith({ weeks: 4, threshold: 2 });
  });

  it('renders daily articles chart', async () => {
    (dashboardAPI.getOverview as jest.Mock).mockResolvedValue(mockOverview);
    (dashboardAPI.getSummary as jest.Mock).mockResolvedValue(mockSummary);
    (dashboardAPI.getDailyArticles as jest.Mock).mockResolvedValue(mockDailyArticles);
    (nlpAPI.getSentimentBySite as jest.Mock).mockResolvedValue(mockSentimentBySite);
    (authorsAPI.getTopWithStats as jest.Mock).mockResolvedValue(mockTopAuthors);
    (topicsAPI.getSpikes as jest.Mock).mockResolvedValue(mockSpikes);
    (categoriesAPI.getDistribution as jest.Mock).mockResolvedValue(mockCategories);

    const DashboardComponent = await DashboardOverview({ site: 'all' });
    render(DashboardComponent);

    expect(screen.getByText('Daily Publishing Trends')).toBeInTheDocument();
  });

  it('renders sentiment overview', async () => {
    (dashboardAPI.getOverview as jest.Mock).mockResolvedValue(mockOverview);
    (dashboardAPI.getSummary as jest.Mock).mockResolvedValue(mockSummary);
    (dashboardAPI.getDailyArticles as jest.Mock).mockResolvedValue(mockDailyArticles);
    (nlpAPI.getSentimentBySite as jest.Mock).mockResolvedValue(mockSentimentBySite);
    (authorsAPI.getTopWithStats as jest.Mock).mockResolvedValue(mockTopAuthors);
    (topicsAPI.getSpikes as jest.Mock).mockResolvedValue(mockSpikes);
    (categoriesAPI.getDistribution as jest.Mock).mockResolvedValue(mockCategories);

    const DashboardComponent = await DashboardOverview({ site: 'all' });
    render(DashboardComponent);

    expect(screen.getByText('Sentiment Analysis')).toBeInTheDocument();
  });

  it('renders top authors card', async () => {
    (dashboardAPI.getOverview as jest.Mock).mockResolvedValue(mockOverview);
    (dashboardAPI.getSummary as jest.Mock).mockResolvedValue(mockSummary);
    (dashboardAPI.getDailyArticles as jest.Mock).mockResolvedValue(mockDailyArticles);
    (nlpAPI.getSentimentBySite as jest.Mock).mockResolvedValue(mockSentimentBySite);
    (authorsAPI.getTopWithStats as jest.Mock).mockResolvedValue(mockTopAuthors);
    (topicsAPI.getSpikes as jest.Mock).mockResolvedValue(mockSpikes);
    (categoriesAPI.getDistribution as jest.Mock).mockResolvedValue(mockCategories);

    const DashboardComponent = await DashboardOverview({ site: 'all' });
    render(DashboardComponent);

    expect(screen.getByText('Top 10 Authors')).toBeInTheDocument();
  });

  it('renders trending topics card', async () => {
    (dashboardAPI.getOverview as jest.Mock).mockResolvedValue(mockOverview);
    (dashboardAPI.getSummary as jest.Mock).mockResolvedValue(mockSummary);
    (dashboardAPI.getDailyArticles as jest.Mock).mockResolvedValue(mockDailyArticles);
    (nlpAPI.getSentimentBySite as jest.Mock).mockResolvedValue(mockSentimentBySite);
    (authorsAPI.getTopWithStats as jest.Mock).mockResolvedValue(mockTopAuthors);
    (topicsAPI.getSpikes as jest.Mock).mockResolvedValue(mockSpikes);
    (categoriesAPI.getDistribution as jest.Mock).mockResolvedValue(mockCategories);

    const DashboardComponent = await DashboardOverview({ site: 'all' });
    render(DashboardComponent);

    expect(screen.getByText('Trending Topics')).toBeInTheDocument();
  });
});
