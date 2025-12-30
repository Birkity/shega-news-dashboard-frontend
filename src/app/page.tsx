import { Suspense } from 'react';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { SiteSelector, type SiteFilter } from '@/components/dashboard/site-selector';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

interface DashboardPageProps {
  readonly searchParams: Promise<{ site?: SiteFilter }>;
}

function getDescription(site: SiteFilter): string {
  if (site === 'shega') {
    return 'Analytics for Shega Media news coverage';
  }
  if (site === 'addis_insight') {
    return 'Analytics for Addis Insight news coverage';
  }
  return 'Comparative analytics for Shega vs Addis Insight news coverage';
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const site = params.site || 'all';
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            {getDescription(site)}
          </p>
        </div>
        <Suspense fallback={null}>
          <SiteSelector />
        </Suspense>
      </div>

      {/* Main Dashboard Content */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardOverview site={site} />
      </Suspense>
    </div>
  );
}
