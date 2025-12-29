'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChartComponent } from '@/components/charts/bar-chart';
import type { CategoryDistribution } from '@/types/api';

interface CategoryDistributionCardProps {
  categories: CategoryDistribution[];
}

export function CategoryDistributionCard({ categories }: CategoryDistributionCardProps) {
  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Category Distribution</CardTitle>
          <CardDescription>Articles by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Take top 8 categories for the chart
  const topCategories = categories
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map((cat) => ({
      category: cat.category.length > 15 ? `${cat.category.slice(0, 15)}...` : cat.category,
      shega: cat.shega_count,
      addis_insight: cat.addis_insight_count,
    }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Category Distribution</CardTitle>
        <CardDescription>Top categories by article count</CardDescription>
      </CardHeader>
      <CardContent>
        <BarChartComponent
          data={topCategories}
          bars={[
            { dataKey: 'shega', color: '#2563eb', name: 'Shega' },
            { dataKey: 'addis_insight', color: '#dc2626', name: 'Addis Insight' },
          ]}
          xAxisKey="category"
          height={280}
          layout="vertical"
          showLegend
          barSize={12}
        />
      </CardContent>
    </Card>
  );
}
