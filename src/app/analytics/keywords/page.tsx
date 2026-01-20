import { Suspense } from 'react';
import Link from 'next/link';
import { keywordsAnalyticsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { InteractiveWordCloud } from '@/components/interactive/clickable-elements';
import { 
  Heading1, FileText, ExternalLink
} from 'lucide-react';

export const dynamic = 'force-dynamic';

// Color palettes for word clouds
const COLOR_PALETTES = {
  headline: [
    'bg-blue-600', 'bg-blue-500', 'bg-blue-400', 
    'bg-sky-600', 'bg-sky-500', 'bg-cyan-500'
  ],
  body: [
    'bg-violet-600', 'bg-violet-500', 'bg-purple-500', 
    'bg-fuchsia-500', 'bg-pink-500', 'bg-purple-400'
  ],
  trending: [
    'bg-orange-600', 'bg-orange-500', 'bg-amber-500', 
    'bg-yellow-500', 'bg-orange-400', 'bg-amber-400'
  ],
  shega: [
    'bg-blue-600', 'bg-blue-500', 'bg-blue-400',
    'bg-indigo-500', 'bg-sky-500', 'bg-cyan-500'
  ],
  addis: [
    'bg-green-600', 'bg-green-500', 'bg-emerald-500',
    'bg-teal-500', 'bg-lime-500', 'bg-green-400'
  ],
};

// Use InteractiveWordCloud from clickable-elements.tsx - it's already imported
// This allows clicking on keywords to navigate to filtered articles

// Keyword List Component for comparison - now with clickable links
function KeywordList({ 
  keywords, 
  title, 
  colorClass 
}: { 
  readonly keywords: { keyword: string; count: number }[];
  readonly title: string;
  readonly colorClass: string;
}) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <Badge className={colorClass}>{title}</Badge>
      </h4>
      <div className="space-y-2">
        {keywords.slice(0, 15).map((kw, i) => (
          <Link 
            key={kw.keyword} 
            href={`/articles?keyword=${encodeURIComponent(kw.keyword)}`}
            className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-accent transition-colors group"
          >
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground w-4">{i + 1}.</span>
              <span className="group-hover:text-primary">{kw.keyword}</span>
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{kw.count.toLocaleString()}</Badge>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

async function KeywordsContent() {
  let keywordsBySite;
  
  try {
    keywordsBySite = await keywordsAnalyticsAPI.getBySite({ limit: 30 });
  } catch (error) {
    console.error('Error fetching keywords data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load keywords data. Please check if the API is running.</p>
      </div>
    );
  }

  // Extract data
  const shegaKeywords = keywordsBySite?.shega;
  const addisKeywords = keywordsBySite?.addis_insight;
  const comparison = keywordsBySite?.comparison;

  // Calculate overlap stats
  const headlineOverlap = comparison?.headline_keywords?.pairwise_overlap?.shega_vs_addis_insight;
  const bodyOverlap = comparison?.body_keywords?.pairwise_overlap?.shega_vs_addis_insight;

  return (
    <div className="space-y-6">
      {/* Overlap Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Headline Keyword Overlap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{headlineOverlap?.overlap_percentage?.toFixed(1) || 0}%</p>
                <p className="text-xs text-muted-foreground">{headlineOverlap?.shared_count || 0} shared keywords</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{comparison?.headline_keywords?.unique_per_site?.shega?.length || 0} unique to Shega</p>
                <p>{comparison?.headline_keywords?.unique_per_site?.addis_insight?.length || 0} unique to Addis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Body Keyword Overlap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{bodyOverlap?.overlap_percentage?.toFixed(1) || 0}%</p>
                <p className="text-xs text-muted-foreground">{bodyOverlap?.shared_count || 0} shared keywords</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{comparison?.body_keywords?.unique_per_site?.shega?.length || 0} unique to Shega</p>
                <p>{comparison?.body_keywords?.unique_per_site?.addis_insight?.length || 0} unique to Addis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Headlines Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heading1 className="h-5 w-5" />
            Headline Keywords by Site
          </CardTitle>
          <CardDescription>Compare headline keyword usage between sites</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Badge className="bg-blue-500">Shega</Badge>
              </h4>
              <InteractiveWordCloud 
                words={shegaKeywords?.headline_keywords || []} 
                palette="shega" 
              />
            </div>
            <div>
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Badge className="bg-green-500">Addis Insight</Badge>
              </h4>
              <InteractiveWordCloud 
                words={addisKeywords?.headline_keywords || []} 
                palette="addis" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Body Keywords Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Body Keywords by Site
          </CardTitle>
          <CardDescription>Compare body content keyword usage between sites</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-2">
            <KeywordList 
              keywords={shegaKeywords?.body_keywords || []} 
              title="Shega" 
              colorClass="bg-blue-500" 
            />
            <KeywordList 
              keywords={addisKeywords?.body_keywords || []} 
              title="Addis Insight" 
              colorClass="bg-green-500" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function KeywordsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Keywords Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Analysis of keywords from article headlines and body content
        </p>
      </div>

      <Suspense fallback={<KeywordsSkeleton />}>
        <KeywordsContent />
      </Suspense>
    </div>
  );
}

function KeywordsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-96" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
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
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
