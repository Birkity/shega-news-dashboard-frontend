import { Suspense } from 'react';
import { publishingAnalyticsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { AreaLineChart } from '@/components/charts/line-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Activity, FileText, TrendingUp, BarChart2 } from 'lucide-react';
import { SiteSelector, type SiteFilter } from '@/components/dashboard/site-selector';
import type { Site } from '@/types/api';

export const dynamic = 'force-dynamic';

interface SearchParams {
  site?: string;
}

interface CalendarHeatmapDay {
  date: string;
  total: number;
  shega: number;
  addis_insight: number;
}

async function PublishingContent({ site }: { readonly site: SiteFilter }) {
  const siteParam: Site | undefined = site === 'all' ? undefined : site;
  
  let calendarHeatmap, yearlyComparison;
  
  try {
    [calendarHeatmap, yearlyComparison] = await Promise.all([
      publishingAnalyticsAPI.getCalendarHeatmap({ months: 12, site: siteParam }),
      publishingAnalyticsAPI.getYearlyComparison({ site: siteParam }),
    ]);
  } catch (error) {
    console.error('Error fetching publishing data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load publishing data. Please check if the API is running.</p>
      </div>
    );
  }

  // Process calendar heatmap data
  const heatmapData = calendarHeatmap?.heatmap_data || [];
  const stats = calendarHeatmap?.statistics;

  // Calculate weekday totals from heatmap data
  const weekdayTotals: Record<string, { shega: number; addis: number }> = {
    'Monday': { shega: 0, addis: 0 },
    'Tuesday': { shega: 0, addis: 0 },
    'Wednesday': { shega: 0, addis: 0 },
    'Thursday': { shega: 0, addis: 0 },
    'Friday': { shega: 0, addis: 0 },
    'Saturday': { shega: 0, addis: 0 },
    'Sunday': { shega: 0, addis: 0 },
  };

  heatmapData.forEach((day: CalendarHeatmapDay) => {
    const date = new Date(day.date);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (weekdayTotals[weekday]) {
      weekdayTotals[weekday].shega += day.shega;
      weekdayTotals[weekday].addis += day.addis_insight;
    }
  });

  const weekdayData = Object.entries(weekdayTotals).map(([day, totals]) => ({
    day,
    shega: totals.shega,
    addis: totals.addis,
    total: totals.shega + totals.addis,
  }));

  // Calculate monthly totals from heatmap data
  const monthlyTotals: Record<string, { shega: number; addis: number }> = {};
  heatmapData.forEach((day: CalendarHeatmapDay) => {
    const monthKey = day.date.substring(0, 7); // YYYY-MM format
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { shega: 0, addis: 0 };
    }
    monthlyTotals[monthKey].shega += day.shega;
    monthlyTotals[monthKey].addis += day.addis_insight;
  });

  const monthlyData = Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, totals]) => {
      const date = new Date(month + '-01');
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        shega: totals.shega,
        addis: totals.addis,
        total: totals.shega + totals.addis,
      };
    });

  // Process yearly data
  const yearlyData = yearlyComparison?.yearly_data || [];
  const yearlyChartData = yearlyData.map((year) => ({
    year: year.year.toString(),
    shega: year.shega.articles,
    addis: year.addis_insight.articles,
    total: year.shega.articles + year.addis_insight.articles,
  }));

  // Calculate totals for KPIs
  const totalArticles = heatmapData.reduce((sum: number, day: CalendarHeatmapDay) => sum + day.total, 0);
  const shegaTotal = heatmapData.reduce((sum: number, day: CalendarHeatmapDay) => sum + day.shega, 0);
  const addisTotal = heatmapData.reduce((sum: number, day: CalendarHeatmapDay) => sum + day.addis_insight, 0);
  
  // Find peak day
  const peakDay = weekdayData.reduce((max, day) => day.total > max.total ? day : max, weekdayData[0] || { day: 'N/A', total: 0 });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArticles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 12 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Per Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avg_articles_per_day?.toFixed(1) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Articles per day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Peak Day</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peakDay.day}</div>
            <p className="text-xs text-muted-foreground">{peakDay.total} articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Max In a Day</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.max_articles_per_day || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">articles in single day</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekday" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="weekday">By Weekday</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          <TabsTrigger value="yearly">Yearly Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="weekday">
          <Card>
            <CardHeader>
              <CardTitle>Publishing by Day of Week</CardTitle>
              <CardDescription>Article distribution across weekdays</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={weekdayData}
                bars={[
                  { dataKey: 'shega', color: '#2563eb', name: 'Shega', stackId: 'stack' },
                  { dataKey: 'addis', color: '#16a34a', name: 'Addis Insight', stackId: 'stack' },
                ]}
                xAxisKey="day"
                height={400}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Publishing Trends</CardTitle>
              <CardDescription>Article volume over the past months</CardDescription>
            </CardHeader>
            <CardContent>
              <AreaLineChart
                data={monthlyData}
                lines={[
                  { dataKey: 'shega', color: '#2563eb', name: 'Shega' },
                  { dataKey: 'addis', color: '#16a34a', name: 'Addis Insight' },
                ]}
                xAxisKey="month"
                height={400}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yearly">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Yearly Article Volume</CardTitle>
                <CardDescription>Historical publishing volume by year</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={yearlyChartData}
                  bars={[
                    { dataKey: 'shega', color: '#2563eb', name: 'Shega', stackId: 'stack' },
                    { dataKey: 'addis', color: '#16a34a', name: 'Addis Insight', stackId: 'stack' },
                  ]}
                  xAxisKey="year"
                  height={400}
                />
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-500">Shega</Badge>
                    Yearly Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {yearlyData.slice(-5).reverse().map((year) => (
                      <div key={year.year} className="flex items-center justify-between border-b pb-2">
                        <span className="font-medium">{year.year}</span>
                        <div className="flex gap-4 text-sm">
                          <span>{year.shega.articles} articles</span>
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
                    Yearly Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {yearlyData.slice(-5).reverse().map((year) => (
                      <div key={year.year} className="flex items-center justify-between border-b pb-2">
                        <span className="font-medium">{year.year}</span>
                        <div className="flex gap-4 text-sm">
                          <span>{year.addis_insight.articles} articles</span>
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Site Comparison Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Site Comparison (Last 12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Shega</span>
                <span className="font-medium">{shegaTotal.toLocaleString()} articles</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${totalArticles > 0 ? (shegaTotal / totalArticles * 100) : 0}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Addis Insight</span>
                <span className="font-medium">{addisTotal.toLocaleString()} articles</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: `${totalArticles > 0 ? (addisTotal / totalArticles * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface PublishingPageProps {
  readonly searchParams: Promise<SearchParams>;
}

export default async function PublishingPage({ searchParams }: PublishingPageProps) {
  const params = await searchParams;
  const site = (params.site as SiteFilter) || 'all';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Publishing Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Analyze publishing patterns and frequency
          </p>
        </div>
        <SiteSelector />
      </div>

      <Suspense fallback={<PublishingSkeleton />}>
        <PublishingContent site={site} />
      </Suspense>
    </div>
  );
}

function PublishingSkeleton() {
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
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
