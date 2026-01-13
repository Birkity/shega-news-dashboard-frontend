import { Suspense } from 'react';
import { publishingAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { AreaLineChart } from '@/components/charts/line-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Activity, FileText, TrendingUp } from 'lucide-react';
import { SiteSelector, type SiteFilter } from '@/components/dashboard/site-selector';

export const dynamic = 'force-dynamic';

interface SearchParams {
  site?: string;
}

async function PublishingContent({ site }: { readonly site: SiteFilter }) {
  // For publishing page, we don't support 'all' - default to 'shega'
  const effectiveSite = site === 'all' ? 'shega' : site;
  
  let publishingTrends, yearlyAnalysis;
  
  try {
    [publishingTrends, yearlyAnalysis] = await Promise.all([
      publishingAPI.getTrends(),
      publishingAPI.getYearly(),
    ]);
  } catch (error) {
    console.error('Error fetching publishing data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load publishing data. Please check if the API is running.</p>
      </div>
    );
  }

  const siteName = effectiveSite === 'shega' ? 'Shega Media' : 'Addis Insight';
  const siteColor = effectiveSite === 'shega' ? '#2563eb' : '#16a34a';

  // Get site-specific data
  const getSiteValue = (item: { shega: number; addis_insight: number }) => 
    effectiveSite === 'shega' ? item.shega : item.addis_insight;

  // Transform weekday data
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekdayData = publishingTrends.by_weekday.map((item) => ({
    day: weekdays[Number.parseInt(item.value, 10)] || item.value,
    articles: getSiteValue(item),
  }));

  // Transform monthly data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = publishingTrends.by_month.map((item) => ({
    month: months[Number.parseInt(item.value, 10) - 1] || item.value,
    articles: getSiteValue(item),
  }));

  // Transform yearly timeline
  const yearlyTimelineData = yearlyAnalysis.years?.map((item) => ({
    year: item.year.toString(),
    articles: effectiveSite === 'shega' ? item.shega.articles : item.addis_insight.articles,
  })) || [];

  // Calculate totals
  const totalArticles = publishingTrends.by_weekday.reduce((sum, d) => sum + getSiteValue(d), 0);
  const avgPerDay = weekdayData.length > 0 
    ? Math.round(weekdayData.reduce((sum, d) => sum + d.articles, 0) / weekdayData.length)
    : 0;
  const peakDay = weekdayData.reduce((max, d) => d.articles > max.articles ? d : max, weekdayData[0] || { day: 'N/A', articles: 0 });
  const peakMonth = monthlyData.reduce((max, m) => m.articles > max.articles ? m : max, monthlyData[0] || { month: 'N/A', articles: 0 });

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
            <p className="text-xs text-muted-foreground">{siteName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Per Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerDay}</div>
            <p className="text-xs text-muted-foreground">Articles per weekday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Peak Day</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peakDay.day}</div>
            <p className="text-xs text-muted-foreground">{peakDay.articles} articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Peak Month</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peakMonth.month}</div>
            <p className="text-xs text-muted-foreground">{peakMonth.articles} articles</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekday" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="weekday" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            By Weekday
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            By Month
          </TabsTrigger>
          <TabsTrigger value="yearly" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Yearly Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekday">
          <Card>
            <CardHeader>
              <CardTitle>Publishing by Day of Week</CardTitle>
              <CardDescription>Article distribution across weekdays for {siteName}</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={weekdayData}
                bars={[
                  { dataKey: 'articles', color: siteColor, name: siteName },
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
              <CardTitle>Publishing by Month</CardTitle>
              <CardDescription>Seasonal publishing patterns for {siteName}</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={monthlyData}
                bars={[
                  { dataKey: 'articles', color: siteColor, name: siteName },
                ]}
                xAxisKey="month"
                height={400}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yearly">
          <Card>
            <CardHeader>
              <CardTitle>Yearly Publishing Timeline</CardTitle>
              <CardDescription>Article publishing trends over the years for {siteName}</CardDescription>
            </CardHeader>
            <CardContent>
              <AreaLineChart
                data={yearlyTimelineData}
                lines={[
                  { dataKey: 'articles', color: siteColor, name: siteName },
                ]}
                xAxisKey="year"
                height={400}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PublishingPageProps {
  readonly searchParams: Promise<SearchParams>;
}

export default async function PublishingPage({ searchParams }: PublishingPageProps) {
  const params = await searchParams;
  const site = (params.site as SiteFilter) || 'shega';
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Publishing Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Analyze publishing patterns by weekday, month, and year
          </p>
        </div>
        <SiteSelector showBothOption={false} />
      </div>

      <Suspense fallback={<PublishingSkeleton />}>
        <PublishingContent site={site} />
      </Suspense>
    </div>
  );
}

const SKELETON_CARD_IDS = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'] as const;

function PublishingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {SKELETON_CARD_IDS.map((id) => (
          <Card key={id}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-lg" />
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
