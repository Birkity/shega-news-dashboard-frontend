import { Suspense } from 'react';
import { authorsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { DonutChart } from '@/components/charts/donut-chart';
import { User, TrendingUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function AuthorsContent() {
  let topAuthors, authorsWithStats;
  
  try {
    [topAuthors, authorsWithStats] = await Promise.all([
      authorsAPI.getTop({ limit: 20 }),
      authorsAPI.getTopWithStats({ limit: 10 }),
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
    articles: author.article_count,
    avgWords: Math.round(author.avg_word_count),
  }));

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
          <CardDescription>Most prolific writers across both sites</CardDescription>
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

      {/* Authors with Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {authorsWithStats.map((author, index) => (
          <Card key={`${author.author}-${author.site}`} className="relative overflow-hidden">
            <div className={cn(
              'absolute left-0 top-0 h-full w-1',
              author.site === 'shega' ? 'bg-blue-500' : 'bg-red-500'
            )} />
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{author.author}</CardTitle>
                  <CardDescription className="capitalize">
                    {author.site === 'addis_insight' ? 'Addis Insight' : 'Shega'}
                  </CardDescription>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  #{index + 1}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Articles</p>
                  <p className="text-xl font-bold">{author.article_count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Words</p>
                  <p className="text-xl font-bold">{Math.round(author.avg_word_count)}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Sentiment Breakdown</p>
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    {author.sentiment_breakdown.positive_pct.toFixed(0)}% Positive
                  </Badge>
                  <Badge className={getSentimentColor(author.avg_polarity)}>
                    {author.avg_polarity > 0 ? '+' : ''}{(author.avg_polarity * 100).toFixed(0)}% Polarity
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AuthorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Authors Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Analysis of author productivity and writing patterns
        </p>
      </div>

      <Suspense fallback={<AuthorsSkeleton />}>
        <AuthorsContent />
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
