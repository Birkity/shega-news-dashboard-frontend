'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChartComponent } from '@/components/charts/area-chart';
import type { DailyArticle } from '@/types/api';

interface DailyArticlesChartProps {
  data: DailyArticle[];
}

export function DailyArticlesChart({ data }: DailyArticlesChartProps) {
  // Format the data for the chart
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    shega: item.shega,
    addis_insight: item.addis_insight,
  }));

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
            { dataKey: 'addis_insight', color: '#dc2626', name: 'Addis Insight' },
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
