/**
 * Dashboard Components Tests
 * Tests for dashboard-specific components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the API module
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

// Import after mocking
import { KPICard, ComparisonKPICard } from '@/components/dashboard/kpi-card';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';

describe('KPICard Component', () => {
  it('renders with title and value', () => {
    render(<KPICard title="Total Articles" value="1,234" />);
    
    expect(screen.getByText('Total Articles')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders with subtitle', () => {
    render(
      <KPICard 
        title="Total Articles" 
        value="1,234" 
        subtitle="Last 30 days"
      />
    );
    
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('renders positive change indicator', () => {
    render(
      <KPICard 
        title="Articles" 
        value="100" 
        change={15.5}
      />
    );
    
    expect(screen.getByText(/\+15\.5%/)).toBeInTheDocument();
  });

  it('renders negative change indicator', () => {
    render(
      <KPICard 
        title="Articles" 
        value="100" 
        change={-10.2}
      />
    );
    
    expect(screen.getByText(/-10\.2%/)).toBeInTheDocument();
  });

  it('renders loading skeleton when loading is true', () => {
    render(<KPICard title="Test" value="123" loading />);
    
    // Should show skeleton elements
    const card = document.querySelector('.animate-pulse');
    expect(card).toBeInTheDocument();
  });

  it('renders with icon when provided', () => {
    render(
      <KPICard 
        title="Articles" 
        value="100" 
        icon="newspaper"
      />
    );
    
    expect(screen.getByText('Articles')).toBeInTheDocument();
  });
});

describe('ComparisonKPICard Component', () => {
  it('renders with shega and addis values', () => {
    render(
      <ComparisonKPICard
        title="Total Articles"
        shegaValue="1,000"
        addisValue="800"
      />
    );
    
    expect(screen.getByText('Total Articles')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('800')).toBeInTheDocument();
    expect(screen.getByText('Shega')).toBeInTheDocument();
    expect(screen.getByText('Addis Insight')).toBeInTheDocument();
  });

  it('renders with positive difference', () => {
    render(
      <ComparisonKPICard
        title="Articles"
        shegaValue="100"
        addisValue="80"
        difference={25}
      />
    );
    
    expect(screen.getByText(/\+25\.0% difference/)).toBeInTheDocument();
  });

  it('renders with negative difference', () => {
    render(
      <ComparisonKPICard
        title="Articles"
        shegaValue="80"
        addisValue="100"
        difference={-20}
      />
    );
    
    expect(screen.getByText(/-20\.0% difference/)).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(
      <ComparisonKPICard
        title="Test"
        shegaValue="100"
        addisValue="80"
        loading
      />
    );
    
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });
});

describe('DashboardSkeleton Component', () => {
  it('renders skeleton loading state', () => {
    render(<DashboardSkeleton />);
    
    // Check for multiple skeleton elements
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders KPI card skeletons', () => {
    render(<DashboardSkeleton />);
    
    // Should have grid layout with skeleton cards
    const cards = document.querySelectorAll('[class*="rounded"]');
    expect(cards.length).toBeGreaterThan(0);
  });
});
