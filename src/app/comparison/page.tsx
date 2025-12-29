import { Suspense } from 'react';
import { comparisonAPI, dashboardAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scale, FileText, Tags, User, Building2, MapPin,
  TrendingUp, TrendingDown, Minus, BarChart3
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function ComparisonContent() {
  let keywordComparison, entityComparison, contentLengthComparison, dashboardSummary;
  
  try {
    [keywordComparison, entityComparison, contentLengthComparison, dashboardSummary] = await Promise.all([
      comparisonAPI.getKeywords(15),
      comparisonAPI.getEntities({ limit: 15 }),
      comparisonAPI.getContentLength(),
      dashboardAPI.getSummary(),
    ]);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load comparison data. Please check if the API is running.</p>
      </div>
    );
  }

  // Transform shared keyword comparison data for chart
  const keywordData = keywordComparison.shared.slice(0, 15).map((kw) => ({
    keyword: kw.keyword.length > 15 ? `${kw.keyword.slice(0, 15)}...` : kw.keyword,
    Shega: kw.shega_count,
    'Addis Insight': kw.addis_count,
  }));

  // Entity comparison - shared entities for chart
  const sharedEntityData = entityComparison.shared.slice(0, 10).map(e => ({
    entity: e.entity.length > 12 ? `${e.entity.slice(0, 12)}...` : e.entity,
    Shega: e.shega_count,
    'Addis Insight': e.addis_count,
  }));

  // Calculate differences
  const shegaArticles = dashboardSummary.shega.total_articles;
  const addisArticles = dashboardSummary.addis_insight.total_articles;
  const articleDiff = shegaArticles - addisArticles;
  const articleDiffPercent = addisArticles > 0 ? ((articleDiff / addisArticles) * 100).toFixed(1) : 0;

  const avgLengthDiff = contentLengthComparison.shega.avg_body_words - contentLengthComparison.addis_insight.avg_body_words;

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
                {articleDiff > 0 ? (
                  <TrendingUp className="h-5 w-5 text-blue-500 mx-auto" />
                ) : articleDiff < 0 ? (
                  <TrendingDown className="h-5 w-5 text-red-500 mx-auto" />
                ) : (
                  <Minus className="h-5 w-5 text-gray-500 mx-auto" />
                )}
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
                  {contentLengthComparison.shega.avg_body_words.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Shega</p>
              </div>
              <div className="text-center px-4">
                {avgLengthDiff > 0 ? (
                  <TrendingUp className="h-5 w-5 text-blue-500 mx-auto" />
                ) : avgLengthDiff < 0 ? (
                  <TrendingDown className="h-5 w-5 text-red-500 mx-auto" />
                ) : (
                  <Minus className="h-5 w-5 text-gray-500 mx-auto" />
                )}
                <p className="text-xs font-medium">{avgLengthDiff > 0 ? '+' : ''}{avgLengthDiff.toFixed(0)}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {contentLengthComparison.addis_insight.avg_body_words.toFixed(0)}
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
                  {contentLengthComparison.shega.max_body_words.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Shega</p>
              </div>
              <div className="text-center px-4">
                <span className="text-lg">vs</span>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {contentLengthComparison.addis_insight.max_body_words.toLocaleString()}
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
                  {contentLengthComparison.shega.min_body_words}
                </p>
                <p className="text-xs text-muted-foreground">Shega</p>
              </div>
              <div className="text-center px-4">
                <span className="text-lg">vs</span>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {contentLengthComparison.addis_insight.min_body_words}
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
              {keywordComparison.shega_only.slice(0, 15).map((kw) => (
                <Badge
                  key={kw.keyword}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {kw.keyword}
                  <span className="ml-1 opacity-60">({kw.count})</span>
                </Badge>
              ))}
              {keywordComparison.shega_only.length === 0 && (
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
              {keywordComparison.addis_insight_only.slice(0, 15).map((kw) => (
                <Badge
                  key={kw.keyword}
                  variant="secondary"
                  className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                >
                  {kw.keyword}
                  <span className="ml-1 opacity-60">({kw.count})</span>
                </Badge>
              ))}
              {keywordComparison.addis_insight_only.length === 0 && (
                <p className="text-sm text-muted-foreground">No unique keywords for Addis Insight</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ComparisonPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Source Comparison</h1>
        <p className="text-muted-foreground mt-1">
          Side-by-side comparison of Shega vs Addis Insight content
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
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
