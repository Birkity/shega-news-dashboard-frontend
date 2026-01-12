import { Suspense } from 'react';
import { comparisonAPI, dashboardAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { LineChartComponent } from '@/components/charts/line-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scale, FileText, Tags, User, Building2, MapPin,
  TrendingUp, TrendingDown, Minus, BarChart3,
  Swords, Trophy, Target, AlertTriangle, Lightbulb, Copy, Hash
} from 'lucide-react';
import type * as API from '@/types/api';

export const dynamic = 'force-dynamic';

// Helper function for insight impact badge variant
function getImpactBadgeVariant(impact: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (impact) {
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'outline';
  }
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
  let keywordComparison, entityComparison, contentLengthComparison, dashboardSummary, insights, coverageGaps, publishingTrends, duplication;
  
  try {
    [keywordComparison, entityComparison, contentLengthComparison, dashboardSummary, insights, coverageGaps, publishingTrends, duplication] = await Promise.all([
      comparisonAPI.getKeywords(15),
      comparisonAPI.getEntities({ limit: 15 }),
      comparisonAPI.getContentLength(),
      dashboardAPI.getSummary(),
      comparisonAPI.getInsights(),
      comparisonAPI.getCoverageGaps(20),
      comparisonAPI.getPublishingTrends(6),
      comparisonAPI.getDuplication(0.8),
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
    date: item.date,
    Shega: item.shega_count,
    'Addis Insight': item.addis_insight_count,
  })) ?? [];

  // Transform shared keyword comparison data for chart
  const keywordData = (keywordComparison?.shared ?? []).slice(0, 15).map((kw) => ({
    keyword: kw.keyword.length > 15 ? `${kw.keyword.slice(0, 15)}...` : kw.keyword,
    Shega: kw.shega_count,
    'Addis Insight': kw.addis_count,
  }));

  // Entity comparison - shared entities for chart
  const sharedEntityData = (entityComparison?.shared ?? []).slice(0, 10).map(e => ({
    entity: e.entity.length > 12 ? `${e.entity.slice(0, 12)}...` : e.entity,
    Shega: e.shega_count,
    'Addis Insight': e.addis_count,
  }));

  // Calculate differences
  const shegaArticles = dashboardSummary?.shega?.total_articles ?? 0;
  const addisArticles = dashboardSummary?.addis_insight?.total_articles ?? 0;
  const articleDiff = shegaArticles - addisArticles;
  const articleDiffPercent = addisArticles > 0 ? ((articleDiff / addisArticles) * 100).toFixed(1) : 0;

  const avgLengthDiff = (contentLengthComparison?.shega?.avg_body_words ?? 0) - (contentLengthComparison?.addis_insight?.avg_body_words ?? 0);

  return (
    <div className="space-y-6">
      {/* Quick Comparison Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Article Count</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{shegaArticles}</p>
                <p className="text-xs text-muted-foreground">Shega</p>
              </div>
              <div className="text-center px-4">
                {getTrendIndicator(articleDiff)}
                <p className="text-xs font-medium">{articleDiff > 0 ? '+' : ''}{articleDiffPercent}%</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{addisArticles}</p>
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
                <p className="text-xs text-muted-foreground">Shega</p>
              </div>
              <div className="text-center px-4">
                {getTrendIndicator(avgLengthDiff)}
                <p className="text-xs font-medium">{avgLengthDiff > 0 ? '+' : ''}{avgLengthDiff.toFixed(0)}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {(contentLengthComparison?.addis_insight?.avg_body_words ?? 0).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Addis Insight</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Max Word Count</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {(contentLengthComparison?.shega?.max_body_words ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Shega</p>
              </div>
              <div className="text-center px-4">
                <span className="text-lg">vs</span>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {(contentLengthComparison?.addis_insight?.max_body_words ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Addis Insight</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Min Word Count</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {contentLengthComparison?.shega?.min_body_words ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Shega</p>
              </div>
              <div className="text-center px-4">
                <span className="text-lg">vs</span>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {contentLengthComparison?.addis_insight?.min_body_words ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Addis Insight</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keyword Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Keyword Comparison
          </CardTitle>
          <CardDescription>Side-by-side comparison of keyword usage between sources</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChartComponent
            data={keywordData}
            bars={[
              { dataKey: 'Shega', color: '#2563eb', name: 'Shega' },
              { dataKey: 'Addis Insight', color: '#dc2626', name: 'Addis Insight' },
            ]}
            xAxisKey="keyword"
            height={500}
            layout="vertical"
          />
        </CardContent>
      </Card>

      {/* Entity Comparison Tabs */}
      <Tabs defaultValue="shared" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="shared" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Shared Entities
          </TabsTrigger>
          <TabsTrigger value="shega-only" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Shega Only
          </TabsTrigger>
          <TabsTrigger value="addis-only" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Addis Only
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shared">
          <Card>
            <CardHeader>
              <CardTitle>Shared Entities ({entityComparison.entity_type})</CardTitle>
              <CardDescription>Entities mentioned by both sources</CardDescription>
            </CardHeader>
            <CardContent>
              {sharedEntityData.length > 0 ? (
                <BarChartComponent
                  data={sharedEntityData}
                  bars={[
                    { dataKey: 'Shega', color: '#2563eb', name: 'Shega' },
                    { dataKey: 'Addis Insight', color: '#dc2626', name: 'Addis Insight' },
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

        <TabsContent value="shega-only">
          <Card>
            <CardHeader>
              <CardTitle>Shega Unique Entities</CardTitle>
              <CardDescription>Entities only mentioned by Shega</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {entityComparison.shega_only.slice(0, 20).map((e) => (
                  <Badge
                    key={e.entity}
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {e.entity}
                    <span className="ml-1 opacity-60">({e.count})</span>
                  </Badge>
                ))}
                {entityComparison.shega_only.length === 0 && (
                  <p className="text-sm text-muted-foreground">No unique entities for Shega</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addis-only">
          <Card>
            <CardHeader>
              <CardTitle>Addis Insight Unique Entities</CardTitle>
              <CardDescription>Entities only mentioned by Addis Insight</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {entityComparison.addis_insight_only.slice(0, 20).map((e) => (
                  <Badge
                    key={e.entity}
                    variant="secondary"
                    className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  >
                    {e.entity}
                    <span className="ml-1 opacity-60">({e.count})</span>
                  </Badge>
                ))}
                {entityComparison.addis_insight_only.length === 0 && (
                  <p className="text-sm text-muted-foreground">No unique entities for Addis Insight</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unique Keywords Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Badge className="bg-blue-500">Shega</Badge>
              Unique Keywords
            </CardTitle>
            <CardDescription>Keywords only found in Shega content</CardDescription>
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
                <p className="text-sm text-muted-foreground">No unique keywords for Shega</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Badge className="bg-red-500">Addis Insight</Badge>
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
                  className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
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

      {/* Publishing Trends Comparison */}
      {publishingChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Publishing Trends Comparison
            </CardTitle>
            <CardDescription>
              Daily article publishing comparison over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartComponent
              data={publishingChartData}
              xAxisKey="date"
              lines={[
                { dataKey: 'Shega', color: '#2563eb', name: 'Shega' },
                { dataKey: 'Addis Insight', color: '#dc2626', name: 'Addis Insight' },
              ]}
              height={350}
            />
          </CardContent>
        </Card>
      )}

      {/* Competitive Insights Section */}
      {insights?.insights && insights.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Competitive Insights
            </CardTitle>
            <CardDescription>
              AI-generated insights from content analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 mb-6 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-2xl font-bold text-blue-600">
                  {insights?.summary?.shega_wins ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Shega Wins</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-2xl font-bold text-green-600">
                  {insights?.summary?.addis_wins ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Addis Wins</p>
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

      {/* Coverage Gaps Section */}
      {(coverageGaps?.shega_exclusive?.length > 0 || coverageGaps?.addis_insight_exclusive?.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                Topics Addis Covers (Shega Doesn't)
              </CardTitle>
              <CardDescription>
                Content gaps that Shega might want to consider covering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {coverageGaps.addis_insight_exclusive?.length > 0 ? (
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
                        <Badge variant="secondary">{topic.article_count} articles</Badge>
                        {topic.trend === 'rising' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {topic.trend === 'falling' && <TrendingDown className="h-4 w-4 text-red-500" />}
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
                Shega's unique content advantages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {coverageGaps.shega_exclusive?.length > 0 ? (
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
                        <Badge variant="secondary">{topic.article_count} articles</Badge>
                        {topic.trend === 'rising' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {topic.trend === 'falling' && <TrendingDown className="h-4 w-4 text-red-500" />}
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
      )}

      {/* Duplication Analysis Section */}
      {duplication?.duplicate_pairs && duplication.duplicate_pairs.length > 0 && (
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
                <p className="text-2xl font-bold">{duplication.duplicate_pairs.length}</p>
                <p className="text-sm text-muted-foreground">Duplicate Pairs Found</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-2xl font-bold">
                  {duplication.duplicate_pairs.length > 0
                    ? (
                        duplication.duplicate_pairs.reduce((acc: number, d: API.DuplicatePair) => acc + d.similarity_score, 0) /
                        duplication.duplicate_pairs.length * 100
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
            <div className="space-y-4">
              {duplication.duplicate_pairs.slice(0, 5).map((pair: API.DuplicatePair) => (
                <div 
                  key={`dup-pair-${pair.shega_title}-${pair.addis_insight_title}`}
                  className="p-4 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary">
                      {(pair.similarity_score * 100).toFixed(1)}% similar
                    </Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Shega Article</p>
                      <p className="text-sm font-medium">{pair.shega_title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Addis Insight Article</p>
                      <p className="text-sm font-medium">{pair.addis_insight_title}</p>
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
          </CardContent>
        </Card>
      )}
    </div>
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
            Head-to-head comparison: Shega vs Addis Insight
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
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
