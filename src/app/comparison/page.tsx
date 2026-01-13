import { Suspense } from 'react';
import { comparisonAPI, dashboardAPI, publishingAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { AreaLineChart } from '@/components/charts/line-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scale, FileText, Tags, User,
  TrendingUp, TrendingDown, Minus, BarChart3,
  Swords, Trophy, Target, AlertTriangle, Lightbulb, Copy, Hash,
  Calendar, Layers, GitCompare
} from 'lucide-react';
import type * as API from '@/types/api';

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

// Helper function for insight category icons
function getInsightIcon(category?: string) {
  if (!category) return <Lightbulb className="h-4 w-4" />;
  
  const lowerCategory = category.toLowerCase();
  switch (lowerCategory) {
    case 'volume':
    case 'articles': return <FileText className="h-4 w-4" />;
    case 'sentiment': return <TrendingUp className="h-4 w-4" />;
    case 'keyword':
    case 'keywords': return <Hash className="h-4 w-4" />;
    case 'topic':
    case 'topics': return <Target className="h-4 w-4" />;
    default: return <Lightbulb className="h-4 w-4" />;
  }
}

async function ComparisonContent() {
  let keywordComparison, entityComparison, contentLengthComparison, dashboardSummary, insights, coverageGaps, publishingTrends, duplication, yearlyAnalysis;
  
  try {
    [keywordComparison, entityComparison, contentLengthComparison, dashboardSummary, insights, coverageGaps, publishingTrends, duplication, yearlyAnalysis] = await Promise.all([
      comparisonAPI.getKeywords(15),
      comparisonAPI.getEntities({ limit: 15 }),
      comparisonAPI.getContentLength(),
      dashboardAPI.getSummary(),
      comparisonAPI.getInsights(),
      comparisonAPI.getCoverageGaps(20),
      comparisonAPI.getPublishingTrends(6),
      comparisonAPI.getDuplication(0.8),
      publishingAPI.getYearly(),
    ]);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load comparison data. Please check if the API is running.</p>
      </div>
    );
  }

  // Prepare publishing trends chart data
  const publishingChartData = publishingTrends?.data?.map((item: API.ComparePublishingTrendsItem) => ({
    month: item.month,
    'Shega Media': item.shega,
    'Addis Insight': item.addis_insight,
  })) ?? [];

  // Transform shared keyword comparison data for chart
  const keywordData = (keywordComparison?.shared ?? []).slice(0, 15).map((kw) => ({
    keyword: kw.keyword.length > 15 ? `${kw.keyword.slice(0, 15)}...` : kw.keyword,
    'Shega Media': kw.shega_count,
    'Addis Insight': kw.addis_count,
  }));

  // Entity comparison - shared entities for chart
  const sharedEntityData = (entityComparison?.shared ?? []).slice(0, 10).map(e => ({
    entity: e.entity.length > 12 ? `${e.entity.slice(0, 12)}...` : e.entity,
    'Shega Media': e.shega_count,
    'Addis Insight': e.addis_count,
  }));

  // Calculate differences
  const shegaArticles = dashboardSummary?.shega?.total_articles ?? 0;
  const addisArticles = dashboardSummary?.addis_insight?.total_articles ?? 0;
  const articleDiff = shegaArticles - addisArticles;
  const articleDiffPercent = addisArticles > 0 ? ((articleDiff / addisArticles) * 100).toFixed(1) : 0;

  const avgLengthDiff = (contentLengthComparison?.shega?.avg_body_words ?? 0) - (contentLengthComparison?.addis_insight?.avg_body_words ?? 0);

  // Yearly timeline data
  const yearlyTimelineData = yearlyAnalysis?.years?.map((item) => ({
    year: item.year.toString(),
    'Shega Media': item.shega.articles,
    'Addis Insight': item.addis_insight.articles,
  })) || [];

  return (
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <TabsList className="mb-4 grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <Scale className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="publishing" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Publishing</span>
        </TabsTrigger>
        <TabsTrigger value="content" className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline">Content</span>
        </TabsTrigger>
        <TabsTrigger value="keywords" className="flex items-center gap-2">
          <Tags className="h-4 w-4" />
          <span className="hidden sm:inline">Keywords</span>
        </TabsTrigger>
        <TabsTrigger value="topics" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          <span className="hidden sm:inline">Topics</span>
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
                  <p className="text-xs text-muted-foreground">Shega Media</p>
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
              <CardTitle className="text-sm font-medium">Avg. Word Count</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {(contentLengthComparison?.shega?.avg_body_words ?? 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Shega Media</p>
                </div>
                <div className="text-center px-4">
                  {getTrendIndicator(avgLengthDiff)}
                  <p className="text-xs font-medium">{avgLengthDiff > 0 ? '+' : ''}{avgLengthDiff.toFixed(0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {(contentLengthComparison?.addis_insight?.avg_body_words ?? 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Addis Insight</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Shared Keywords</CardTitle>
              <Tags className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-2xl font-bold">{keywordComparison?.shared?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Common keywords across sites</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Duplicate Articles</CardTitle>
              <Copy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-2xl font-bold">{duplication?.duplicates?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">High similarity pairs (80%+)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competitive Insights Section */}
        {insights?.insights && insights.insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Competitive Insights
              </CardTitle>
              <CardDescription>
                Key findings from content analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-6 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-2xl font-bold text-blue-600">
                    {insights?.summary?.shega_wins ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Shega Media Wins</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p className="text-2xl font-bold text-green-600">
                    {insights?.summary?.addis_wins ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Addis Insight Wins</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20">
                  <p className="text-2xl font-bold text-gray-600">
                    {insights?.summary?.ties ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Ties</p>
                </div>
              </div>
              <div className="space-y-4">
                {(insights?.insights ?? []).slice(0, 5).map((insight: API.CompetitiveInsight, index: number) => (
                  <div key={`insight-${insight.category}-${index}`} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        {getInsightIcon(insight.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{insight.category}</span>
                          {insight.winner && insight.winner !== 'tie' && (
                            <Badge variant={insight.winner === 'shega' ? 'default' : 'secondary'}>
                              {insight.winner === 'shega' ? 'Shega Leads' : 'Addis Leads'}
                            </Badge>
                          )}
                          {insight.winner === 'tie' && (
                            <Badge variant="outline">Tie</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.insight}</p>
                        {insight.metric && (
                          <div className="flex items-center gap-2 mt-2 text-sm">
                            <span className="text-blue-600">Shega: {insight.shega_value}</span>
                            <span className="text-muted-foreground">vs</span>
                            <span className="text-green-600">Addis: {insight.addis_value}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Entity Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Shared Entity Coverage
            </CardTitle>
            <CardDescription>Entities mentioned by both sources</CardDescription>
          </CardHeader>
          <CardContent>
            {sharedEntityData.length > 0 ? (
              <BarChartComponent
                data={sharedEntityData}
                bars={[
                  { dataKey: 'Shega Media', color: '#2563eb', name: 'Shega Media' },
                  { dataKey: 'Addis Insight', color: '#16a34a', name: 'Addis Insight' },
                ]}
                xAxisKey="entity"
                height={400}
                layout="vertical"
              />
            ) : (
              <p className="text-center text-muted-foreground py-8">No shared entity data available</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* PUBLISHING TAB */}
      <TabsContent value="publishing" className="space-y-6">
        {/* Publishing Trends */}
        {publishingChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Publishing Trends (Last 6 Months)
              </CardTitle>
              <CardDescription>
                Monthly article publishing comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AreaLineChart
                data={publishingChartData}
                xAxisKey="month"
                lines={[
                  { dataKey: 'Shega Media', color: '#2563eb', name: 'Shega Media' },
                  { dataKey: 'Addis Insight', color: '#16a34a', name: 'Addis Insight' },
                ]}
                height={350}
              />
            </CardContent>
          </Card>
        )}

        {/* Yearly Timeline */}
        {yearlyTimelineData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Year-over-Year Publishing
              </CardTitle>
              <CardDescription>
                Historical article publishing trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AreaLineChart
                data={yearlyTimelineData}
                xAxisKey="year"
                lines={[
                  { dataKey: 'Shega Media', color: '#2563eb', name: 'Shega Media' },
                  { dataKey: 'Addis Insight', color: '#16a34a', name: 'Addis Insight' },
                ]}
                height={350}
              />
            </CardContent>
          </Card>
        )}

        {/* Publishing Volume Summary */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <BarChart3 className="h-5 w-5" />
                Shega Media Publishing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Articles</span>
                  <span className="font-bold">{shegaArticles.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Word Count</span>
                  <span className="font-bold">{(contentLengthComparison?.shega?.avg_body_words ?? 0).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Max Word Count</span>
                  <span className="font-bold">{(contentLengthComparison?.shega?.max_body_words ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <BarChart3 className="h-5 w-5" />
                Addis Insight Publishing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Articles</span>
                  <span className="font-bold">{addisArticles.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Word Count</span>
                  <span className="font-bold">{(contentLengthComparison?.addis_insight?.avg_body_words ?? 0).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Max Word Count</span>
                  <span className="font-bold">{(contentLengthComparison?.addis_insight?.max_body_words ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* CONTENT TAB */}
      <TabsContent value="content" className="space-y-6">
        {/* Content Length Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content Length Comparison
            </CardTitle>
            <CardDescription>Word count statistics across sites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <h4 className="font-semibold">Shega Media</h4>
                </div>
                <div className="grid gap-3">
                  <div className="flex justify-between text-sm">
                    <span>Average Words</span>
                    <span className="font-medium">{(contentLengthComparison?.shega?.avg_body_words ?? 0).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Maximum Words</span>
                    <span className="font-medium">{(contentLengthComparison?.shega?.max_body_words ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Minimum Words</span>
                    <span className="font-medium">{contentLengthComparison?.shega?.min_body_words ?? 0}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <h4 className="font-semibold">Addis Insight</h4>
                </div>
                <div className="grid gap-3">
                  <div className="flex justify-between text-sm">
                    <span>Average Words</span>
                    <span className="font-medium">{(contentLengthComparison?.addis_insight?.avg_body_words ?? 0).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Maximum Words</span>
                    <span className="font-medium">{(contentLengthComparison?.addis_insight?.max_body_words ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Minimum Words</span>
                    <span className="font-medium">{contentLengthComparison?.addis_insight?.min_body_words ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Duplication Analysis Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Content Duplication Analysis
            </CardTitle>
            <CardDescription>
              Articles with high content similarity across sites (80%+ threshold)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 mb-6 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{duplication?.duplicates?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">Duplicate Pairs Found</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-2xl font-bold">
                  {duplication?.duplicates?.length > 0
                    ? (
                        duplication.duplicates.reduce((acc: number, d: API.DuplicateArticlePair) => acc + d.similarity_score, 0) /
                        duplication.duplicates.length * 100
                      ).toFixed(1)
                    : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Similarity</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-2xl font-bold">80%</p>
                <p className="text-sm text-muted-foreground">Detection Threshold</p>
              </div>
            </div>
            {duplication?.duplicates && duplication.duplicates.length > 0 ? (
              <div className="space-y-4">
                {duplication.duplicates.slice(0, 5).map((pair: API.DuplicateArticlePair) => (
                  <div 
                    key={`dup-pair-${pair.shega_title}-${pair.addis_title}`}
                    className="p-4 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary">
                        {(pair.similarity_score * 100).toFixed(1)}% similar
                      </Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Shega Media Article</p>
                        <p className="text-sm font-medium">{pair.shega_title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Addis Insight Article</p>
                        <p className="text-sm font-medium">{pair.addis_title}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Similarity</span>
                        <span>{(pair.similarity_score * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={pair.similarity_score * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No duplicate articles found</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* KEYWORDS TAB */}
      <TabsContent value="keywords" className="space-y-6">
        {/* Shared Keyword Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Shared Keyword Comparison
            </CardTitle>
            <CardDescription>Side-by-side comparison of keyword usage between sources</CardDescription>
          </CardHeader>
          <CardContent>
            {keywordData.length > 0 ? (
              <BarChartComponent
                data={keywordData}
                bars={[
                  { dataKey: 'Shega Media', color: '#2563eb', name: 'Shega Media' },
                  { dataKey: 'Addis Insight', color: '#16a34a', name: 'Addis Insight' },
                ]}
                xAxisKey="keyword"
                height={500}
                layout="vertical"
              />
            ) : (
              <p className="text-center text-muted-foreground py-8">No shared keyword data available</p>
            )}
          </CardContent>
        </Card>

        {/* Unique Keywords Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Badge className="bg-blue-500">Shega Media</Badge>
                Unique Keywords
              </CardTitle>
              <CardDescription>Keywords only found in Shega Media content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(keywordComparison?.shega_only ?? []).slice(0, 15).map((kw) => (
                  <Badge
                    key={kw.keyword}
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {kw.keyword}
                    <span className="ml-1 opacity-60">({kw.count})</span>
                  </Badge>
                ))}
                {(keywordComparison?.shega_only?.length ?? 0) === 0 && (
                  <p className="text-sm text-muted-foreground">No unique keywords for Shega Media</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Badge className="bg-green-500">Addis Insight</Badge>
                Unique Keywords
              </CardTitle>
              <CardDescription>Keywords only found in Addis Insight content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(keywordComparison?.addis_insight_only ?? []).slice(0, 15).map((kw) => (
                  <Badge
                    key={kw.keyword}
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  >
                    {kw.keyword}
                    <span className="ml-1 opacity-60">({kw.count})</span>
                  </Badge>
                ))}
                {(keywordComparison?.addis_insight_only?.length ?? 0) === 0 && (
                  <p className="text-sm text-muted-foreground">No unique keywords for Addis Insight</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unique Entity Comparison */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Shega Media Unique Entities</CardTitle>
              <CardDescription>Entities only mentioned by Shega Media</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {entityComparison?.shega_only?.slice(0, 20).map((e) => (
                  <Badge
                    key={e.entity}
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {e.entity}
                    <span className="ml-1 opacity-60">({e.count})</span>
                  </Badge>
                ))}
                {(entityComparison?.shega_only?.length ?? 0) === 0 && (
                  <p className="text-sm text-muted-foreground">No unique entities for Shega Media</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Addis Insight Unique Entities</CardTitle>
              <CardDescription>Entities only mentioned by Addis Insight</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {entityComparison?.addis_insight_only?.slice(0, 20).map((e) => (
                  <Badge
                    key={e.entity}
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  >
                    {e.entity}
                    <span className="ml-1 opacity-60">({e.count})</span>
                  </Badge>
                ))}
                {(entityComparison?.addis_insight_only?.length ?? 0) === 0 && (
                  <p className="text-sm text-muted-foreground">No unique entities for Addis Insight</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* TOPICS TAB */}
      <TabsContent value="topics" className="space-y-6">
        {/* Coverage Gaps Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                Topics Addis Covers (Shega Doesn't)
              </CardTitle>
              <CardDescription>
                Content gaps that Shega Media might want to consider covering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {coverageGaps?.addis_insight_exclusive?.length > 0 ? (
                  coverageGaps.addis_insight_exclusive.slice(0, 10).map((topic: API.CoverageGapTopic) => (
                    <div 
                      key={`addis-gap-${topic.topic}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">{topic.topic}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{topic.count} articles</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No coverage gaps found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Trophy className="h-5 w-5" />
                Topics Shega Covers (Addis Doesn't)
              </CardTitle>
              <CardDescription>
                Shega Media's unique content advantages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {coverageGaps?.shega_exclusive?.length > 0 ? (
                  coverageGaps.shega_exclusive.slice(0, 10).map((topic: API.CoverageGapTopic) => (
                    <div 
                      key={`shega-gap-${topic.topic}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{topic.topic}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{topic.count} articles</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No exclusive topics found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Topic Coverage Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Topic Coverage Summary
            </CardTitle>
            <CardDescription>Overview of topic distribution between sites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {coverageGaps?.shega_exclusive?.length ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Shega Media Exclusive Topics</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {coverageGaps?.addis_insight_exclusive?.length ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Addis Insight Exclusive Topics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default function ComparisonPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Swords className="h-8 w-8" />
            Competitive Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Head-to-head comparison: Shega Media vs Addis Insight
          </p>
        </div>
      </div>

      <Suspense fallback={<ComparisonSkeleton />}>
        <ComparisonContent />
      </Suspense>
    </div>
  );
}

const SKELETON_CARD_IDS = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'] as const;

function ComparisonSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full max-w-2xl" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {SKELETON_CARD_IDS.map((id) => (
          <Card key={id}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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
