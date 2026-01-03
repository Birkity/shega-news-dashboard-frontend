import { Suspense } from 'react';
import { nlpAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, MapPin, Users, Landmark } from 'lucide-react';
import { SiteSelector, type SiteFilter } from '@/components/dashboard/site-selector';
import type { Site, EntityItem } from '@/types/api';

export const dynamic = 'force-dynamic';

interface SearchParams {
  site?: string;
  tab?: string;
}

// Helper to format entity data for charts
function formatEntityData(entities: EntityItem[], maxLength = 25) {
  return entities.map(e => ({
    entity: e.entity.length > maxLength ? `${e.entity.slice(0, maxLength)}...` : e.entity,
    fullName: e.entity,
    count: e.count,
  }));
}

// Entity stats card component
interface EntityStatsProps {
  readonly title: string;
  readonly icon: React.ReactNode;
  readonly total: number;
  readonly topEntity: string;
  readonly topCount: number;
}

function EntityStatsCard({ title, icon, total, topEntity, topCount }: EntityStatsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{total.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground mt-1">
          Top: <span className="font-medium">{topEntity}</span> ({topCount})
        </p>
      </CardContent>
    </Card>
  );
}

// Entity list component
interface EntityListProps {
  readonly entities: EntityItem[];
  readonly type: 'persons' | 'organizations' | 'locations';
}

function EntityList({ entities, type }: EntityListProps) {
  const getIcon = () => {
    switch (type) {
      case 'persons': return <User className="h-4 w-4" />;
      case 'organizations': return <Building2 className="h-4 w-4" />;
      case 'locations': return <MapPin className="h-4 w-4" />;
    }
  };

  const getColorClass = () => {
    switch (type) {
      case 'persons': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'organizations': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'locations': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    }
  };

  return (
    <div className="space-y-2">
      {entities.map((entity, index) => (
        <div
          key={entity.entity}
          className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {getIcon()}
              <span className="font-medium truncate">{entity.entity}</span>
            </div>
          </div>
          <Badge className={getColorClass()}>
            {entity.count} mentions
          </Badge>
        </div>
      ))}
    </div>
  );
}

async function EntitiesContent({ site }: { readonly site: SiteFilter }) {
  const siteParam: Site | undefined = site === 'all' ? undefined : site;
  
  let people, organizations, locations;
  
  try {
    [people, organizations, locations] = await Promise.all([
      nlpAPI.getPeople({ limit: 20, site: siteParam }),
      nlpAPI.getOrganizations({ limit: 20, site: siteParam }),
      nlpAPI.getLocations({ limit: 20, site: siteParam }),
    ]);
  } catch (error) {
    console.error('Error fetching entity data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load entity data. Please check if the API is running.</p>
      </div>
    );
  }

  // Calculate totals
  const totalPeople = people.reduce((sum, e) => sum + e.count, 0);
  const totalOrgs = organizations.reduce((sum, e) => sum + e.count, 0);
  const totalLocations = locations.reduce((sum, e) => sum + e.count, 0);

  // Prepare chart data
  const peopleChartData = formatEntityData(people.slice(0, 15));
  const orgsChartData = formatEntityData(organizations.slice(0, 15));
  const locationsChartData = formatEntityData(locations.slice(0, 15));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <EntityStatsCard
          title="People Mentioned"
          icon={<Users className="h-4 w-4 text-blue-500" />}
          total={totalPeople}
          topEntity={people[0]?.entity || 'N/A'}
          topCount={people[0]?.count || 0}
        />
        <EntityStatsCard
          title="Organizations"
          icon={<Landmark className="h-4 w-4 text-purple-500" />}
          total={totalOrgs}
          topEntity={organizations[0]?.entity || 'N/A'}
          topCount={organizations[0]?.count || 0}
        />
        <EntityStatsCard
          title="Locations"
          icon={<MapPin className="h-4 w-4 text-green-500" />}
          total={totalLocations}
          topEntity={locations[0]?.entity || 'N/A'}
          topCount={locations[0]?.count || 0}
        />
      </div>

      {/* Entity Tabs */}
      <Tabs defaultValue="people" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="people" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            People ({people.length})
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organizations ({organizations.length})
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Locations ({locations.length})
          </TabsTrigger>
        </TabsList>

        {/* People Tab */}
        <TabsContent value="people" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Top People Mentioned
                </CardTitle>
                <CardDescription>
                  Most frequently mentioned individuals in news articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={peopleChartData}
                  bars={[{ dataKey: 'count', color: '#3b82f6', name: 'Mentions' }]}
                  xAxisKey="entity"
                  height={400}
                  layout="vertical"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>People List</CardTitle>
                <CardDescription>Complete ranked list of mentioned people</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                <EntityList entities={people} type="persons" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-500" />
                  Top Organizations
                </CardTitle>
                <CardDescription>
                  Most frequently mentioned organizations and companies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={orgsChartData}
                  bars={[{ dataKey: 'count', color: '#8b5cf6', name: 'Mentions' }]}
                  xAxisKey="entity"
                  height={400}
                  layout="vertical"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Organizations List</CardTitle>
                <CardDescription>Complete ranked list of mentioned organizations</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                <EntityList entities={organizations} type="organizations" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  Top Locations
                </CardTitle>
                <CardDescription>
                  Most frequently mentioned geographic locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={locationsChartData}
                  bars={[{ dataKey: 'count', color: '#22c55e', name: 'Mentions' }]}
                  xAxisKey="entity"
                  height={400}
                  layout="vertical"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Locations List</CardTitle>
                <CardDescription>Complete ranked list of mentioned locations</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                <EntityList entities={locations} type="locations" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface EntitiesPageProps {
  readonly searchParams: Promise<SearchParams>;
}

function EntitiesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {(['people', 'orgs', 'locs'] as const).map((id) => (
          <Card key={id}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="mt-2 h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function EntitiesPage({ searchParams }: EntitiesPageProps) {
  const params = await searchParams;
  const site = (params.site as SiteFilter) || 'all';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Named Entities</h1>
          <p className="text-muted-foreground mt-1">
            People, organizations, and locations mentioned in news articles
          </p>
        </div>
        <SiteSelector />
      </div>

      <Suspense fallback={<EntitiesSkeleton />}>
        <EntitiesContent site={site} />
      </Suspense>
    </div>
  );
}
