import { Suspense } from 'react';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Comparative analytics for Shega vs Addis Insight news coverage
        </p>
      </div>

      {/* Main Dashboard Content */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardOverview />
      </Suspense>
    </div>
  );
}
