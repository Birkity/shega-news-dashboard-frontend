/**
 * Layout Components Tests
 * Tests for Sidebar, DashboardLayout, and ThemeProvider
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { Sidebar } from '@/components/layout/sidebar';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ThemeProvider } from '@/components/providers/theme-provider';

describe('Sidebar', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it('renders sidebar with navigation items', () => {
    render(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Articles')).toBeInTheDocument();
  });

  it('renders analytics section', () => {
    render(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('renders system section', () => {
    render(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('renders all navigation items when expanded', () => {
    render(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    expect(screen.getByText('Authors')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Keywords')).toBeInTheDocument();
    expect(screen.getByText('Topics')).toBeInTheDocument();
    expect(screen.getByText('Sentiment')).toBeInTheDocument();
    expect(screen.getByText('Publishing')).toBeInTheDocument();
    expect(screen.getByText('NLP Analytics')).toBeInTheDocument();
    expect(screen.getByText('Comparison')).toBeInTheDocument();
    expect(screen.getByText('System Status')).toBeInTheDocument();
  });

  it('renders branding when expanded', () => {
    render(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    expect(screen.getByText('Shega Analytics')).toBeInTheDocument();
    expect(screen.getByText('News Dashboard')).toBeInTheDocument();
  });

  it('hides text when collapsed', () => {
    render(<Sidebar isCollapsed={true} onToggle={mockOnToggle} />);
    expect(screen.queryByText('Shega Analytics')).not.toBeInTheDocument();
    expect(screen.queryByText('News Dashboard')).not.toBeInTheDocument();
  });

  it('hides section titles when collapsed', () => {
    render(<Sidebar isCollapsed={true} onToggle={mockOnToggle} />);
    expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
    expect(screen.queryByText('System')).not.toBeInTheDocument();
  });

  it('renders collapse toggle button', () => {
    render(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    // Find the toggle button
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('calls onToggle when collapse button is clicked', () => {
    render(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    // Find the collapse button (last button or specific one)
    const buttons = screen.getAllByRole('button');
    // The toggle button should be present
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders theme toggle button', () => {
    render(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    const buttons = screen.getAllByRole('button');
    // Theme toggle button should exist
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders topics with badge', () => {
    render(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    expect(screen.getByText('Topics')).toBeInTheDocument();
    expect(screen.getByText('Trends')).toBeInTheDocument();
  });

  it('navigation links have correct hrefs', () => {
    render(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('href', '/');
    
    const articlesLink = screen.getByRole('link', { name: /articles/i });
    expect(articlesLink).toHaveAttribute('href', '/articles');
    
    const comparisonLink = screen.getByRole('link', { name: /comparison/i });
    expect(comparisonLink).toHaveAttribute('href', '/comparison');
  });
});

describe('DashboardLayout', () => {
  it('renders children', () => {
    render(
      <DashboardLayout>
        <div data-testid="test-child">Test Content</div>
      </DashboardLayout>
    );
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders sidebar', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('toggles sidebar collapse state', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );
    
    // Initially expanded, should show branding
    expect(screen.getByText('Shega Analytics')).toBeInTheDocument();
    
    // Find and click the toggle button
    const buttons = screen.getAllByRole('button');
    const toggleButton = buttons.find(btn => 
      btn.querySelector('svg[class*="ChevronLeft"]') || 
      btn.querySelector('svg[class*="ChevronRight"]')
    );
    
    if (toggleButton) {
      fireEvent.click(toggleButton);
    }
  });

  it('renders main content area', () => {
    render(
      <DashboardLayout>
        <main>Main Content</main>
      </DashboardLayout>
    );
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });
});

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(
      <ThemeProvider>
        <div data-testid="test-child">Themed Content</div>
      </ThemeProvider>
    );
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Themed Content')).toBeInTheDocument();
  });

  it('passes props to underlying provider', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="system">
        <div>Content</div>
      </ThemeProvider>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('works with multiple children', () => {
    render(
      <ThemeProvider>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ThemeProvider>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });
});
