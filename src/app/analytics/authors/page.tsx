import { Suspense } from 'react';
import { authorAnalyticsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { User, Users, FileText, TrendingUp } from 'lucide-react';
import { SiteSelector, type SiteFilter } from '@/components/dashboard/site-selector';
import { AuthorAnalyticsClient } from '@/components/analytics/author-analytics-client';
import type { Site } from '@/types/api';

export const dynamic = 'force-dynamic';

interface SearchParams {
  site?: string;
  author?: string;
}

async function AuthorsContent({ site, selectedAuthor }: { readonly site: SiteFilter; readonly selectedAuthor?: string }) {
  // For authors page, we don't support 'all' - default to 'shega'
  const effectiveSite = site === 'all' ? 'shega' : site;
  const siteParam: Site = effectiveSite;
  
  let topAuthorsData, authorsWithStatsData;
  
  try {
    [topAuthorsData, authorsWithStatsData] = await Promise.all([
      authorAnalyticsAPI.getList({ site: siteParam }),
      authorAnalyticsAPI.getList({ site: siteParam }),
    ]);
  } catch (error) {
    console.error('Error fetching authors:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load authors data. Please check if the API is running.</p>
      </div>
    );
  }

  const topAuthors = topAuthorsData.authors.slice(0, 10);
  const authorsWithStats = authorsWithStatsData.authors;

  const chartData = topAuthors.slice(0, 10).map((author: any) => ({
    author: author.author.length > 15 ? `${author.author.slice(0, 15)}...` : author.author,
    fullName: author.author,
    articles: author.article_count,
    avgWords: Math.round(author.avg_word_count),
  }));

  const siteName = effectiveSite === 'shega' ? 'Shega Media' : 'Addis Insight';

  // Calculate overview stats
  const totalAuthors = authorsWithStats.length;
  const totalArticles = authorsWithStats.reduce((sum: number, a: any) => sum + a.article_count, 0);
  const avgArticlesPerAuthor = totalAuthors > 0 ? totalArticles / totalAuthors : 0;
  const avgWordCount = authorsWithStats.length > 0 
    ? authorsWithStats.reduce((sum: number, a: any) => sum + a.avg_word_count, 0) / authorsWithStats.length 
    : 0;
  const avgPolarity = authorsWithStats.length > 0
    ? authorsWithStats.reduce((sum: number, a: any) => sum + a.avg_polarity, 0) / authorsWithStats.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Authors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAuthors}</div>
            <p className="text-xs text-muted-foreground">Active writers on {siteName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Articles/Author</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgArticlesPerAuthor.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Average productivity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Word Count</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgWordCount).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Words per article</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Sentiment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPolarity > 0 ? '+' : ''}{(avgPolarity * 100).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Average polarity score</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Authors Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Top 10 Authors by Article Count
          </CardTitle>
          <CardDescription>Most prolific writers on {siteName}</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChartComponent
            data={chartData}
            bars={[{ dataKey: 'articles', color: effectiveSite === 'shega' ? '#2563eb' : '#16a34a', name: 'Articles' }]}
            xAxisKey="author"
            height={400}
            layout="vertical"
          />
        </CardContent>
      </Card>

      {/* Author Selection and Analytics */}
      <AuthorAnalyticsClient 
        authors={authorsWithStats as any} 
        selectedAuthor={selectedAuthor || (authorsWithStats.length > 0 ? authorsWithStats[0].author : undefined)}
        site={effectiveSite}
      />
    </div>
  );
}

interface AuthorsPageProps {
  readonly searchParams: Promise<SearchParams>;
}

export default async function AuthorsPage({ searchParams }: AuthorsPageProps) {
  const params = await searchParams;
  const site = (params.site as SiteFilter) || 'shega'; // Default to shega
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
        <SiteSelector showBothOption={false} />
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
