import { Suspense } from 'react';
import Link from 'next/link';
import { 
  keywordsAnalyticsAPI, 
  topicsAnalyticsAPI, 
  authorAnalyticsAPI,
  publishingAnalyticsAPI,
} from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, Sparkles, Users, ArrowRight, 
  Tag, Calendar, Flame
} from 'lucide-react';

// Trending Keywords by Site
async function TrendingKeywordsBySitePanel() {
  try {
    const [shegaData, addisData] = await Promise.all([
      keywordsAnalyticsAPI.getTrending({ months: 1, site: 'shega' }),
      keywordsAnalyticsAPI.getTrending({ months: 1, site: 'addis_insight' })
    ]);
    
    const shegaHeadlineKeywords = shegaData?.trending_headline_keywords?.slice(0, 8) || [];
    const shegaBodyKeywords = shegaData?.trending_body_keywords?.slice(0, 8) || [];
    const addisHeadlineKeywords = addisData?.trending_headline_keywords?.slice(0, 8) || [];
    const addisBodyKeywords = addisData?.trending_body_keywords?.slice(0, 8) || [];

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Trending Keywords
            </CardTitle>
            <Link href="/analytics/keywords">
              <Button variant="ghost" size="sm" className="gap-1 h-8">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <CardDescription>Popular keywords by site - last month</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="shega" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="shega" className="text-xs">
                <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                Shega Media
              </TabsTrigger>
              <TabsTrigger value="addis_insight" className="text-xs">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                Addis Insight
              </TabsTrigger>
            </TabsList>
            <TabsContent value="shega" className="mt-0 space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Headlines</p>
                <div className="flex flex-wrap gap-2">
                  {shegaHeadlineKeywords.map((kw: { keyword: string; count: number }) => (
                    <Link 
                      key={kw.keyword} 
                      href={`/articles?keyword=${encodeURIComponent(kw.keyword)}&site=shega`}
                    >
                      <Badge 
                        variant="default" 
                        className="cursor-pointer hover:bg-blue-700 transition-colors"
                      >
                        {kw.keyword}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Articles</p>
                <div className="flex flex-wrap gap-2">
                  {shegaBodyKeywords.map((kw: { keyword: string; count: number }) => (
                    <Link 
                      key={kw.keyword} 
                      href={`/articles?keyword=${encodeURIComponent(kw.keyword)}&site=shega`}
                    >
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition-colors"
                      >
                        {kw.keyword}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="addis_insight" className="mt-0 space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Headlines</p>
                <div className="flex flex-wrap gap-2">
                  {addisHeadlineKeywords.map((kw: { keyword: string; count: number }) => (
                    <Link 
                      key={kw.keyword} 
                      href={`/articles?keyword=${encodeURIComponent(kw.keyword)}&site=addis_insight`}
                    >
                      <Badge 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-green-600 hover:text-white transition-colors"
                      >
                        {kw.keyword}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Articles</p>
                <div className="flex flex-wrap gap-2">
                  {addisBodyKeywords.map((kw: { keyword: string; count: number }) => (
                    <Link 
                      key={kw.keyword} 
                      href={`/articles?keyword=${encodeURIComponent(kw.keyword)}&site=addis_insight`}
                    >
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-green-50 hover:border-green-500 transition-colors"
                      >
                        {kw.keyword}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error fetching trending keywords by site:', error);
    return null;
  }
}

// Recent Publishing Activity by Site
async function PublishingActivityBySitePanel() {
  try {
    const data = await publishingAnalyticsAPI.getCalendarHeatmap({ months: 1 });
    
    // Get the last 7 days of data
    const recentDays = data?.heatmap_data?.slice(-7) || [];
    
    // Calculate stats for each site
    const shegaTotal = recentDays.reduce((sum, day) => sum + day.shega, 0);
    const addisTotal = recentDays.reduce((sum, day) => sum + day.addis_insight, 0);
    const shegaAvg = shegaTotal / 7;
    const addisAvg = addisTotal / 7;

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Publishing Activity
            </CardTitle>
            <Link href="/analytics/publishing">
              <Button variant="ghost" size="sm" className="gap-1 h-8">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <CardDescription>Last 7 days by site</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="shega" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shega">Shega Media</TabsTrigger>
              <TabsTrigger value="addis_insight">Addis Insight</TabsTrigger>
            </TabsList>
            <TabsContent value="shega" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <p className="text-2xl font-bold text-blue-600">{shegaTotal}</p>
                  <p className="text-xs text-muted-foreground">Total Articles</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <p className="text-2xl font-bold text-blue-600">{shegaAvg.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Avg per Day</p>
                </div>
              </div>
              <div className="flex gap-1 justify-center">
                {recentDays.map((day) => {
                  const intensity = day.shega > 0 ? Math.min(day.shega / 10, 1) : 0;
                  return (
                    <div
                      key={day.date}
                      className="w-8 h-8 rounded flex items-center justify-center text-xs font-medium"
                      style={{
                        backgroundColor: intensity > 0 
                          ? `rgba(37, 99, 235, ${0.2 + intensity * 0.8})` 
                          : 'var(--muted)',
                        color: intensity > 0.5 ? 'white' : 'inherit',
                      }}
                      title={`${day.date}: ${day.shega} articles`}
                    >
                      {day.shega}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            <TabsContent value="addis_insight" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <p className="text-2xl font-bold text-green-600">{addisTotal}</p>
                  <p className="text-xs text-muted-foreground">Total Articles</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <p className="text-2xl font-bold text-green-600">{addisAvg.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Avg per Day</p>
                </div>
              </div>
              <div className="flex gap-1 justify-center">
                {recentDays.map((day) => {
                  const intensity = day.addis_insight > 0 ? Math.min(day.addis_insight / 10, 1) : 0;
                  return (
                    <div
                      key={day.date}
                      className="w-8 h-8 rounded flex items-center justify-center text-xs font-medium"
                      style={{
                        backgroundColor: intensity > 0 
                          ? `rgba(34, 197, 94, ${0.2 + intensity * 0.8})` 
                          : 'var(--muted)',
                        color: intensity > 0.5 ? 'white' : 'inherit',
                      }}
                      title={`${day.date}: ${day.addis_insight} articles`}
                    >
                      {day.addis_insight}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error fetching publishing activity:', error);
    return null;
  }
}

// Quick Actions Panel
export function QuickActionsPanel() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          Quick Actions
        </CardTitle>
        <CardDescription>Jump to key analytics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/articles?sort_by=recent">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <Calendar className="h-4 w-4" />
              Latest Articles
            </Button>
          </Link>
          <Link href="/comparison">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <Tag className="h-4 w-4" />
              Compare Sites
            </Button>
          </Link>
          <Link href="/analytics/sentiment">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <Flame className="h-4 w-4" />
              Sentiment
            </Button>
          </Link>
          <Link href="/analytics/entities">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <Users className="h-4 w-4" />
              Entities
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton loaders
function PanelSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// Top Authors by Site (Top 10 per site)
async function TopAuthorsBySitePanel() {
  try {
    const [shegaData, addisData] = await Promise.all([
      authorAnalyticsAPI.getList({ site: 'shega', sort_by: 'articles' }),
      authorAnalyticsAPI.getList({ site: 'addis_insight', sort_by: 'articles' })
    ]);
    
    const shegaAuthors = (shegaData?.authors || []).slice(0, 10);
    const addisAuthors = (addisData?.authors || []).slice(0, 10);

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Top Authors by Site
            </CardTitle>
            <Link href="/analytics/authors">
              <Button variant="ghost" size="sm" className="gap-1 h-8">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <CardDescription>Most prolific writers by publication</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="shega" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="shega" className="text-xs">
                <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                Shega Media
              </TabsTrigger>
              <TabsTrigger value="addis_insight" className="text-xs">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                Addis Insight
              </TabsTrigger>
            </TabsList>
            <TabsContent value="shega" className="mt-0">
              <ScrollArea className="h-[360px]">
                <div className="space-y-2">
                  {shegaAuthors.map((author: { author: string; article_count: number }, index: number) => (
                    <Link 
                      key={author.author}
                      href={`/articles?author=${encodeURIComponent(author.author)}&site=shega`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-700 text-xs font-semibold">
                          {author.author.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium truncate max-w-[140px] group-hover:text-primary">
                          {author.author}
                        </span>
                      </div>
                      <Badge variant="default" className="text-xs">
                        {author.article_count}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="addis_insight" className="mt-0">
              <ScrollArea className="h-[360px]">
                <div className="space-y-2">
                  {addisAuthors.map((author: { author: string; article_count: number }, index: number) => (
                    <Link 
                      key={author.author}
                      href={`/articles?author=${encodeURIComponent(author.author)}&site=addis_insight`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/10 text-green-700 text-xs font-semibold">
                          {author.author.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium truncate max-w-[140px] group-hover:text-primary">
                          {author.author}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {author.article_count}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error fetching top authors by site:', error);
    return null;
  }
}

// Top Topics by Site (Top 10 per site)
async function TopTopicsBySitePanel() {
  try {
    const [shegaData, addisData] = await Promise.all([
      topicsAnalyticsAPI.getLabels({ limit: 10, site: 'shega' }),
      topicsAnalyticsAPI.getLabels({ limit: 10, site: 'addis_insight' })
    ]);
    
    const shegaTopics = shegaData?.labels || [];
    const addisTopics = addisData?.labels || [];

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Top Topics by Site
            </CardTitle>
            <Link href="/analytics/topics">
              <Button variant="ghost" size="sm" className="gap-1 h-8">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <CardDescription>Most covered topics by publication</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="shega" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="shega" className="text-xs">
                <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                Shega Media
              </TabsTrigger>
              <TabsTrigger value="addis_insight" className="text-xs">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                Addis Insight
              </TabsTrigger>
            </TabsList>
            <TabsContent value="shega" className="mt-0">
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {shegaTopics.map((topic: { topic_label: string; article_count: number }, index: number) => (
                    <Link 
                      key={topic.topic_label}
                      href={`/articles?topic_label=${encodeURIComponent(topic.topic_label)}&site=shega`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-600 w-5">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-medium truncate max-w-[160px] group-hover:text-primary">
                          {topic.topic_label}
                        </span>
                      </div>
                      <Badge variant="default" className="text-xs">
                        {topic.article_count}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="addis_insight" className="mt-0">
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {addisTopics.map((topic: { topic_label: string; article_count: number }, index: number) => (
                    <Link 
                      key={topic.topic_label}
                      href={`/articles?topic_label=${encodeURIComponent(topic.topic_label)}&site=addis_insight`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-green-600 w-5">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-medium truncate max-w-[160px] group-hover:text-primary">
                          {topic.topic_label}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {topic.article_count}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error fetching top topics by site:', error);
    return null;
  }
}

// Main Insights Grid Component
export function InsightsGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Suspense fallback={<PanelSkeleton />}>
        <TrendingKeywordsBySitePanel />
      </Suspense>
      <Suspense fallback={<PanelSkeleton />}>
        <PublishingActivityBySitePanel />
      </Suspense>
      <Suspense fallback={<PanelSkeleton />}>
        <TopAuthorsBySitePanel />
      </Suspense>
      <Suspense fallback={<PanelSkeleton />}>
        <TopTopicsBySitePanel />
      </Suspense>
    </div>
  );
}

// Single row insights for smaller spaces
export function InsightsRow() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Suspense fallback={<PanelSkeleton />}>
        <TrendingKeywordsBySitePanel />
      </Suspense>
      <Suspense fallback={<PanelSkeleton />}>
        <TopTopicsBySitePanel />
      </Suspense>
      <QuickActionsPanel />
    </div>
  );
}

