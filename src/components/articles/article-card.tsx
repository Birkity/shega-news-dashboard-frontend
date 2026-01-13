'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ExternalLink, FileText } from 'lucide-react';
import type { Article } from '@/types/api';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
  readonly article: Article;
}

export function ArticleCard({ article }: Readonly<ArticleCardProps>) {
  const getSentimentColor = (label?: string) => {
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  const excerpt = article.body ? truncateText(article.body, 200) : '';

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
                {article.word_count_body?.toLocaleString()} words
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge className={cn('capitalize', getSiteColor(article.site))}>
              {article.site === 'addis_insight' ? 'Addis Insight' : 'Shega'}
            </Badge>
            {article.sentiment_label && (
              <Badge className={cn('capitalize', getSentimentColor(article.sentiment_label))}>
                {article.sentiment_label}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {excerpt}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {/* Categories */}
          {article.categories?.slice(0, 3).map((category) => (
            <Badge key={category} variant="outline" className="text-xs">
              {category}
            </Badge>
          ))}
          {(article.categories?.length ?? 0) > 3 && (
            <Badge variant="outline" className="text-xs">
              +{(article.categories?.length ?? 0) - 3} more
            </Badge>
          )}
          
          <div className="flex-1" />
          
          {article.full_url && (
            <Button variant="ghost" size="sm" asChild>
              <a 
                href={article.full_url} 
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
