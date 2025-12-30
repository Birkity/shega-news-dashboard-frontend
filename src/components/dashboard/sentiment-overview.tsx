'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DonutChart } from '@/components/charts/donut-chart';
import { Badge } from '@/components/ui/badge';
import type { SentimentBySite } from '@/types/api';

interface SentimentOverviewProps {
  readonly data: SentimentBySite | null;
  readonly highlightSite?: 'shega' | 'addis_insight';
}

const SENTIMENT_COLORS = {
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#ef4444',
};

export function SentimentOverview({ data, highlightSite }: SentimentOverviewProps) {
  if (!data) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Sentiment Analysis</CardTitle>
          <CardDescription>Distribution by site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const shegaData = [
    { name: 'Positive', value: data.shega.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: data.shega.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: data.shega.negative, color: SENTIMENT_COLORS.negative },
  ];

  const addisData = [
    { name: 'Positive', value: data.addis_insight.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: data.addis_insight.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: data.addis_insight.negative, color: SENTIMENT_COLORS.negative },
  ];

  // Single site view
  if (highlightSite) {
    const siteData = highlightSite === 'shega' ? shegaData : addisData;
    const siteSentiment = highlightSite === 'shega' ? data.shega : data.addis_insight;
    const siteName = highlightSite === 'shega' ? 'Shega' : 'Addis Insight';

    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Sentiment Analysis</CardTitle>
          <CardDescription>{siteName} sentiment distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <DonutChart
            data={siteData}
            height={220}
            innerRadius={50}
            outerRadius={80}
            showLegend={false}
          />
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {siteSentiment.positive_pct.toFixed(1)}% Positive
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
              {siteSentiment.neutral_pct.toFixed(1)}% Neutral
            </Badge>
            <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
              {siteSentiment.negative_pct.toFixed(1)}% Negative
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Comparison view (both sites with tabs)
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Sentiment Analysis</CardTitle>
        <CardDescription>Distribution by site</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="shega" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="shega" className="text-xs">Shega</TabsTrigger>
            <TabsTrigger value="addis" className="text-xs">Addis Insight</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shega" className="mt-0">
            <DonutChart
              data={shegaData}
              height={220}
              innerRadius={50}
              outerRadius={80}
              showLegend={false}
            />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                {data.shega.positive_pct.toFixed(1)}% Positive
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                {data.shega.neutral_pct.toFixed(1)}% Neutral
              </Badge>
              <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                {data.shega.negative_pct.toFixed(1)}% Negative
              </Badge>
            </div>
          </TabsContent>
          
          <TabsContent value="addis" className="mt-0">
            <DonutChart
              data={addisData}
              height={220}
              innerRadius={50}
              outerRadius={80}
              showLegend={false}
            />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                {data.addis_insight.positive_pct.toFixed(1)}% Positive
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                {data.addis_insight.neutral_pct.toFixed(1)}% Neutral
              </Badge>
              <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                {data.addis_insight.negative_pct.toFixed(1)}% Negative
              </Badge>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
