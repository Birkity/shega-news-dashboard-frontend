import Link from 'next/link';
import { 
  contentAnalyticsAPI, 
  sentimentAnalyticsAPI, 
  authorAnalyticsAPI, 
  topicsAnalyticsAPI,
  competitiveAnalysisAPI
} from '@/lib/api';
import { KPICard, ComparisonKPICard } from './kpi-card';
import type { SiteFilter } from './site-selector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Flame, Users, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardOverviewProps {
  readonly site: SiteFilter;
}

async function fetchDashboardData(site: SiteFilter) {
  try {
    const siteParam = site === 'all' ? undefined : site;
    
    const [lengthComparison, sentimentDist, authorsOverview, topicLabels, competitiveSummary] = 
      await Promise.allSettled([
        contentAnalyticsAPI.getLengthComparison(),
        sentimentAnalyticsAPI.getDistribution({ site: siteParam }),
        authorAnalyticsAPI.getOverviewCards({ site: siteParam }),
        topicsAnalyticsAPI.getLabels({ limit: 10, site: siteParam }),
        competitiveAnalysisAPI.getCompetitiveSummary(),
      ]);

    return {
      lengthComparison: lengthComparison.status === 'fulfilled' ? lengthComparison.value : null,
      sentimentDist: sentimentDist.status === 'fulfilled' ? sentimentDist.value : null,
      authorsOverview: authorsOverview.status === 'fulfilled' ? authorsOverview.value : null,
      topicLabels: topicLabels.status === 'fulfilled' ? topicLabels.value : null,
      competitiveSummary: competitiveSummary.status === 'fulfilled' ? competitiveSummary.value : null,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      lengthComparison: null,
      sentimentDist: null,
      authorsOverview: null,
      topicLabels: null,
      competitiveSummary: null,
    };
  }
}

