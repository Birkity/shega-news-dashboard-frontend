import { Suspense } from 'react';
import { sentimentAnalyticsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { AreaLineChart } from '@/components/charts/line-chart';
import { Smile, Frown, Meh, TrendingUp } from 'lucide-react';
import { SiteSelector, type SiteFilter } from '@/components/dashboard/site-selector';
import { ExpandableArticleCard } from '@/components/sentiment/expandable-article-card';
import type { Site } from '@/types/api';

export const dynamic = 'force-dynamic';

interface SearchParams {
  site?: string;
}

async function SentimentContent({ site }: { readonly site: SiteFilter }) {
  const siteParam: Site | undefined = site === 'all' ? undefined : site;
  
  let sentimentTimeline, sentimentDistribution, topPositive, topNegative;
  
  try {
    [sentimentTimeline, sentimentDistribution, topPositive, topNegative] = await Promise.all([
      sentimentAnalyticsAPI.getTimeline({ site: siteParam, months: 12 }),
      sentimentAnalyticsAPI.getDistribution({ site: siteParam }),
      sentimentAnalyticsAPI.getTopPositive({ site: siteParam, limit: 10 }),
      sentimentAnalyticsAPI.getTopNegative({ site: siteParam, limit: 10 }),
    ]);
  } catch (error) {
    console.error('Error fetching sentiment data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load sentiment data. Please check if the API is running.</p>
      </div>
    );
  }

  // Transform timeline data for line chart
  const siteKey = site === 'shega' ? 'shega' : 'addis_insight';
  const timelineData = Array.isArray(sentimentTimeline) 
    ? sentimentTimeline
        .filter((item: any) => item[siteKey] !== null)
        .map((item: any) => {
          const siteData = item[siteKey];
          const count = siteData?.count || 0;
          const positivePct = siteData?.positive_pct || 0;
          const negativePct = siteData?.negative_pct || 0;
          const neutralPct = 100 - positivePct - negativePct;
          
          return {
            month: item.month,
            positive: Math.round((count * positivePct) / 100),
            neutral: Math.round((count * neutralPct) / 100),
            negative: Math.round((count * negativePct) / 100),
          };
        })
    : [];

  // Get sentiment breakdown for the selected site
  const siteBreakdown = sentimentDistribution?.distribution?.[siteKey] || {
    positive: 0,
    neutral: 0,
    negative: 0,
    positive_pct: 0,
    neutral_pct: 0,
    negative_pct: 0,
  };

  // Transform breakdown data for bar chart
  const breakdownData = [
    { category: 'Positive', count: siteBreakdown.positive, percentage: siteBreakdown.positive_pct || 0 },
    { category: 'Neutral', count: siteBreakdown.neutral, percentage: siteBreakdown.neutral_pct || 0 },
    { category: 'Negative', count: siteBreakdown.negative, percentage: siteBreakdown.negative_pct || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Sentiment Trend Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sentiment Trend Over Time
          </CardTitle>
          <CardDescription>Monthly sentiment distribution for the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          {timelineData.length > 0 ? (
            <AreaLineChart
              data={timelineData}
              lines={[
                { dataKey: 'positive', color: '#10B981', name: 'Positive' },
                { dataKey: 'neutral', color: '#6B7280', name: 'Neutral' },
                { dataKey: 'negative', color: '#EF4444', name: 'Negative' },
              ]}
              xAxisKey="month"
              height={350}
            />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No timeline data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sentiment Breakdown for Selected Site */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Breakdown</CardTitle>
          <CardDescription>Distribution of sentiment categories for {site === 'shega' ? 'Shega Media' : 'Addis Insight'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Bar Chart Visualization */}
            <div>
              <BarChartComponent
                data={breakdownData}
                bars={[
                  { dataKey: 'count', color: '#3B82F6', name: 'Article Count' },
                ]}
                xAxisKey="category"
                height={300}
              />
            </div>

            {/* Numerical Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smile className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium">Positive</p>
                    <p className="text-sm text-muted-foreground">{siteBreakdown.positive} articles</p>
                  </div>
                </div>
                <Badge className="bg-green-500 text-lg px-3 py-1">
                  {siteBreakdown.positive_pct?.toFixed(1) || 0}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Meh className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="font-medium">Neutral</p>
                    <p className="text-sm text-muted-foreground">{siteBreakdown.neutral} articles</p>
                  </div>
                </div>
                <Badge className="bg-gray-500 text-lg px-3 py-1">
                  {siteBreakdown.neutral_pct?.toFixed(1) || 0}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Frown className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="font-medium">Negative</p>
                    <p className="text-sm text-muted-foreground">{siteBreakdown.negative} articles</p>
                  </div>
                </div>
                <Badge className="bg-red-500 text-lg px-3 py-1">
                  {siteBreakdown.negative_pct?.toFixed(1) || 0}%
                </Badge>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Total Articles: <span className="font-medium">{siteBreakdown.positive + siteBreakdown.neutral + siteBreakdown.negative}</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Positive and Negative Articles */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Positive Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-green-500" />
              Top Positive Articles
            </CardTitle>
            <CardDescription>Articles with the highest positive sentiment scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {topPositive?.[siteKey]?.map((article: any) => (
                <ExpandableArticleCard
                  key={article.url || article.title}
                  article={article}
                  siteName={site === 'shega' ? 'Shega Media' : 'Addis Insight'}
                  badgeColor="green"
                />
              ))}
              {(!topPositive?.[siteKey] || topPositive[siteKey].length === 0) && (
                <div className="text-center text-muted-foreground py-8">
                  No positive articles found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Negative Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Frown className="h-5 w-5 text-red-500" />
              Top Negative Articles
            </CardTitle>
            <CardDescription>Articles with the highest negative sentiment scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {topNegative?.[siteKey]?.map((article: any) => (
                <ExpandableArticleCard
                  key={article.url || article.title}
                  article={article}
                  siteName={site === 'shega' ? 'Shega Media' : 'Addis Insight'}
                  badgeColor="red"
                />
              ))}
              {(!topNegative?.[siteKey] || topNegative[siteKey].length === 0) && (
                <div className="text-center text-muted-foreground py-8">
                  No negative articles found
                </div>
              )}
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
  const site = (params.site as SiteFilter) || 'shega';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sentiment Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Analyze sentiment distribution and trends across articles
          </p>
        </div>
        <SiteSelector showBothOption={false} />
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
      {/* Timeline Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>

      {/* Breakdown Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[300px] w-full" />
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
