import { Suspense } from 'react';
import { keywordsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heading1, FileText, Tags, Sparkles, TrendingUp, Zap, ArrowUpRight } from 'lucide-react';
import { SiteSelector, type SiteFilter } from '@/components/dashboard/site-selector';
import type * as API from '@/types/api';

export const dynamic = 'force-dynamic';

// Helper function for spike ratio badge variant
function getSpikeRatioBadgeVariant(ratio: number): 'default' | 'secondary' | 'destructive' {
  if (ratio >= 3) return 'destructive';
  if (ratio >= 2) return 'default';
  return 'secondary';
}

interface SearchParams {
  site?: string;
}

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
  meta: [
    'bg-emerald-600', 'bg-emerald-500', 'bg-teal-500', 
    'bg-green-500', 'bg-teal-400', 'bg-emerald-400'
  ],
  tfidf: [
    'bg-orange-600', 'bg-orange-500', 'bg-amber-500', 
    'bg-yellow-500', 'bg-orange-400', 'bg-amber-400'
  ],
};

// Word Cloud Component with better styling
function WordCloud({ 
  words, 
  palette = 'headline',
  emptyMessage = 'No keywords available for this selection',
}: { 
  readonly words: { keyword: string; count: number; tfidf_score?: number }[];
  readonly palette?: keyof typeof COLOR_PALETTES;
  readonly emptyMessage?: string;
}) {
  if (words.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center text-muted-foreground text-center px-4">
        {emptyMessage}
      </div>
    );
  }

  const colors = COLOR_PALETTES[palette];
  const maxCount = Math.max(...words.map(w => w.count));
  const minCount = Math.min(...words.map(w => w.count));
  const range = maxCount - minCount || 1;

  // Get varied rotation and position for organic look
  const getStyle = (count: number, index: number) => {
    const normalized = (count - minCount) / range;
    // Size range from 0.85rem to 2.2rem
    const fontSize = 0.85 + normalized * 1.35;
    
    // Subtle random rotation (-5 to 5 degrees)
    const seed = index * 137.508;
    const rotation = Math.sin(seed) * 5;
    
    // Varied vertical alignment
    const verticalOffset = Math.cos(seed * 2) * 6;
    
    return {
      fontSize: `${fontSize}rem`,
      transform: `rotate(${rotation}deg)`,
      marginTop: `${verticalOffset}px`,
    };
  };

  // Get color based on count ranking
  const getColor = (index: number) => {
    const colorIndex = index % colors.length;
    return colors[colorIndex];
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 p-8 min-h-[350px]">
      {words.map((word, index) => {
        const style = getStyle(word.count, index);
        const colorClass = getColor(index);
        const tooltip = word.tfidf_score 
          ? `${word.keyword}: ${word.count} occurrences (TF-IDF: ${word.tfidf_score.toFixed(4)})`
          : `${word.keyword}: ${word.count} occurrences`;
        
        return (
          <span
            key={word.keyword}
            className={`inline-block rounded-full px-4 py-1.5 text-white font-semibold 
              transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-default
              ${colorClass}`}
            style={style}
            title={tooltip}
          >
            {word.keyword}
          </span>
        );
      })}
    </div>
  );
}

// Stats display component
function KeywordStats({ 
  label, 
  value, 
  subtext 
}: { 
  readonly label: string; 
  readonly value: string | number; 
  readonly subtext?: string; 
}) {
  return (
    <div className="text-center p-4 rounded-lg bg-muted/50">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  );
}

