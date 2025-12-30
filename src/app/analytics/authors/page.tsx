import { Suspense } from 'react';
import { authorsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SiteSelector, type SiteFilter } from '@/components/dashboard/site-selector';
import { AuthorAnalyticsClient } from '@/components/analytics/author-analytics-client';
import type { Site } from '@/types/api';

export const dynamic = 'force-dynamic';

interface SearchParams {
  site?: string;
  author?: string;
}

async function AuthorsContent({ site, selectedAuthor }: { readonly site: SiteFilter; readonly selectedAuthor?: string }) {
  const siteParam: Site | undefined = site === 'all' ? undefined : site;
  
  let topAuthors, authorsWithStats;
  
  try {
    [topAuthors, authorsWithStats] = await Promise.all([
      authorsAPI.getTop({ limit: 10, site: siteParam }),
      authorsAPI.getTopWithStats({ limit: 50, site: siteParam }),
    ]);
  } catch (error) {
    console.error('Error fetching authors:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load authors data. Please check if the API is running.</p>
      </div>
    );
  }

  const chartData = topAuthors.slice(0, 10).map((author) => ({
    author: author.author.length > 15 ? `${author.author.slice(0, 15)}...` : author.author,
    fullName: author.author,
    articles: author.article_count,
    avgWords: Math.round(author.avg_word_count),
  }));

  function getSiteDescription(): string {
    if (site === 'shega') {
      return 'Top authors from Shega';
    }
    if (site === 'addis_insight') {
      return 'Top authors from Addis Insight';
    }
    return 'Most prolific writers across both sites';
  }

  const getSentimentColor = (polarity: number) => {
    if (polarity > 0.1) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    if (polarity < -0.1) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Top Authors Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Top 10 Authors by Article Count
          </CardTitle>
          <CardDescription>{getSiteDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChartComponent
            data={chartData}
            bars={[{ dataKey: 'articles', color: '#2563eb', name: 'Articles' }]}
            xAxisKey="author"
            height={400}
            layout="vertical"
          />
        </CardContent>
      </Card>

      {/* Author Selection and Analytics */}
      <AuthorAnalyticsClient 
        authors={authorsWithStats} 
        selectedAuthor={selectedAuthor}
        site={site}
      />

      {/* Authors Stats Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {authorsWithStats.slice(0, 5).map((author, index) => (
          <Card key={`${author.author}-${author.site}`} className="relative overflow-hidden">
            <div className={cn(
              'absolute left-0 top-0 h-full w-1',
              author.site === 'shega' ? 'bg-blue-500' : 'bg-green-500'
            )} />
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm truncate">{author.author}</CardTitle>
                  <CardDescription className="text-xs capitalize">
                    {author.site === 'addis_insight' ? 'Addis Insight' : 'Shega'}
                  </CardDescription>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary shrink-0">
                  #{index + 1}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Articles</p>
                  <p className="text-lg font-bold">{author.article_count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Words</p>
                  <p className="text-lg font-bold">{Math.round(author.avg_word_count)}</p>
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-1">
                <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  {author.sentiment_breakdown.positive_pct.toFixed(0)}%+
                </Badge>
                <Badge className={cn('text-xs', getSentimentColor(author.avg_polarity))}>
                  {author.avg_polarity > 0 ? '+' : ''}{(author.avg_polarity * 100).toFixed(0)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface AuthorsPageProps {
  readonly searchParams: Promise<SearchParams>;
}

export default async function AuthorsPage({ searchParams }: AuthorsPageProps) {
  const params = await searchParams;
  const site = (params.site as SiteFilter) || 'all';
  const selectedAuthor = params.author;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Authors Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Analysis of author productivity, writing patterns, and keywords
          </p>
        </div>
        <SiteSelector />
      </div>

      <Suspense fallback={<AuthorsSkeleton />}>
        <AuthorsContent site={site} selectedAuthor={selectedAuthor} />
      </Suspense>
    </div>
  );
}

function AuthorsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[500px] w-full" />
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
