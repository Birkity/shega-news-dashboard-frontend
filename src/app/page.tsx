import { Suspense } from 'react';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { InsightsGrid } from '@/components/dashboard/insights-panels';
import { Skeleton } from '@/components/ui/skeleton';
import { SiteFilter, DateRangeSelector } from '@/components/filters/global-filters';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

interface DashboardPageProps {
  readonly searchParams: Promise<{
    site?: string;
    date_range?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const site = (params.site as 'shega' | 'addis_insight' | undefined) || 'all';

  return (
    <div className="space-y-6">
      {/* Page Header with Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Comparative analytics for Shega Media vs Addis Insight news coverage
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SiteFilter />
          <DateRangeSelector />
        </div>
      </div>

      {/* Main Dashboard Content */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardOverview site={site === 'all' ? 'all' : site} />
      </Suspense>

      {/* Insights & Quick Navigation */}
      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-4">Quick Insights</h2>
        <Suspense fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map(i => (
              <Skeleton key={i} className="h-[280px] w-full rounded-lg" />
            ))}
          </div>
        }>
          <InsightsGrid />
        </Suspense>
      </div>
    </div>
  );
}
