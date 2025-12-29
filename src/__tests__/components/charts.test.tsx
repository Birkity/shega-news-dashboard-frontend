/**
 * Chart Components Tests
 * Tests for Recharts-based chart components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the entire recharts module before any imports
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
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
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

import { AreaChartComponent } from '@/components/charts/area-chart';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { AreaLineChart } from '@/components/charts/line-chart';
import { DonutChart } from '@/components/charts/donut-chart';

describe('AreaChartComponent', () => {
  const mockData = [
    { date: '2024-01', value: 100 },
    { date: '2024-02', value: 150 },
    { date: '2024-03', value: 120 },
  ];

  it('renders chart with title', () => {
    render(
      <AreaChartComponent
        data={mockData}
        areas={[{ dataKey: 'value', color: '#2563eb', name: 'Value' }]}
        xAxisKey="date"
        title="Test Chart"
      />
    );

    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('renders chart with description', () => {
    render(
      <AreaChartComponent
        data={mockData}
        areas={[{ dataKey: 'value', color: '#2563eb', name: 'Value' }]}
        xAxisKey="date"
        title="Test Chart"
        description="This is a test description"
      />
    );

    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('renders responsive container', () => {
    render(
      <AreaChartComponent
        data={mockData}
        areas={[{ dataKey: 'value', color: '#2563eb', name: 'Value' }]}
        xAxisKey="date"
      />
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders area chart element', () => {
    render(
      <AreaChartComponent
        data={mockData}
        areas={[{ dataKey: 'value', color: '#2563eb', name: 'Value' }]}
        xAxisKey="date"
      />
    );

    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });
});

describe('BarChartComponent', () => {
  const mockData = [
    { category: 'A', count: 100 },
    { category: 'B', count: 150 },
    { category: 'C', count: 80 },
  ];

  it('renders chart with title', () => {
    render(
      <BarChartComponent
        data={mockData}
        bars={[{ dataKey: 'count', color: '#2563eb', name: 'Count' }]}
        xAxisKey="category"
        title="Bar Chart Test"
      />
    );

    expect(screen.getByText('Bar Chart Test')).toBeInTheDocument();
  });

  it('renders bar chart element', () => {
    render(
      <BarChartComponent
        data={mockData}
        bars={[{ dataKey: 'count', color: '#2563eb', name: 'Count' }]}
        xAxisKey="category"
      />
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders with description when title is provided', () => {
    render(
      <BarChartComponent
        data={mockData}
        bars={[{ dataKey: 'count', color: '#2563eb', name: 'Count' }]}
        xAxisKey="category"
        title="Bar Chart"
        description="Bar chart description"
      />
    );

    expect(screen.getByText('Bar chart description')).toBeInTheDocument();
  });
});

describe('AreaLineChart (Line Chart)', () => {
  const mockData = [
    { month: 'Jan', value: 100 },
    { month: 'Feb', value: 120 },
    { month: 'Mar', value: 115 },
  ];

  it('renders line chart with title', () => {
    render(
      <AreaLineChart
        data={mockData}
        lines={[{ dataKey: 'value', color: '#2563eb', name: 'Value' }]}
        xAxisKey="month"
        title="Line Chart Test"
      />
    );

    expect(screen.getByText('Line Chart Test')).toBeInTheDocument();
  });

  it('renders line chart element', () => {
    render(
      <AreaLineChart
        data={mockData}
        lines={[{ dataKey: 'value', color: '#2563eb', name: 'Value' }]}
        xAxisKey="month"
      />
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders with description when title is provided', () => {
    render(
      <AreaLineChart
        data={mockData}
        lines={[{ dataKey: 'value', color: '#2563eb', name: 'Value' }]}
        xAxisKey="month"
        title="Line Chart"
        description="Line chart description"
      />
    );

    expect(screen.getByText('Line chart description')).toBeInTheDocument();
  });
});

describe('DonutChart', () => {
  const mockData = [
    { name: 'Positive', value: 40 },
    { name: 'Neutral', value: 35 },
    { name: 'Negative', value: 25 },
  ];

  it('renders donut chart with title', () => {
    render(
      <DonutChart
        data={mockData}
        title="Sentiment Distribution"
      />
    );

    expect(screen.getByText('Sentiment Distribution')).toBeInTheDocument();
  });

  it('renders pie chart element', () => {
    render(
      <DonutChart
        data={mockData}
      />
    );

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders with center label', () => {
    render(
      <DonutChart
        data={mockData}
        title="Sentiment"
        centerLabel="Total"
        centerValue={100}
      />
    );

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(
      <DonutChart
        data={mockData}
        title="Sentiment"
        description="Overall sentiment breakdown"
      />
    );

    expect(screen.getByText('Overall sentiment breakdown')).toBeInTheDocument();
  });
});
