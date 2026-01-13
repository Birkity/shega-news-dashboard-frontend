import { Suspense } from 'react';
import { nlpAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, MapPin, BookOpen, FileText, TrendingUp, Type, Hash } from 'lucide-react';
import { SiteSelector, type SiteFilter } from '@/components/dashboard/site-selector';

export const dynamic = 'force-dynamic';

interface SearchParams {
  site?: string;
}

async function NLPContent({ site }: { readonly site: SiteFilter }) {
  // For NLP page, we don't support 'all' - default to 'shega'
  const effectiveSite = site === 'all' ? 'shega' : site;
  
  let readabilityStats, personEntitiesRaw, orgEntitiesRaw, locationEntitiesRaw;
  
  try {
    [readabilityStats, personEntitiesRaw, orgEntitiesRaw, locationEntitiesRaw] = await Promise.all([
      nlpAPI.getReadabilityBySite(),
      nlpAPI.getTopEntities({ entity_type: 'persons', limit: 10 }),
      nlpAPI.getTopEntities({ entity_type: 'organizations', limit: 10 }),
      nlpAPI.getTopEntities({ entity_type: 'locations', limit: 10 }),
    ]);
  } catch (error) {
    console.error('Error fetching NLP data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load content quality data. Please check if the API is running.</p>
      </div>
    );
  }

  const siteName = effectiveSite === 'shega' ? 'Shega Media' : 'Addis Insight';
  const siteColor = effectiveSite === 'shega' ? '#2563eb' : '#16a34a';
  const readabilityData = effectiveSite === 'shega' ? readabilityStats.shega : readabilityStats.addis_insight;

  // Process entities by type - filter by site if API supports it, otherwise show all
  const personEntities = personEntitiesRaw || [];
  const orgEntities = orgEntitiesRaw || [];
  const locationEntities = locationEntitiesRaw || [];

  const personData = personEntities.map(e => ({
    entity: e.entity.length > 25 ? `${e.entity.slice(0, 25)}...` : e.entity,
    count: e.count,
  }));

  const orgData = orgEntities.map(e => ({
    entity: e.entity.length > 25 ? `${e.entity.slice(0, 25)}...` : e.entity,
    count: e.count,
  }));

  const locationData = locationEntities.map(e => ({
    entity: e.entity.length > 25 ? `${e.entity.slice(0, 25)}...` : e.entity,
    count: e.count,
  }));

  return (
    <div className="space-y-6">
      {/* Readability Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Readability Score</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readabilityData?.avg_readability?.toFixed(1) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Flesch Reading Ease</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Word Count</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readabilityData?.avg_word_count?.toFixed(0) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Words per article</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Sentences</CardTitle>
            <Type className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readabilityData?.avg_sentences?.toFixed(1) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Sentences per article</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sentence Length</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readabilityData?.avg_sentence_length?.toFixed(1) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Words per sentence</p>
          </CardContent>
        </Card>
      </div>

      {/* Readability Interpretation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Content Quality Summary
          </CardTitle>
          <CardDescription>Readability analysis for {siteName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Reading Level</h4>
                <p className="text-sm text-muted-foreground">
                  {getReadabilityInterpretation(readabilityData?.avg_readability || 0)}
                </p>
              </div>
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Content Depth</h4>
                <p className="text-sm text-muted-foreground">
                  {getContentDepthInterpretation(readabilityData?.avg_word_count || 0)}
                </p>
              </div>
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
              <CardDescription>Most frequently mentioned individuals in {siteName} articles</CardDescription>
            </CardHeader>
            <CardContent>
              {personData.length > 0 ? (
                <BarChartComponent
                  data={personData}
                  bars={[{ dataKey: 'count', color: siteColor, name: 'Mentions' }]}
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
              <CardDescription>Most frequently mentioned organizations in {siteName} articles</CardDescription>
            </CardHeader>
            <CardContent>
              {orgData.length > 0 ? (
                <BarChartComponent
                  data={orgData}
                  bars={[{ dataKey: 'count', color: siteColor, name: 'Mentions' }]}
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
              <CardDescription>Most frequently mentioned places in {siteName} articles</CardDescription>
            </CardHeader>
            <CardContent>
              {locationData.length > 0 ? (
                <BarChartComponent
                  data={locationData}
                  bars={[{ dataKey: 'count', color: siteColor, name: 'Mentions' }]}
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
    </div>
  );
}

function getReadabilityInterpretation(score: number): string {
  if (score >= 90) return 'Very Easy - Easily understood by an average 11-year-old student.';
  if (score >= 80) return 'Easy - Conversational English for consumers.';
  if (score >= 70) return 'Fairly Easy - Easily understood by 13-15 year old students.';
  if (score >= 60) return 'Standard - Plain English, easily understood by most adults.';
  if (score >= 50) return 'Fairly Difficult - Best understood by college students.';
  if (score >= 30) return 'Difficult - Best understood by university graduates.';
  return 'Very Difficult - Best understood by university graduates with specialized knowledge.';
}

function getContentDepthInterpretation(wordCount: number): string {
  if (wordCount >= 1500) return 'Long-form content with in-depth analysis and comprehensive coverage.';
  if (wordCount >= 800) return 'Detailed articles with substantial content and good depth.';
  if (wordCount >= 400) return 'Standard news articles with adequate coverage.';
  if (wordCount >= 200) return 'Brief articles focusing on key points.';
  return 'Short-form content, typically news briefs or updates.';
}

interface NLPPageProps {
  readonly searchParams: Promise<SearchParams>;
}

export default async function NLPPage({ searchParams }: NLPPageProps) {
  const params = await searchParams;
  const site = (params.site as SiteFilter) || 'shega';
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Quality</h1>
          <p className="text-muted-foreground mt-1">
            Readability analysis and named entity recognition
          </p>
        </div>
        <SiteSelector showBothOption={false} />
      </div>

      <Suspense fallback={<NLPSkeleton />}>
        <NLPContent site={site} />
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
          <Skeleton className="h-24 w-full" />
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
