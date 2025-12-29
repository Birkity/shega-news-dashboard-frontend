'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User } from 'lucide-react';
import type { AuthorWithStats } from '@/types/api';
import { cn } from '@/lib/utils';

interface TopAuthorsCardProps {
  authors: AuthorWithStats[];
}

export function TopAuthorsCard({ authors }: TopAuthorsCardProps) {
  if (authors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Top Authors</CardTitle>
          <CardDescription>Most prolific writers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSentimentColor = (polarity: number) => {
    if (polarity > 0.1) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    if (polarity < -0.1) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  };

  const getSiteColor = (site: string) => {
    return site === 'shega' 
      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
      : 'border-red-500 bg-red-50 dark:bg-red-950';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Top Authors</CardTitle>
        <CardDescription>Most prolific writers by article count</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px]">
          <div className="space-y-3">
            {authors.map((author, index) => (
              <div
                key={`${author.author}-${author.site}`}
                className={cn(
                  'flex items-center gap-3 rounded-lg border-l-4 p-3 transition-colors hover:bg-accent/50',
                  getSiteColor(author.site)
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-lg font-bold text-primary">{index + 1}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{author.author}</p>
                    <Badge variant="outline" className="shrink-0 text-xs capitalize">
                      {author.site === 'addis_insight' ? 'Addis' : 'Shega'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{author.article_count} articles</span>
                    <span>·</span>
                    <span>~{Math.round(author.avg_word_count)} words/article</span>
                  </div>
                </div>

                <Badge className={cn('shrink-0', getSentimentColor(author.avg_polarity))}>
                  {author.avg_polarity > 0 ? '+' : ''}{(author.avg_polarity * 100).toFixed(0)}%
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
