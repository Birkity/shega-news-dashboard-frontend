import { Suspense } from 'react';
import { categoriesAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { DonutChart } from '@/components/charts/donut-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderOpen, BarChart3, PieChart } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function CategoriesContent() {
  let categoryDistribution, shegaCategories, addisCategories;
  
  try {
    [categoryDistribution, shegaCategories, addisCategories] = await Promise.all([
      categoriesAPI.getDistribution(),
      categoriesAPI.getDistribution('shega'),
      categoriesAPI.getDistribution('addis_insight'),
    ]);
  } catch (error) {
    console.error('Error fetching categories data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load categories data. Please check if the API is running.</p>
      </div>
    );
  }

  const barData = categoryDistribution.slice(0, 15).map((cat) => ({
    category: cat.category.length > 20 ? `${cat.category.slice(0, 20)}...` : cat.category,
    count: cat.total,
  }));

  const donutData = categoryDistribution.slice(0, 10).map((cat) => ({
    name: cat.category,
    value: cat.total,
  }));

  const shegaData = shegaCategories.slice(0, 10).map((cat) => ({
    name: cat.category,
    value: cat.shega_count,
  }));

  const addisData = addisCategories.slice(0, 10).map((cat) => ({
    name: cat.category,
    value: cat.addis_insight_count,
  }));

  const totalArticles = categoryDistribution.reduce((sum, cat) => sum + cat.total, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryDistribution.length}</div>
            <p className="text-xs text-muted-foreground">unique categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{categoryDistribution[0]?.category || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{categoryDistribution[0]?.total || 0} articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArticles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">across all categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
          <CardDescription>Number of articles per category</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChartComponent
            data={barData}
            bars={[{ dataKey: 'count', color: '#2563eb', name: 'Articles' }]}
            xAxisKey="category"
            height={500}
            layout="vertical"
          />
        </CardContent>
      </Card>

      {/* Site Comparison */}
      <Tabs defaultValue="combined" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="combined">Combined View</TabsTrigger>
          <TabsTrigger value="shega">Shega</TabsTrigger>
          <TabsTrigger value="addis">Addis Insight</TabsTrigger>
        </TabsList>

        <TabsContent value="combined">
          <Card>
            <CardHeader>
              <CardTitle>Overall Category Split</CardTitle>
              <CardDescription>Distribution across all sources</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <DonutChart
                data={donutData}
                colors={['#2563eb', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#eab308', '#6366f1', '#14b8a6', '#f43f5e']}
                innerRadius={60}
                outerRadius={120}
                centerLabel="Articles"
                centerValue={totalArticles}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shega">
          <Card>
            <CardHeader>
              <CardTitle>Shega Categories</CardTitle>
              <CardDescription>Category distribution for Shega News</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <DonutChart
                data={shegaData}
                colors={['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1d4ed8', '#1e40af', '#1e3a8a', '#3730a3', '#4338ca']}
                innerRadius={60}
                outerRadius={120}
                centerLabel="Articles"
                centerValue={shegaCategories.reduce((s, c) => s + c.shega_count, 0)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addis">
          <Card>
            <CardHeader>
              <CardTitle>Addis Insight Categories</CardTitle>
              <CardDescription>Category distribution for Addis Insight</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <DonutChart
                data={addisData}
                colors={['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#b91c1c', '#991b1b', '#7f1d1d', '#f97316', '#fb923c']}
                innerRadius={60}
                outerRadius={120}
                centerLabel="Articles"
                centerValue={addisCategories.reduce((s, c) => s + c.addis_insight_count, 0)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* All Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>Complete list of categories with article counts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categoryDistribution.map((cat) => (
              <Badge
                key={cat.category}
                variant="outline"
                className="text-sm py-1.5 px-3"
              >
                {cat.category}
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold">
                  {cat.total}
                </span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Analysis of article categories and content distribution
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
