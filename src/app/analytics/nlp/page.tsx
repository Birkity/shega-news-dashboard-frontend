import { Suspense } from 'react';
import { nlpAnalyticsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, FileText, CheckCircle2, Clock, User, Building2, MapPin
} from 'lucide-react';

export const dynamic = 'force-dynamic';

// Readability level helper
function getReadabilityLevel(score: number): { label: string; color: string; description: string } {
  if (score >= 60) {
    return { label: 'Easy', color: 'text-green-600', description: '6th-7th grade level' };
  } else if (score >= 30) {
    return { label: 'Moderate', color: 'text-yellow-600', description: 'High school/college level' };
  } else {
    return { label: 'Difficult', color: 'text-red-600', description: 'College graduate level' };
  }
}

async function NLPContent() {
  let readabilityBySite, enrichmentStatus, people, organizations, locations;
  
  try {
    [readabilityBySite, enrichmentStatus, people, organizations, locations] = await Promise.all([
      nlpAnalyticsAPI.getReadabilityBySite(),
      nlpAnalyticsAPI.getEnrichmentStatus(),
      nlpAnalyticsAPI.getPeople({ limit: 10 }),
      nlpAnalyticsAPI.getOrganizations({ limit: 10 }),
      nlpAnalyticsAPI.getLocations({ limit: 10 }),
    ]);
  } catch (error) {
    console.error('Error fetching NLP data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load NLP data. Please check if the API is running.</p>
      </div>
    );
  }

  const shegaReadability = readabilityBySite.shega;
  const addisReadability = readabilityBySite.addis_insight;

  // Prepare readability comparison data
  const readabilityComparisonData = [
    {
      metric: 'Readability Score',
      shega: shegaReadability.avg_readability,
      addis: addisReadability.avg_readability,
    },
    {
      metric: 'Sentence Length',
      shega: shegaReadability.avg_sentence_length,
      addis: addisReadability.avg_sentence_length,
    },
    {
      metric: 'Word Length',
      shega: shegaReadability.avg_word_length,
      addis: addisReadability.avg_word_length,
    },
  ];

  // Prepare entity chart data
  const peopleChartData = people.people.slice(0, 8).map(p => ({
    name: p.person.length > 15 ? `${p.person.slice(0, 15)}...` : p.person,
    shega: p.shega_count,
    addis: p.addis_insight_count,
  }));

  const orgsChartData = organizations.organizations.slice(0, 8).map(o => ({
    name: o.organization.length > 15 ? `${o.organization.slice(0, 15)}...` : o.organization,
    shega: o.shega_count,
    addis: o.addis_insight_count,
  }));

  const locationsChartData = locations.locations.slice(0, 8).map(l => ({
    name: l.location.length > 15 ? `${l.location.slice(0, 15)}...` : l.location,
    shega: l.shega_count,
    addis: l.addis_insight_count,
  }));

  const shegaLevel = getReadabilityLevel(shegaReadability.avg_readability);
  const addisLevel = getReadabilityLevel(addisReadability.avg_readability);

  return (
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <TabsList className="mb-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span>Overview</span>
        </TabsTrigger>
        <TabsTrigger value="readability" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Readability</span>
        </TabsTrigger>
        <TabsTrigger value="entities" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Entities</span>
        </TabsTrigger>
      </TabsList>

      {/* OVERVIEW TAB */}
      <TabsContent value="overview" className="space-y-6">
        {/* Enrichment Status */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">NLP Coverage</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrichmentStatus.enriched_pct.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {enrichmentStatus.enriched.toLocaleString()} / {enrichmentStatus.total.toLocaleString()} articles
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrichmentStatus.pending.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Articles awaiting processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Shega Readability</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${shegaLevel.color}`}>
                {shegaReadability.avg_readability.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">{shegaLevel.label} - {shegaLevel.description}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Addis Readability</CardTitle>
              <BookOpen className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${addisLevel.color}`}>
                {addisReadability.avg_readability.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">{addisLevel.label} - {addisLevel.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Entity Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                Top Person Mentioned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{people.people[0]?.person || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">
                {people.people[0]?.total_count.toLocaleString() || 0} mentions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-500" />
                Top Organization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{organizations.organizations[0]?.organization || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">
                {organizations.organizations[0]?.total_count.toLocaleString() || 0} mentions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                Top Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{locations.locations[0]?.location || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">
                {locations.locations[0]?.total_count.toLocaleString() || 0} mentions
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* READABILITY TAB */}
      <TabsContent value="readability" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-blue-500">Shega</Badge>
                Readability Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {shegaReadability.avg_readability.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">Flesch Score</p>
                  <Badge variant="outline" className={shegaLevel.color}>{shegaLevel.label}</Badge>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {shegaReadability.avg_word_count.toFixed(0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Words</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between p-2 border-b">
                  <span>Avg Sentence Length</span>
                  <span className="font-medium">{shegaReadability.avg_sentence_length.toFixed(1)} words</span>
                </div>
                <div className="flex justify-between p-2 border-b">
                  <span>Avg Word Length</span>
                  <span className="font-medium">{shegaReadability.avg_word_length.toFixed(2)} chars</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-green-500">Addis Insight</Badge>
                Readability Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {addisReadability.avg_readability.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">Flesch Score</p>
                  <Badge variant="outline" className={addisLevel.color}>{addisLevel.label}</Badge>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {addisReadability.avg_word_count.toFixed(0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Words</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between p-2 border-b">
                  <span>Avg Sentence Length</span>
                  <span className="font-medium">{addisReadability.avg_sentence_length.toFixed(1)} words</span>
                </div>
                <div className="flex justify-between p-2 border-b">
                  <span>Avg Word Length</span>
                  <span className="font-medium">{addisReadability.avg_word_length.toFixed(2)} chars</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Readability Comparison</CardTitle>
            <CardDescription>
              Flesch Reading Ease: 0-30 = Difficult, 30-60 = Moderate, 60-100 = Easy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={readabilityComparisonData}
              bars={[
                { dataKey: 'shega', color: '#2563eb', name: 'Shega' },
                { dataKey: 'addis', color: '#16a34a', name: 'Addis Insight' },
              ]}
              xAxisKey="metric"
              height={300}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* ENTITIES TAB */}
      <TabsContent value="entities" className="space-y-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Top People by Site
              </CardTitle>
              <CardDescription>Most frequently mentioned individuals</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={peopleChartData}
                bars={[
                  { dataKey: 'shega', color: '#2563eb', name: 'Shega' },
                  { dataKey: 'addis', color: '#16a34a', name: 'Addis Insight' },
                ]}
                xAxisKey="name"
                height={300}
              />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-500" />
                  Top Organizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={orgsChartData}
                  bars={[
                    { dataKey: 'shega', color: '#2563eb', name: 'Shega' },
                    { dataKey: 'addis', color: '#16a34a', name: 'Addis Insight' },
                  ]}
                  xAxisKey="name"
                  height={300}
                  layout="vertical"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  Top Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={locationsChartData}
                  bars={[
                    { dataKey: 'shega', color: '#2563eb', name: 'Shega' },
                    { dataKey: 'addis', color: '#16a34a', name: 'Addis Insight' },
                  ]}
                  xAxisKey="name"
                  height={300}
                  layout="vertical"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default function NLPPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">NLP Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Natural Language Processing insights: readability, entities, and content analysis
        </p>
      </div>

      <Suspense fallback={<NLPSkeleton />}>
        <NLPContent />
      </Suspense>
    </div>
  );
}

function NLPSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-96" />
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
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
