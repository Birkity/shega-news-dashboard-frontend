import { Suspense } from 'react';
import { sentimentAnalyticsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smile, Frown, Meh, TrendingUp } from 'lucide-react';
import { SiteSelector, type SiteFilter } from '@/components/dashboard/site-selector';
import type { Site } from '@/types/api';

export const dynamic = 'force-dynamic';

interface SearchParams {
  site?: string;
}

async function SentimentContent({ site }: { readonly site: SiteFilter }) {
  const siteParam: Site | undefined = site === 'all' ? undefined : site;
  
  let sentimentDistribution, sentimentTrends;
  
  try {
    [sentimentDistribution, sentimentTrends] = await Promise.all([
      sentimentAnalyticsAPI.getDistribution({ site: siteParam }),
      sentimentAnalyticsAPI.getTrends({ site: siteParam, months: 12 }),
    ]);
  } catch (error) {
    console.error('Error fetching sentiment data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load sentiment data. Please check if the API is running.</p>
      </div>
    );
  }

  // Get the right distribution based on site selection
  const getDistribution = () => {
    if (site === 'all') return sentimentDistribution.distribution.all;
    if (site === 'shega') return sentimentDistribution.distribution.shega;
    return sentimentDistribution.distribution.addis_insight;
  };

  const distribution = getDistribution();

  // Transform data for comparison chart
  const comparisonData = [
    {
      site: 'Shega',
      positive: sentimentDistribution.distribution.shega?.positive || 0,
      neutral: sentimentDistribution.distribution.shega?.neutral || 0,
      negative: sentimentDistribution.distribution.shega?.negative || 0,
    },
    {
      site: 'Addis Insight',
      positive: sentimentDistribution.distribution.addis_insight?.positive || 0,
      neutral: sentimentDistribution.distribution.addis_insight?.neutral || 0,
      negative: sentimentDistribution.distribution.addis_insight?.negative || 0,
    },
  ];

  // Transform trends data for chart
  const trendsData = sentimentTrends?.timeline?.map((item: {
    month: string;
    avg_polarity: number;
    avg_subjectivity: number;
    positive_count: number;
    negative_count: number;
    neutral_count: number;
    total_articles: number;
  }) => ({
    month: item.month,
    polarity: Math.round(item.avg_polarity * 100) / 100,
    subjectivity: Math.round(item.avg_subjectivity * 100) / 100,
    positive: item.positive_count,
    negative: item.negative_count,
    neutral: item.neutral_count,
    total: item.total_articles,
  })) || [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Positive Articles</CardTitle>
            <Smile className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {distribution?.positive?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {distribution?.positive_pct?.toFixed(1) || 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Neutral Articles</CardTitle>
            <Meh className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {distribution?.neutral?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {distribution?.neutral_pct?.toFixed(1) || 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Negative Articles</CardTitle>
            <Frown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {distribution?.negative?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {distribution?.negative_pct?.toFixed(1) || 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Analyzed</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {distribution?.total?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              articles with sentiment
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="comparison">Site Comparison</TabsTrigger>
          <TabsTrigger value="trends">Trends Over Time</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Comparison by Site</CardTitle>
              <CardDescription>Compare sentiment distribution between Shega and Addis Insight</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={comparisonData}
                bars={[
                  { dataKey: 'positive', color: '#10B981', name: 'Positive', stackId: 'stack' },
                  { dataKey: 'neutral', color: '#6B7280', name: 'Neutral', stackId: 'stack' },
                  { dataKey: 'negative', color: '#EF4444', name: 'Negative', stackId: 'stack' },
                ]}
                xAxisKey="site"
                height={400}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Trends Over Time</CardTitle>
              <CardDescription>Monthly article counts by sentiment category</CardDescription>
            </CardHeader>
            <CardContent>
              {trendsData.length > 0 ? (
                <BarChartComponent
                  data={trendsData}
                  bars={[
                    { dataKey: 'positive', color: '#10B981', name: 'Positive', stackId: 'stack' },
                    { dataKey: 'neutral', color: '#6B7280', name: 'Neutral', stackId: 'stack' },
                    { dataKey: 'negative', color: '#EF4444', name: 'Negative', stackId: 'stack' },
                  ]}
                  xAxisKey="month"
                  height={400}
                />
              ) : (
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-blue-500">Shega</Badge>
                  Sentiment Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smile className="h-5 w-5 text-green-500" />
                      <span>Positive</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{sentimentDistribution.distribution.shega?.positive || 0}</span>
                      <Badge variant="outline" className="text-green-600">
                        {sentimentDistribution.distribution.shega?.positive_pct?.toFixed(1) || 0}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Meh className="h-5 w-5 text-gray-500" />
                      <span>Neutral</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{sentimentDistribution.distribution.shega?.neutral || 0}</span>
                      <Badge variant="outline" className="text-gray-600">
                        {sentimentDistribution.distribution.shega?.neutral_pct?.toFixed(1) || 0}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Frown className="h-5 w-5 text-red-500" />
                      <span>Negative</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{sentimentDistribution.distribution.shega?.negative || 0}</span>
                      <Badge variant="outline" className="text-red-600">
                        {sentimentDistribution.distribution.shega?.negative_pct?.toFixed(1) || 0}%
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Avg Positive Polarity: {sentimentDistribution.avg_polarity_by_label?.shega?.positive?.toFixed(3) || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-green-500">Addis Insight</Badge>
                  Sentiment Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smile className="h-5 w-5 text-green-500" />
                      <span>Positive</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{sentimentDistribution.distribution.addis_insight?.positive || 0}</span>
                      <Badge variant="outline" className="text-green-600">
                        {sentimentDistribution.distribution.addis_insight?.positive_pct?.toFixed(1) || 0}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Meh className="h-5 w-5 text-gray-500" />
                      <span>Neutral</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{sentimentDistribution.distribution.addis_insight?.neutral || 0}</span>
                      <Badge variant="outline" className="text-gray-600">
                        {sentimentDistribution.distribution.addis_insight?.neutral_pct?.toFixed(1) || 0}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Frown className="h-5 w-5 text-red-500" />
                      <span>Negative</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{sentimentDistribution.distribution.addis_insight?.negative || 0}</span>
                      <Badge variant="outline" className="text-red-600">
                        {sentimentDistribution.distribution.addis_insight?.negative_pct?.toFixed(1) || 0}%
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Avg Positive Polarity: {sentimentDistribution.avg_polarity_by_label?.addis_insight?.positive?.toFixed(3) || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
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
            Analyze sentiment distribution and trends across articles
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

function SentimentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-10 w-96" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
