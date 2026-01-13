import { Suspense } from 'react';
import { healthAPI, scrapingAPI, schedulerAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, Server, Database, Clock, CheckCircle2, 
  XCircle, Play, Pause, RefreshCw
} from 'lucide-react';

export const dynamic = 'force-dynamic';

// Helper function for consistent date/time formatting (avoid hydration issues)
function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
}

// Helper function to get API status label
function getApiStatusLabel(status?: string): string {
  if (status === 'healthy') return 'Healthy';
  if (status === 'degraded') return 'Degraded';
  return 'Unknown';
}

// Helper function to get task status color
function getTaskStatusColor(status: string): string {
  if (status === 'completed') return 'bg-green-500';
  if (status === 'running') return 'bg-blue-500';
  return 'bg-red-500';
}

// Helper function to get task badge variant
function getTaskBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' {
  if (status === 'completed') return 'default';
  if (status === 'running') return 'secondary';
  return 'destructive';
}

// Health Status Cards Component
interface HealthStatusCardsProps {
  readonly health: Awaited<ReturnType<typeof healthAPI.getHealth>> | null;
  readonly schedulerStatus: Awaited<ReturnType<typeof schedulerAPI.getStatus>> | null;
}

function HealthStatusCards({ health, schedulerStatus }: HealthStatusCardsProps) {
  const isHealthy = health?.status === 'healthy';
  const isSchedulerRunning = schedulerStatus?.running;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className={isHealthy ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">API Status</CardTitle>
          {isHealthy ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {getApiStatusLabel(health?.status)}
          </div>
          <p className="text-xs text-muted-foreground">
            {health?.app_name || 'Unable to connect to API'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Database</CardTitle>
          <Database className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {health?.mongodb_connected ? 'Connected' : 'Disconnected'}
          </div>
          <p className="text-xs text-muted-foreground">
            {health?.mongodb_status || 'MongoDB connection status'}
          </p>
        </CardContent>
      </Card>

      <Card className={isSchedulerRunning ? 'border-green-200 dark:border-green-800' : 'border-amber-200 dark:border-amber-800'}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Scheduler</CardTitle>
          {isSchedulerRunning ? (
            <Play className="h-5 w-5 text-green-500" />
          ) : (
            <Pause className="h-5 w-5 text-amber-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isSchedulerRunning ? 'Running' : 'Stopped'}
          </div>
          <p className="text-xs text-muted-foreground">
            {schedulerStatus?.enabled ? 'Enabled' : 'Disabled'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Scheduler Details Component
interface SchedulerDetailsProps {
  readonly schedulerStatus: Awaited<ReturnType<typeof schedulerAPI.getStatus>>;
}

function SchedulerDetails({ schedulerStatus }: SchedulerDetailsProps) {
  const isSchedulerRunning = schedulerStatus?.running;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Scheduler Details
        </CardTitle>
        <CardDescription>Background pipeline scheduler status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex justify-between p-2 rounded bg-muted/50">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={isSchedulerRunning ? 'default' : 'secondary'}>
                {isSchedulerRunning ? 'Running' : 'Stopped'}
              </Badge>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/50">
              <span className="text-sm text-muted-foreground">Enabled</span>
              <span className="text-sm font-medium">{schedulerStatus.enabled ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/50">
              <span className="text-sm text-muted-foreground">Interval</span>
              <span className="text-sm font-medium">{schedulerStatus.interval_weeks} week(s)</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between p-2 rounded bg-muted/50">
              <span className="text-sm text-muted-foreground">Pipeline Running</span>
              <Badge variant={schedulerStatus.is_pipeline_running ? 'destructive' : 'secondary'}>
                {schedulerStatus.is_pipeline_running ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/50">
              <span className="text-sm text-muted-foreground">Last Run</span>
              <span className="text-sm font-medium">
                {schedulerStatus.last_run ? formatDateTime(schedulerStatus.last_run) : 'Never'}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/50">
              <span className="text-sm text-muted-foreground">Next Run</span>
              <span className="text-sm font-medium">
                {schedulerStatus.next_run ? formatDateTime(schedulerStatus.next_run) : 'Not scheduled'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Scraping Status Component
interface ScrapingStatusCardProps {
  readonly scrapingStatus: Awaited<ReturnType<typeof scrapingAPI.getAllStatus>>;
}

function ScrapingStatusCard({ scrapingStatus }: ScrapingStatusCardProps) {
  const taskEntries = Object.entries(scrapingStatus.tasks || {}).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Scraping Status
        </CardTitle>
        <CardDescription>Web scraping task status overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h4 className="font-semibold">Completed</h4>
            </div>
            <p className="text-3xl font-bold">{scrapingStatus.completed_count || 0}</p>
            <p className="text-sm text-muted-foreground">tasks</p>
          </div>
          <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              <h4 className="font-semibold">Running</h4>
            </div>
            <p className="text-3xl font-bold">{scrapingStatus.running_count || 0}</p>
            <p className="text-sm text-muted-foreground">tasks</p>
          </div>
          <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <h4 className="font-semibold">Failed</h4>
            </div>
            <p className="text-3xl font-bold">{scrapingStatus.failed_count || 0}</p>
            <p className="text-sm text-muted-foreground">tasks</p>
          </div>
        </div>

        {taskEntries.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium">Recent Tasks</h4>
            {taskEntries.map(([taskId, task]) => (
              <div
                key={taskId}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${getTaskStatusColor(task.status)}`} />
                  <div>
                    <p className="font-medium capitalize">{task.site}</p>
                    <p className="text-xs text-muted-foreground">
                      Started: {formatDateTime(task.started_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getTaskBadgeVariant(task.status)}>
                    {task.status}
                  </Badge>
                  {task.stats && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.stats.articles_new} new, {task.stats.articles_updated} updated
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// System Information Component
interface SystemInfoCardProps {
  readonly health: Awaited<ReturnType<typeof healthAPI.getHealth>> | null;
}

function SystemInfoCard({ health }: SystemInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          System Information
        </CardTitle>
        <CardDescription>API and environment details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex justify-between p-2 rounded bg-muted/50">
              <span className="text-sm text-muted-foreground">App Name</span>
              <span className="text-sm font-medium">{health?.app_name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/50">
              <span className="text-sm text-muted-foreground">API Version</span>
              <span className="text-sm font-medium">{health?.version || 'Unknown'}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/50">
              <span className="text-sm text-muted-foreground">Timestamp</span>
              <span className="text-sm font-medium">{formatDateTime(health?.timestamp)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between p-2 rounded bg-muted/50">
              <span className="text-sm text-muted-foreground">API URL</span>
              <span className="text-sm font-medium truncate max-w-[200px]">
                {process.env.NEXT_PUBLIC_API_URL || 'Not configured'}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/50">
              <span className="text-sm text-muted-foreground">Last Check</span>
              <span className="text-sm font-medium suppressHydrationWarning">
                {globalThis.window === undefined ? '--:--:--' : new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/50">
              <span className="text-sm text-muted-foreground">Framework</span>
              <span className="text-sm font-medium">Next.js 15 + FastAPI</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Actions Component
function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common system operations (requires API support)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="py-2 px-4 cursor-not-allowed opacity-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Trigger Shega Scrape
          </Badge>
          <Badge variant="outline" className="py-2 px-4 cursor-not-allowed opacity-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Trigger Addis Scrape
          </Badge>
          <Badge variant="outline" className="py-2 px-4 cursor-not-allowed opacity-50">
            <Play className="h-4 w-4 mr-2" />
            Start Scheduler
          </Badge>
          <Badge variant="outline" className="py-2 px-4 cursor-not-allowed opacity-50">
            <Pause className="h-4 w-4 mr-2" />
            Stop Scheduler
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Note: These actions require authentication and are disabled in the current view.
        </p>
      </CardContent>
    </Card>
  );
}

async function SystemContent() {
  const results = await Promise.allSettled([
    healthAPI.getHealth(),
    schedulerAPI.getStatus(),
    scrapingAPI.getAllStatus(),
  ]);

  const health = results[0].status === 'fulfilled' ? results[0].value : null;
  const schedulerStatus = results[1].status === 'fulfilled' ? results[1].value : null;
  const scrapingStatus = results[2].status === 'fulfilled' ? results[2].value : null;

  return (
    <div className="space-y-6">
      <HealthStatusCards health={health} schedulerStatus={schedulerStatus} />
      {schedulerStatus && <SchedulerDetails schedulerStatus={schedulerStatus} />}
      {scrapingStatus && <ScrapingStatusCard scrapingStatus={scrapingStatus} />}
      <SystemInfoCard health={health} />
      <QuickActionsCard />
    </div>
  );
}

export default function SystemPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
        <p className="text-muted-foreground mt-1">
          Monitor API health, scheduler, and scraping status
        </p>
      </div>

      <Suspense fallback={<SystemSkeleton />}>
        <SystemContent />
      </Suspense>
    </div>
  );
}

function SystemSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
