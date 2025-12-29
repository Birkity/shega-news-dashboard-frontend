'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Flame, TrendingUp, Sparkles } from 'lucide-react';
import type { TopicSpike } from '@/types/api';
import { cn } from '@/lib/utils';

interface TrendingTopicsCardProps {
  topics: TopicSpike[];
}

export function TrendingTopicsCard({ topics }: TrendingTopicsCardProps) {
  if (topics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Trending Topics
          </CardTitle>
          <CardDescription>Topics with sudden surge in coverage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No trending topics detected
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSpikeIntensity = (ratio: number | null) => {
    if (!ratio) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
    if (ratio >= 5) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    if (ratio >= 3) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          Trending Topics
        </CardTitle>
        <CardDescription>Topics with sudden surge in coverage</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px]">
          <div className="space-y-2">
            {topics.slice(0, 10).map((topic, index) => (
              <div
                key={topic.keyword}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex h-8 w-8 items-center justify-center">
                  {topic.is_new ? (
                    <Sparkles className="h-5 w-5 text-purple-500" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium capitalize truncate">{topic.keyword}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{topic.recent_count} recent mentions</span>
                    {!topic.is_new && (
                      <>
                        <span>·</span>
                        <span>{topic.previous_count} before</span>
                      </>
                    )}
                  </div>
                </div>

                <Badge className={cn('shrink-0', getSpikeIntensity(topic.spike_ratio))}>
                  {topic.is_new ? (
                    'NEW'
                  ) : topic.spike_ratio ? (
                    `${topic.spike_ratio.toFixed(1)}x`
                  ) : (
                    '—'
                  )}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
