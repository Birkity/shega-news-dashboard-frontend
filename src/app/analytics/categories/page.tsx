import { Suspense } from 'react';
import { topicsAnalyticsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { DonutChart } from '@/components/charts/donut-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderOpen, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function CategoriesContent() {
  let topicLabels, topicLabelsBySite;
  
  try {
    [topicLabels, topicLabelsBySite] = await Promise.all([
      topicsAnalyticsAPI.getLabels({ limit: 30 }),
      topicsAnalyticsAPI.getLabelsBySite({ limit: 15 }),
    ]);
  } catch (error) {
    console.error('Error fetching categories data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load category data. Please check if the API is running.</p>
      </div>
    );
  }

  // Transform topic labels for visualization - separate by site
  const shegaBarData = topicLabelsBySite.by_site?.shega?.labels?.slice(0, 15).map((label) => ({
    category: label.topic_label.length > 20 ? `${label.topic_label.slice(0, 20)}...` : label.topic_label,
    count: label.count,
  })) || [];

  const addisBarData = topicLabelsBySite.by_site?.addis_insight?.labels?.slice(0, 15).map((label) => ({
    category: label.topic_label.length > 20 ? `${label.topic_label.slice(0, 20)}...` : label.topic_label,
    count: label.count,
  })) || [];

  const shegaData = topicLabelsBySite.by_site?.shega?.labels?.slice(0, 10).map((label) => ({
    name: label.topic_label,
    value: label.count,
  })) || [];

  const addisData = topicLabelsBySite.by_site?.addis_insight?.labels?.slice(0, 10).map((label) => ({
    name: label.topic_label,
    value: label.count,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topicLabels.labels.length}</div>
            <p className="text-xs text-muted-foreground">unique topic labels</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{topicLabels.labels[0]?.topic_label || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{topicLabels.labels[0]?.article_count || 0} articles</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distribution" className="w-full">
        <TabsList>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="comparison">Site Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-blue-500">Shega</Badge>
                  Category Distribution
                </CardTitle>
                <CardDescription>Articles per category - Shega Media</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={shegaBarData}
                  bars={[{ dataKey: 'count', color: '#2563eb', name: 'Articles' }]}
                  xAxisKey="category"
                  height={400}
                  layout="vertical"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-green-500">Addis Insight</Badge>
                  Category Distribution
                </CardTitle>
                <CardDescription>Articles per category - Addis Insight</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={addisBarData}
                  bars={[{ dataKey: 'count', color: '#22c55e', name: 'Articles' }]}
                  xAxisKey="category"
                  height={400}
                  layout="vertical"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-blue-500">Shega</Badge>
                  Top Categories
                </CardTitle>
                <CardDescription>
                  {topicLabelsBySite.by_site?.shega?.total_labeled || 0} labeled articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shegaData.length > 0 ? (
                  <DonutChart data={shegaData} height={350} />
                ) : (
                  <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-green-500">Addis Insight</Badge>
                  Top Categories
                </CardTitle>
                <CardDescription>
                  {topicLabelsBySite.by_site?.addis_insight?.total_labeled || 0} labeled articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {addisData.length > 0 ? (
                  <DonutChart data={addisData} height={350} />
                ) : (
                  <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Shared Topics */}
          {topicLabelsBySite.shared_labels && topicLabelsBySite.shared_labels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Shared Categories</CardTitle>
                <CardDescription>Categories covered by both sites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topicLabelsBySite.shared_labels.map((shared) => (
                    <div key={shared.topic_label} className="flex items-center justify-between border-b pb-2">
                      <span className="font-medium">{shared.topic_label}</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-blue-600">Shega: {shared.shega}</span>
                        <span className="text-green-600">Addis: {shared.addis_insight}</span>
                        <Badge variant="outline">{shared.total} total</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground mt-1">
          Explore article categories based on topic labels
        </p>
      </div>

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
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
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
