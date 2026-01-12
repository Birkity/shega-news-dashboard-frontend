import { Suspense } from 'react';
import { sentimentAPI, nlpAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChartComponent } from '@/components/charts/area-chart';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { MessageSquare, TrendingUp, Smile, Frown } from 'lucide-react';
import { SiteSelector, type SiteFilter } from '@/components/dashboard/site-selector';
import type { Site } from '@/types/api';

export const dynamic = 'force-dynamic';

interface SearchParams {
  site?: string;
}

async function SentimentContent({ site }: { readonly site: SiteFilter }) {
  const siteParam: Site | undefined = site === 'all' ? undefined : site;
  
  let timeline, sentimentBySite, topPositive, topNegative;
  
  try {
    [timeline, sentimentBySite, topPositive, topNegative] = await Promise.all([
      sentimentAPI.getTimeline({ months: 12, site: siteParam }),
      nlpAPI.getSentimentBySite(),
      sentimentAPI.getTopPositive({ limit: 5, site: siteParam }),
      sentimentAPI.getTopNegative({ limit: 5, site: siteParam }),
    ]);
  } catch (error) {
    console.error('Error fetching sentiment data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load sentiment data. Please check if the API is running.</p>
      </div>
    );
  }

  const timelineData = timeline?.map((item) => ({
    month: item.month,
    shega_polarity: item.shega?.avg_polarity ?? 0,
    addis_polarity: item.addis_insight?.avg_polarity ?? 0,
  })) ?? [];

  const sentimentComparisonData = [
    {
      site: 'Shega',
      positive: sentimentBySite?.shega?.positive ?? 0,
      neutral: sentimentBySite?.shega?.neutral ?? 0,
      negative: sentimentBySite?.shega?.negative ?? 0,
    },
    {
      site: 'Addis Insight',
      positive: sentimentBySite?.addis_insight?.positive ?? 0,
      neutral: sentimentBySite?.addis_insight?.neutral ?? 0,
      negative: sentimentBySite?.addis_insight?.negative ?? 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shega Avg Polarity</CardTitle>
            <Smile className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((sentimentBySite?.shega?.avg_polarity ?? 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {(sentimentBySite?.shega?.positive_pct ?? 0).toFixed(1)}% positive articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Addis Insight Avg Polarity</CardTitle>
            <Smile className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((sentimentBySite?.addis_insight?.avg_polarity ?? 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {(sentimentBySite?.addis_insight?.positive_pct ?? 0).toFixed(1)}% positive articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shega Subjectivity</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((sentimentBySite?.shega?.avg_subjectivity ?? 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across all articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Addis Insight Subjectivity</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((sentimentBySite?.addis_insight?.avg_subjectivity ?? 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across all articles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sentiment Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sentiment Polarity Over Time
            </CardTitle>
            <CardDescription>Monthly average polarity comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={timelineData}
              areas={[
                { dataKey: 'shega_polarity', color: '#2563eb', name: 'Shega' },
                { dataKey: 'addis_polarity', color: '#dc2626', name: 'Addis Insight' },
              ]}
              xAxisKey="month"
              height={300}
              tooltipFormat="percent"
            />
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Sentiment Distribution by Site
            </CardTitle>
            <CardDescription>Comparison of sentiment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={sentimentComparisonData}
              bars={[
                { dataKey: 'positive', color: '#22c55e', name: 'Positive', stackId: 'stack' },
                { dataKey: 'neutral', color: '#6b7280', name: 'Neutral', stackId: 'stack' },
                { dataKey: 'negative', color: '#ef4444', name: 'Negative', stackId: 'stack' },
              ]}
              xAxisKey="site"
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Articles */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Most Positive */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Smile className="h-5 w-5" />
              Most Positive Articles
            </CardTitle>
            <CardDescription>Articles with highest positive sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPositive.shega?.slice(0, 3).map((article) => (
                <div key={`shega-pos-${article.title}`} className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3 dark:bg-blue-950">
                  <p className="font-medium line-clamp-1">{article.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Shega</span>
                    <span>·</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      +{(article.polarity * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
              {topPositive.addis_insight?.slice(0, 2).map((article) => (
                <div key={`addis-pos-${article.title}`} className="rounded-lg border-l-4 border-red-500 bg-red-50 p-3 dark:bg-red-950">
                  <p className="font-medium line-clamp-1">{article.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Addis Insight</span>
                    <span>·</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      +{(article.polarity * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Negative */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Frown className="h-5 w-5" />
              Most Negative Articles
            </CardTitle>
            <CardDescription>Articles with most negative sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topNegative.shega?.slice(0, 3).map((article) => (
                <div key={`shega-neg-${article.title}`} className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3 dark:bg-blue-950">
                  <p className="font-medium line-clamp-1">{article.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Shega</span>
                    <span>·</span>
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                      {(article.polarity * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
              {topNegative.addis_insight?.slice(0, 2).map((article) => (
                <div key={`addis-neg-${article.title}`} className="rounded-lg border-l-4 border-red-500 bg-red-50 p-3 dark:bg-red-950">
                  <p className="font-medium line-clamp-1">{article.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Addis Insight</span>
                    <span>·</span>
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                      {(article.polarity * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface SentimentPageProps {
  readonly searchParams: Promise<SearchParams>;
}

export default async function SentimentPage({ searchParams }: SentimentPageProps) {
  const params = await searchParams;
  const site = (params.site as SiteFilter) || 'all';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sentiment Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Analysis of article sentiment polarity and subjectivity
          </p>
        </div>
        <SiteSelector />
      </div>

      <Suspense fallback={<SentimentSkeleton />}>
        <SentimentContent site={site} />
      </Suspense>
    </div>
  );
}

const SKELETON_CARD_IDS = ['polarity', 'positive', 'neutral', 'negative'] as const;

function SentimentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {SKELETON_CARD_IDS.map((id) => (
          <Card key={id}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="mt-2 h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
