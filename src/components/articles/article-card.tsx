'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ExternalLink, FileText, Tag } from 'lucide-react';
import type { ArticleListItem } from '@/types/api';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
  readonly article: ArticleListItem;
}

export function ArticleCard({ article }: Readonly<ArticleCardProps>) {
  const getSentimentColor = (label?: string | null) => {
    if (label === 'positive') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    if (label === 'negative') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  };

  const getSiteColor = (site: string) => {
    return site === 'shega'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold leading-tight line-clamp-2">
              {article.title}
            </h3>
            
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {article.author && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {article.author}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(article.posted_date)}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {article.word_count?.toLocaleString()} words
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge className={cn('capitalize', getSiteColor(article.site))}>
              {article.site === 'addis_insight' ? 'Addis Insight' : 'Shega'}
            </Badge>
            {article.sentiment && (
              <Badge className={cn('capitalize', getSentimentColor(article.sentiment))}>
                {article.sentiment}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {article.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {article.excerpt}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {/* Topic Label */}
          {article.topic_label && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {article.topic_label}
            </Badge>
          )}
          
          {/* Keywords */}
          {article.keywords?.slice(0, 2).map((keyword) => (
            <Badge key={keyword} variant="outline" className="text-xs">
              {keyword}
            </Badge>
          ))}
          {(article.keywords?.length ?? 0) > 2 && (
            <Badge variant="outline" className="text-xs">
              +{(article.keywords?.length ?? 0) - 2} more
            </Badge>
          )}
          
          <div className="flex-1" />
          
          {article.url && (
            <Button variant="ghost" size="sm" asChild>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                Read Original
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
