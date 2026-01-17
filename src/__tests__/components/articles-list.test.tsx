// @ts-nocheck
/**
 * Articles List Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the API module
jest.mock('@/lib/api', () => ({
  articlesAPI: {
    getArticles: jest.fn(),
  },
}));

import { ArticlesList } from '@/components/articles/articles-list';
import { articlesAPI } from '@/lib/api';

const mockArticles = {
  articles: [
    {
      id: '1',
      title: 'Test Article 1',
      author: 'John Doe',
      site: 'shega',
      published_at: '2024-01-15',
      word_count: 500,
      summary: 'This is a test article summary',
      sentiment_polarity: 0.5,
      categories: ['Technology'],
    },
    {
      id: '2',
      title: 'Test Article 2',
      author: 'Jane Smith',
      site: 'addis_insight',
      published_at: '2024-01-14',
      word_count: 600,
      summary: 'Another test article summary',
      sentiment_polarity: -0.2,
      categories: ['Business'],
    },
  ],
  total: 100,
  page: 1,
  per_page: 10,
};

describe('ArticlesList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders articles list successfully', async () => {
    (articlesAPI.getArticles as jest.Mock).mockResolvedValue(mockArticles);

    const ArticlesComponent = await ArticlesList({ page: 1 });
    render(ArticlesComponent);

    expect(screen.getByText('Test Article 1')).toBeInTheDocument();
    expect(screen.getByText('Test Article 2')).toBeInTheDocument();
  });

  it('shows results count', async () => {
    (articlesAPI.getArticles as jest.Mock).mockResolvedValue(mockArticles);

    const ArticlesComponent = await ArticlesList({ page: 1 });
    render(ArticlesComponent);

    expect(screen.getByText(/Showing 1 - 10 of 100 articles/)).toBeInTheDocument();
  });

  it('renders no articles message when empty', async () => {
    (articlesAPI.getArticles as jest.Mock).mockResolvedValue({
      articles: [],
      total: 0,
      page: 1,
      per_page: 10,
    });

    const ArticlesComponent = await ArticlesList({ page: 1 });
    render(ArticlesComponent);

    expect(screen.getByText('No articles found matching your criteria.')).toBeInTheDocument();
  });

  it('renders error message on API failure', async () => {
    (articlesAPI.getArticles as jest.Mock).mockRejectedValue(new Error('API Error'));

    const ArticlesComponent = await ArticlesList({ page: 1 });
    render(ArticlesComponent);

    expect(screen.getByText('Unable to load articles. Please check if the API is running.')).toBeInTheDocument();
  });

  it('calls API with correct parameters', async () => {
    (articlesAPI.getArticles as jest.Mock).mockResolvedValue(mockArticles);

    await ArticlesList({ page: 2, site: 'shega', search: 'test', category: 'Tech' });

    expect(articlesAPI.getArticles).toHaveBeenCalledWith({
      page: 2,
      per_page: 10,
      site: 'shega',
      search: 'test',
      category: 'Tech',
    });
  });

  it('renders pagination when there are multiple pages', async () => {
    (articlesAPI.getArticles as jest.Mock).mockResolvedValue(mockArticles);

    const ArticlesComponent = await ArticlesList({ page: 1 });
    render(ArticlesComponent);

    // Should show pagination section - look for page number buttons
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
  });

  it('handles page 2 correctly', async () => {
    (articlesAPI.getArticles as jest.Mock).mockResolvedValue({
      ...mockArticles,
      page: 2,
    });

    const ArticlesComponent = await ArticlesList({ page: 2 });
    render(ArticlesComponent);

    expect(screen.getByText(/Showing 11 - 20 of 100 articles/)).toBeInTheDocument();
  });

  it('handles last page correctly', async () => {
    (articlesAPI.getArticles as jest.Mock).mockResolvedValue({
      articles: [mockArticles.articles[0]],
      total: 95,
      page: 10,
      per_page: 10,
    });

    const ArticlesComponent = await ArticlesList({ page: 10 });
    render(ArticlesComponent);

    expect(screen.getByText(/Showing 91 - 95 of 95 articles/)).toBeInTheDocument();
  });

  it('renders article cards with correct data', async () => {
    (articlesAPI.getArticles as jest.Mock).mockResolvedValue(mockArticles);

    const ArticlesComponent = await ArticlesList({ page: 1 });
    render(ArticlesComponent);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Shega')).toBeInTheDocument();
    expect(screen.getByText('Addis Insight')).toBeInTheDocument();
  });

  it('filters by site parameter', async () => {
    (articlesAPI.getArticles as jest.Mock).mockResolvedValue({
      articles: [mockArticles.articles[0]],
      total: 50,
      page: 1,
      per_page: 10,
    });

    await ArticlesList({ page: 1, site: 'shega' });

    expect(articlesAPI.getArticles).toHaveBeenCalledWith(
      expect.objectContaining({ site: 'shega' })
    );
  });

  it('filters by search parameter', async () => {
    (articlesAPI.getArticles as jest.Mock).mockResolvedValue(mockArticles);

    await ArticlesList({ page: 1, search: 'technology' });

    expect(articlesAPI.getArticles).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'technology' })
    );
  });

  it('filters by category parameter', async () => {
    (articlesAPI.getArticles as jest.Mock).mockResolvedValue(mockArticles);

    await ArticlesList({ page: 1, category: 'Business' });

    expect(articlesAPI.getArticles).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Business' })
    );
  });
});