async function KeywordsContent({ site }: { readonly site: SiteFilter }) {
  let headlineData, bodyData, topKeywords, extractedKeywords, trendingKeywords;
  
  try {
    [headlineData, bodyData, topKeywords, extractedKeywords, trendingKeywords] = await Promise.all([
      keywordsAPI.getHeadline({ limit: 50 }),
      keywordsAPI.getBody({ limit: 50 }),
      keywordsAPI.getTop({ limit: 50, site: site === 'all' ? undefined : site }),
      keywordsAPI.getExtracted({ limit: 50, site: site === 'all' ? undefined : site }),
      keywordsAPI.getTrending({ weeks: 4, threshold: 1.5, site: site === 'all' ? undefined : site }),
    ]);
  } catch (error) {
    console.error('Error fetching keywords data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load keywords data. Please check if the API is running.</p>
      </div>
    );
  }

  // Get the right keyword set based on site selection
  const getHeadlineKeywords = () => {
    if (site === 'all') return headlineData.keywords.all;
    if (site === 'shega') return headlineData.keywords.shega;
    return headlineData.keywords.addis_insight;
  };

  const getBodyKeywords = () => {
    if (site === 'all') return bodyData.keywords.all;
    if (site === 'shega') return bodyData.keywords.shega;
    return bodyData.keywords.addis_insight;
  };

  const headlineKeywords = getHeadlineKeywords();
  const bodyKeywords = getBodyKeywords();

  const metaKeywordsData = topKeywords.map((kw) => ({
    keyword: kw.keyword,
    count: kw.count,
  }));

  const tfidfKeywordsData = extractedKeywords.map((kw) => ({
    keyword: kw.keyword,
    count: kw.count,
  }));

  // Get stats for current site
  const getHeadlineStats = () => {
    const stats = headlineData.stats;
    if (site === 'all') {
      return {
        articles: stats.total_articles_analyzed,
        uniqueWords: stats.unique_headline_words.all,
      };
    }
    const siteKey = site === 'shega' ? 'shega' : 'addis_insight';
    return {
      articles: stats.by_site[siteKey]?.total_articles || 0,
      uniqueWords: stats.unique_headline_words[siteKey] || 0,
    };
  };

  const getBodyStats = () => {
    const stats = bodyData.stats;
    if (site === 'all') {
      return {
        articles: stats.total_articles_analyzed,
        uniqueWords: stats.unique_body_keywords.all,
      };
    }
    const siteKey = site === 'shega' ? 'shega' : 'addis_insight';
    return {
      articles: stats.by_site[siteKey]?.articles_with_keywords || 0,
      uniqueWords: stats.unique_body_keywords[siteKey] || 0,
      avgPerArticle: stats.by_site[siteKey]?.avg_keywords_per_article || 0,
    };
  };

  const headlineStats = getHeadlineStats();
  const bodyStats = getBodyStats();

  function getSiteLabel(): string {
    if (site === 'shega') return 'Shega';
    if (site === 'addis_insight') return 'Addis Insight';
    return 'All Sites';
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="headline" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="headline" className="flex items-center gap-2">
            <Heading1 className="h-4 w-4" />
            Headline Keywords
          </TabsTrigger>
          <TabsTrigger value="body" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Body Keywords
          </TabsTrigger>
          <TabsTrigger value="meta" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Meta Keywords
          </TabsTrigger>
          <TabsTrigger value="tfidf" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            TF-IDF Extracted
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="headline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heading1 className="h-5 w-5" />
                Headline Keywords
              </CardTitle>
              <CardDescription>
                Keywords extracted from article headlines - {getSiteLabel()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KeywordStats 
                  label="Articles Analyzed" 
                  value={headlineStats?.articles?.toLocaleString() ?? '0'} 
                />
                <KeywordStats 
                  label="Unique Words" 
                  value={headlineStats?.uniqueWords?.toLocaleString() ?? '0'} 
                />
                <KeywordStats 
                  label="Top Keyword" 
                  value={headlineKeywords[0]?.keyword || '-'} 
                  subtext={headlineKeywords[0]?.count ? `${headlineKeywords[0].count} occurrences` : undefined}
                />
                <KeywordStats 
                  label="Overlap" 
                  value={`${headlineData?.comparison?.overlap_percentage?.toFixed(1) ?? '0'}%`} 
                  subtext="Between sites"
                />
              </div>
              
              {/* Word Cloud */}
              <WordCloud words={headlineKeywords} palette="headline" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="body">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Body Content Keywords
              </CardTitle>
              <CardDescription>
                Keywords extracted from article body using TF-IDF - {getSiteLabel()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KeywordStats 
                  label="Articles with Keywords" 
                  value={bodyStats?.articles?.toLocaleString() ?? '0'} 
                />
                <KeywordStats 
                  label="Unique Keywords" 
                  value={bodyStats?.uniqueWords?.toLocaleString() ?? '0'} 
                />
                <KeywordStats 
                  label="Top Keyword" 
                  value={bodyKeywords[0]?.keyword || '-'} 
                  subtext={bodyKeywords[0]?.tfidf_score ? `TF-IDF: ${bodyKeywords[0].tfidf_score.toFixed(4)}` : undefined}
                />
                <KeywordStats 
                  label="Overlap" 
                  value={`${bodyData?.comparison?.overlap_percentage?.toFixed(1) ?? '0'}%`} 
                  subtext="Between sites"
                />
              </div>
              
              {/* Word Cloud */}
              <WordCloud words={bodyKeywords} palette="body" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meta">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5" />
                Meta Keywords
              </CardTitle>
              <CardDescription>
                Keywords from article metadata tags - {getSiteLabel()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WordCloud 
                words={metaKeywordsData} 
                palette="meta" 
                emptyMessage={site === 'addis_insight' 
                  ? 'Addis Insight articles do not have meta keywords in the database. Try viewing Headline or Body keywords instead.'
                  : 'No meta keywords available for this selection'
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tfidf">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                TF-IDF Extracted Keywords
              </CardTitle>
              <CardDescription>
                Algorithmically extracted keywords based on importance - {getSiteLabel()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WordCloud words={tfidfKeywordsData} palette="tfidf" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Trending Keywords
              </CardTitle>
              <CardDescription>
                Keywords with significant increase in usage over the last 4 weeks - {getSiteLabel()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <KeywordStats 
                  label="Total Trending" 
                  value={Array.isArray(trendingKeywords) ? trendingKeywords.length : 0}
                  subtext="Spiking keywords"
                />
                <KeywordStats 
                  label="New Keywords" 
                  value={Array.isArray(trendingKeywords) ? trendingKeywords.filter((k: API.TrendingKeyword) => k.is_new).length : 0}
                  subtext="First time appearing"
                />
                <KeywordStats 
                  label="Avg Spike Ratio" 
                  value={
                    Array.isArray(trendingKeywords) && trendingKeywords.length > 0
                      ? (trendingKeywords.reduce((acc: number, k: API.TrendingKeyword) => acc + (k.spike_ratio ?? 0), 0) / 
                          trendingKeywords.filter((k: API.TrendingKeyword) => k.spike_ratio !== null).length).toFixed(1) + 'x'
                      : 'N/A'
                  }
                  subtext="Growth multiplier"
                />
                <KeywordStats 
                  label="Top Spike" 
                  value={
                    Array.isArray(trendingKeywords) && trendingKeywords.length > 0
                      ? Math.max(...trendingKeywords.map((k: API.TrendingKeyword) => k.spike_ratio ?? 0)).toFixed(1) + 'x'
                      : 'N/A'
                  }
                  subtext="Highest growth"
                />
              </div>

              {/* Trending Keywords List */}
              {Array.isArray(trendingKeywords) && trendingKeywords.length > 0 ? (
                <div className="space-y-3">
                  {trendingKeywords.slice(0, 20).map((kw: API.TrendingKeyword) => (
                    <div 
                      key={`trending-${kw.keyword}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                          {kw.is_new ? (
                            <Zap className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium">{kw.keyword}</span>
                          {kw.is_new && (
                            <Badge variant="outline" className="ml-2 text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
                              NEW
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{kw.recent_count} recent</p>
                          <p className="text-xs text-muted-foreground">{kw.previous_count} previous</p>
                        </div>
                        {kw.spike_ratio !== null && (
                          <Badge 
                            variant={getSpikeRatioBadgeVariant(kw.spike_ratio)}
                            className="min-w-[60px] justify-center"
                          >
                            {kw.spike_ratio.toFixed(1)}x
                          </Badge>
                        )}
                        {kw.is_new && kw.spike_ratio === null && (
                          <Badge variant="outline" className="min-w-[60px] justify-center">
                            ∞
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-muted-foreground text-center px-4">
                  No trending keywords detected for this period. Try adjusting the time range or threshold.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface KeywordsPageProps {
  readonly searchParams: Promise<SearchParams>;
}

export default async function KeywordsPage({ searchParams }: KeywordsPageProps) {
  const params = await searchParams;
  const site = (params.site as SiteFilter) || 'all';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Keywords Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Analysis of article keywords from headlines, body content, and metadata
          </p>
        </div>
        <SiteSelector />
      </div>

      <Suspense fallback={<KeywordsSkeleton />}>
        <KeywordsContent site={site} />
      </Suspense>
    </div>
  );
}

function KeywordsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-96" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
