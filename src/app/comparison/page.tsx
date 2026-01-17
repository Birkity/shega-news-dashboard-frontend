import { Suspense } from 'react';
import { competitiveAnalysisAPI, contentAnalyticsAPI, publishingAnalyticsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { DonutChart } from '@/components/charts/donut-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scale, FileText, Tags, 
  TrendingUp, TrendingDown, Minus, 
  Target, Lightbulb, Calendar, Layers, BarChart3
} from 'lucide-react';

export const dynamic = 'force-dynamic';

// Helper function for trend difference indicator
function getTrendIndicator(diff: number) {
  if (diff > 0) {
    return <TrendingUp className="h-5 w-5 text-blue-500 mx-auto" />;
  }
  if (diff < 0) {
    return <TrendingDown className="h-5 w-5 text-red-500 mx-auto" />;
  }
  return <Minus className="h-5 w-5 text-gray-500 mx-auto" />;
}

async function ComparisonContent() {
  let competitiveSummary, contentLength, topicOverlap, yearlyComparison;
  
  try {
    [competitiveSummary, contentLength, topicOverlap, yearlyComparison] = await Promise.all([
      competitiveAnalysisAPI.getCompetitiveSummary(),
      contentAnalyticsAPI.getLengthComparison(),
      competitiveAnalysisAPI.getTopicOverlap(),
      publishingAnalyticsAPI.getYearlyComparison(),
    ]);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load comparison data. Please check if the API is running.</p>
      </div>
    );
  }

  // Extract overview data
  const shegaOverview = competitiveSummary?.overview?.shega;
  const addisOverview = competitiveSummary?.overview?.addis_insight;
  const metrics = competitiveSummary?.competitive_metrics;
  const contentGaps = competitiveSummary?.content_gaps;
  const keyInsights = competitiveSummary?.key_insights || [];

  // Content length data
  const shegaLength = contentLength?.sites?.shega;
  const addisLength = contentLength?.sites?.addis_insight;

  // Calculate differences
  const shegaArticles = shegaOverview?.total_articles || 0;
  const addisArticles = addisOverview?.total_articles || 0;
  const articleDiff = shegaArticles - addisArticles;
  const articleDiffPercent = addisArticles > 0 ? ((articleDiff / addisArticles) * 100).toFixed(1) : '0';

  const avgLengthDiff = (shegaLength?.avg_body_words || 0) - (addisLength?.avg_body_words || 0);

  // Prepare topic overlap data for chart
  const sharedTopicsData = (topicOverlap?.shared_topics || []).slice(0, 10).map((topic: { topic: string; shega_count: number; addis_count: number }) => ({
    topic: topic.topic.length > 15 ? `${topic.topic.slice(0, 15)}...` : topic.topic,
    shega: topic.shega_count,
    addis: topic.addis_count,
  }));

  // Prepare unique topics for donut charts
  const shegaUniqueTopics = (topicOverlap?.shega_unique_topics || []).slice(0, 8).map((t: { topic: string; count: number }) => ({
    name: t.topic,
    value: t.count,
  }));

  const addisUniqueTopics = (topicOverlap?.addis_unique_topics || []).slice(0, 8).map((t: { topic: string; count: number }) => ({
    name: t.topic,
    value: t.count,
  }));

  // Yearly timeline data
  const yearlyData = yearlyComparison?.yearly_data || [];
  const yearlyChartData = yearlyData.map((year) => ({
    year: year.year.toString(),
    shega: year.shega.articles,
    addis: year.addis_insight.articles,
  }));

  return (
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <TabsList className="mb-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <Scale className="h-4 w-4" />
          <span>Overview</span>
        </TabsTrigger>
        <TabsTrigger value="publishing" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Publishing</span>
        </TabsTrigger>
        <TabsTrigger value="content" className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          <span>Content</span>
        </TabsTrigger>
        <TabsTrigger value="topics" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          <span>Topics</span>
        </TabsTrigger>
      </TabsList>

      {/* OVERVIEW TAB */}
      <TabsContent value="overview" className="space-y-6">
        {/* Quick Comparison Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{shegaArticles.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Shega</p>
                </div>
                <div className="text-center px-4">
                  {getTrendIndicator(articleDiff)}
                  <p className="text-xs font-medium">{articleDiff > 0 ? '+' : ''}{articleDiffPercent}%</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{addisArticles.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Addis Insight</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Word Count</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {(shegaLength?.avg_body_words || 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Shega</p>
                </div>
                <div className="text-center px-4">
                  {getTrendIndicator(avgLengthDiff)}
                  <p className="text-xs font-medium">{avgLengthDiff > 0 ? '+' : ''}{avgLengthDiff.toFixed(0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {(addisLength?.avg_body_words || 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Addis Insight</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unique Authors</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{shegaOverview?.unique_authors || 0}</p>
                  <p className="text-xs text-muted-foreground">Shega</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{addisOverview?.unique_authors || 0}</p>
                  <p className="text-xs text-muted-foreground">Addis Insight</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Shared Topics</CardTitle>
              <Tags className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-2xl font-bold">{topicOverlap?.summary?.shared_count || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {topicOverlap?.summary?.overlap_percentage?.toFixed(1) || 0}% overlap
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {keyInsights.length > 0 ? (
                keyInsights.map((insight, i) => (
                  <div key={`insight-${insight.slice(0, 30)}-${i}`} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No insights available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Gaps */}
        {contentGaps && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-blue-500">Shega</Badge>
                  Content Strengths
                </CardTitle>
                <CardDescription>Topics where Shega leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contentGaps.top_shega_gaps?.slice(0, 5).map((gap) => (
                    <div key={gap.topic} className="flex justify-between items-center">
                      <span className="text-sm">{gap.topic}</span>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline" className="text-blue-600">{gap.shega_count}</Badge>
                        <span className="text-muted-foreground">vs</span>
                        <Badge variant="outline" className="text-green-600">{gap.addis_count}</Badge>
                      </div>
                    </div>
                  )) || <p className="text-muted-foreground text-sm">No data</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-green-500">Addis Insight</Badge>
                  Content Strengths
                </CardTitle>
                <CardDescription>Topics where Addis Insight leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contentGaps.top_addis_gaps?.slice(0, 5).map((gap) => (
                    <div key={gap.topic} className="flex justify-between items-center">
                      <span className="text-sm">{gap.topic}</span>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline" className="text-blue-600">{gap.shega_count}</Badge>
                        <span className="text-muted-foreground">vs</span>
                        <Badge variant="outline" className="text-green-600">{gap.addis_count}</Badge>
                      </div>
                    </div>
                  )) || <p className="text-muted-foreground text-sm">No data</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>

      {/* PUBLISHING TAB */}
      <TabsContent value="publishing" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Yearly Publishing Volume</CardTitle>
            <CardDescription>Historical article count comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={yearlyChartData}
              bars={[
                { dataKey: 'shega', color: '#2563eb', name: 'Shega' },
                { dataKey: 'addis', color: '#16a34a', name: 'Addis Insight' },
              ]}
              xAxisKey="year"
              height={400}
            />
          </CardContent>
        </Card>

        {/* Yearly Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-blue-500">Shega</Badge>
                Growth Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {yearlyData.slice(-5).reverse().map((year) => (
                  <div key={year.year} className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">{year.year}</span>
                    <div className="flex gap-4 items-center">
                      <span className="text-sm">{year.shega.articles} articles</span>
                      {year.shega.yoy_growth_pct !== undefined && (
                        <Badge 
                          variant="outline"
                          className={year.shega.yoy_growth_pct >= 0 ? 'text-green-600' : 'text-red-600'}
                        >
                          {year.shega.yoy_growth_pct >= 0 ? '+' : ''}{year.shega.yoy_growth_pct.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-green-500">Addis Insight</Badge>
                Growth Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {yearlyData.slice(-5).reverse().map((year) => (
                  <div key={year.year} className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">{year.year}</span>
                    <div className="flex gap-4 items-center">
                      <span className="text-sm">{year.addis_insight.articles} articles</span>
                      {year.addis_insight.yoy_growth_pct !== undefined && (
                        <Badge 
                          variant="outline"
                          className={year.addis_insight.yoy_growth_pct >= 0 ? 'text-green-600' : 'text-red-600'}
                        >
                          {year.addis_insight.yoy_growth_pct >= 0 ? '+' : ''}{year.addis_insight.yoy_growth_pct.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* CONTENT TAB */}
      <TabsContent value="content" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Content Length Distribution</CardTitle>
              <CardDescription>Word count statistics by site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-blue-600">Shega</span>
                    <span>{shegaLength?.count || 0} articles</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 bg-muted rounded text-center">
                      <p className="text-xs text-muted-foreground">Min</p>
                      <p className="font-medium">{shegaLength?.min_body_words || 0}</p>
                    </div>
                    <div className="p-2 bg-muted rounded text-center">
                      <p className="text-xs text-muted-foreground">Avg</p>
                      <p className="font-medium">{shegaLength?.avg_body_words?.toFixed(0) || 0}</p>
                    </div>
                    <div className="p-2 bg-muted rounded text-center">
                      <p className="text-xs text-muted-foreground">Max</p>
                      <p className="font-medium">{shegaLength?.max_body_words || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-green-600">Addis Insight</span>
                    <span>{addisLength?.count || 0} articles</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 bg-muted rounded text-center">
                      <p className="text-xs text-muted-foreground">Min</p>
                      <p className="font-medium">{addisLength?.min_body_words || 0}</p>
                    </div>
                    <div className="p-2 bg-muted rounded text-center">
                      <p className="text-xs text-muted-foreground">Avg</p>
                      <p className="font-medium">{addisLength?.avg_body_words?.toFixed(0) || 0}</p>
                    </div>
                    <div className="p-2 bg-muted rounded text-center">
                      <p className="text-xs text-muted-foreground">Max</p>
                      <p className="font-medium">{addisLength?.max_body_words || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Competitive Metrics</CardTitle>
              <CardDescription>Who leads in which areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Volume Leader</span>
                  <Badge className={metrics?.volume_leader === 'shega' ? 'bg-blue-500' : 'bg-green-500'}>
                    {metrics?.volume_leader === 'shega' ? 'Shega' : 'Addis Insight'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Volume Difference</span>
                  <span className="font-medium">{metrics?.volume_difference?.toLocaleString() || 0} articles</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Content Depth Leader</span>
                  <Badge className={metrics?.depth_leader === 'shega' ? 'bg-blue-500' : 'bg-green-500'}>
                    {metrics?.depth_leader === 'shega' ? 'Shega' : 'Addis Insight'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Word Count Diff</span>
                  <span className="font-medium">{metrics?.depth_difference?.toFixed(0) || 0} words</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Author Leader</span>
                  <Badge className={metrics?.author_leader === 'shega' ? 'bg-blue-500' : 'bg-green-500'}>
                    {metrics?.author_leader === 'shega' ? 'Shega' : 'Addis Insight'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* TOPICS TAB */}
      <TabsContent value="topics" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Shared Topic Coverage</CardTitle>
            <CardDescription>Topics covered by both sites</CardDescription>
          </CardHeader>
          <CardContent>
            {sharedTopicsData.length > 0 ? (
              <BarChartComponent
                data={sharedTopicsData}
                bars={[
                  { dataKey: 'shega', color: '#2563eb', name: 'Shega' },
                  { dataKey: 'addis', color: '#16a34a', name: 'Addis Insight' },
                ]}
                xAxisKey="topic"
                height={400}
              />
            ) : (
              <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                No shared topics data available
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-blue-500">Shega</Badge>
                Unique Topics
              </CardTitle>
              <CardDescription>Topics exclusive to Shega ({topicOverlap?.summary?.shega_unique_count || 0} topics)</CardDescription>
            </CardHeader>
            <CardContent>
              {shegaUniqueTopics.length > 0 ? (
                <DonutChart data={shegaUniqueTopics} height={300} />
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No unique topics
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-green-500">Addis Insight</Badge>
                Unique Topics
              </CardTitle>
              <CardDescription>Topics exclusive to Addis Insight ({topicOverlap?.summary?.addis_unique_count || 0} topics)</CardDescription>
            </CardHeader>
            <CardContent>
              {addisUniqueTopics.length > 0 ? (
                <DonutChart data={addisUniqueTopics} height={300} />
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No unique topics
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default function ComparisonPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Comparison</h1>
        <p className="text-muted-foreground mt-1">
          Compare Shega and Addis Insight across key metrics
        </p>
      </div>

      <Suspense fallback={<ComparisonSkeleton />}>
        <ComparisonContent />
      </Suspense>
    </div>
  );
}

function ComparisonSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-96" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
