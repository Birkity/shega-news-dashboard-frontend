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
import { 
  TrendingUp, Sparkles, Users, ArrowRight, 
  Tag, Calendar, Flame
} from 'lucide-react';

// Trending Keywords Quick View
async function TrendingKeywordsPanel() {
  try {
    const data = await keywordsAnalyticsAPI.getTrending({ months: 1 });
    const headlineKeywords = data?.trending_headline_keywords?.slice(0, 8) || [];
    const bodyKeywords = data?.trending_body_keywords?.slice(0, 8) || [];

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
          <CardDescription>Popular keywords in the last month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Headlines</p>
              <div className="flex flex-wrap gap-2">
                {headlineKeywords.map((kw: { keyword: string; count: number }) => (
                  <Link 
                    key={kw.keyword} 
                    href={`/articles?keyword=${encodeURIComponent(kw.keyword)}`}
                  >
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
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
                {bodyKeywords.map((kw: { keyword: string; count: number }) => (
                  <Link 
                    key={kw.keyword} 
                    href={`/articles?keyword=${encodeURIComponent(kw.keyword)}`}
                  >
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {kw.keyword}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error fetching trending keywords:', error);
    return null;
  }
}

// Top Topics Quick View
async function TopTopicsPanel() {
  try {
    const data = await topicsAnalyticsAPI.getLabels({ limit: 8 });
    const topics = data?.labels || [];

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Top Topics
            </CardTitle>
            <Link href="/analytics/topics">
              <Button variant="ghost" size="sm" className="gap-1 h-8">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <CardDescription>Most covered topics</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {topics.map((topic: { topic_label: string; article_count: number; percentage: number }, index: number) => (
                <Link 
                  key={topic.topic_label}
                  href={`/articles?topic_label=${encodeURIComponent(topic.topic_label)}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground w-5">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium truncate max-w-[180px] group-hover:text-primary">
                      {topic.topic_label}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {topic.article_count}
                  </Badge>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error fetching top topics:', error);
    return null;
  }
}

// Top Authors Quick View
async function TopAuthorsPanel() {
  try {
    const data = await authorAnalyticsAPI.getOverviewCards();
    
    const shegaAuthors = (data?.shega?.top_authors || []).map((a: any) => ({ ...a, site: 'shega' }));
    const addisAuthors = (data?.addis_insight?.top_authors || []).map((a: any) => ({ ...a, site: 'addis_insight' }));
    const allAuthors = [...shegaAuthors, ...addisAuthors]
      .sort((a, b) => b.article_count - a.article_count)
      .slice(0, 10);

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Top Authors
            </CardTitle>
            <Link href="/analytics/authors">
              <Button variant="ghost" size="sm" className="gap-1 h-8">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <CardDescription>Most prolific writers</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {allAuthors.map((author: { author: string; article_count: number; site: string }) => {
                const siteParam = author.site ? `&site=${author.site}` : '';
                return (
                  <Link 
                    key={`${author.author}-${author.site}`}
                    href={`/articles?author=${encodeURIComponent(author.author)}${siteParam}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {author.author.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium truncate max-w-[120px] group-hover:text-primary">
                        {author.author}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={author.site === 'shega' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {author.site === 'shega' ? 'S' : 'A'}
                      </Badge>
                      <span className="text-sm font-bold w-8 text-right">{author.article_count}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error fetching top authors:', error);
    return null;
  }
}

// Recent Publishing Activity
async function PublishingActivityPanel() {
  try {
    const data = await publishingAnalyticsAPI.getCalendarHeatmap({ months: 1 });
    
    // Get the last 7 days of data - CalendarHeatmapDay uses 'total' field
    const recentDays = data?.heatmap_data?.slice(-7) || [];
    const totalRecent = recentDays.reduce((sum, day) => sum + day.total, 0);
    const avgPerDay = totalRecent / 7;

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
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{totalRecent}</p>
                <p className="text-xs text-muted-foreground">Total Articles</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{avgPerDay.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avg per Day</p>
              </div>
            </div>
            <div className="flex gap-1 justify-center">
              {recentDays.map((day) => {
                const intensity = day.total > 0 ? Math.min(day.total / 10, 1) : 0;
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
                    title={`${day.date}: ${day.total} articles`}
                  >
                    {day.total}
                  </div>
                );
              })}
            </div>
          </div>
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

// Main Insights Grid Component
export function InsightsGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Suspense fallback={<PanelSkeleton />}>
        <TrendingKeywordsPanel />
      </Suspense>
      <Suspense fallback={<PanelSkeleton />}>
        <TopTopicsPanel />
      </Suspense>
      <Suspense fallback={<PanelSkeleton />}>
        <TopAuthorsPanel />
      </Suspense>
      <Suspense fallback={<PanelSkeleton />}>
        <PublishingActivityPanel />
      </Suspense>
    </div>
  );
}

// Single row insights for smaller spaces
export function InsightsRow() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Suspense fallback={<PanelSkeleton />}>
        <TrendingKeywordsPanel />
      </Suspense>
      <Suspense fallback={<PanelSkeleton />}>
        <TopTopicsPanel />
      </Suspense>
      <QuickActionsPanel />
    </div>
  );
}

export { TrendingKeywordsPanel, TopTopicsPanel, TopAuthorsPanel, PublishingActivityPanel };
