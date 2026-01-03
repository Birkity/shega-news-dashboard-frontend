import { dashboardAPI, nlpAPI, authorsAPI, topicsAPI, comparisonAPI } from '@/lib/api';
import { KPICard, ComparisonKPICard } from './kpi-card';
import { DailyArticlesChart } from './daily-articles-chart';
import { SentimentOverview } from './sentiment-overview';
import { TopAuthorsCard } from './top-authors-card';
import { TrendingTopicsCard } from './trending-topics-card';
import { CompetitiveInsightsCard } from './competitive-insights-card';
import type { SiteFilter } from './site-selector';

interface DashboardOverviewProps {
  readonly site: SiteFilter;
}

async function fetchDashboardData(site: SiteFilter) {
  try {
    const siteParam = site === 'all' ? undefined : site;
    
    const [overview, summary, dailyArticles, sentimentBySite, topAuthors, spikes, insights] = 
      await Promise.allSettled([
        dashboardAPI.getOverview(),
        dashboardAPI.getSummary(),
        dashboardAPI.getDailyArticles(30, siteParam),
        nlpAPI.getSentimentBySite(),
        authorsAPI.getTopWithStats({ limit: 10, site: siteParam }),
        topicsAPI.getSpikes({ weeks: 4, threshold: 2 }),
        comparisonAPI.getInsights(),
      ]);

    return {
      overview: overview.status === 'fulfilled' ? overview.value : null,
      summary: summary.status === 'fulfilled' ? summary.value : null,
      dailyArticles: dailyArticles.status === 'fulfilled' ? dailyArticles.value : [],
      sentimentBySite: sentimentBySite.status === 'fulfilled' ? sentimentBySite.value : null,
      topAuthors: topAuthors.status === 'fulfilled' ? topAuthors.value : [],
      spikes: spikes.status === 'fulfilled' ? spikes.value : [],
      insights: insights.status === 'fulfilled' ? insights.value : null,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      overview: null,
      summary: null,
      dailyArticles: [],
      sentimentBySite: null,
      topAuthors: [],
      spikes: [],
      insights: null,
    };
  }
}

export async function DashboardOverview({ site }: DashboardOverviewProps) {
  const data = await fetchDashboardData(site);

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '—';
    return num.toLocaleString();
  };

  const formatDecimal = (num: number | undefined) => {
    if (num === undefined) return '—';
    return num.toFixed(1);
  };

  // For single site view, show simple KPI cards
  if (site !== 'all') {
    const siteData = site === 'shega' ? data.summary?.shega : data.summary?.addis_insight;
    const siteCount = site === 'shega' 
      ? data.overview?.article_count.shega_count 
      : data.overview?.article_count.addis_insight_count;
    const siteSentiment = site === 'shega' 
      ? data.sentimentBySite?.shega 
      : data.sentimentBySite?.addis_insight;

    return (
      <div className="space-y-6">
        {/* KPI Cards Row - Single Site View */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Articles"
            value={formatNumber(siteCount)}
            icon="newspaper"
          />
          <KPICard
            title="Unique Authors"
            value={formatNumber(siteData?.unique_authors)}
            icon="users"
          />
          <KPICard
            title="Avg Word Count"
            value={formatDecimal(siteData?.avg_body_word_count)}
            icon="fileText"
          />
          <KPICard
            title="Avg Readability"
            value={formatDecimal(siteData?.avg_readability)}
            icon="gauge"
          />
        </div>

        {/* Second KPI Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Avg Sentiment"
            value={formatDecimal(siteData?.avg_sentiment)}
            subtitle={siteSentiment ? `${siteSentiment.positive_pct?.toFixed(0)}% positive` : undefined}
            icon="gauge"
          />
          <KPICard
            title="Avg Headline Length"
            value={formatDecimal(siteData?.avg_headline_word_count)}
            subtitle="words per headline"
            icon="fileText"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DailyArticlesChart data={data.dailyArticles} site={site} />
          </div>
          <div>
            <SentimentOverview data={data.sentimentBySite} highlightSite={site} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-4 md:grid-cols-2">
          <TopAuthorsCard authors={data.topAuthors} />
          <TrendingTopicsCard topics={data.spikes} />
        </div>
      </div>
    );
  }

  // Comparison view (both sites)
  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ComparisonKPICard
          title="Total Articles"
          shegaValue={formatNumber(data.overview?.article_count.shega_count)}
          addisValue={formatNumber(data.overview?.article_count.addis_insight_count)}
          difference={data.overview?.article_count.percentage_difference}
          icon="newspaper"
        />
        
        <ComparisonKPICard
          title="Unique Authors"
          shegaValue={formatNumber(data.summary?.shega.unique_authors)}
          addisValue={formatNumber(data.summary?.addis_insight.unique_authors)}
          difference={data.summary ? 
            ((data.summary.shega.unique_authors - data.summary.addis_insight.unique_authors) / 
              data.summary.addis_insight.unique_authors * 100) : undefined}
          icon="users"
        />
        
        <ComparisonKPICard
          title="Avg Word Count"
          shegaValue={formatDecimal(data.summary?.shega.avg_body_word_count)}
          addisValue={formatDecimal(data.summary?.addis_insight.avg_body_word_count)}
          icon="fileText"
        />
        
        <ComparisonKPICard
          title="Avg Readability"
          shegaValue={formatDecimal(data.summary?.shega.avg_readability)}
          addisValue={formatDecimal(data.summary?.addis_insight.avg_readability)}
          icon="gauge"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailyArticlesChart data={data.dailyArticles} />
        </div>
        <div>
          <SentimentOverview data={data.sentimentBySite} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <TopAuthorsCard authors={data.topAuthors} />
        <TrendingTopicsCard topics={data.spikes} />
      </div>

      {/* Competitive Insights Row - Only shown in comparison view */}
      {data.insights && data.insights.insights.length > 0 && (
        <CompetitiveInsightsCard insights={data.insights} />
      )}
    </div>
  );
}
