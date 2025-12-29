import { dashboardAPI, nlpAPI, authorsAPI, topicsAPI, categoriesAPI } from '@/lib/api';
import { KPICard, ComparisonKPICard } from './kpi-card';
import { DailyArticlesChart } from './daily-articles-chart';
import { SentimentOverview } from './sentiment-overview';
import { TopAuthorsCard } from './top-authors-card';
import { TrendingTopicsCard } from './trending-topics-card';
import { CategoryDistributionCard } from './category-distribution-card';

async function fetchDashboardData() {
  try {
    const [overview, summary, dailyArticles, sentimentBySite, topAuthors, spikes, categories] = 
      await Promise.allSettled([
        dashboardAPI.getOverview(),
        dashboardAPI.getSummary(),
        dashboardAPI.getDailyArticles(30),
        nlpAPI.getSentimentBySite(),
        authorsAPI.getTopWithStats({ limit: 5 }),
        topicsAPI.getSpikes({ weeks: 4, threshold: 2.0 }),
        categoriesAPI.getDistribution(),
      ]);

    return {
      overview: overview.status === 'fulfilled' ? overview.value : null,
      summary: summary.status === 'fulfilled' ? summary.value : null,
      dailyArticles: dailyArticles.status === 'fulfilled' ? dailyArticles.value : [],
      sentimentBySite: sentimentBySite.status === 'fulfilled' ? sentimentBySite.value : null,
      topAuthors: topAuthors.status === 'fulfilled' ? topAuthors.value : [],
      spikes: spikes.status === 'fulfilled' ? spikes.value : [],
      categories: categories.status === 'fulfilled' ? categories.value : [],
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
      categories: [],
    };
  }
}

export async function DashboardOverview() {
  const data = await fetchDashboardData();

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '—';
    return num.toLocaleString();
  };

  const formatDecimal = (num: number | undefined) => {
    if (num === undefined) return '—';
    return num.toFixed(1);
  };

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TopAuthorsCard authors={data.topAuthors} />
        <TrendingTopicsCard topics={data.spikes} />
        <CategoryDistributionCard categories={data.categories} />
      </div>
    </div>
  );
}
