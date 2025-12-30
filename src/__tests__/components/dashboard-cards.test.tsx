/**
 * Additional Dashboard Components Tests
 * Tests for CategoryDistributionCard, DailyArticlesChart, SentimentOverview,
 * TopAuthorsCard, and TrendingTopicsCard
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  Bar: () => <div data-testid="bar" />,
  Pie: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

import { CategoryDistributionCard } from '@/components/dashboard/category-distribution-card';
import { DailyArticlesChart } from '@/components/dashboard/daily-articles-chart';
import { SentimentOverview } from '@/components/dashboard/sentiment-overview';
import { TopAuthorsCard } from '@/components/dashboard/top-authors-card';
import { TrendingTopicsCard } from '@/components/dashboard/trending-topics-card';

describe('CategoryDistributionCard', () => {
  it('renders no data message when categories is empty', () => {
    render(<CategoryDistributionCard categories={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText('Category Distribution')).toBeInTheDocument();
  });

  it('renders chart with categories data', () => {
    const mockCategories = [
      { category: 'Technology', total: 100, shega_count: 60, addis_insight_count: 40 },
      { category: 'Business', total: 80, shega_count: 50, addis_insight_count: 30 },
      { category: 'Politics', total: 60, shega_count: 30, addis_insight_count: 30 },
    ];

    render(<CategoryDistributionCard categories={mockCategories} />);
    expect(screen.getByText('Category Distribution')).toBeInTheDocument();
    expect(screen.getByText('Top categories by article count')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('truncates long category names', () => {
    const mockCategories = [
      { category: 'Very Long Category Name That Should Be Truncated', total: 100, shega_count: 60, addis_insight_count: 40 },
    ];

    render(<CategoryDistributionCard categories={mockCategories} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('handles more than 8 categories by showing only top 8', () => {
    const mockCategories = Array.from({ length: 10 }, (_, i) => ({
      category: `Category ${i + 1}`,
      total: 100 - i * 5,
      shega_count: 50 - i * 2,
      addis_insight_count: 50 - i * 3,
    }));

    render(<CategoryDistributionCard categories={mockCategories} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
});

describe('DailyArticlesChart', () => {
  it('renders no data message when data is empty', () => {
    render(<DailyArticlesChart data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText('Daily Publishing Trends')).toBeInTheDocument();
  });

  it('renders chart with daily article data', () => {
    const mockData = [
      { date: '2024-01-01', shega: 5, addis_insight: 3 },
      { date: '2024-01-02', shega: 7, addis_insight: 4 },
      { date: '2024-01-03', shega: 6, addis_insight: 5 },
    ];

    render(<DailyArticlesChart data={mockData} />);
    expect(screen.getByText('Daily Publishing Trends')).toBeInTheDocument();
    expect(screen.getByText('Article count per day over the last 30 days')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });
});

describe('SentimentOverview', () => {
  it('renders no data message when data is null', () => {
    render(<SentimentOverview data={null} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText('Sentiment Analysis')).toBeInTheDocument();
  });

  it('renders sentiment tabs with data', () => {
    const mockData = {
      shega: { 
        count: 100, avg_polarity: 0.2, avg_subjectivity: 0.4,
        positive: 40, neutral: 35, negative: 25, 
        positive_pct: 40, neutral_pct: 35, negative_pct: 25 
      },
      addis_insight: { 
        count: 100, avg_polarity: 0.1, avg_subjectivity: 0.5,
        positive: 30, neutral: 45, negative: 25,
        positive_pct: 30, neutral_pct: 45, negative_pct: 25
      },
    };

    render(<SentimentOverview data={mockData} />);
    expect(screen.getByText('Sentiment Analysis')).toBeInTheDocument();
    expect(screen.getByText('Distribution by site')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /shega/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /addis insight/i })).toBeInTheDocument();
  });
});

describe('TopAuthorsCard', () => {
  it('renders no data message when authors is empty', () => {
    render(<TopAuthorsCard authors={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText('Top Authors')).toBeInTheDocument();
  });

  it('renders authors list with data', () => {
    const mockAuthors = [
      { author: 'John Doe', site: 'shega' as const, article_count: 50, avg_polarity: 0.2, avg_subjectivity: 0.4, sentiment_breakdown: { positive: 30, negative: 10, neutral: 10, positive_pct: 60 }, avg_word_count: 500 },
      { author: 'Jane Smith', site: 'addis_insight' as const, article_count: 40, avg_polarity: -0.1, avg_subjectivity: 0.5, sentiment_breakdown: { positive: 15, negative: 15, neutral: 10, positive_pct: 37.5 }, avg_word_count: 450 },
    ];

    render(<TopAuthorsCard authors={mockAuthors} />);
    expect(screen.getByText('Top Authors')).toBeInTheDocument();
    expect(screen.getByText('Most prolific writers by article count')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays correct site badges', () => {
    const mockAuthors = [
      { author: 'John Doe', site: 'shega' as const, article_count: 50, avg_polarity: 0.2, avg_subjectivity: 0.4, sentiment_breakdown: { positive: 30, negative: 10, neutral: 10, positive_pct: 60 }, avg_word_count: 500 },
    ];

    render(<TopAuthorsCard authors={mockAuthors} />);
    expect(screen.getByText('Shega')).toBeInTheDocument();
  });

  it('handles positive polarity', () => {
    const mockAuthors = [
      { author: 'John Doe', site: 'shega' as const, article_count: 50, avg_polarity: 0.3, avg_subjectivity: 0.4, sentiment_breakdown: { positive: 30, negative: 10, neutral: 10, positive_pct: 60 }, avg_word_count: 500 },
    ];

    render(<TopAuthorsCard authors={mockAuthors} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles negative polarity', () => {
    const mockAuthors = [
      { author: 'John Doe', site: 'shega' as const, article_count: 50, avg_polarity: -0.3, avg_subjectivity: 0.4, sentiment_breakdown: { positive: 10, negative: 30, neutral: 10, positive_pct: 20 }, avg_word_count: 500 },
    ];

    render(<TopAuthorsCard authors={mockAuthors} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles neutral polarity', () => {
    const mockAuthors = [
      { author: 'John Doe', site: 'shega' as const, article_count: 50, avg_polarity: 0.05, avg_subjectivity: 0.4, sentiment_breakdown: { positive: 20, negative: 20, neutral: 10, positive_pct: 40 }, avg_word_count: 500 },
    ];

    render(<TopAuthorsCard authors={mockAuthors} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});

describe('TrendingTopicsCard', () => {
  it('renders no data message when topics is empty', () => {
    render(<TrendingTopicsCard topics={[]} />);
    expect(screen.getByText('No trending topics detected')).toBeInTheDocument();
    expect(screen.getByText('Trending Topics')).toBeInTheDocument();
  });

  it('renders topics list with data', () => {
    const mockTopics = [
      { keyword: 'AI', recent_count: 50, previous_count: 10, spike_ratio: 5, is_new: false },
      { keyword: 'Blockchain', recent_count: 30, previous_count: 0, spike_ratio: null, is_new: true },
    ];

    render(<TrendingTopicsCard topics={mockTopics} />);
    expect(screen.getByText('Trending Topics')).toBeInTheDocument();
    expect(screen.getByText('Topics with sudden surge in coverage')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('Blockchain')).toBeInTheDocument();
  });

  it('handles new topics', () => {
    const mockTopics = [
      { keyword: 'NewTopic', recent_count: 30, previous_count: 0, spike_ratio: null, is_new: true },
    ];

    render(<TrendingTopicsCard topics={mockTopics} />);
    expect(screen.getByText('NewTopic')).toBeInTheDocument();
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('handles high spike ratio', () => {
    const mockTopics = [
      { keyword: 'ViralTopic', recent_count: 100, previous_count: 10, spike_ratio: 10, is_new: false },
    ];

    render(<TrendingTopicsCard topics={mockTopics} />);
    expect(screen.getByText('ViralTopic')).toBeInTheDocument();
  });

  it('handles medium spike ratio', () => {
    const mockTopics = [
      { keyword: 'MediumTopic', recent_count: 30, previous_count: 10, spike_ratio: 3, is_new: false },
    ];

    render(<TrendingTopicsCard topics={mockTopics} />);
    expect(screen.getByText('MediumTopic')).toBeInTheDocument();
  });

  it('handles low spike ratio', () => {
    const mockTopics = [
      { keyword: 'LowTopic', recent_count: 15, previous_count: 10, spike_ratio: 1.5, is_new: false },
    ];

    render(<TrendingTopicsCard topics={mockTopics} />);
    expect(screen.getByText('LowTopic')).toBeInTheDocument();
  });

  it('limits to 10 topics', () => {
    const mockTopics = Array.from({ length: 15 }, (_, i) => ({
      keyword: `Topic${i + 1}`,
      recent_count: 50 - i,
      previous_count: 10,
      spike_ratio: 5,
      is_new: false,
    }));

    render(<TrendingTopicsCard topics={mockTopics} />);
    expect(screen.getByText('Topic1')).toBeInTheDocument();
    expect(screen.getByText('Topic10')).toBeInTheDocument();
    expect(screen.queryByText('Topic11')).not.toBeInTheDocument();
  });
});
