import { Suspense } from 'react';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { InsightsGrid } from '@/components/dashboard/insights-panels';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Comparative analytics for Shega Media vs Addis Insight news coverage
        </p>
      </div>

      {/* Main Dashboard Content */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardOverview site="all" />
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
