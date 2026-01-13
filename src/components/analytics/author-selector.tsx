'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AuthorWithStats } from '@/types/api';

interface AuthorSelectorProps {
  readonly authors: AuthorWithStats[];
  readonly selectedAuthor?: string;
}

export function AuthorSelector({ authors, selectedAuthor }: AuthorSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleAuthorSelect = (author: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (author === selectedAuthor) {
      // Deselect if clicking the same author
      params.delete('author');
    } else {
      params.set('author', author);
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const getSiteColor = (site: string) => {
    return site === 'shega' 
      ? 'border-l-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950' 
      : 'border-l-green-500 hover:bg-green-50 dark:hover:bg-green-950';
  };

  const getSentimentColor = (polarity: number) => {
    if (polarity > 0.1) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    if (polarity < -0.1) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  };

  if (authors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Top 10 Authors
          </CardTitle>
          <CardDescription>Select an author to view detailed analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No authors found for the selected site
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Top 10 Authors
        </CardTitle>
        <CardDescription>
          Select an author to view productivity and analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {authors.map((author, index) => (
              <Button
                key={`${author.author}-${author.site}`}
                variant="ghost"
                className={cn(
                  'w-full justify-start h-auto p-3 border-l-4 rounded-none rounded-r-lg transition-all',
                  getSiteColor(author.site),
                  selectedAuthor === author.author && 'bg-accent ring-2 ring-primary'
                )}
                onClick={() => handleAuthorSelect(author.author)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{author.author}</p>
                      <Badge variant="outline" className="shrink-0 text-xs capitalize">
                        {author.site === 'addis_insight' ? 'Addis' : 'Shega Media'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{author.article_count} articles</span>
                      <span>•</span>
                      <span>~{Math.round(author.avg_word_count)} words/article</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={cn('text-xs', getSentimentColor(author.avg_polarity))}>
                      {author.avg_polarity > 0 ? '+' : ''}{(author.avg_polarity * 100).toFixed(0)}%
                    </Badge>
                    <ChevronRight className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform',
                      selectedAuthor === author.author && 'rotate-90'
                    )} />
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
