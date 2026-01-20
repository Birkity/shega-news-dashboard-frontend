import { Suspense } from 'react';
import { nlpAnalyticsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, MapPin, Users, Landmark, Globe } from 'lucide-react';
import { SiteSelector, type SiteFilter } from '@/components/dashboard/site-selector';
import type { Site, NLPPersonEntity, NLPOrganizationEntity, NLPLocationEntity } from '@/types/api';

export const dynamic = 'force-dynamic';

interface SearchParams {
  site?: string;
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
          Top: <span className="font-medium">{topEntity}</span> ({topCount.toLocaleString()})
        </p>
      </CardContent>
    </Card>
  );
}

// Entity list component with site breakdown - for People
function PeopleList({ entities }: { readonly entities: NLPPersonEntity[] }) {
  return (
    <div className="space-y-3">
      {entities.map((entity, index) => (
        <div
          key={entity.person}
          className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium truncate">{entity.person}</span>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                {entity.total_count.toLocaleString()} mentions
              </Badge>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                Shega: {entity.shega_count}
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-300">
                Addis: {entity.addis_insight_count}
              </Badge>
            </div>
            {entity.example_titles.length > 0 && (
              <p className="text-xs text-muted-foreground truncate">
                Example: {entity.example_titles[0]}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Entity list component with site breakdown - for Organizations
function OrganizationsList({ entities }: { readonly entities: NLPOrganizationEntity[] }) {
  return (
    <div className="space-y-3">
      {entities.map((entity, index) => (
        <div
          key={entity.organization}
          className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="font-medium truncate">{entity.organization}</span>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                {entity.total_count.toLocaleString()} mentions
              </Badge>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                Shega: {entity.shega_count}
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-300">
                Addis: {entity.addis_insight_count}
              </Badge>
            </div>
            {entity.example_titles.length > 0 && (
              <p className="text-xs text-muted-foreground truncate">
                Example: {entity.example_titles[0]}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Entity list component with site breakdown - for Locations
function LocationsList({ entities }: { readonly entities: NLPLocationEntity[] }) {
  return (
    <div className="space-y-3">
      {entities.map((entity, index) => (
        <div
          key={entity.location}
          className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium truncate">{entity.location}</span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                {entity.total_count.toLocaleString()} mentions
              </Badge>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                Shega: {entity.shega_count}
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-300">
                Addis: {entity.addis_insight_count}
              </Badge>
            </div>
            {entity.example_titles.length > 0 && (
              <p className="text-xs text-muted-foreground truncate">
                Example: {entity.example_titles[0]}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

async function EntitiesContent({ site }: { readonly site: SiteFilter }) {
  const siteParam: Site | undefined = site === 'all' ? undefined : site;
  
  let people, organizations, locations, enrichmentStatus;
  
  try {
    [people, organizations, locations, enrichmentStatus] = await Promise.all([
      nlpAnalyticsAPI.getPeople({ site: siteParam, limit: 20 }),
      nlpAnalyticsAPI.getOrganizations({ site: siteParam, limit: 20 }),
      nlpAnalyticsAPI.getLocations({ site: siteParam, limit: 20 }),
      nlpAnalyticsAPI.getEnrichmentStatus(),
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
  const totalPeople = people.people.reduce((sum, e) => sum + e.total_count, 0);
  const totalOrgs = organizations.organizations.reduce((sum, e) => sum + e.total_count, 0);
  const totalLocations = locations.locations.reduce((sum, e) => sum + e.total_count, 0);

  // Prepare chart data
  const peopleChartData = people.people.slice(0, 10).map(p => ({
    name: p.person.length > 20 ? `${p.person.slice(0, 20)}...` : p.person,
    shega: p.shega_count,
    addis: p.addis_insight_count,
    total: p.total_count,
  }));

  const orgsChartData = organizations.organizations.slice(0, 10).map(o => ({
    name: o.organization.length > 20 ? `${o.organization.slice(0, 20)}...` : o.organization,
    shega: o.shega_count,
    addis: o.addis_insight_count,
    total: o.total_count,
  }));

  const locationsChartData = locations.locations.slice(0, 10).map(l => ({
    name: l.location.length > 20 ? `${l.location.slice(0, 20)}...` : l.location,
    shega: l.shega_count,
    addis: l.addis_insight_count,
    total: l.total_count,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <EntityStatsCard
          title="People Mentioned"
          icon={<Users className="h-4 w-4 text-blue-500" />}
          total={totalPeople}
          topEntity={people.people[0]?.person || 'N/A'}
          topCount={people.people[0]?.total_count || 0}
        />
        <EntityStatsCard
          title="Organizations"
          icon={<Landmark className="h-4 w-4 text-purple-500" />}
          total={totalOrgs}
          topEntity={organizations.organizations[0]?.organization || 'N/A'}
          topCount={organizations.organizations[0]?.total_count || 0}
        />
        <EntityStatsCard
          title="Locations"
          icon={<Globe className="h-4 w-4 text-green-500" />}
          total={totalLocations}
          topEntity={locations.locations[0]?.location || 'N/A'}
          topCount={locations.locations[0]?.total_count || 0}
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">NLP Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrichmentStatus.enriched_pct.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {enrichmentStatus.enriched.toLocaleString()} / {enrichmentStatus.total.toLocaleString()} articles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entity Tabs */}
      <Tabs defaultValue="people" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="people" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            People ({people.total_unique})
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organizations ({organizations.total_unique})
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Locations ({locations.total_unique})
          </TabsTrigger>
        </TabsList>

        {/* People Tab */}
        <TabsContent value="people" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Top People by Site
                </CardTitle>
                <CardDescription>
                  People mentioned in news articles, split by source
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={peopleChartData}
                  bars={[
                    { dataKey: 'shega', color: '#2563eb', name: 'Shega' },
                    { dataKey: 'addis', color: '#16a34a', name: 'Addis Insight' },
                  ]}
                  xAxisKey="name"
                  height={400}
                  layout="vertical"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>People Mentions</CardTitle>
                <CardDescription>Detailed breakdown with example articles</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                <PeopleList entities={people.people} />
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
                  Top Organizations by Site
                </CardTitle>
                <CardDescription>
                  Organizations mentioned in news articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={orgsChartData}
                  bars={[
                    { dataKey: 'shega', color: '#2563eb', name: 'Shega' },
                    { dataKey: 'addis', color: '#16a34a', name: 'Addis Insight' },
                  ]}
                  xAxisKey="name"
                  height={400}
                  layout="vertical"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Organization Mentions</CardTitle>
                <CardDescription>Detailed breakdown with example articles</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                <OrganizationsList entities={organizations.organizations} />
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
                  Top Locations by Site
                </CardTitle>
                <CardDescription>
                  Geographic locations mentioned in articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={locationsChartData}
                  bars={[
                    { dataKey: 'shega', color: '#2563eb', name: 'Shega' },
                    { dataKey: 'addis', color: '#16a34a', name: 'Addis Insight' },
                  ]}
                  xAxisKey="name"
                  height={400}
                  layout="vertical"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Location Mentions</CardTitle>
                <CardDescription>Detailed breakdown with example articles</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                <LocationsList entities={locations.locations} />
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

export default async function EntitiesPage({ searchParams }: EntitiesPageProps) {
  const params = await searchParams;
  const site = (params.site as SiteFilter) || 'shega';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entity Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Named entity recognition: people, organizations, and locations mentioned in articles
          </p>
        </div>
        <SiteSelector showBothOption={false} />
      </div>

      <Suspense fallback={<EntitiesSkeleton />}>
        <EntitiesContent site={site} />
      </Suspense>
    </div>
  );
}

function EntitiesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
