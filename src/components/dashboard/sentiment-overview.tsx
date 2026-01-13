'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { SentimentBySite } from '@/types/api';
import { cn } from '@/lib/utils';

interface SentimentOverviewProps {
  readonly data: SentimentBySite | null;
  readonly highlightSite?: 'shega' | 'addis_insight';
}

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

  // Single site view
  if (highlightSite) {
    const siteSentiment = highlightSite === 'shega' ? data.shega : data.addis_insight;
    const siteName = highlightSite === 'shega' ? 'Shega Media' : 'Addis Insight';

    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Sentiment Analysis</CardTitle>
          <CardDescription>{siteName} sentiment distribution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium">{(siteSentiment?.positive_pct ?? 0).toFixed(1)}%</span>
              </div>
              <span className="text-sm text-muted-foreground">{siteSentiment?.positive ?? 0} articles</span>
            </div>
            <Progress value={siteSentiment?.positive_pct ?? 0} className="h-2 bg-muted [&>div]:bg-green-500" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-sm font-medium">{(siteSentiment?.neutral_pct ?? 0).toFixed(1)}%</span>
              </div>
              <span className="text-sm text-muted-foreground">{siteSentiment?.neutral ?? 0} articles</span>
            </div>
            <Progress value={siteSentiment?.neutral_pct ?? 0} className="h-2 bg-muted [&>div]:bg-gray-500" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm font-medium">{(siteSentiment?.negative_pct ?? 0).toFixed(1)}%</span>
              </div>
              <span className="text-sm text-muted-foreground">{siteSentiment?.negative ?? 0} articles</span>
            </div>
            <Progress value={siteSentiment?.negative_pct ?? 0} className="h-2 bg-muted [&>div]:bg-red-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Comparison view - show both sites side by side with numbers only
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Sentiment Analysis</CardTitle>
        <CardDescription>Distribution by site</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shega Media */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm font-medium">Shega Media</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className={cn("p-2 rounded-md bg-green-100 dark:bg-green-900/30")}>
              <div className="text-lg font-bold text-green-600">{(data.shega?.positive_pct ?? 0).toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">{data.shega?.positive ?? 0}</div>
            </div>
            <div className={cn("p-2 rounded-md bg-gray-100 dark:bg-gray-800/50")}>
              <div className="text-lg font-bold text-gray-600 dark:text-gray-400">{(data.shega?.neutral_pct ?? 0).toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">{data.shega?.neutral ?? 0}</div>
            </div>
            <div className={cn("p-2 rounded-md bg-red-100 dark:bg-red-900/30")}>
              <div className="text-lg font-bold text-red-600">{(data.shega?.negative_pct ?? 0).toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">{data.shega?.negative ?? 0}</div>
            </div>
          </div>
        </div>

        {/* Addis Insight */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium">Addis Insight</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className={cn("p-2 rounded-md bg-green-100 dark:bg-green-900/30")}>
              <div className="text-lg font-bold text-green-600">{(data.addis_insight?.positive_pct ?? 0).toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">{data.addis_insight?.positive ?? 0}</div>
            </div>
            <div className={cn("p-2 rounded-md bg-gray-100 dark:bg-gray-800/50")}>
              <div className="text-lg font-bold text-gray-600 dark:text-gray-400">{(data.addis_insight?.neutral_pct ?? 0).toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">{data.addis_insight?.neutral ?? 0}</div>
            </div>
            <div className={cn("p-2 rounded-md bg-red-100 dark:bg-red-900/30")}>
              <div className="text-lg font-bold text-red-600">{(data.addis_insight?.negative_pct ?? 0).toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">{data.addis_insight?.negative ?? 0}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
