import { Suspense } from 'react';
import { publishingAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { AreaLineChart } from '@/components/charts/line-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, Sun, Moon, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function PublishingContent() {
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

  // Transform hourly data - API returns { value: "0", shega: number, addis_insight: number }
  const hourlyData = publishingTrends.by_hour.map((item) => ({
    hour: `${item.value.padStart(2, '0')}:00`,
    Shega: item.shega,
    'Addis Insight': item.addis_insight,
  }));

  // Transform weekday data
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekdayData = publishingTrends.by_weekday.map((item) => ({
    day: weekdays[Number.parseInt(item.value, 10)]?.slice(0, 3) || item.value,
    Shega: item.shega,
    'Addis Insight': item.addis_insight,
  }));

  // Transform monthly data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = publishingTrends.by_month.map((item) => ({
    month: months[Number.parseInt(item.value, 10) - 1] || item.value,
    Shega: item.shega,
    'Addis Insight': item.addis_insight,
  }));

  // Calculate peak hours
  const peakShegaHour = publishingTrends.by_hour.reduce((max, h) => h.shega > max.shega ? h : max, publishingTrends.by_hour[0] || { value: '0', shega: 0, addis_insight: 0 });
  const peakAddisHour = publishingTrends.by_hour.reduce((max, h) => h.addis_insight > max.addis_insight ? h : max, publishingTrends.by_hour[0] || { value: '0', shega: 0, addis_insight: 0 });

  // Calculate peak days
  const peakShegaDay = publishingTrends.by_weekday.reduce((max, d) => d.shega > max.shega ? d : max, publishingTrends.by_weekday[0] || { value: '0', shega: 0, addis_insight: 0 });
  const peakAddisDay = publishingTrends.by_weekday.reduce((max, d) => d.addis_insight > max.addis_insight ? d : max, publishingTrends.by_weekday[0] || { value: '0', shega: 0, addis_insight: 0 });

  // Transform yearly timeline - check if yearlyAnalysis has the expected structure
  const yearlyTimelineData = yearlyAnalysis.years?.map((item) => ({
    year: item.year,
    Shega: item.shega.articles,
    'Addis Insight': item.addis_insight.articles,
    total: item.shega.articles + item.addis_insight.articles,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shega Peak Hour</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peakShegaHour.value.padStart(2, '0')}:00</div>
            <p className="text-xs text-muted-foreground">{peakShegaHour.shega} articles published</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Addis Peak Hour</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peakAddisHour.value.padStart(2, '0')}:00</div>
            <p className="text-xs text-muted-foreground">{peakAddisHour.addis_insight} articles published</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shega Peak Day</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekdays[Number.parseInt(peakShegaDay.value, 10)]?.slice(0, 3) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{peakShegaDay.shega} articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Addis Peak Day</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekdays[Number.parseInt(peakAddisDay.value, 10)]?.slice(0, 3) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{peakAddisDay.addis_insight} articles</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="hourly" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="hourly" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            By Hour
          </TabsTrigger>
          <TabsTrigger value="weekday" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            By Weekday
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            By Month
          </TabsTrigger>
          <TabsTrigger value="yearly" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Yearly Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hourly">
          <Card>
            <CardHeader>
              <CardTitle>Publishing by Hour of Day</CardTitle>
              <CardDescription>When articles are published throughout the day (24-hour format)</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={hourlyData}
                bars={[
                  { dataKey: 'Shega', color: '#2563eb', name: 'Shega' },
                  { dataKey: 'Addis Insight', color: '#dc2626', name: 'Addis Insight' },
                ]}
                xAxisKey="hour"
                height={400}
              />
            </CardContent>
          </Card>
        </TabsContent>

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
                  { dataKey: 'Shega', color: '#2563eb', name: 'Shega' },
                  { dataKey: 'Addis Insight', color: '#dc2626', name: 'Addis Insight' },
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
              <CardDescription>Seasonal publishing patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={monthlyData}
                bars={[
                  { dataKey: 'Shega', color: '#2563eb', name: 'Shega' },
                  { dataKey: 'Addis Insight', color: '#dc2626', name: 'Addis Insight' },
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
              <CardDescription>Article publishing trends over the year</CardDescription>
            </CardHeader>
            <CardContent>
              <AreaLineChart
                data={yearlyTimelineData}
                lines={[
                  { dataKey: 'Shega', color: '#2563eb', name: 'Shega' },
                  { dataKey: 'Addis Insight', color: '#dc2626', name: 'Addis Insight' },
                ]}
                xAxisKey="date"
                height={400}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Time of Day Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              Daytime Publishing (6AM - 6PM)
            </CardTitle>
            <CardDescription>Articles published during work hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Shega</span>
                  <span className="text-sm text-muted-foreground">
                    {hourlyData.slice(6, 18).reduce((sum, h) => sum + h.Shega, 0)} articles
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ 
                      width: `${(hourlyData.slice(6, 18).reduce((sum, h) => sum + h.Shega, 0) / 
                        Math.max(1, hourlyData.reduce((sum, h) => sum + h.Shega, 0))) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Addis Insight</span>
                  <span className="text-sm text-muted-foreground">
                    {hourlyData.slice(6, 18).reduce((sum, h) => sum + h['Addis Insight'], 0)} articles
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full" 
                    style={{ 
                      width: `${(hourlyData.slice(6, 18).reduce((sum, h) => sum + h['Addis Insight'], 0) / 
                        Math.max(1, hourlyData.reduce((sum, h) => sum + h['Addis Insight'], 0))) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-500" />
              Nighttime Publishing (6PM - 6AM)
            </CardTitle>
            <CardDescription>Articles published after hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Shega</span>
                  <span className="text-sm text-muted-foreground">
                    {[...hourlyData.slice(0, 6), ...hourlyData.slice(18)].reduce((sum, h) => sum + h.Shega, 0)} articles
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ 
                      width: `${([...hourlyData.slice(0, 6), ...hourlyData.slice(18)].reduce((sum, h) => sum + h.Shega, 0) / 
                        Math.max(1, hourlyData.reduce((sum, h) => sum + h.Shega, 0))) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Addis Insight</span>
                  <span className="text-sm text-muted-foreground">
                    {[...hourlyData.slice(0, 6), ...hourlyData.slice(18)].reduce((sum, h) => sum + h['Addis Insight'], 0)} articles
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full" 
                    style={{ 
                      width: `${([...hourlyData.slice(0, 6), ...hourlyData.slice(18)].reduce((sum, h) => sum + h['Addis Insight'], 0) / 
                        Math.max(1, hourlyData.reduce((sum, h) => sum + h['Addis Insight'], 0))) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PublishingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Publishing Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Analyze publishing patterns by time of day, weekday, and month
        </p>
      </div>

      <Suspense fallback={<PublishingSkeleton />}>
        <PublishingContent />
      </Suspense>
    </div>
  );
}

const SKELETON_CARD_IDS = ['skeleton-peak-1', 'skeleton-peak-2', 'skeleton-peak-3', 'skeleton-peak-4'] as const;

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
