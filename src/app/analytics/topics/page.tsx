import { Suspense } from 'react';
import Link from 'next/link';
import { topicsAnalyticsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaLineChart } from '@/components/charts/line-chart';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Sparkles, Tag, Layers, ExternalLink } from 'lucide-react';
import { SiteSelector, type SiteFilter } from '@/components/dashboard/site-selector';
import type { Site } from '@/types/api';

export const dynamic = 'force-dynamic';

interface SearchParams {
  site?: string;
}

async function TopicsContent({ site }: { readonly site: SiteFilter }) {
  const siteParam: Site | undefined = site === 'all' ? undefined : site;
  
  let topicLabels, topicLabelsBySite, topicLabelsOverTime;
  
  try {
    [topicLabels, topicLabelsBySite, topicLabelsOverTime] = await Promise.all([
      topicsAnalyticsAPI.getLabels({ limit: 20, site: siteParam }),
      topicsAnalyticsAPI.getLabelsBySite({ limit: 10 }),
      topicsAnalyticsAPI.getLabelsOverTime({ months: 6, top_n: 10, site: siteParam }),
    ]);
  } catch (error) {
    console.error('Error fetching topics data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load topics data. Please check if the API is running.</p>
      </div>
    );
  }

  // Transform topic labels over time for the chart
  const evolutionData = topicLabelsOverTime.timeline.map((month: Record<string, number | string>) => ({
    ...month,
  }));

  // Get tracked topics for the chart lines
  const topicColors = ['#2563eb', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#eab308', '#f43f5e', '#14b8a6', '#a855f7'];
  const evolutionLines = topicLabelsOverTime.tracked_topics.slice(0, 10).map((topic: string, i: number) => ({
    dataKey: topic,
    color: topicColors[i % topicColors.length],
    name: topic,
  }));

  // Transform topic labels for bar chart
  const labelsBarData = topicLabels.labels.slice(0, 12).map((label: { topic_label: string; article_count: number; avg_sentiment: number }) => ({
    topic: label.topic_label.length > 15 ? `${label.topic_label.slice(0, 15)}...` : label.topic_label,
    articles: label.article_count,
    sentiment: Math.round(label.avg_sentiment * 100),
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topicLabels.total_articles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">in the database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Labeled Articles</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topicLabels.total_with_labels.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{topicLabels.coverage_percentage.toFixed(1)}% coverage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Topic</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{topicLabels.labels[0]?.topic_label || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{topicLabels.labels[0]?.article_count || 0} articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Topics Tracked</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topicLabelsOverTime.tracked_topics.length}</div>
            <p className="text-xs text-muted-foreground">unique topics</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="evolution" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="evolution">Topic Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="bysite">By Site</TabsTrigger>
        </TabsList>

        <TabsContent value="evolution">
          <Card>
            <CardHeader>
              <CardTitle>Topic Trends Over Time</CardTitle>
              <CardDescription>How topic labels have trended over the past {topicLabelsOverTime.months} months</CardDescription>
            </CardHeader>
            <CardContent>
              <AreaLineChart
                data={evolutionData}
                lines={evolutionLines}
                xAxisKey="month"
                height={400}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Topic Distribution</CardTitle>
              <CardDescription>Article count by topic label</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={labelsBarData}
                bars={[
                  { dataKey: 'articles', color: '#2563eb', name: 'Articles' },
                ]}
                xAxisKey="topic"
                height={450}
                layout="vertical"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bysite">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-blue-500">Shega</Badge>
                  Top Topics
                </CardTitle>
                <CardDescription>{topicLabelsBySite.by_site?.shega?.total_labeled || 0} labeled articles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topicLabelsBySite.by_site?.shega?.labels?.slice(0, 10).map((label: { topic_label: string; count: number }, i: number) => (
                    <Link 
                      key={label.topic_label} 
                      href={`/articles?topic_label=${encodeURIComponent(label.topic_label)}&site=shega`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate group-hover:text-primary">{label.topic_label}</p>
                      </div>
                      <Badge variant="outline">{label.count}</Badge>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  )) || <p className="text-muted-foreground">No data available</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-green-500">Addis Insight</Badge>
                  Top Topics
                </CardTitle>
                <CardDescription>{topicLabelsBySite.by_site?.addis_insight?.total_labeled || 0} labeled articles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topicLabelsBySite.by_site?.addis_insight?.labels?.slice(0, 10).map((label: { topic_label: string; count: number }, i: number) => (
                    <Link 
                      key={label.topic_label} 
                      href={`/articles?topic_label=${encodeURIComponent(label.topic_label)}&site=addis_insight`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate group-hover:text-primary">{label.topic_label}</p>
                      </div>
                      <Badge variant="outline">{label.count}</Badge>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  )) || <p className="text-muted-foreground">No data available</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Topic Tags - Clickable */}
      <Card>
        <CardHeader>
          <CardTitle>All Topic Labels</CardTitle>
          <CardDescription>Topics identified using {topicLabels.methodology} - click to view articles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {topicLabels.labels.map((label: { topic_label: string; article_count: number; percentage: number }, i: number) => (
              <Link
                key={label.topic_label}
                href={`/articles?topic_label=${encodeURIComponent(label.topic_label)}`}
              >
                <Badge
                  style={{ backgroundColor: topicColors[i % topicColors.length] }}
                  className="text-white text-sm py-1.5 px-3 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {label.topic_label} ({label.article_count})
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface TopicsPageProps {
  readonly searchParams: Promise<SearchParams>;
}

export default async function TopicsPage({ searchParams }: TopicsPageProps) {
  const params = await searchParams;
  const site = (params.site as SiteFilter) || 'all';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Topics Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track topic labels, trends, and distribution over time
          </p>
        </div>
        <SiteSelector />
      </div>

      <Suspense fallback={<TopicsSkeleton />}>
        <TopicsContent site={site} />
      </Suspense>
    </div>
  );
}

function TopicsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
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
