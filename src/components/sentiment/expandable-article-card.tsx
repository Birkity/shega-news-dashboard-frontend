'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExpandableArticleCardProps {
  article: {
    title: string;
    excerpt: string;
    posted_date: string;
    author: string;
    polarity: number;
    url: string;
  };
  siteName: string;
  badgeColor: 'green' | 'red';
}

export function ExpandableArticleCard({ article, siteName, badgeColor }: ExpandableArticleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract first two sentences from excerpt
  const getPreview = (text: string) => {
    if (!text) return '';
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.slice(0, 2).join(' ');
  };

  const preview = getPreview(article.excerpt);
  const hasMoreContent = article.excerpt && article.excerpt.length > preview.length;

  const badgeClass = badgeColor === 'green' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="border-b pb-4 last:border-0">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <h3 className="font-medium mb-1">{article.title}</h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
            <span>{siteName}</span>
            <span>•</span>
            <span>{article.author || 'Unknown'}</span>
            <span>•</span>
            <span>{new Date(article.posted_date).toLocaleDateString()}</span>
          </div>
        </div>
        <Badge className={`${badgeClass} shrink-0`}>
          {article.polarity?.toFixed(3)}
        </Badge>
      </div>
      
      {/* Excerpt Preview/Full */}
      {article.excerpt && (
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">
            {isExpanded ? article.excerpt : preview}
          </p>
          
          {hasMoreContent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2 text-xs"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show more
                </>
              )}
            </Button>
          )}
          
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline ml-2"
            >
              Read full article →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
