'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChartComponent } from '@/components/charts/area-chart';
import type { DailyArticle } from '@/types/api';

interface DailyArticlesChartProps {
  readonly data: DailyArticle[];
  readonly site?: 'shega' | 'addis_insight';
}

function getSiteCount(item: DailyArticle, site?: 'shega' | 'addis_insight'): number {
  if (site === 'shega') return item.shega;
  if (site === 'addis_insight') return item.addis_insight;
  return item.shega + item.addis_insight;
}

export function DailyArticlesChart({ data, site }: DailyArticlesChartProps) {
  // Format the data for the chart - use consistent formatting to avoid hydration issues
  const chartData = data.map((item) => {
    // Use a simple date string that's consistent between server and client
    const dateStr = item.date.split('T')[0]; // Get YYYY-MM-DD part
    const [, month, day] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${monthNames[Number.parseInt(month, 10) - 1]} ${Number.parseInt(day, 10)}`;
    
    return {
      date: formattedDate,
      shega: item.shega,
      addis_insight: item.addis_insight,
      // For single site view, just show the selected site's data
      count: getSiteCount(item, site),
    };
  });

  const formatDate = (value: string) => value;

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Daily Publishing Trends</CardTitle>
          <CardDescription>Article count per day over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Single site view
  if (site) {
    const color = site === 'shega' ? '#2563eb' : '#16a34a';
    const name = site === 'shega' ? 'Shega' : 'Addis Insight';
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Daily Publishing Trends</CardTitle>
          <CardDescription>Article count per day for {name}</CardDescription>
        </CardHeader>
        <CardContent>
          <AreaChartComponent
            data={chartData}
            areas={[
              { dataKey: site, color, name },
            ]}
            xAxisKey="date"
            height={300}
            formatXAxis={formatDate}
            gradient
          />
        </CardContent>
      </Card>
    );
  }

  // Comparison view (both sites)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Daily Publishing Trends</CardTitle>
        <CardDescription>Article count per day over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <AreaChartComponent
          data={chartData}
          areas={[
            { dataKey: 'shega', color: '#2563eb', name: 'Shega' },
            { dataKey: 'addis_insight', color: '#16a34a', name: 'Addis Insight' },
          ]}
          xAxisKey="date"
          height={300}
          formatXAxis={formatDate}
          gradient
        />
      </CardContent>
    </Card>
  );
}
