/**
 * Article Components Tests
 * Tests for ArticleCard, ArticlesFilters, and ArticlesPagination
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock next/navigation
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/articles',
  useSearchParams: () => mockSearchParams,
}));

import { ArticleCard } from '@/components/articles/article-card';
import { ArticlesFilters } from '@/components/articles/articles-filters';
import { ArticlesPagination } from '@/components/articles/articles-pagination';

describe('ArticleCard', () => {
  const mockArticle = {
    id: '1',
    title: 'Test Article Title',
    slug: 'test-article-title',
    body: 'This is a test article body content that should be displayed as an excerpt in the card component.',
    author: 'John Doe',
    posted_date: '2024-01-15T10:00:00Z',
    site: 'shega' as const,
    full_url: 'https://example.com/article',
    word_count_body: 500,
    categories: ['Technology', 'Business', 'Innovation', 'Startup'],
    keywords: ['tech', 'startup'],
    sentiment_label: 'positive' as const,
    sentiment_polarity: 0.5,
  };

  it('renders article title', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
  });

  it('renders author name', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
  });

  it('renders word count', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('500 words')).toBeInTheDocument();
  });

  it('renders site badge for shega', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('Shega')).toBeInTheDocument();
  });

  it('renders site badge for addis insight', () => {
    const addisArticle = { ...mockArticle, site: 'addis_insight' as const };
    render(<ArticleCard article={addisArticle} />);
    expect(screen.getByText('Addis Insight')).toBeInTheDocument();
  });

  it('renders positive sentiment badge', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('positive')).toBeInTheDocument();
  });

  it('renders negative sentiment badge', () => {
    const negativeArticle = { ...mockArticle, sentiment_label: 'negative' as const };
    render(<ArticleCard article={negativeArticle} />);
    expect(screen.getByText('negative')).toBeInTheDocument();
  });

  it('renders neutral sentiment badge', () => {
    const neutralArticle = { ...mockArticle, sentiment_label: 'neutral' as const };
    render(<ArticleCard article={neutralArticle} />);
    expect(screen.getByText('neutral')).toBeInTheDocument();
  });

  it('renders categories', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Innovation')).toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('renders article without author', () => {
    const articleWithoutAuthor = { ...mockArticle, author: null };
    render(<ArticleCard article={articleWithoutAuthor} />);
    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('renders article without body', () => {
    const articleWithoutBody = { ...mockArticle, body: '' };
    render(<ArticleCard article={articleWithoutBody} />);
    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
  });

  it('truncates long body text', () => {
    const longBody = 'A'.repeat(300);
    const articleWithLongBody = { ...mockArticle, body: longBody };
    render(<ArticleCard article={articleWithLongBody} />);
    // Should truncate at 200 characters with ...
    expect(screen.getByText(/^A+\.\.\.$/)).toBeInTheDocument();
  });

  it('renders article without categories', () => {
    const articleWithoutCategories = { ...mockArticle, categories: [] };
    render(<ArticleCard article={articleWithoutCategories} />);
    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
  });

  it('renders article without sentiment label', () => {
    const articleWithoutSentiment = { ...mockArticle, sentiment_label: undefined };
    render(<ArticleCard article={articleWithoutSentiment} />);
    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    expect(screen.queryByText('positive')).not.toBeInTheDocument();
  });
});

describe('ArticlesFilters', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders search input', () => {
    render(<ArticlesFilters />);
    expect(screen.getByPlaceholderText('Search articles...')).toBeInTheDocument();
  });

  it('renders site filter select', () => {
    render(<ArticlesFilters />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('handles search form submission', () => {
    render(<ArticlesFilters />);
    const input = screen.getByPlaceholderText('Search articles...');
    fireEvent.change(input, { target: { value: 'test search' } });
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    expect(mockPush).toHaveBeenCalled();
  });

  it('shows clear button when search has value', () => {
    render(<ArticlesFilters />);
    const input = screen.getByPlaceholderText('Search articles...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // There should be a clear button now
    const clearButtons = screen.getAllByRole('button');
    expect(clearButtons.length).toBeGreaterThan(0);
  });

  it('shows clear filters button when filters are applied', () => {
    // Set up search params with a filter
    const params = new URLSearchParams('site=shega');
    jest.spyOn(require('next/navigation'), 'useSearchParams').mockReturnValue(params);
    
    render(<ArticlesFilters />);
    // Should have a clear filters button
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });
});

describe('ArticlesPagination', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders pagination buttons', () => {
    render(<ArticlesPagination currentPage={1} totalPages={10} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('disables first page button on first page', () => {
    render(<ArticlesPagination currentPage={1} totalPages={10} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });

  it('disables last page button on last page', () => {
    render(<ArticlesPagination currentPage={10} totalPages={10} />);
    const buttons = screen.getAllByRole('button');
    const lastButton = buttons.at(-1);
    const secondLastButton = buttons.at(-2);
    expect(lastButton).toBeDisabled();
    expect(secondLastButton).toBeDisabled();
  });

  it('navigates to page when button clicked', () => {
    render(<ArticlesPagination currentPage={5} totalPages={10} />);
    const pageButton = screen.getByText('6');
    fireEvent.click(pageButton);
    expect(mockPush).toHaveBeenCalled();
  });

  it('navigates to previous page', () => {
    render(<ArticlesPagination currentPage={5} totalPages={10} />);
    const buttons = screen.getAllByRole('button');
    // Second button is previous
    fireEvent.click(buttons[1]);
    expect(mockPush).toHaveBeenCalled();
  });

  it('navigates to next page', () => {
    render(<ArticlesPagination currentPage={5} totalPages={10} />);
    const buttons = screen.getAllByRole('button');
    // Second to last button is next
    const nextButton = buttons.at(-2);
    if (nextButton) fireEvent.click(nextButton);
    expect(mockPush).toHaveBeenCalled();
  });

  it('navigates to first page', () => {
    render(<ArticlesPagination currentPage={5} totalPages={10} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(mockPush).toHaveBeenCalled();
  });

  it('navigates to last page', () => {
    render(<ArticlesPagination currentPage={5} totalPages={10} />);
    const buttons = screen.getAllByRole('button');
    const lastButton = buttons.at(-1);
    if (lastButton) fireEvent.click(lastButton);
    expect(mockPush).toHaveBeenCalled();
  });

  it('shows correct current page indicator', () => {
    render(<ArticlesPagination currentPage={3} totalPages={10} />);
    const currentPageButton = screen.getByText('3');
    expect(currentPageButton).toBeInTheDocument();
  });

  it('handles single page scenario', () => {
    render(<ArticlesPagination currentPage={1} totalPages={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    // All navigation buttons should be disabled
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
    expect(buttons.at(-1)).toBeDisabled();
    expect(buttons.at(-2)).toBeDisabled();
  });

  it('limits visible page buttons', () => {
    render(<ArticlesPagination currentPage={50} totalPages={100} />);
    // Should show max 5 visible pages around current
    const pageButtons = screen.getAllByRole('button').filter(btn => 
      !btn.querySelector('svg') && btn.textContent
    );
    expect(pageButtons.length).toBeLessThanOrEqual(5);
  });
});
