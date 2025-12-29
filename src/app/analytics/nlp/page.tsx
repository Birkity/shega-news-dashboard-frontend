import { Suspense } from 'react';
import { nlpAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { DonutChart } from '@/components/charts/donut-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  User, Building2, MapPin, BookOpen, CheckCircle2, 
  Clock, FileText, Sparkles 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function NLPContent() {
  let topEntities, readabilityStats, enrichmentStatus, personEntitiesRaw, orgEntitiesRaw, locationEntitiesRaw;
  
  try {
    [topEntities, readabilityStats, enrichmentStatus, personEntitiesRaw, orgEntitiesRaw, locationEntitiesRaw] = await Promise.all([
      nlpAPI.getTopEntities({ limit: 15 }),
      nlpAPI.getReadabilityBySite(),
      nlpAPI.getEnrichmentStatus(),
      nlpAPI.getTopEntities({ entity_type: 'persons', limit: 10 }),
      nlpAPI.getTopEntities({ entity_type: 'organizations', limit: 10 }),
      nlpAPI.getTopEntities({ entity_type: 'locations', limit: 10 }),
    ]);
  } catch (error) {
    console.error('Error fetching NLP data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load NLP data. Please check if the API is running.</p>
      </div>
    );
  }

  // Process entities by type - use filtered API results
  const personEntities = personEntitiesRaw || [];
  const orgEntities = orgEntitiesRaw || [];
  const locationEntities = locationEntitiesRaw || [];

  const personData = personEntities.map(e => ({
    entity: e.entity.length > 20 ? `${e.entity.slice(0, 20)}...` : e.entity,
    count: e.count,
  }));

  const orgData = orgEntities.map(e => ({
    entity: e.entity.length > 20 ? `${e.entity.slice(0, 20)}...` : e.entity,
    count: e.count,
  }));

  const locationData = locationEntities.map(e => ({
    entity: e.entity.length > 20 ? `${e.entity.slice(0, 20)}...` : e.entity,
    count: e.count,
  }));

  // Enrichment status donut
  const enrichmentData = [
    { name: 'Enriched', value: enrichmentStatus.enriched },
    { name: 'Pending', value: enrichmentStatus.pending },
  ].filter(d => d.value > 0);

  const enrichmentPercentage = enrichmentStatus.total > 0 
    ? Math.round((enrichmentStatus.enriched / enrichmentStatus.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Enrichment Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrichmentStatus.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">in database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">NLP Enriched</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrichmentStatus.enriched.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{enrichmentPercentage}% complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrichmentStatus.pending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrichment Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            NLP Enrichment Progress
          </CardTitle>
          <CardDescription>Overall progress of NLP processing pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Processing Progress</span>
              <span className="text-sm text-muted-foreground">{enrichmentPercentage}%</span>
            </div>
            <Progress value={enrichmentPercentage} className="h-3" />
            <div className="flex justify-center">
              <DonutChart
                data={enrichmentData}
                colors={['#22c55e', '#eab308', '#ef4444']}
                innerRadius={50}
                outerRadius={100}
                centerLabel="% Done"
                centerValue={enrichmentPercentage}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Named Entity Recognition */}
      <Tabs defaultValue="persons" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="persons" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            People
          </TabsTrigger>
          <TabsTrigger value="orgs" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Locations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="persons">
          <Card>
            <CardHeader>
              <CardTitle>Top People Mentioned</CardTitle>
              <CardDescription>Most frequently mentioned individuals across articles</CardDescription>
            </CardHeader>
            <CardContent>
              {personData.length > 0 ? (
                <BarChartComponent
                  data={personData}
                  bars={[{ dataKey: 'count', color: '#8b5cf6', name: 'Mentions' }]}
                  xAxisKey="entity"
                  height={400}
                  layout="vertical"
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">No person entities found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orgs">
          <Card>
            <CardHeader>
              <CardTitle>Top Organizations</CardTitle>
              <CardDescription>Most frequently mentioned organizations</CardDescription>
            </CardHeader>
            <CardContent>
              {orgData.length > 0 ? (
                <BarChartComponent
                  data={orgData}
                  bars={[{ dataKey: 'count', color: '#2563eb', name: 'Mentions' }]}
                  xAxisKey="entity"
                  height={400}
                  layout="vertical"
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">No organization entities found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Top Locations</CardTitle>
              <CardDescription>Most frequently mentioned places</CardDescription>
            </CardHeader>
            <CardContent>
              {locationData.length > 0 ? (
                <BarChartComponent
                  data={locationData}
                  bars={[{ dataKey: 'count', color: '#22c55e', name: 'Mentions' }]}
                  xAxisKey="entity"
                  height={400}
                  layout="vertical"
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">No location entities found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Readability Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Readability Analysis
          </CardTitle>
          <CardDescription>Content readability metrics by source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Shega Readability */}
            <div className="space-y-4 p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <h4 className="font-semibold">Shega</h4>
              </div>
              <div className="grid gap-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Readability Score</span>
                    <span className="font-medium">{readabilityStats.shega?.avg_readability?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <Progress 
                    value={readabilityStats.shega?.avg_readability || 0} 
                    className="h-2 mt-1" 
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Sentences</span>
                    <span className="font-medium">{readabilityStats.shega?.avg_sentences?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Word Count</span>
                    <span className="font-medium">{readabilityStats.shega?.avg_word_count?.toFixed(0) || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Sentence Length</span>
                    <span className="font-medium">{readabilityStats.shega?.avg_sentence_length?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Addis Insight Readability */}
            <div className="space-y-4 p-4 rounded-lg border bg-red-50 dark:bg-red-950/20">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <h4 className="font-semibold">Addis Insight</h4>
              </div>
              <div className="grid gap-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Readability Score</span>
                    <span className="font-medium">{readabilityStats.addis_insight?.avg_readability?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <Progress 
                    value={readabilityStats.addis_insight?.avg_readability || 0} 
                    className="h-2 mt-1" 
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Sentences</span>
                    <span className="font-medium">{readabilityStats.addis_insight?.avg_sentences?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Word Count</span>
                    <span className="font-medium">{readabilityStats.addis_insight?.avg_word_count?.toFixed(0) || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Sentence Length</span>
                    <span className="font-medium">{readabilityStats.addis_insight?.avg_sentence_length?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Entities Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Named Entities</CardTitle>
          <CardDescription>Complete list of extracted entities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {topEntities.map((entity, index) => {
              const colors = [
                'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
                'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
              ];
              const color = colors[index % colors.length];
              
              return (
                <span
                  key={`${entity.entity}-${index}`}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}
                >
                  {entity.entity}
                  <span className="ml-1 opacity-60">({entity.count})</span>
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NLPPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">NLP Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Named Entity Recognition, readability analysis, and enrichment status
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
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-[200px] w-full mt-4" />
        </CardContent>
      </Card>
      <Skeleton className="h-10 w-80" />
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
