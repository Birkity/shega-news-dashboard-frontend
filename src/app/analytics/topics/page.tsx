import { Suspense } from 'react';
import { topicsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaLineChart } from '@/components/charts/line-chart';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Sparkles, Calendar, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function TopicsContent() {
  let topicEvolution, topicSpikes, topicSentiment;
  
  try {
    [topicEvolution, topicSpikes, topicSentiment] = await Promise.all([
      topicsAPI.getEvolution({ limit: 8 }),
      topicsAPI.getSpikes({ weeks: 4 }),
      topicsAPI.getSentimentDistribution({ limit: 12 }),
    ]);
  } catch (error) {
    console.error('Error fetching topics data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load topics data. Please check if the API is running.</p>
      </div>
    );
  }

  // Transform topic evolution for the chart - now based on months and top_keywords
  const evolutionData = topicEvolution.evolution.map((month) => {
    const dataPoint: Record<string, string | number> = { month: month.month };
    month.top_keywords.slice(0, 5).forEach((kw) => {
      dataPoint[kw.keyword] = kw.count;
    });
    return dataPoint;
  });

  // Get all unique keywords from evolution data
  const allKeywords = new Set<string>();
  topicEvolution.evolution.forEach((month) => {
    month.top_keywords.forEach((kw) => allKeywords.add(kw.keyword));
  });

  const topicColors = ['#2563eb', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#eab308', '#f43f5e'];
  const evolutionLines = Array.from(allKeywords).slice(0, 8).map((keyword, i) => ({
    dataKey: keyword,
    color: topicColors[i % topicColors.length],
    name: keyword,
  }));

  // Transform sentiment data for stacked bar
  const sentimentData = topicSentiment.map((topic) => ({
    keyword: topic.keyword.length > 12 ? `${topic.keyword.slice(0, 12)}...` : topic.keyword,
    positive: topic.positive,
    neutral: topic.neutral,
    negative: topic.negative,
    total: topic.positive + topic.neutral + topic.negative,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Months Tracked</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topicEvolution.months}</div>
            <p className="text-xs text-muted-foreground">months of data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spikes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topicSpikes.length}</div>
            <p className="text-xs text-muted-foreground">detected spikes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Spike</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{topicSpikes[0]?.keyword || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Ratio: {topicSpikes[0]?.spike_ratio?.toFixed(1) || 'N/A'}x</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique Keywords</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allKeywords.size}</div>
            <p className="text-xs text-muted-foreground">keywords tracked</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="evolution" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="evolution">Topic Evolution</TabsTrigger>
          <TabsTrigger value="spikes">Topic Spikes</TabsTrigger>
          <TabsTrigger value="sentiment">Topic Sentiment</TabsTrigger>
        </TabsList>

        <TabsContent value="evolution">
          <Card>
            <CardHeader>
              <CardTitle>Topic Evolution Over Time</CardTitle>
              <CardDescription>How key topics have trended over the analysis period</CardDescription>
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

        <TabsContent value="spikes">
          <Card>
            <CardHeader>
              <CardTitle>Topic Spikes</CardTitle>
              <CardDescription>Keywords that experienced sudden increases in coverage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topicSpikes.slice(0, 15).map((spike, i) => (
                  <div
                    key={spike.keyword}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{spike.keyword}</p>
                      <p className="text-sm text-muted-foreground">
                        Recent: {spike.recent_count} • Previous: {spike.previous_count}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={spike.is_new ? 'default' : (spike.spike_ratio ?? 0) > 2 ? 'destructive' : 'secondary'}>
                        {spike.is_new ? 'New' : spike.spike_ratio ? `${spike.spike_ratio.toFixed(1)}x spike` : 'N/A'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {spike.recent_count} recent articles
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment">
          <Card>
            <CardHeader>
              <CardTitle>Topic Sentiment Distribution</CardTitle>
              <CardDescription>Sentiment breakdown across top topics</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={sentimentData}
                bars={[
                  { dataKey: 'positive', color: '#22c55e', name: 'Positive', stackId: 'stack' },
                  { dataKey: 'neutral', color: '#6b7280', name: 'Neutral', stackId: 'stack' },
                  { dataKey: 'negative', color: '#ef4444', name: 'Negative', stackId: 'stack' },
                ]}
                xAxisKey="keyword"
                height={450}
                layout="vertical"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Topic Tags */}
      <Card>
        <CardHeader>
          <CardTitle>All Tracked Topics</CardTitle>
          <CardDescription>Topics being monitored for trends and spikes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from(allKeywords).slice(0, 20).map((keyword, i) => (
              <Badge
                key={keyword}
                style={{ backgroundColor: topicColors[i % topicColors.length] }}
                className="text-white text-sm py-1.5 px-3"
              >
                {keyword}
              </Badge>
            ))}
            {topicSpikes.filter(s => !allKeywords.has(s.keyword)).slice(0, 10).map((spike) => (
              <Badge
                key={spike.keyword}
                variant="outline"
                className="text-sm py-1.5 px-3"
              >
                {spike.keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TopicsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Topics Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track topic evolution, spikes, and sentiment over time
        </p>
      </div>

      <Suspense fallback={<TopicsSkeleton />}>
        <TopicsContent />
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