// Simple inline top authors component
function SimpleTopAuthorsCard({ data, site }: { readonly data: any; readonly site: SiteFilter }) {
  let authors: any[] = [];
  if (site === 'all') {
    const shegaAuthors = (data?.shega?.top_authors || []).map((a: any) => ({ ...a, site: 'shega' }));
    const addisAuthors = (data?.addis_insight?.top_authors || []).map((a: any) => ({ ...a, site: 'addis_insight' }));
    authors = [...shegaAuthors, ...addisAuthors].sort((a, b) => b.article_count - a.article_count).slice(0, 10);
  } else if (site === 'shega') {
    authors = (data?.shega?.top_authors || []).map((a: any) => ({ ...a, site: 'shega' }));
  } else {
    authors = (data?.addis_insight?.top_authors || []).map((a: any) => ({ ...a, site: 'addis_insight' }));
  }

  if (authors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Top Authors
          </CardTitle>
          <CardDescription>Most prolific writers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

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
        <CardDescription>Most prolific writers by article count - click to view articles</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-1">
            {authors.map((author: any, index: number) => {
              const siteParam = author.site ? `&site=${author.site}` : '';
              return (
                <Link 
                  key={`${author.author}-${index}`} 
                  href={`/articles?author=${encodeURIComponent(author.author)}${siteParam}`}
                  className="flex items-center justify-between rounded-lg border p-2 hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                    <span className="text-sm font-medium truncate max-w-[150px] group-hover:text-primary">{author.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={author.site === 'shega' ? 'default' : 'secondary'} className="text-xs">
                      {author.site === 'shega' ? 'Shega' : 'Addis'}
                    </Badge>
                    <span className="text-sm font-bold">{author.article_count}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Simple inline topics component
function SimpleTopicsCard({ data, site }: { readonly data: any; readonly site: SiteFilter }) {
  const topics = data?.labels || [];

  if (topics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Top Topics
          </CardTitle>
          <CardDescription>Most covered topics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No topics available
          </div>
        </CardContent>
      </Card>
    );
  }

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
        <CardDescription>Most covered topics - click to view articles</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-1">
            {topics.slice(0, 10).map((topic: any, index: number) => (
              <Link 
                key={`${topic.topic_label}-${index}`} 
                href={`/articles?topic_label=${encodeURIComponent(topic.topic_label)}`}
                className="flex items-center justify-between rounded-lg border p-2 hover:bg-accent transition-colors group"
              >
                <span className="text-sm font-medium truncate max-w-[200px] group-hover:text-primary">{topic.topic_label}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {topic.article_count} articles
                  </Badge>
                  <span className="text-xs text-muted-foreground">{topic.percentage?.toFixed(1)}%</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export async function DashboardOverview({ site }: DashboardOverviewProps) {
  const data = await fetchDashboardData(site);

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '—';
    return num.toLocaleString();
  };

  const formatDecimal = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '—';
    return num.toFixed(1);
  };

  // Get data from competitive summary
  const overview = data.competitiveSummary?.overview;
  const shegaData = overview?.shega;
  const addisData = overview?.addis_insight;
  
  // Get length data from the correct structure
  const lengthSites = data.lengthComparison?.sites;

  // For single site view, show simple KPI cards
  if (site !== 'all') {
    const siteData = site === 'shega' ? shegaData : addisData;
    const lengthData = site === 'shega' ? lengthSites?.shega : lengthSites?.addis_insight;
    const authorsData = site === 'shega' ? data.authorsOverview?.shega : data.authorsOverview?.addis_insight;

    return (
      <div className="space-y-6">
        {/* KPI Cards Row - Single Site View */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Articles"
            value={formatNumber(siteData?.total_articles)}
            icon="newspaper"
          />
          <KPICard
            title="Unique Authors"
            value={formatNumber(authorsData?.total_authors)}
            icon="users"
          />
          <KPICard
            title="Avg Word Count"
            value={formatDecimal(lengthData?.avg_body_words)}
            icon="fileText"
          />
          <KPICard
            title="Avg Sentiment"
            value={formatDecimal(siteData?.avg_sentiment ? siteData.avg_sentiment * 100 : undefined)}
            subtitle="sentiment score"
            icon="gauge"
          />
        </div>

        {/* Bottom Row */}
        <div className="grid gap-4 md:grid-cols-2">
          <SimpleTopAuthorsCard data={data.authorsOverview} site={site} />
          <SimpleTopicsCard data={data.topicLabels} site={site} />
        </div>
      </div>
    );
  }

  // Comparison view (both sites)
  const shegaArticles = shegaData?.total_articles || 0;
  const addisArticles = addisData?.total_articles || 0;
  const articleDiff = addisArticles > 0 ? ((shegaArticles - addisArticles) / addisArticles * 100) : undefined;

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ComparisonKPICard
          title="Total Articles"
          shegaValue={formatNumber(shegaArticles)}
          addisValue={formatNumber(addisArticles)}
          difference={articleDiff}
          icon="newspaper"
        />
        
        <ComparisonKPICard
          title="Unique Authors"
          shegaValue={formatNumber(data.authorsOverview?.shega?.total_authors)}
          addisValue={formatNumber(data.authorsOverview?.addis_insight?.total_authors)}
          icon="users"
        />
        
        <ComparisonKPICard
          title="Avg Word Count"
          shegaValue={formatDecimal(lengthSites?.shega?.avg_body_words)}
          addisValue={formatDecimal(lengthSites?.addis_insight?.avg_body_words)}
          icon="fileText"
        />
        
        <ComparisonKPICard
          title="Avg Sentiment"
          shegaValue={formatDecimal(shegaData?.avg_sentiment ? shegaData.avg_sentiment * 100 : undefined)}
          addisValue={formatDecimal(addisData?.avg_sentiment ? addisData.avg_sentiment * 100 : undefined)}
          icon="gauge"
        />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <SimpleTopAuthorsCard data={data.authorsOverview} site={site} />
        <SimpleTopicsCard data={data.topicLabels} site={site} />
      </div>
    </div>
  );
}
